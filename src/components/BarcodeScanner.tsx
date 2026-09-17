import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, AlertTriangle, Keyboard, RefreshCw, VideoOff, Zap, ZapOff, ZoomIn, Focus } from 'lucide-react';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: string) => void;
  onCloseCamera?: () => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ 
  onScanSuccess, 
  onScanFailure,
  onCloseCamera
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [fallbackMode, setFallbackMode] = useState<boolean>(false);
  const [manualInput, setManualInput] = useState<string>('');
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  
  // Advanced Camera Controls
  const [currentZoom, setCurrentZoom] = useState<number>(1);
  const [hasHardwareZoom, setHasHardwareZoom] = useState<boolean>(false);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [focusRingPos, setFocusRingPos] = useState<{ x: number; y: number } | null>(null);
  const [showFocusTip, setShowFocusTip] = useState<boolean>(true);

  const qrCodeInstanceRef = useRef<Html5Qrcode | null>(null);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);
  const scannerId = "assetwatch-qr-reader";

  // Helper to apply hardware constraints (focus, zoom, torch) to active video track
  const applyTrackSettings = useCallback(async (zoomLevel: number, torchState: boolean) => {
    try {
      const videoEl = document.querySelector(`#${scannerId} video`) as HTMLVideoElement | null;
      if (!videoEl || !videoEl.srcObject) return;
      const stream = videoEl.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];
      if (!track) return;
      videoTrackRef.current = track;

      const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as any;

      // Check capabilities
      if (capabilities.torch !== undefined) {
        setHasTorch(true);
      }
      if (capabilities.zoom) {
        setHasHardwareZoom(true);
      }

      const advanced: any = {};

      // 1. Continuous AutoFocus & Exposure
      if (capabilities.focusMode && Array.isArray(capabilities.focusMode) && capabilities.focusMode.includes('continuous')) {
        advanced.focusMode = 'continuous';
      }
      if (capabilities.exposureMode && Array.isArray(capabilities.exposureMode) && capabilities.exposureMode.includes('continuous')) {
        advanced.exposureMode = 'continuous';
      }

      // 2. Hardware Zoom if supported
      if (capabilities.zoom) {
        const minZ = capabilities.zoom.min || 1;
        const maxZ = capabilities.zoom.max || 5;
        const targetZ = Math.min(Math.max(zoomLevel, minZ), maxZ);
        advanced.zoom = targetZ;
      }

      // 3. Torch / Flashlight
      if (capabilities.torch !== undefined) {
        advanced.torch = torchState;
      }

      if (Object.keys(advanced).length > 0) {
        await track.applyConstraints({ advanced: [advanced] });
      }
    } catch (e) {
      console.warn("Could not apply hardware track constraints, relying on digital enhancements:", e);
    }
  }, [scannerId]);

  // Handle Zoom change (Both Hardware & Digital Fallback)
  const handleZoomChange = async (newZoom: number) => {
    setCurrentZoom(newZoom);
    await applyTrackSettings(newZoom, torchOn);

    // Also apply digital CSS zoom on video element to guarantee visual magnification
    const videoEl = document.querySelector(`#${scannerId} video`) as HTMLVideoElement | null;
    if (videoEl) {
      videoEl.style.transform = newZoom > 1 ? `scale(${newZoom})` : 'none';
      videoEl.style.transformOrigin = 'center center';
      videoEl.style.transition = 'transform 0.2s ease-out';
    }
  };

  // Handle Torch toggle
  const toggleTorch = async () => {
    const nextState = !torchOn;
    setTorchOn(nextState);
    await applyTrackSettings(currentZoom, nextState);
  };

  // Tap to Refocus / Continuous focus trigger
  const handleTapToFocus = async (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setFocusRingPos({ x, y });
    setTimeout(() => setFocusRingPos(null), 1200);

    // Trigger focus re-calibration
    try {
      if (videoTrackRef.current) {
        const track = videoTrackRef.current;
        const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as any;
        if (capabilities.focusMode && capabilities.focusMode.includes('continuous')) {
          await track.applyConstraints({ advanced: [{ focusMode: 'continuous' } as any] });
        }
      }
    } catch (err) {
      console.warn("Tap-to-focus trigger error:", err);
    }
  };

  useEffect(() => {
    let html5Qr: Html5Qrcode | null = null;
    
    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setHasPermission(true);
          
          // Prefer back camera (environment / rear)
          const backCamera = devices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('environment') || 
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('0, facing back')
          );
          
          const targetCameraId = backCamera ? backCamera.id : devices[0].id;
          setActiveCameraId(targetCameraId);

          html5Qr = new Html5Qrcode(scannerId, {
            verbose: false,
            experimentalFeatures: {
              useBarCodeDetectorIfSupported: true
            }
          });
          qrCodeInstanceRef.current = html5Qr;

          await html5Qr.start(
            targetCameraId,
            {
              fps: 20, // Higher scanning frequency for crisp detection
              qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
                // Wide rectangular box optimized for 1D barcodes and QR codes
                const width = Math.min(viewfinderWidth * 0.88, 380);
                const height = Math.max(width * 0.50, 150);
                return { width, height };
              },
              aspectRatio: 1.0,
              videoConstraints: {
                facingMode: 'environment',
                width: { min: 1080, ideal: 1920, max: 2560 }, // High resolution captures fine barcode lines
                height: { min: 720, ideal: 1080, max: 1440 },
                advanced: [
                  { focusMode: 'continuous' } as any,
                  { exposureMode: 'continuous' } as any
                ]
              } as any
            },
            (decodedText) => {
              onScanSuccess(decodedText);
            },
            (errorMessage) => {
              if (onScanFailure) onScanFailure(errorMessage);
            }
          );

          // Apply initial track settings (Autofocus & capabilities probe)
          setTimeout(() => {
            applyTrackSettings(1, false);
          }, 500);

        } else {
          setHasPermission(false);
          setFallbackMode(true);
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setHasPermission(false);
        setFallbackMode(true);
      }
    };

    if (!fallbackMode) {
      const timer = setTimeout(() => {
        startScanner();
      }, 300);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    }

    return () => {
      stopScanner();
    };
  }, [fallbackMode, applyTrackSettings]);

  const stopScanner = async () => {
    if (qrCodeInstanceRef.current && qrCodeInstanceRef.current.isScanning) {
      try {
        await qrCodeInstanceRef.current.stop();
      } catch (e) {
        console.error("Failed to stop scanner:", e);
      }
      qrCodeInstanceRef.current = null;
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScanSuccess(manualInput.trim());
      setManualInput('');
    }
  };

  const switchCamera = async () => {
    if (!qrCodeInstanceRef.current) return;
    
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 1) {
        await stopScanner();
        
        const currentIndex = devices.findIndex(d => d.id === activeCameraId);
        const nextIndex = (currentIndex + 1) % devices.length;
        const nextCameraId = devices[nextIndex].id;
        setActiveCameraId(nextCameraId);

        const html5Qr = new Html5Qrcode(scannerId, {
          verbose: false,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          }
        });
        qrCodeInstanceRef.current = html5Qr;

        await html5Qr.start(
          nextCameraId,
          {
            fps: 20,
            qrbox: { width: 320, height: 160 },
            aspectRatio: 1.0,
            videoConstraints: {
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              advanced: [
                { focusMode: 'continuous' } as any
              ]
            } as any
          },
          onScanSuccess,
          onScanFailure
        );

        setTimeout(() => {
          applyTrackSettings(currentZoom, torchOn);
        }, 500);
      }
    } catch (e) {
      console.error("Error switching camera:", e);
    }
  };

  if (fallbackMode) {
    return (
      <div className="scanner-fallback-container">
        <Keyboard size={32} className="fallback-icon" />
        <h4>โหมดป้อนรหัสด้วยตัวเอง</h4>
        <p className="fallback-desc">
          กล้องไม่พร้อมใช้งาน หรืออุปกรณ์ไม่รองรับการเปิดกล้องผ่านเบราว์เซอร์ โปรดป้อนรหัสครุภัณฑ์เพื่อตรวจงาน
        </p>
        <form onSubmit={handleManualSubmit} className="manual-scan-form">
          <input 
            type="text" 
            className="form-input manual-scan-input" 
            placeholder="เช่น 6901-001-0001"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            autoFocus
            required
          />
          <button type="submit" className="btn btn-primary manual-scan-btn">
            ค้นหาและตรวจงาน
          </button>
        </form>
        <button 
          type="button" 
          className="btn-retry-camera"
          onClick={() => setFallbackMode(false)}
        >
          <Camera size={14} /> ลองเปิดกล้องอีกครั้ง
        </button>
      </div>
    );
  }

  return (
    <div className="scanner-wrapper">
      {/* Scanner Header Bar */}
      <div className="scanner-header-bar">
        <div className="scanner-title-group">
          <div className="live-dot-pulse"></div>
          <span>กล้องตรวจงานกำลังรันอยู่...</span>
        </div>
        <div className="scanner-controls">
          {/* Torch / Flash Toggle */}
          <button 
            type="button" 
            className={`scanner-control-btn ${torchOn ? 'active-torch' : ''}`}
            onClick={toggleTorch}
            title={torchOn ? "ปิดไฟฉาย" : "เปิดไฟฉายช่วยสแกน"}
            style={{ background: torchOn ? 'rgba(234, 179, 8, 0.3)' : 'rgba(255, 255, 255, 0.1)' }}
          >
            {torchOn ? <Zap size={15} color="#eab308" /> : <ZapOff size={15} color="#ffffff" />}
          </button>

          {/* Switch Camera */}
          <button 
            type="button" 
            className="scanner-control-btn"
            onClick={switchCamera}
            title="สลับกล้อง"
          >
            <RefreshCw size={15} color="#ffffff" />
          </button>

          {/* Manual Input */}
          <button 
            type="button" 
            className="scanner-control-btn"
            onClick={() => {
              stopScanner();
              setFallbackMode(true);
            }}
            title="ป้อนรหัสด้วยมือ"
          >
            <Keyboard size={15} color="#ffffff" />
          </button>

          {/* Close Camera */}
          {onCloseCamera && (
            <button 
              type="button" 
              className="scanner-control-btn btn-close-cam"
              onClick={onCloseCamera}
              title="ปิดกล้องสแกนเนอร์"
              style={{ background: 'rgba(239, 68, 68, 0.2)' }}
            >
              <VideoOff size={15} color="#ef4444" />
            </button>
          )}
        </div>
      </div>

      {/* Video Viewfinder Container */}
      <div className="video-container" onClick={handleTapToFocus}>
        <div id={scannerId} className="scanner-view"></div>
        
        {/* Scanning Reticle Box */}
        <div className="scanner-overlay-aim">
          <div className="aim-corner top-left"></div>
          <div className="aim-corner top-right"></div>
          <div className="aim-corner bottom-left"></div>
          <div className="aim-corner bottom-right"></div>
          <div className="scan-laser-line"></div>
        </div>

        {/* Tap-to-Focus Animated Ring */}
        {focusRingPos && (
          <div 
            className="focus-ring-pulse"
            style={{ left: focusRingPos.x, top: focusRingPos.y }}
          >
            <Focus size={32} color="#fbbf24" />
          </div>
        )}

        {/* Zoom Quick Selector Overlaid inside video */}
        <div className="zoom-selector-pill" onClick={(e) => e.stopPropagation()}>
          <div className="zoom-label">
            <ZoomIn size={12} /> ซูม
          </div>
          {[1, 1.5, 2, 2.5].map((z) => (
            <button
              key={z}
              type="button"
              className={`zoom-opt-btn ${currentZoom === z ? 'active' : ''}`}
              onClick={() => handleZoomChange(z)}
            >
              {z}x
            </button>
          ))}
        </div>
      </div>

      {/* Focus & Distance Helper Tip Banner */}
      {showFocusTip && (
        <div className="scanner-focus-tip">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
            <span style={{ fontSize: '0.9rem' }}>💡</span>
            <span>
              <strong>หากภาพเบลอหรือไม่โฟกัส:</strong> ให้ถอยกล้องห่าง 15-20 ซม. แล้วกดปุ่ม <strong>ซูม 1.5x - 2x</strong> หรือแตะที่หน้าจอเพื่อโฟกัส
            </span>
          </div>
          <button 
            type="button" 
            onClick={() => setShowFocusTip(false)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.75rem', padding: '2px' }}
          >
            ✕
          </button>
        </div>
      )}

      {hasPermission === false && (
        <div className="scanner-permission-alert">
          <AlertTriangle size={18} />
          <span>ไม่ได้รับอนุญาตให้เข้าถึงกล้อง โปรดตั้งค่าอนุญาตเบราว์เซอร์ของคุณ</span>
        </div>
      )}

      <style>{`
        .scanner-wrapper {
          width: 100%;
          background-color: #0b0f19;
          border-radius: var(--radius-md);
          overflow: hidden;
          position: relative;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
        }

        .scanner-header-bar {
          background-color: rgba(17, 24, 39, 0.95);
          padding: 0.65rem 0.9rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .scanner-title-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: #ffffff;
          font-weight: 600;
        }

        .live-dot-pulse {
          width: 6px;
          height: 6px;
          background-color: var(--danger);
          border-radius: 50%;
          animation: scanner-dot-pulse 1.2s infinite;
        }

        @keyframes scanner-dot-pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.6); opacity: 0.4; }
          100% { transform: scale(1); opacity: 1; }
        }

        .scanner-controls {
          display: flex;
          gap: 0.4rem;
        }

        .scanner-control-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color var(--transition-fast);
        }

        .scanner-control-btn:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        .video-container {
          position: relative;
          width: 100%;
          background-color: #000000;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: crosshair;
          overflow: hidden;
        }

        .scanner-view {
          width: 100% !important;
          height: 100% !important;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .scanner-view > div {
          width: 100% !important;
          height: 100% !important;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .scanner-view video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          will-change: transform;
        }

        /* Target Reticle Styles */
        .scanner-overlay-aim {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 82%;
          height: 44%;
          border: 1px dashed rgba(255, 255, 255, 0.3);
          border-radius: var(--radius-sm);
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .aim-corner {
          position: absolute;
          width: 22px;
          height: 22px;
          border-color: var(--primary);
          border-style: solid;
          pointer-events: none;
        }

        .top-left { top: -2px; left: -2px; border-width: 4px 0 0 4px; border-top-left-radius: 6px; }
        .top-right { top: -2px; right: -2px; border-width: 4px 4px 0 0; border-top-right-radius: 6px; }
        .bottom-left { bottom: -2px; left: -2px; border-width: 0 0 4px 4px; border-bottom-left-radius: 6px; }
        .bottom-right { bottom: -2px; right: -2px; border-width: 0 4px 4px 0; border-bottom-right-radius: 6px; }

        .scan-laser-line {
          position: absolute;
          width: 96%;
          height: 3px;
          background: linear-gradient(90deg, transparent, var(--danger), transparent);
          box-shadow: 0 0 10px var(--danger);
          animation: scan-laser 2.2s ease-in-out infinite;
        }

        @keyframes scan-laser {
          0% { top: 8%; }
          50% { top: 90%; }
          100% { top: 8%; }
        }

        /* Tap to Focus Ring */
        .focus-ring-pulse {
          position: absolute;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 15;
          animation: focus-ring-anim 0.8s ease-out forwards;
        }

        @keyframes focus-ring-anim {
          0% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
          40% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          80% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }

        /* Zoom Selector Pill Overlaid */
        .zoom-selector-pill {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 20px;
          padding: 3px 6px;
          display: flex;
          align-items: center;
          gap: 4px;
          z-index: 12;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }

        .zoom-label {
          font-size: 0.68rem;
          color: rgba(255, 255, 255, 0.7);
          display: flex;
          align-items: center;
          gap: 3px;
          padding: 0 4px;
          font-weight: 600;
        }

        .zoom-opt-btn {
          background: transparent;
          border: none;
          color: #ffffff;
          font-size: 0.725rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .zoom-opt-btn.active {
          background: var(--primary);
          color: #ffffff;
          box-shadow: 0 2px 6px rgba(79, 70, 229, 0.5);
        }

        .zoom-opt-btn:hover:not(.active) {
          background: rgba(255, 255, 255, 0.15);
        }

        /* Focus Tip Banner */
        .scanner-focus-tip {
          background: rgba(15, 23, 42, 0.95);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.5rem 0.85rem;
          font-size: 0.75rem;
          line-height: 1.4;
          color: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .scanner-focus-tip strong {
          color: #fbbf24;
        }

        .scanner-permission-alert {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          padding: 0.75rem;
          background-color: rgba(239, 68, 68, 0.95);
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.775rem;
          font-weight: 600;
          justify-content: center;
          z-index: 12;
        }

        /* Fallback Styles */
        .scanner-fallback-container {
          padding: 2.5rem 1.5rem;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-shadow: var(--glass-shadow);
        }

        .fallback-icon {
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        .fallback-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 0.25rem 0 1.5rem 0;
          max-width: 320px;
          line-height: 1.5;
        }

        .manual-scan-form {
          width: 100%;
          max-width: 340px;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .manual-scan-input {
          text-align: center;
          font-size: 1.15rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .manual-scan-btn {
          width: 100%;
        }

        .btn-retry-camera {
          background: none;
          border: none;
          color: var(--primary);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

