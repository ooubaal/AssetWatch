import React, { useState } from 'react';
import { 
  QrCode, 
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  MapPin, 
  User, 
  FileImage,
  RefreshCw,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { Asset, SurveyRecord } from '../utils/mockData';
import { BarcodeScanner } from '../components/BarcodeScanner';
import { uploadImage } from '../services/dbService';
import confetti from 'canvas-confetti';

interface Module2ScanSurveyProps {
  assets: Asset[];
  onAddSurvey: (survey: Omit<SurveyRecord, 'id'>) => Promise<void>;
  onUpdateAssetStatus: (id: string, status: Asset['status']) => Promise<void>;
  onLogAudit: (trail: { assetId: string; assetName: string; action: any; operator: string; details: string }) => Promise<void>;
  onRedirectToAdd: (prefilledId: string) => void;
}

export const Module2_ScanSurvey: React.FC<Module2ScanSurveyProps> = ({
  assets,
  onAddSurvey,
  onUpdateAssetStatus,
  onLogAudit,
  onRedirectToAdd
}) => {
  const [operator, setOperator] = useState(() => localStorage.getItem('assetwatch_operator') || 'ผู้ตรวจการทั่วไป');
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [scannedAsset, setScannedAsset] = useState<Asset | null>(null);
  
  // Survey Form States
  const [selectedStatus, setSelectedStatus] = useState<Asset['status']>('ใช้งานได้');
  const [attachImageFile, setAttachImageFile] = useState<File | null>(null);
  const [attachImagePreview, setAttachImagePreview] = useState<string | null>(null);
  
  const [saving, setSaving] = useState(false);
  const [surveySuccess, setSurveySuccess] = useState(false);
  const [isNewScanNeeded, setIsNewScanNeeded] = useState(true);

  // Save operator name to localStorage on change
  const handleOperatorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setOperator(val);
    localStorage.setItem('assetwatch_operator', val);
  };

  const handleScanSuccess = (decodedId: string) => {
    setIsNewScanNeeded(false);
    setScannedId(decodedId);
    
    // Look up in assets list
    const found = assets.find(a => a.id.toLowerCase() === decodedId.toLowerCase());
    if (found) {
      setScannedAsset(found);
      setSelectedStatus(found.status);
      setSurveySuccess(false);
    } else {
      setScannedAsset(null);
      setSurveySuccess(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSurveySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedId) return;

    setSaving(true);
    try {
      let uploadedUrl = '';
      if (attachImageFile) {
        uploadedUrl = await uploadImage(attachImageFile, 'surveys');
      }

      // 1. Add survey log record
      await onAddSurvey({
        assetId: scannedId,
        status: selectedStatus,
        imageUrl: uploadedUrl || undefined,
        operator: operator || 'ผู้ตรวจการทั่วไป',
        timestamp: new Date().toISOString()
      });

      // 2. If status has changed, update the asset status in main database
      if (scannedAsset && scannedAsset.status !== selectedStatus) {
        await onUpdateAssetStatus(scannedId, selectedStatus);
        
        // Log status change audit trail
        await onLogAudit({
          assetId: scannedId,
          assetName: scannedAsset.name,
          action: 'survey',
          operator,
          details: `แสกนสำรวจและเปลี่ยนสถานะครุภัณฑ์ จาก "${scannedAsset.status}" เป็น "${selectedStatus}"`
        });
      } else if (scannedAsset) {
        // Log simple verification survey audit trail
        await onLogAudit({
          assetId: scannedId,
          assetName: scannedAsset.name,
          action: 'survey',
          operator,
          details: `แสกนสำรวจพบตัวครุภัณฑ์ สภาพยังคง "${selectedStatus}" เหมือนเดิม`
        });
      } else {
        // Unregistered asset checked
        await onLogAudit({
          assetId: scannedId,
          assetName: 'ครุภัณฑ์ไม่ได้ลงทะเบียน',
          action: 'survey',
          operator,
          details: `แสกนสำรวจพบรหัสที่ไม่ได้ลงทะเบียน: "${scannedId}"`
        });
      }

      // Polish: Confetti Rain!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setSurveySuccess(true);
      setAttachImageFile(null);
      setAttachImagePreview(null);
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการบันทึกผลการสำรวจ');
    } finally {
      setSaving(false);
    }
  };

  const handleResetScan = () => {
    setScannedId(null);
    setScannedAsset(null);
    setAttachImageFile(null);
    setAttachImagePreview(null);
    setSurveySuccess(false);
    setIsNewScanNeeded(true);
  };

  return (
    <div className="module-container animate-fade-in">
      <div className="module-title-section">
        <h2>สแกนตรวจนับครุภัณฑ์รายชิ้น (Module 2)</h2>
        <p>เปิดสแกนผ่านกล้องโทรศัพท์มือถือเพื่อยืนยันสภาพและอัปโหลดรูปภาพความเสียหายแบบเรียลไทม์</p>
      </div>

      {/* Operator profile card */}
      <div className="operator-card glass-panel">
        <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
          <label className="form-label">✍️ ชื่อผู้ตรวจสอบนับครุภัณฑ์</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="โปรดป้อนชื่อผู้สำรวจพัสดุ..." 
            value={operator}
            onChange={handleOperatorChange}
          />
        </div>
        <div className="operator-survey-tip">
          <TrendingUp size={16} color="var(--primary)" />
          <span>ผู้แสกนหลายท่านสามารถเข้าระบบในคอมหรือมือถือพร้อมกันได้เพื่อช่วยกันนับอย่างเร็ว</span>
        </div>
      </div>

      {/* Scanner Control View Area */}
      <div className="survey-layout-grid">
        
        {/* Left Column: Scanner Panel */}
        <div className="scanner-column">
          {isNewScanNeeded ? (
            <div className="scan-frame glass-panel">
              <BarcodeScanner onScanSuccess={handleScanSuccess} />
            </div>
          ) : (
            <div className="scan-placeholder glass-panel">
              <CheckCircle2 size={48} color="var(--success)" className="success-bounce" />
              <h3>ตรวจพบรหัสครุภัณฑ์เรียบร้อยแล้ว</h3>
              <div className="scanned-code-pill">
                <code>{scannedId}</code>
              </div>
              <button className="btn btn-secondary" onClick={handleResetScan}>
                <RefreshCw size={14} /> เริ่มต้นแสกนชิ้นถัดไป
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Scanned Result Card & Form */}
        <div className="form-column">
          
          {/* Case 1: Scanning is in progress, waiting */}
          {!scannedId && (
            <div className="survey-wait-card glass-panel">
              <QrCode size={48} className="pulse-scanning" color="var(--text-muted)" />
              <h3>กำลังรอการแสกนบาร์โค้ด...</h3>
              <p>หันกล้องไปที่ฉลากรหัสครุภัณฑ์ หรือกดปุ่มป้อนรหัสด้วยมือในช่องกล้องเพื่อตรวจนับ</p>
            </div>
          )}

          {/* Case 2: Scanned ID but asset NOT registered in system */}
          {scannedId && !scannedAsset && !surveySuccess && (
            <div className="survey-unregistered-card glass-panel">
              <AlertTriangle size={48} color="var(--warning)" className="warning-shake" />
              <h3>ไม่พบข้อมูลครุภัณฑ์รหัสนี้ในระบบ!</h3>
              <div className="scanned-code-pill pill-warning">
                รหัส: <code>{scannedId}</code>
              </div>
              <p className="card-desc-warn">
                รหัสที่คุณแสกนพบยังไม่เคยได้รับการขึ้นทะเบียนพัสดุในฐานข้อมูล AssetWatch มาก่อน
              </p>
              
              <div className="warning-actions">
                <button className="btn btn-secondary" onClick={handleResetScan}>
                  สแกนรหัสอื่น
                </button>
                <button className="btn btn-warning" onClick={() => onRedirectToAdd(scannedId)}>
                  ขึ้นทะเบียนครุภัณฑ์รหัสนี้ใหม่ (Module 3)
                </button>
              </div>
            </div>
          )}

          {/* Case 3: Asset Scanned Successfully, displaying Confirm Form */}
          {scannedId && scannedAsset && !surveySuccess && (
            <form onSubmit={handleSurveySubmit} className="survey-form-panel glass-panel">
              <div className="survey-asset-brief">
                <img 
                  src={scannedAsset.imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60'} 
                  alt={scannedAsset.name} 
                />
                <div className="brief-details">
                  <span className="brief-id">{scannedAsset.id}</span>
                  <h3>{scannedAsset.name}</h3>
                  <span>📍 {scannedAsset.location}</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">🔍 ยืนยันสถานะที่พบในขณะสำรวจ</label>
                <select 
                  className="form-select status-confirm-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as Asset['status'])}
                  required
                >
                  <option value="ใช้งานได้">ใช้งานได้ (ปกติ/สภาพสมบูรณ์)</option>
                  <option value="ชำรุด">ชำรุด (มีปัญหาขัดข้องขณะทดลอง)</option>
                  <option value="รอจำหน่าย">รอจำหน่าย (เก่าเสื่อมสภาพ)</option>
                  <option value="ขอป้ายรหัสใหม่">ขอป้ายรหัสใหม่ (ป้ายเดิมหลุดลอก/จางหาย)</option>
                  <option value="รอโอน">รอโอน (เตรียมย้ายไปกองอื่น)</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>

              {/* Picture upload area for documenting asset damage */}
              <div className="form-group">
                <label className="form-label">📷 แนบรูปภาพถ่ายตรวจสอบสภาพ (ตัวเลือกกรณีมีปัญหา)</label>
                <div className="survey-upload-trigger">
                  <input 
                    type="file" 
                    id="survey-photo-capture" 
                    accept="image/*" 
                    capture="environment" // Forces back-camera camera capture on phone!
                    className="file-hidden-input"
                    onChange={handleImageChange}
                  />
                  <label htmlFor="survey-photo-capture" className="upload-box-dashed">
                    {attachImagePreview ? (
                      <div className="preview-image-box">
                        <img src={attachImagePreview} alt="damage report preview" />
                        <span className="preview-indicator">
                          <RefreshCw size={12} /> กดเพื่อถ่ายภาพใหม่
                        </span>
                      </div>
                    ) : (
                      <>
                        <Camera size={24} color="var(--text-muted)" />
                        <span>กดเพื่อเปิดกล้องมือถือถ่ายภาพแนบสภาพ</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleResetScan}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'กำลังบันทึก...' : '✅ ยืนยันความถูกต้องพัสดุ'}
                </button>
              </div>
            </form>
          )}

          {/* Case 4: Survey Success Screen */}
          {surveySuccess && (
            <div className="survey-success-card glass-panel">
              <div className="success-sparkle-halo">
                <Sparkles size={36} color="var(--success)" />
              </div>
              <h3>ยืนยันสภาพครุภัณฑ์สำเร็จ!</h3>
              <p>ข้อมูลการแสกนสำรวจจากผู้ตรวจ <strong>{operator}</strong> ได้รับการบันทึกลงคลาวด์และอัปเดตระบบเรียบร้อยแล้ว</p>
              
              <div className="survey-summary-success-pill">
                <span>รหัสตรวจแล้ว:</span>
                <code>{scannedId}</code>
              </div>

              <button className="btn btn-primary w-full" onClick={handleResetScan}>
                สแกนชิ้นถัดไปทันที
              </button>
            </div>
          )}

        </div>

      </div>

      <style>{`
        .operator-card {
          padding: 1.25rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .operator-survey-tip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.775rem;
          color: var(--text-secondary);
          font-weight: 550;
          max-width: 320px;
        }

        .survey-layout-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        .scan-placeholder {
          padding: 4rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          text-align: center;
        }

        .scanned-code-pill {
          padding: 0.5rem 1.25rem;
          background-color: var(--success-light);
          border-radius: var(--radius-full);
          border: 1px solid var(--success);
          color: var(--success);
          font-weight: 600;
        }

        .pill-warning {
          background-color: var(--warning-light);
          border-color: var(--warning);
          color: var(--warning);
        }

        .success-bounce {
          animation: bounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes bounce {
          0% { transform: scale(0.3); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .survey-wait-card {
          padding: 5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          text-align: center;
        }

        .pulse-scanning {
          animation: scan-pulsate 1.8s infinite alternate;
        }

        @keyframes scan-pulsate {
          0% { transform: scale(1); filter: drop-shadow(0 0 2px var(--text-muted)); }
          100% { transform: scale(1.15); filter: drop-shadow(0 0 10px var(--primary)); }
        }

        .survey-unregistered-card {
          padding: 3rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          text-align: center;
        }

        .warning-shake {
          animation: shake 0.5s infinite alternate;
        }

        @keyframes shake {
          0% { transform: rotate(-5deg); }
          100% { transform: rotate(5deg); }
        }

        .card-desc-warn {
          font-size: 0.85rem;
          color: var(--text-secondary);
          max-width: 380px;
          line-height: 1.5;
        }

        .warning-actions {
          display: flex;
          gap: 1rem;
          width: 100%;
        }

        .warning-actions button {
          flex: 1;
        }

        .survey-form-panel {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .survey-asset-brief {
          display: flex;
          gap: 1rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 1rem;
          align-items: center;
        }

        .survey-asset-brief img {
          width: 64px;
          height: 64px;
          object-fit: cover;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
        }

        .brief-details {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .brief-id {
          font-size: 0.725rem;
          font-family: monospace;
          color: var(--text-muted);
          font-weight: 550;
        }

        .brief-details h3 {
          font-size: 0.95rem;
          font-weight: 750;
          color: var(--text-primary);
        }

        .brief-details span {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .status-confirm-select {
          font-size: 1rem;
          font-weight: 600;
          color: var(--primary);
          border-color: var(--primary);
        }

        /* Attached image styles */
        .survey-upload-trigger {
          width: 100%;
        }

        .file-hidden-input {
          display: none;
        }

        .upload-box-dashed {
          width: 100%;
          border: 2px dashed var(--border);
          border-radius: var(--radius-md);
          padding: 2rem 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all var(--transition-fast);
          background-color: var(--bg-primary);
        }

        .upload-box-dashed:hover {
          border-color: var(--primary);
          background-color: rgba(59, 130, 246, 0.02);
        }

        .preview-image-box {
          position: relative;
          width: 100%;
          max-width: 240px;
          aspect-ratio: 4/3;
          border-radius: var(--radius-sm);
          overflow: hidden;
          border: 1px solid var(--border);
        }

        .preview-image-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preview-indicator {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          background-color: rgba(0, 0, 0, 0.6);
          color: #ffffff;
          padding: 0.35rem;
          font-size: 0.65rem;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          backdrop-filter: blur(2px);
        }

        /* Success screen card */
        .survey-success-card {
          padding: 3.5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          text-align: center;
        }

        .success-sparkle-halo {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background-color: var(--success-light);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
        }

        .survey-summary-success-pill {
          padding: 0.5rem 1rem;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          display: flex;
          gap: 0.5rem;
          font-size: 0.85rem;
          margin-bottom: 0.5rem;
        }

        .survey-summary-success-pill span {
          color: var(--text-muted);
        }

        .survey-summary-success-pill code {
          font-weight: 600;
          color: var(--text-primary);
        }

        @media (max-width: 768px) {
          .survey-layout-grid {
            grid-template-columns: 1fr;
          }
          .operator-card {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
          .operator-survey-tip {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
