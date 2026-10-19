import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { 
  MultiFormatReader, 
  BarcodeFormat, 
  DecodeHintType, 
  BinaryBitmap, 
  HybridBinarizer, 
  GlobalHistogramBinarizer,
  HTMLCanvasElementLuminanceSource 
} from '@zxing/library';
import { Camera, AlertTriangle, Keyboard, RefreshCw, VideoOff, Zap, ZapOff, ZoomIn, Focus, Sparkles, CheckCircle2, PauseCircle } from 'lucide-react';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: string) => void;
  onCloseCamera?: () => void;
  isPaused?: boolean;
}

// Global teardown lock to prevent hardware camera collisions across rapid unmount/mount cycles
let activeCameraTeardownPromise: Promise<void> | null = null;

// Built-in Web Audio API scanner beep (identical to handheld Honeywell/Zebra scanners)
const playScannerBeep = (isSuccess = true) => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    if (isSuccess) {
      osc.frequency.setValueAtTime(2050, ctx.currentTime);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else {
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {
    // Audio restricted or uninitialized before user gesture
  }
};

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ 
  onScanSuccess, 
  onScanFailure,
  onCloseCamera,
  isPaused = false
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [fallbackMode, setFallbackMode] = useState<boolean>(false);
  const [manualInput, setManualInput] = useState<string>('');
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [retryAttempt, setRetryAttempt] = useState<number>(0);
  
  // Advanced Camera Controls & Zoom defaults (1.0x default, hardware zoom if supported)
  const [currentZoom, setCurrentZoom] = useState<number>(1.0);
  const [hasHardwareZoom, setHasHardwareZoom] = useState<boolean>(false);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [, setHasTorch] = useState<boolean>(false);
  const [focusRingPos, setFocusRingPos] = useState<{ x: number; y: number } | null>(null);
  const [showFocusTip, setShowFocusTip] = useState<boolean>(true);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [isAiEngineActive, setIsAiEngineActive] = useState<boolean>(false);

  const qrCodeInstanceRef = useRef<Html5Qrcode | null>(null);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);
  const nativeDetectorLoopRef = useRef<number | null>(null);
  const lastDetectTimestampRef = useRef<number>(0);
  const isScannedRecentlyRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);
  const isPausedRef = useRef<boolean>(isPaused);

  // Keep isPausedRef synced without re-triggering scanner effects
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Unique DOM ID per component instance to prevent DOM collision in fast remounts
  const scannerIdRef = useRef<string>(`assetwatch-qr-reader-${Math.random().toString(36).slice(2, 7)}`);
  const scannerId = scannerIdRef.current;

  // Exact rectangular box for Code 128 / Code 39 asset tags and QR codes (matches visual reticle)
  const getQrBoxDimensions = useCallback((viewfinderWidth: number, viewfinderHeight: number) => {
    const width = Math.min(Math.floor(viewfinderWidth * 0.84), 480);
    const height = Math.min(Math.floor(viewfinderHeight * 0.48), 240);
    return { width, height };
  }, []);

  // Vibration and audio feedback on successful scan
  const triggerSuccessFeedback = useCallback((code: string) => {
    if (isPausedRef.current || isScannedRecentlyRef.current) return;
    isScannedRecentlyRef.current = true;
    setLastScannedCode(code);

    playScannerBeep(true);

    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([45, 30, 45]);
      }
    } catch (e) {
      // ignore haptic error
    }

    onScanSuccess(code);

    // Cooldown to prevent multi-triggering
    setTimeout(() => {
      if (isMountedRef.current) {
        isScannedRecentlyRef.current = false;
        setLastScannedCode(null);
      }
    }, 1200);
  }, [onScanSuccess]);

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

      if (capabilities.torch !== undefined) {
        setHasTorch(true);
      }
      if (capabilities.zoom) {
        setHasHardwareZoom(true);
      }

      const advanced: any = {};

      // 1. Continuous AutoFocus & AutoExposure (Crucial for sharp barcode reading)
      if (capabilities.focusMode && Array.isArray(capabilities.focusMode) && capabilities.focusMode.includes('continuous')) {
        advanced.focusMode = 'continuous';
      }
      if (capabilities.exposureMode && Array.isArray(capabilities.exposureMode) && capabilities.exposureMode.includes('continuous')) {
        advanced.exposureMode = 'continuous';
      }
      if (capabilities.whiteBalanceMode && Array.isArray(capabilities.whiteBalanceMode) && capabilities.whiteBalanceMode.includes('continuous')) {
        advanced.whiteBalanceMode = 'continuous';
      }

      // 2. Hardware Optical/Sensor Zoom if supported
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
      console.warn("Hardware track constraints adjustment:", e);
    }
  }, [scannerId]);

  // Handle Zoom change (Direct Hardware Sensor Zoom so video frames match decoder coordinates 1:1)
  const handleZoomChange = async (newZoom: number) => {
    setCurrentZoom(newZoom);
    await applyTrackSettings(newZoom, torchOn);
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
    setTimeout(() => {
      if (isMountedRef.current) setFocusRingPos(null);
    }, 1000);

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
      console.warn("Tap-to-focus trigger:", err);
    }
  };

  // High-Performance Hybrid Detection Loop (Hardware BarcodeDetector on Android + High-Res ZXing on iOS)
  const startNativeBarcodeDetectorLoop = useCallback(async (videoEl: HTMLVideoElement) => {
    let nativeDetector: any = null;
    let hasNative1D = false;

    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      try {
        const BarcodeDetectorClass = (window as any).BarcodeDetector;
        let targetFormats = ['code_128', 'code_39', 'qr_code', 'ean_13', 'ean_8'];
        if (typeof BarcodeDetectorClass.getSupportedFormats === 'function') {
          const supported: string[] = await BarcodeDetectorClass.getSupportedFormats();
          targetFormats = targetFormats.filter(f => supported.includes(f));
          hasNative1D = supported.includes('code_128');
        }
        if (targetFormats.length > 0) {
          nativeDetector = new BarcodeDetectorClass({ formats: targetFormats });
        }
      } catch (e) {
        nativeDetector = null;
      }
    }

    // Set up dedicated High-Resolution ZXing Reader for iOS / 1D fallback
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.QR_CODE,
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);

    const zxingReader = new MultiFormatReader();
    zxingReader.setHints(hints);

    // Reusable offscreen canvas (720x360 keeps individual barcode stripes sharp and unblurred)
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = 720;
    offscreenCanvas.height = 360;
    const offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });

    setIsAiEngineActive(true);
    let isDetecting = false;

    const detectFrame = async (timestamp: number) => {
      if (!isMountedRef.current) return;

      if (
        !videoEl || 
        videoEl.paused || 
        videoEl.ended || 
        isPausedRef.current || 
        isScannedRecentlyRef.current
      ) {
        nativeDetectorLoopRef.current = requestAnimationFrame(detectFrame);
        return;
      }

      // Throttle detection to every ~75ms (~13 FPS)
      if (timestamp - lastDetectTimestampRef.current >= 75) {
        lastDetectTimestampRef.current = timestamp;

        if (!isDetecting && videoEl.readyState >= 2) {
          isDetecting = true;
          try {
            // STEP 1: If device supports native 1D detection (Android ML Kit), use it directly
            if (nativeDetector && hasNative1D) {
              const barcodes = await nativeDetector.detect(videoEl);
              if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                triggerSuccessFeedback(barcodes[0].rawValue);
                isDetecting = false;
                nativeDetectorLoopRef.current = requestAnimationFrame(detectFrame);
                return;
              }
            }

            // STEP 2: High-Resolution Optical Crop Decoder (Crucial for iPhone / iOS Safari)
            if (offscreenCtx) {
              const vw = videoEl.videoWidth;
              const vh = videoEl.videoHeight;
              if (vw > 0 && vh > 0) {
                // Focus on central 84% x 50% matching the blue aiming reticle
                const cropW = Math.floor(vw * 0.84);
                const cropH = Math.floor(vh * 0.50);
                const cropX = Math.floor((vw - cropW) / 2);
                const cropY = Math.floor((vh - cropH) / 2);

                offscreenCtx.drawImage(
                  videoEl,
                  cropX, cropY, cropW, cropH,
                  0, 0, 720, 360
                );

                try {
                  const lum = new HTMLCanvasElementLuminanceSource(offscreenCanvas);
                  const bitmap = new BinaryBitmap(new HybridBinarizer(lum));
                  const res = zxingReader.decode(bitmap);
                  if (res && res.getText()) {
                    triggerSuccessFeedback(res.getText());
                    isDetecting = false;
                    nativeDetectorLoopRef.current = requestAnimationFrame(detectFrame);
                    return;
                  }
                } catch {
                  // Fallback to GlobalHistogramBinarizer for low-contrast / glossy asset tags
                  try {
                    const lum = new HTMLCanvasElementLuminanceSource(offscreenCanvas);
                    const bitmap = new BinaryBitmap(new GlobalHistogramBinarizer(lum));
                    const res = zxingReader.decode(bitmap);
                    if (res && res.getText()) {
                      triggerSuccessFeedback(res.getText());
                      isDetecting = false;
                      nativeDetectorLoopRef.current = requestAnimationFrame(detectFrame);
                      return;
                    }
                  } catch {
                    // Normal frame non-detection
                  }
                }
              }
            }

            // STEP 3: Check native detector for 2D QR codes (supported on iOS Safari)
            if (nativeDetector && !hasNative1D) {
              try {
                const barcodes = await nativeDetector.detect(videoEl);
                if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                  triggerSuccessFeedback(barcodes[0].rawValue);
                  isDetecting = false;
                  nativeDetectorLoopRef.current = requestAnimationFrame(detectFrame);
                  return;
                }
              } catch {}
            }
          } catch (detErr) {
            // Ignore single frame detection error
          } finally {
            isDetecting = false;
          }
        }
      }

      nativeDetectorLoopRef.current = requestAnimationFrame(detectFrame);
    };

    nativeDetectorLoopRef.current = requestAnimationFrame(detectFrame);
  }, [triggerSuccessFeedback]);

  // Clean teardown logic with graceful sequence
  const stopScanner = useCallback(async () => {
    if (nativeDetectorLoopRef.current) {
      cancelAnimationFrame(nativeDetectorLoopRef.current);
      nativeDetectorLoopRef.current = null;
    }

    const instance = qrCodeInstanceRef.current;
    qrCodeInstanceRef.current = null;

    if (instance) {
      try {
        if (instance.isScanning) {
          await instance.stop();
        }
        await instance.clear();
      } catch (e) {
        // Safe to ignore stop error if stream already detached
      }
    }

    // Explicitly release any lingering tracks after Html5Qrcode stops
    try {
      if (videoTrackRef.current) {
        videoTrackRef.current.stop();
        videoTrackRef.current = null;
      }

      const videoEl = document.querySelector(`#${scannerId} video`) as HTMLVideoElement | null;
      if (videoEl) {
        videoEl.pause();
        if (videoEl.srcObject) {
          const stream = videoEl.srcObject as MediaStream;
          stream.getTracks().forEach(track => {
            try { track.stop(); } catch {}
          });
          videoEl.srcObject = null;
        }
      }
    } catch (e) {
      console.warn("Error releasing media tracks:", e);
    }

    // Clear inner DOM of container to allow clean remount
    const container = document.getElementById(scannerId);
    if (container) {
      container.innerHTML = '';
    }
  }, [scannerId]);

  useEffect(() => {
    isMountedRef.current = true;
    let isCancelled = false;

    const startScannerWithRetry = async (attempt = 0) => {
      if (isCancelled || !isMountedRef.current) return;
      setIsInitializing(true);
      setRetryAttempt(attempt);

      // Wait if previous teardown is still releasing hardware camera
      if (activeCameraTeardownPromise) {
        try {
          await activeCameraTeardownPromise;
        } catch {}
      }

      try {
        let targetCameraConfig: any = { facingMode: 'environment' };
        try {
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length > 0) {
            const backCamera = devices.find(device => 
              device.label.toLowerCase().includes('back') || 
              device.label.toLowerCase().includes('environment') || 
              device.label.toLowerCase().includes('rear') ||
              device.label.toLowerCase().includes('0, facing back') ||
              device.label.toLowerCase().includes('main')
            );
            if (backCamera) {
              targetCameraConfig = backCamera.id;
              setActiveCameraId(backCamera.id);
            }
          }
        } catch (e) {
          // getCameras can fail before permission; facingMode environment works directly
          targetCameraConfig = { facingMode: 'environment' };
        }

        if (isCancelled || !isMountedRef.current) return;
        setHasPermission(true);

        const supportedFormats = [
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8
        ];

        // On iOS Safari, native BarcodeDetector only supports QR code and breaks when 1D barcodes are passed
        // Use native detector inside Html5Qrcode only if it actually supports code_128
        let useNativeInHtml5Qr = false;
        if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
          try {
            const BDetector = (window as any).BarcodeDetector;
            if (typeof BDetector.getSupportedFormats === 'function') {
              const supported: string[] = await BDetector.getSupportedFormats();
              useNativeInHtml5Qr = supported.includes('code_128');
            }
          } catch {
            useNativeInHtml5Qr = false;
          }
        }

        const html5Qr = new Html5Qrcode(scannerId, {
          verbose: false,
          formatsToSupport: supportedFormats,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: useNativeInHtml5Qr
          }
        });
        qrCodeInstanceRef.current = html5Qr;

        // Adaptive video constraints (attempt 0: 1080p ideal, attempt 1: 720p ideal, attempt 2: standard fallback)
        // Note: Advanced track settings (focus, zoom) are applied safely AFTER stream is created
        const adaptiveConstraints = attempt === 0 
          ? {
              facingMode: 'environment',
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }
          : attempt === 1
          ? {
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          : {
              facingMode: 'environment'
            };

        await html5Qr.start(
          targetCameraConfig,
          {
            fps: 12, // 12 FPS leaves CPU headroom for ZXing and prevents thermal throttling on iPhone
            qrbox: getQrBoxDimensions,
            videoConstraints: adaptiveConstraints as any
          },
          (decodedText) => {
            triggerSuccessFeedback(decodedText);
          },
          (errorMessage) => {
            if (onScanFailure) onScanFailure(errorMessage);
          }
        );

        if (isCancelled || !isMountedRef.current) {
          await stopScanner();
          return;
        }

        setIsInitializing(false);

        // Apply initial track settings (Autofocus & start at 1.0x true view)
        setTimeout(() => {
          if (!isMountedRef.current || isCancelled) return;
          applyTrackSettings(1.0, false);

          const videoEl = document.querySelector(`#${scannerId} video`) as HTMLVideoElement | null;
          if (videoEl) {
            startNativeBarcodeDetectorLoop(videoEl);
          }
        }, 350);
      } catch (err: any) {
        console.warn(`Camera startup error (attempt ${attempt + 1}):`, err);

        // Auto-retry transient hardware lock errors (NotReadableError, AbortError, OverconstrainedError)
        if (attempt < 3 && err?.name !== 'NotAllowedError') {
          await new Promise(r => setTimeout(r, 400 * (attempt + 1)));
          if (!isCancelled && isMountedRef.current) {
            return startScannerWithRetry(attempt + 1);
          }
        }

        if (!isCancelled && isMountedRef.current) {
          setHasPermission(false);
          setFallbackMode(true);
          setIsInitializing(false);
        }
      }
    };

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isMountedRef.current && !fallbackMode) {
        const videoEl = document.querySelector(`#${scannerId} video`) as HTMLVideoElement | null;
        if (videoEl && videoEl.paused) {
          try {
            await videoEl.play();
          } catch (e) {
            // Track may have closed in OS background; auto restart scanner cleanly
            if (qrCodeInstanceRef.current && !qrCodeInstanceRef.current.isScanning) {
              startScannerWithRetry(0);
            }
          }
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (!fallbackMode) {
      // Small buffer to guarantee DOM element is painted
      const timer = setTimeout(() => {
        startScannerWithRetry(0);
      }, 150);

      return () => {
        isCancelled = true;
        isMountedRef.current = false;
        clearTimeout(timer);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        activeCameraTeardownPromise = stopScanner().then(() => {
          return new Promise(r => setTimeout(r, 150));
        });
      };
    }

    return () => {
      isCancelled = true;
      isMountedRef.current = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      activeCameraTeardownPromise = stopScanner();
    };
  }, [fallbackMode, applyTrackSettings, triggerSuccessFeedback, startNativeBarcodeDetectorLoop, stopScanner, scannerId]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      triggerSuccessFeedback(manualInput.trim());
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

        const supportedFormats = [
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8
        ];

        let useNativeInHtml5Qr = false;
        if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
          try {
            const BDetector = (window as any).BarcodeDetector;
            if (typeof BDetector.getSupportedFormats === 'function') {
              const supported: string[] = await BDetector.getSupportedFormats();
              useNativeInHtml5Qr = supported.includes('code_128');
            }
          } catch {
            useNativeInHtml5Qr = false;
          }
        }

        const html5Qr = new Html5Qrcode(scannerId, {
          verbose: false,
          formatsToSupport: supportedFormats,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: useNativeInHtml5Qr
          }
        });
        qrCodeInstanceRef.current = html5Qr;

        await html5Qr.start(
          nextCameraId,
          {
            fps: 12,
            qrbox: getQrBoxDimensions,
            videoConstraints: {
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            } as any
          },
          (decodedText) => triggerSuccessFeedback(decodedText),
          onScanFailure
        );

        setTimeout(() => {
          applyTrackSettings(currentZoom, torchOn);

          const videoEl = document.querySelector(`#${scannerId} video`) as HTMLVideoElement | null;
          if (videoEl) {
            startNativeBarcodeDetectorLoop(videoEl);
          }
        }, 350);
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
          กล้องไม่พร้อมใช้งานชั่วคราว หรืออุปกรณ์ไม่อนุญาตการเปิดกล้องผ่านเบราว์เซอร์ โปรดป้อนรหัสครุภัณฑ์เพื่อตรวจงาน
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
          onClick={() => {
            setFallbackMode(false);
            setHasPermission(null);
          }}
        >
          <Camera size={14} /> 🔄 ลองเปิดกล้องอีกครั้ง
        </button>
      </div>
    );
  }

  return (
    <div className={`scanner-wrapper ${isPaused ? 'scanner-is-paused' : ''}`}>
      {/* Scanner Header Bar */}
      <div className="scanner-header-bar">
        <div className="scanner-title-group">
          {isPaused ? (
            <span style={{ fontSize: '0.78rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <PauseCircle size={13} /> พักกล้องชั่วคราว (สแตนด์บาย)
            </span>
          ) : (
            <>
              <div className="live-dot-pulse"></div>
              <span style={{ fontSize: '0.78rem' }}>กล้องสแกนพร้อมทำงาน</span>
              {isAiEngineActive && (
                <span className="badge-ai-engine" title="ระบบใช้ Neural Engine ตรวจจับบาร์โค้ดระดับฮาร์ดแวร์ความเร็วสูง">
                  <Sparkles size={11} /> AI Hardware Mode
                </span>
              )}
            </>
          )}
        </div>
        <div className="scanner-controls">
          {/* Torch / Flash Toggle */}
          <button 
            type="button" 
            className={`scanner-control-btn ${torchOn ? 'active-torch' : ''}`}
            onClick={toggleTorch}
            title={torchOn ? "ปิดไฟฉาย" : "เปิดไฟฉายช่วยสแกนในที่มืด"}
            style={{ background: torchOn ? 'rgba(234, 179, 8, 0.35)' : 'rgba(255, 255, 255, 0.1)' }}
          >
            {torchOn ? <Zap size={15} color="#eab308" /> : <ZapOff size={15} color="#ffffff" />}
          </button>

          {/* Switch Camera */}
          <button 
            type="button" 
            className="scanner-control-btn"
            onClick={switchCamera}
            title="สลับกล้อง / เลนส์"
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

        {/* Loading / Connecting Overlay */}
        {isInitializing && (
          <div className="scanner-connecting-overlay">
            <RefreshCw size={24} className="animate-spin text-primary" />
            <span>
              {retryAttempt > 0 
                ? `กำลังเชื่อมต่อกล้องใหม่... (ครั้งที่ ${retryAttempt + 1}/3)` 
                : 'กำลังเริ่มการทำงานกล้อง...'}
            </span>
          </div>
        )}

        {/* Paused Overlay */}
        {isPaused && (
          <div className="scanner-paused-overlay">
            <PauseCircle size={36} color="#fbbf24" style={{ opacity: 0.8 }} />
            <span>สแตนด์บาย — ระบบพร้อมสแกนทันทีเมื่อกดชิ้นถัดไป</span>
          </div>
        )}
        
        {/* Scanning Reticle Box */}
        {!isPaused && (
          <div className="scanner-overlay-aim">
            <div className="aim-corner top-left"></div>
            <div className="aim-corner top-right"></div>
            <div className="aim-corner bottom-left"></div>
            <div className="aim-corner bottom-right"></div>
            <div className="scan-laser-line"></div>

            {/* Scanned Feedback Overlay */}
            {lastScannedCode && (
              <div className="scan-locked-badge animate-fade-in">
                <CheckCircle2 size={18} color="#10b981" />
                <span>ตรวจพบ: {lastScannedCode}</span>
              </div>
            )}
          </div>
        )}

        {/* Tap-to-Focus Animated Ring */}
        {focusRingPos && (
          <div 
            className="focus-ring-pulse"
            style={{ left: focusRingPos.x, top: focusRingPos.y }}
          >
            <Focus size={32} color="#fbbf24" />
          </div>
        )}

        {/* Zoom Quick Selector Overlaid inside video (Active when hardware sensor zoom is supported) */}
        {!isPaused && hasHardwareZoom && (
          <div className="zoom-selector-pill" onClick={(e) => e.stopPropagation()}>
            <div className="zoom-label">
              <ZoomIn size={12} /> ซูม
            </div>
            {[1, 1.5, 2, 2.5, 3].map((z) => (
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
        )}
      </div>

      {/* Focus & Distance Helper Tip Banner */}
      {showFocusTip && !isPaused && (
        <div className="scanner-focus-tip">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flex: 1 }}>
            <span style={{ fontSize: '1rem' }}>💡</span>
            <span>
              <strong>คำแนะนำสำหรับ iPhone 15 / ทุกรุ่น:</strong> ถือกล้องห่างบาร์โค้ดประมาณ <strong>15–20 ซม.</strong> (ระยะ 1 ฝ่ามือ) ให้บาร์โค้ดอยู่กลางกรอบสีฟ้า (หากภาพเบลอแตะหน้าจอ 1 ครั้งเพื่อโฟกัส)
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
          flex-wrap: wrap;
        }

        .badge-ai-engine {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.4);
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 0.65rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 3px;
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

        .scanner-connecting-overlay,
        .scanner-paused-overlay {
          position: absolute;
          inset: 0;
          background: rgba(11, 15, 25, 0.85);
          backdrop-filter: blur(4px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          z-index: 20;
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 600;
          text-align: center;
          padding: 1rem;
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
          width: 84%;
          height: 48%;
          max-width: 480px;
          max-height: 240px;
          border: 1px dashed rgba(255, 255, 255, 0.35);
          border-radius: var(--radius-sm);
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        #qr-shaded-region {
          display: none !important;
        }

        .aim-corner {
          position: absolute;
          width: 24px;
          height: 24px;
          border-color: #3b82f6;
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
          background: linear-gradient(90deg, transparent, #38bdf8, transparent);
          box-shadow: 0 0 12px #38bdf8;
          animation: scan-laser 1.8s ease-in-out infinite;
        }

        @keyframes scan-laser {
          0% { top: 8%; }
          50% { top: 90%; }
          100% { top: 8%; }
        }

        .scan-locked-badge {
          background: rgba(16, 185, 129, 0.9);
          color: #ffffff;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          backdrop-filter: blur(4px);
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
          background: rgba(15, 23, 42, 0.88);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 22px;
          padding: 3px 6px;
          display: flex;
          align-items: center;
          gap: 4px;
          z-index: 12;
          box-shadow: 0 4px 14px rgba(0,0,0,0.45);
        }

        .zoom-label {
          font-size: 0.68rem;
          color: rgba(255, 255, 255, 0.75);
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
          background: #3b82f6;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.6);
        }

        .zoom-opt-btn:hover:not(.active) {
          background: rgba(255, 255, 255, 0.18);
        }

        /* Focus Tip Banner */
        .scanner-focus-tip {
          background: rgba(15, 23, 42, 0.95);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.55rem 0.85rem;
          font-size: 0.75rem;
          line-height: 1.45;
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
