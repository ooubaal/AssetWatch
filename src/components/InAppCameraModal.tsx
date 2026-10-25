import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, Zap, ZapOff, RotateCcw, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { waitForGlobalCameraTeardown } from './BarcodeScanner';

export interface InAppCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  title?: string;
  subtitle?: string;
  idealWidth?: number;
  idealHeight?: number;
}

export const InAppCameraModal: React.FC<InAppCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = "ถ่ายภาพสภาพครุภัณฑ์",
  subtitle = "ถ่ายภาพด่วนผ่านหน้าเว็บโดยตรง ไม่สลับแอป ป้องกันปัญหาแอปหลุดหรือหน่วยความจำไม่พอ",
  idealWidth = 1280,
  idealHeight = 960
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [capturedBlobUrl, setCapturedBlobUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fallbackNativeInputRef = useRef<HTMLInputElement>(null);
  const isMountedRef = useRef(true);

  // Stop current active media stream safely
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => {
        try { track.stop(); } catch {}
      });
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  // Clean up captured photo preview blob URL
  const clearCaptured = useCallback(() => {
    if (capturedBlobUrl) {
      URL.revokeObjectURL(capturedBlobUrl);
      setCapturedBlobUrl(null);
    }
    setCapturedFile(null);
  }, [capturedBlobUrl]);

  // Handler for fallback native camera capture
  const handleNativeFallbackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onCapture(file);
      onClose();
    }
  };

  // Start in-app camera stream with multi-tier fallback and hardware lock mitigation
  const startCamera = useCallback(async (deviceId?: string) => {
    setIsInitializing(true);
    setErrorMsg(null);
    setTorchOn(false);

    try {
      // Release existing stream before requesting new one
      if (stream) {
        stream.getTracks().forEach(track => {
          try { track.stop(); } catch {}
        });
        setStream(null);
      }

      // 1. Wait for global teardown from scanner if any
      await waitForGlobalCameraTeardown();

      // 2. Extra safety: release any active video streams in DOM
      document.querySelectorAll('video').forEach(vid => {
        if (vid !== videoRef.current && vid.srcObject) {
          try {
            (vid.srcObject as MediaStream).getTracks().forEach(track => {
              try { track.stop(); } catch {}
            });
            vid.srcObject = null;
          } catch {}
        }
      });

      // 3. Grace period for Android Camera HAL (Hardware Abstraction Layer) to release driver
      await new Promise(r => setTimeout(r, 280));
      if (!isMountedRef.current) return;

      // Enumerate cameras if not already populated
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevs = devices.filter(d => d.kind === 'videoinput');
          setCameras(videoDevs);
        }
      } catch {}

      let mediaStream: MediaStream | null = null;
      let lastError: any = null;

      // Tier 1: Try with preferred facingMode and ideal resolution
      const tier1Constraints: MediaStreamConstraints = {
        audio: false,
        video: deviceId 
          ? {
              deviceId: { exact: deviceId },
              width: { ideal: idealWidth },
              height: { ideal: idealHeight }
            }
          : {
              facingMode: { ideal: 'environment' },
              width: { ideal: idealWidth },
              height: { ideal: idealHeight }
            }
      };

      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(tier1Constraints);
      } catch (err1: any) {
        lastError = err1;
        console.warn('InAppCamera: Tier 1 constraints failed, attempting fallback...', err1);
        
        // Wait 350ms if error was NotReadableError (hardware busy)
        await new Promise(r => setTimeout(r, 350));
        if (!isMountedRef.current) return;

        // Tier 2: Try relaxed facingMode: 'environment' without resolution constraints
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: { facingMode: 'environment' }
          });
        } catch (err2: any) {
          lastError = err2;
          console.warn('InAppCamera: Tier 2 constraints failed, attempting generic video...', err2);
          
          await new Promise(r => setTimeout(r, 300));
          if (!isMountedRef.current) return;

          // Tier 3: Generic fallback to any video camera
          try {
            mediaStream = await navigator.mediaDevices.getUserMedia({
              audio: false,
              video: true
            });
          } catch (err3: any) {
            lastError = err3;
          }
        }
      }

      if (!mediaStream) {
        throw lastError || new Error('Could not start video stream');
      }

      if (!isMountedRef.current) {
        mediaStream.getTracks().forEach(t => t.stop());
        return;
      }

      setStream(mediaStream);

      // Check hardware torch capabilities
      const track = mediaStream.getVideoTracks()[0];
      if (track) {
        const caps = (track.getCapabilities ? track.getCapabilities() : {}) as any;
        setHasTorch(Boolean(caps.torch));
      }

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.error('In-app camera startup failed:', err);
      if (isMountedRef.current) {
        setErrorMsg('ไม่สามารถเปิดกล้องได้: ' + (err.name === 'NotAllowedError' ? 'ไม่ได้รับอนุญาตการเข้าถึงกล้อง' : err.message || 'โปรดตรวจสอบการอนุญาตกล้อง'));
      }
    } finally {
      if (isMountedRef.current) {
        setIsInitializing(false);
      }
    }
  }, [idealWidth, idealHeight, stream]);

  // Initial mount / open watcher
  useEffect(() => {
    isMountedRef.current = true;
    if (isOpen) {
      clearCaptured();
      startCamera(selectedCameraId || undefined);
    } else {
      stopStream();
      clearCaptured();
    }

    return () => {
      isMountedRef.current = false;
      stopStream();
      clearCaptured();
    };
  }, [isOpen]);

  // Torch toggle handler
  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (!track) return;
    try {
      const nextTorch = !torchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextTorch }]
      });
      setTorchOn(nextTorch);
    } catch (e) {
      console.warn("Could not toggle torch:", e);
    }
  };

  // Flip / switch camera
  const switchCamera = () => {
    if (cameras.length <= 1) return;
    const currentIdx = cameras.findIndex(c => c.deviceId === selectedCameraId);
    const nextIdx = (currentIdx + 1) % cameras.length;
    const nextCam = cameras[nextIdx];
    setSelectedCameraId(nextCam.deviceId);
    startCamera(nextCam.deviceId);
  };

  // Shutter action: Grab current frame to offscreen canvas with lightweight JPEG compression
  const takeSnapshot = () => {
    if (!videoRef.current || isCapturing) return;
    setIsCapturing(true);

    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(40);
      }
    } catch {}

    const videoEl = videoRef.current;
    const vw = videoEl.videoWidth || 1280;
    const vh = videoEl.videoHeight || 960;

    // Constrain maximum dimensions to 1280 to ensure ultra-low RAM footprint (~35-65KB)
    let targetW = vw;
    let targetH = vh;
    const maxDim = 1280;
    if (targetW > targetH && targetW > maxDim) {
      targetH = Math.round((targetH * maxDim) / targetW);
      targetW = maxDim;
    } else if (targetH > maxDim) {
      targetW = Math.round((targetW * maxDim) / targetH);
      targetH = maxDim;
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setIsCapturing(false);
      return;
    }

    ctx.drawImage(videoEl, 0, 0, targetW, targetH);

    canvas.toBlob((blob) => {
      // Immediately clear canvas buffer from GPU memory
      canvas.width = 0;
      canvas.height = 0;

      if (blob) {
        const timestamp = Date.now();
        const file = new File([blob], `survey_snap_${timestamp}.jpg`, {
          type: 'image/jpeg',
          lastModified: timestamp
        });
        const previewUrl = URL.createObjectURL(blob);
        setCapturedBlobUrl(previewUrl);
        setCapturedFile(file);
      }
      setIsCapturing(false);
    }, 'image/jpeg', 0.78);
  };

  // Confirm and use captured photo
  const handleConfirm = () => {
    if (capturedFile) {
      onCapture(capturedFile);
      onClose();
    }
  };

  // Retake photo
  const handleRetake = () => {
    clearCaptured();
  };

  if (!isOpen) return null;

  return (
    <div className="inapp-camera-modal-overlay">
      <div className="inapp-camera-modal-container glass-panel">
        {/* Header */}
        <div className="inapp-camera-header">
          <div className="inapp-camera-title-group">
            <div className="inapp-camera-title">
              <Camera size={18} color="var(--primary)" />
              <h3>{title}</h3>
            </div>
            <p className="inapp-camera-subtitle">{subtitle}</p>
          </div>
          <button 
            type="button" 
            className="btn-close-modal" 
            onClick={onClose}
            title="ปิดหน้าต่างกล้อง"
          >
            <X size={20} />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="inapp-camera-body">
          {errorMsg ? (
            <div className="inapp-camera-error" style={{ textAlign: 'center', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <AlertCircle size={44} color="var(--danger)" />
              <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', maxWidth: '280px', lineHeight: 1.4, margin: 0 }}>
                {errorMsg}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', maxWidth: '280px', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => startCamera(selectedCameraId || undefined)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', width: '100%', padding: '0.6rem', fontSize: '0.85rem' }}
                >
                  <RefreshCw size={15} /> ลองเปิดกล้องอีกครั้ง
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => fallbackNativeInputRef.current?.click()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    width: '100%',
                    padding: '0.6rem',
                    fontSize: '0.85rem',
                    borderColor: 'var(--primary)',
                    color: 'var(--primary)',
                    background: 'rgba(59, 130, 246, 0.08)',
                    fontWeight: 650
                  }}
                >
                  <Camera size={15} /> 📸 ถ่ายด้วยกล้องมาตรฐานของเครื่อง
                </button>
              </div>
            </div>
          ) : capturedBlobUrl ? (
            /* Review captured photo */
            <div className="inapp-camera-preview-box">
              <img src={capturedBlobUrl} alt="Captured snapshot preview" />
              <div className="preview-indicator-badge">
                <Check size={14} /> ถ่ายภาพแล้ว กรุณาตรวจสอบความชัดเจน
              </div>
            </div>
          ) : (
            /* Live camera stream */
            <div className="inapp-camera-viewport">
              <video 
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="inapp-camera-video"
              />

              {/* Viewfinder Target Reticle Frame */}
              <div className="inapp-camera-reticle">
                <div className="inapp-reticle-corner tl"></div>
                <div className="inapp-reticle-corner tr"></div>
                <div className="inapp-reticle-corner bl"></div>
                <div className="inapp-reticle-corner br"></div>
              </div>

              {/* Top Floating Controls */}
              <div className="inapp-camera-top-controls">
                {hasTorch && (
                  <button 
                    type="button" 
                    className={`btn-camera-util ${torchOn ? 'active' : ''}`}
                    onClick={toggleTorch}
                    title={torchOn ? "ปิดไฟฉาย" : "เปิดไฟฉายช่วยถ่าย"}
                  >
                    {torchOn ? <Zap size={16} color="#eab308" /> : <ZapOff size={16} color="#ffffff" />}
                  </button>
                )}
                {cameras.length > 1 && (
                  <button 
                    type="button" 
                    className="btn-camera-util"
                    onClick={switchCamera}
                    title="สลับกล้อง"
                  >
                    <RotateCcw size={16} />
                  </button>
                )}
              </div>

              {isInitializing && (
                <div className="inapp-camera-loading">
                  <div className="spinner"></div>
                  <span>กำลังเชื่อมต่อกล้องถ่ายรูป...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hidden Fallback File/Camera Input */}
        <input 
          ref={fallbackNativeInputRef}
          type="file" 
          accept="image/*" 
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleNativeFallbackChange}
        />

        {/* Footer Action Bar */}
        <div className="inapp-camera-footer">
          {capturedBlobUrl ? (
            <div className="inapp-confirm-actions">
              <button 
                type="button" 
                className="btn btn-secondary inapp-btn-retake" 
                onClick={handleRetake}
              >
                <RotateCcw size={16} /> ถ่ายใหม่
              </button>
              <button 
                type="button" 
                className="btn btn-primary inapp-btn-confirm" 
                onClick={handleConfirm}
              >
                <Check size={16} /> ใช้ภาพนี้
              </button>
            </div>
          ) : (
            <div className="inapp-shutter-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', width: '100%' }}>
              <button 
                type="button" 
                className="inapp-shutter-btn"
                onClick={takeSnapshot}
                disabled={isInitializing || Boolean(errorMsg)}
                title="กดถ่ายรูป"
              >
                <div className="shutter-inner-dot"></div>
              </button>

              <button
                type="button"
                className="btn-camera-util"
                onClick={() => fallbackNativeInputRef.current?.click()}
                title="สลับไปใช้กล้องมาตรฐานของมือถือ (Native Camera)"
                style={{
                  position: 'absolute',
                  right: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.72rem',
                  padding: '0.4rem 0.65rem',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '20px',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <Camera size={13} /> กล้องระบบ
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .inapp-camera-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          animation: inapp-fade 0.2s ease-out;
        }

        @keyframes inapp-fade {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }

        .inapp-camera-modal-container {
          width: 100%;
          max-width: 520px;
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: var(--radius-lg, 16px);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
        }

        .inapp-camera-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 0.9rem 1.1rem;
          background: rgba(15, 23, 42, 0.95);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .inapp-camera-title-group {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .inapp-camera-title {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .inapp-camera-title h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
          color: #ffffff;
        }

        .inapp-camera-subtitle {
          margin: 0;
          font-size: 0.73rem;
          color: rgba(255, 255, 255, 0.65);
        }

        .btn-close-modal {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: rgba(255, 255, 255, 0.8);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.15s;
        }

        .btn-close-modal:hover {
          background: rgba(255, 255, 255, 0.25);
          color: #ffffff;
        }

        .inapp-camera-body {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          background: #000000;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .inapp-camera-viewport {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .inapp-camera-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .inapp-camera-preview-box {
          position: relative;
          width: 100%;
          height: 100%;
          background: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .inapp-camera-preview-box img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .preview-indicator-badge {
          position: absolute;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(16, 185, 129, 0.9);
          backdrop-filter: blur(4px);
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 5px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }

        .inapp-camera-reticle {
          position: absolute;
          inset: 12%;
          border: 1px dashed rgba(255, 255, 255, 0.25);
          border-radius: 12px;
          pointer-events: none;
        }

        .inapp-reticle-corner {
          position: absolute;
          width: 18px;
          height: 18px;
          border-color: var(--primary, #3b82f6);
          border-style: solid;
        }

        .inapp-reticle-corner.tl { top: -2px; left: -2px; border-width: 3px 0 0 3px; border-top-left-radius: 6px; }
        .inapp-reticle-corner.tr { top: -2px; right: -2px; border-width: 3px 3px 0 0; border-top-right-radius: 6px; }
        .inapp-reticle-corner.bl { bottom: -2px; left: -2px; border-width: 0 0 3px 3px; border-bottom-left-radius: 6px; }
        .inapp-reticle-corner.br { bottom: -2px; right: -2px; border-width: 0 3px 3px 0; border-bottom-right-radius: 6px; }

        .inapp-camera-top-controls {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          gap: 6px;
          z-index: 10;
        }

        .btn-camera-util {
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: #ffffff;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-camera-util:hover {
          background: rgba(30, 41, 59, 0.95);
          transform: scale(1.05);
        }

        .btn-camera-util.active {
          background: rgba(234, 179, 8, 0.3);
          border-color: #eab308;
        }

        .inapp-camera-loading,
        .inapp-camera-error {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          color: #ffffff;
          padding: 1.5rem;
          text-align: center;
          font-size: 0.85rem;
          background: rgba(15, 23, 42, 0.9);
        }

        .inapp-camera-footer {
          padding: 1rem;
          background: rgba(15, 23, 42, 0.95);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .inapp-shutter-row {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }

        .inapp-shutter-btn {
          width: 66px;
          height: 66px;
          border-radius: 50%;
          background: #ffffff;
          border: 4px solid rgba(59, 130, 246, 0.5);
          padding: 3px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.1s, border-color 0.2s;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        }

        .inapp-shutter-btn:active {
          transform: scale(0.92);
        }

        .shutter-inner-dot {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #0f172a;
          transition: background-color 0.15s;
        }

        .inapp-shutter-btn:hover .shutter-inner-dot {
          background: #38bdf8;
        }

        .inapp-confirm-actions {
          display: flex;
          gap: 0.75rem;
          width: 100%;
        }

        .inapp-btn-retake {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.65rem;
        }

        .inapp-btn-confirm {
          flex: 1.5;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.65rem;
        }
      `}</style>
    </div>
  );
};
