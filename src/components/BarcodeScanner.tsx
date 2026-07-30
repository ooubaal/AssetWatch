import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, AlertTriangle, Keyboard, RefreshCw, VideoOff } from 'lucide-react';

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
  
  const qrCodeInstanceRef = useRef<Html5Qrcode | null>(null);
  const scannerId = "assetwatch-qr-reader";

  useEffect(() => {
    // Check camera permission and list devices
    let html5Qr: Html5Qrcode | null = null;
    
    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setHasPermission(true);
          
          // Prefer back camera (environment)
          const backCamera = devices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('environment') || 
            device.label.toLowerCase().includes('rear')
          );
          
          const targetCameraId = backCamera ? backCamera.id : devices[0].id;
          setActiveCameraId(targetCameraId);

          html5Qr = new Html5Qrcode(scannerId);
          qrCodeInstanceRef.current = html5Qr;

          await html5Qr.start(
            targetCameraId,
            {
              fps: 10,
              qrbox: (width, height) => {
                const size = Math.min(width, height) * 0.7;
                return { width: size, height: size * 0.5 }; // Horizontal barcode oriented rectangle
              },
              aspectRatio: 1.0
            },
            (decodedText) => {
              // On success
              onScanSuccess(decodedText);
            },
            (errorMessage) => {
              // Silent failure as it scans continuously
              if (onScanFailure) onScanFailure(errorMessage);
            }
          );
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
      // Small timeout to ensure container is fully rendered in DOM
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
  }, [fallbackMode]);

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
        
        // Find next camera in list
        const currentIndex = devices.findIndex(d => d.id === activeCameraId);
        const nextIndex = (currentIndex + 1) % devices.length;
        const nextCameraId = devices[nextIndex].id;
        setActiveCameraId(nextCameraId);

        const html5Qr = new Html5Qrcode(scannerId);
        qrCodeInstanceRef.current = html5Qr;

        await html5Qr.start(
          nextCameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.0
          },
          onScanSuccess,
          onScanFailure
        );
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
      <div className="scanner-header-bar">
        <div className="scanner-title-group">
          <div className="live-dot-pulse"></div>
          <span>กล้องตรวจงานกำลังรันอยู่...</span>
        </div>
        <div className="scanner-controls">
          <button 
            type="button" 
            className="scanner-control-btn"
            onClick={switchCamera}
            title="สลับกล้อง"
          >
            <RefreshCw size={16} color="#ffffff" />
          </button>
          <button 
            type="button" 
            className="scanner-control-btn"
            onClick={() => {
              stopScanner();
              setFallbackMode(true);
            }}
            title="ป้อนรหัสด้วยมือ"
          >
            <Keyboard size={16} color="#ffffff" />
          </button>
          {onCloseCamera && (
            <button 
              type="button" 
              className="scanner-control-btn btn-close-cam"
              onClick={onCloseCamera}
              title="ปิดกล้องสแกนเนอร์"
              style={{ background: 'rgba(239, 68, 68, 0.2)' }}
            >
              <VideoOff size={16} color="#ef4444" />
            </button>
          )}
        </div>
      </div>

      <div className="video-container">
        <div id={scannerId} className="scanner-view"></div>
        {/* Scanning Target Box Graphic overlay */}
        <div className="scanner-overlay-aim">
          <div className="aim-corner top-left"></div>
          <div className="aim-corner top-right"></div>
          <div className="aim-corner bottom-left"></div>
          <div className="aim-corner bottom-right"></div>
          <div className="scan-laser-line"></div>
        </div>
      </div>

      {hasPermission === false && (
        <div className="scanner-permission-alert">
          <AlertTriangle size={18} />
          <span>ไม่ได้รับอนุญาตให้เข้าถึงกล้อง โปรดตั้งค่าเบราว์เซอร์ของคุณ</span>
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
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .scanner-title-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.825rem;
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
          gap: 0.5rem;
        }

        .scanner-control-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          width: 28px;
          height: 28px;
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
        }

        .scanner-view {
          width: 100% !important;
          height: 100% !important;
        }

        .scanner-view div {
          width: 100% !important;
          height: 100% !important;
        }

        .scanner-view video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }

        /* Target Reticle Styles */
        .scanner-overlay-aim {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 75%;
          height: 40%;
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
          width: 20px;
          height: 20px;
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
          width: 95%;
          height: 3px;
          background: linear-gradient(90deg, transparent, var(--danger), transparent);
          box-shadow: 0 0 8px var(--danger);
          animation: scan-laser 2.2s ease-in-out infinite;
        }

        @keyframes scan-laser {
          0% { top: 10%; }
          50% { top: 85%; }
          100% { top: 10%; }
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
