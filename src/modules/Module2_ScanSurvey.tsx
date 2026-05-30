import React, { useState, useEffect } from 'react';
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
  TrendingUp,
  ListTodo,
  CheckCircle,
  Clock,
  ArrowRight,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { Asset, SurveyRecord } from '../utils/mockData';
import { BarcodeScanner } from '../components/BarcodeScanner';
import { uploadImage } from '../services/dbService';
import confetti from 'canvas-confetti';

interface Module2ScanSurveyProps {
  assets: Asset[];
  surveys: SurveyRecord[];
  onAddSurvey: (survey: Omit<SurveyRecord, 'id'>) => Promise<void>;
  onUpdateAssetStatus: (id: string, status: Asset['status']) => Promise<void>;
  onLogAudit: (trail: { assetId: string; assetName: string; action: any; operator: string; details: string }) => Promise<void>;
  onRedirectToAdd: (prefilledId: string) => void;
}

export const Module2_ScanSurvey: React.FC<Module2ScanSurveyProps> = ({
  assets,
  surveys,
  onAddSurvey,
  onUpdateAssetStatus,
  onLogAudit,
  onRedirectToAdd
}) => {
  const [operator, setOperator] = useState(() => localStorage.getItem('assetwatch_operator') || 'ผู้ตรวจการทั่วไป');
  
  // Checklist-Driven State
  const [selectedDept, setSelectedDept] = useState<string>(() => localStorage.getItem('assetwatch_selected_dept') || 'all');
  const [checklistTab, setChecklistTab] = useState<'pending' | 'completed'>('pending');

  const [scannedId, setScannedId] = useState<string | null>(null);
  const [scannedAsset, setScannedAsset] = useState<Asset | null>(null);
  
  // Survey Form States
  const [selectedStatus, setSelectedStatus] = useState<Asset['status']>('ใช้งานได้');
  const [attachImageFile, setAttachImageFile] = useState<File | null>(null);
  const [attachImagePreview, setAttachImagePreview] = useState<string | null>(null);
  
  const [saving, setSaving] = useState(false);
  const [surveySuccess, setSurveySuccess] = useState(false);
  const [isNewScanNeeded, setIsNewScanNeeded] = useState(true);

  // Extract unique departments for dropdown
  const uniqueDepts = Array.from(new Set(assets.map(a => a.department).filter(Boolean)));

  // Save selected department to localstorage
  const handleDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedDept(val);
    localStorage.setItem('assetwatch_selected_dept', val);
  };

  // Save operator name to localStorage on change
  const handleOperatorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setOperator(val);
    localStorage.setItem('assetwatch_operator', val);
  };

  // Helpers to check if asset was surveyed today
  const todayStr = new Date().toISOString().split('T')[0];
  const isAssetSurveyedToday = (assetId: string) => {
    return surveys.some(s => {
      try {
        const sDate = new Date(s.timestamp).toISOString().split('T')[0];
        return s.assetId === assetId && sDate === todayStr;
      } catch {
        return false;
      }
    });
  };

  // Calculate filtered checklist based on selected department
  const filteredChecklist = assets.filter(asset => {
    if (selectedDept === 'all') return asset.status !== 'รอจำหน่าย' && asset.status !== 'อื่นๆ';
    return asset.department === selectedDept && asset.status !== 'รอจำหน่าย' && asset.status !== 'อื่นๆ';
  });

  const pendingList = filteredChecklist.filter(asset => !isAssetSurveyedToday(asset.id));
  const completedList = filteredChecklist.filter(asset => isAssetSurveyedToday(asset.id));

  const totalInList = filteredChecklist.length;
  const surveyedInList = completedList.length;
  const progressPercent = totalInList > 0 ? Math.round((surveyedInList / totalInList) * 100) : 0;

  // Trigger celebration on 100% completion of selected list!
  useEffect(() => {
    if (progressPercent === 100 && totalInList > 0 && !isNewScanNeeded && surveySuccess) {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 }
      });
    }
  }, [progressPercent, totalInList, isNewScanNeeded, surveySuccess]);

  const handleScanSuccess = (decodedId: string) => {
    setIsNewScanNeeded(false);
    setScannedId(decodedId);
    
    // Look up in assets list
    const found = assets.find(a => a.id.toLowerCase() === decodedId.toLowerCase());
    if (found) {
      setScannedAsset(found);
      setSelectedStatus(found.status);
      setSurveySuccess(false);

      // Warning if scanned asset belongs to a different department than selected
      if (selectedDept !== 'all' && found.department !== selectedDept) {
        // Just log a console warning or show in UI, we will handle in UI dynamically
      }
    } else {
      setScannedAsset(null);
      setSurveySuccess(false);
    }
  };

  const handleManualCountSelect = (asset: Asset) => {
    setIsNewScanNeeded(false);
    setScannedId(asset.id);
    setScannedAsset(asset);
    setSelectedStatus(asset.status);
    setSurveySuccess(false);
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
          details: `สแกนสำรวจตรวจนับ และอัปเดตเปลี่ยนสถานะพัสดุ จาก "${scannedAsset.status}" เป็น "${selectedStatus}"`
        });
      } else if (scannedAsset) {
        // Log simple verification survey audit trail
        await onLogAudit({
          assetId: scannedId,
          assetName: scannedAsset.name,
          action: 'survey',
          operator,
          details: `สแกนสำรวจตรวจนับแล้ว สภาพยังคง "${selectedStatus}" ตามปกติ`
        });
      } else {
        // Unregistered asset checked
        await onLogAudit({
          assetId: scannedId,
          assetName: 'ครุภัณฑ์ไม่ได้ลงทะเบียน',
          action: 'survey',
          operator,
          details: `สแกนพบและตรวจนับรหัสที่ยังไม่เคยมีในคลังระบบ: "${scannedId}"`
        });
      }

      // Polish: Confetti Rain!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
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

  const statusColors: Record<string, string> = {
    'ใช้งานได้': 'badge-success',
    'ชำรุด': 'badge-danger',
    'รอจำหน่าย': 'badge-warning',
    'ขอป้ายรหัสใหม่': 'badge-info',
    'รอโอน': 'badge-primary',
    'อื่นๆ': 'badge-muted'
  };

  return (
    <div className="module-container animate-fade-in">
      <div className="module-title-section">
        <h2>ระบบตรวจนับตามลิสต์และสแกนพัสดุรายหน่วยงาน (Module 2)</h2>
        <p>เลือกแผนงานเป้าหมาย คัดลอกและเปิดกล้องเดินสแกนเช็คเป้าหมายพัสดุค้างตรวจนับพร้อมแถบความก้าวหน้าเรียลไทม์</p>
      </div>

      {/* Setup configuration bar */}
      <div className="survey-setup-bar glass-panel">
        <div className="form-group flex-1" style={{ marginBottom: 0 }}>
          <label className="form-label">✍️ ชื่อผู้ตรวจสอบนับครุภัณฑ์</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="ป้อนชื่อผู้ตรวจนับ..." 
            value={operator}
            onChange={handleOperatorChange}
          />
        </div>
        
        <div className="form-group flex-1" style={{ marginBottom: 0 }}>
          <label className="form-label">🏢 เลือกแผนงาน / หน่วยงานที่ต้องการลงพื้นที่สำรวจ</label>
          <select 
            className="form-select select-survey-target"
            value={selectedDept}
            onChange={handleDeptChange}
          >
            <option value="all">ทุกหน่วยงาน (ครุภัณฑ์ทั้งหมดในคลัง)</option>
            {uniqueDepts.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress display dashboard for the selected checklist */}
      <div className="checklist-progress-panel glass-panel">
        <div className="progress-meta-info">
          <div className="progress-label-group">
            <ClipboardList size={20} className="text-blue" />
            <div>
              <h3>
                เป้าหมาย: {selectedDept === 'all' ? 'ทุกหน่วยงานรวมกัน' : selectedDept}
              </h3>
              <p className="progress-sub">สำรวจพัสดุเสร็จแล้ว <strong>{surveyedInList}</strong> จากทั้งหมด <strong>{totalInList}</strong> รายการ</p>
            </div>
          </div>
          <div className="progress-percent-large">
            {progressPercent}%
          </div>
        </div>

        <div className="progress-bar-bg" style={{ height: '12px', marginTop: '0.75rem' }}>
          <div 
            className="progress-bar-fill fill-primary"
            style={{ width: `${progressPercent}%`, height: '100%', borderRadius: 'inherit' }}
          ></div>
        </div>
      </div>

      {/* Main scanning & checklist dashboard */}
      <div className="survey-layout-grid">
        
        {/* Left Column: Barcode scanner camera */}
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
              
              {scannedAsset && selectedDept !== 'all' && scannedAsset.department !== selectedDept && (
                <div className="alert alert-danger" style={{ padding: '0.65rem 1rem', fontSize: '0.8rem', margin: '0.5rem 0' }}>
                  <AlertTriangle size={16} />
                  <span><strong>คำเตือน:</strong> ครุภัณฑ์ชิ้นนี้อยู่แผนก "{scannedAsset.department}" ไม่ตรงกับแผนกที่เลือกไว้!</span>
                </div>
              )}

              <button className="btn btn-secondary w-full" onClick={handleResetScan} style={{ marginTop: '0.5rem' }}>
                <RefreshCw size={14} /> กดเพื่อสแกนชิ้นถัดไป
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Dynamic Form or Checklist view */}
        <div className="form-column">
          
          {/* CASE 1: Normal state (Scan is running, display checklist board below scanner) */}
          {isNewScanNeeded && !scannedId && (
            <div className="checklist-board-card glass-panel">
              <div className="checklist-header-tabs">
                <button 
                  type="button"
                  className={`checklist-tab-btn ${checklistTab === 'pending' ? 'tab-active' : ''}`}
                  onClick={() => setChecklistTab('pending')}
                >
                  🔴 ค้างตรวจนับ ({pendingList.length})
                </button>
                <button 
                  type="button"
                  className={`checklist-tab-btn ${checklistTab === 'completed' ? 'tab-active' : ''}`}
                  onClick={() => setChecklistTab('completed')}
                >
                  🟢 ตรวจแล้ววันนี้ ({completedList.length})
                </button>
              </div>

              <div className="checklist-items-scroll">
                {checklistTab === 'pending' ? (
                  pendingList.length === 0 ? (
                    <div className="empty-checklist-state">
                      <CheckCircle2 size={36} color="var(--success)" />
                      <h4>สแกนเสร็จสิ้นครบ 100% แล้ว!</h4>
                      <p>ครุภัณฑ์ทั้งหมดของหน่วยงานนี้ได้รับการยืนยันประวัติเรียบร้อยแล้วในวันนี้</p>
                    </div>
                  ) : (
                    pendingList.map(item => (
                      <div key={item.id} className="checklist-item-row animate-fade-in">
                        <div className="item-meta">
                          <code className="item-code">{item.id}</code>
                          <h4 className="item-title">{item.name}</h4>
                          <span className="item-loc">📍 {item.location}</span>
                        </div>
                        <button 
                          type="button"
                          className="btn btn-secondary btn-xs btn-quick-survey"
                          onClick={() => handleManualCountSelect(item)}
                          title="กดเพื่อตรวจนับพัสดุชิ้นนี้ทันทีโดยไม่ต้องสแกนบาร์โค้ด"
                        >
                          ตรวจนับด้วยมือ <ChevronRight size={12} />
                        </button>
                      </div>
                    ))
                  )
                ) : (
                  completedList.length === 0 ? (
                    <div className="empty-checklist-state">
                      <Clock size={36} color="var(--text-muted)" />
                      <h4>ยังไม่มีการตรวจนับวันนี้</h4>
                      <p>หันกล้องมือถือไปสแกนป้ายบาร์โค้ด หรือกดสแกนด้วยมือข้างลิสต์เพื่อทำรายการตรวจรับชิ้นแรก</p>
                    </div>
                  ) : (
                    completedList.map(item => (
                      <div key={item.id} className="checklist-item-row item-row-completed animate-fade-in">
                        <div className="item-meta">
                          <code className="item-code">{item.id}</code>
                          <h4 className="item-title" style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>{item.name}</h4>
                          <span className="item-loc" style={{ color: 'var(--text-muted)' }}>📍 {item.location}</span>
                        </div>
                        <span className="badge badge-success check-mark-completed">
                          ✓ เช็คแล้ว ({item.status})
                        </span>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>
          )}

          {/* CASE 2: Scanned ID but asset NOT registered in system */}
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

          {/* CASE 3: Asset Scanned Successfully, displaying Confirm Form */}
          {scannedId && scannedAsset && !surveySuccess && (
            <form onSubmit={handleSurveySubmit} className="survey-form-panel glass-panel">
              <div className="survey-asset-brief">
                <img 
                  src={scannedAsset.imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60'} 
                  alt={scannedAsset.name} 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60';
                  }}
                />
                <div className="brief-details">
                  <span className="brief-id">{scannedAsset.id}</span>
                  <h3>{scannedAsset.name}</h3>
                  <span>📍 แผนก: {scannedAsset.department}</span>
                  <span>📍 ที่ตั้ง: {scannedAsset.location}</span>
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

          {/* CASE 4: Survey Success Screen */}
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

              {progressPercent === 100 && totalInList > 0 ? (
                <div className="alert alert-success animate-fade-in" style={{ width: '100%', marginBottom: '1rem' }}>
                  <Sparkles size={20} />
                  <span><strong>ยอดเยี่ยมมาก!</strong> คุณสำรวจครบ 100% ของเป้าหมายแผนงานนี้เรียบร้อยแล้ว! 🥳</span>
                </div>
              ) : null}

              <button className="btn btn-primary w-full" onClick={handleResetScan}>
                สแกนชิ้นถัดไปทันที
              </button>
            </div>
          )}

        </div>

      </div>

      <style>{`
        .survey-setup-bar {
          padding: 1.25rem;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .select-survey-target {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--primary);
          border-color: var(--primary);
        }

        /* Progress Panel */
        .checklist-progress-panel {
          padding: 1.25rem 1.5rem;
          margin-bottom: 1.5rem;
        }

        .progress-meta-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .progress-label-group {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .progress-label-group h3 {
          font-size: 1.05rem;
          font-weight: 750;
          line-height: 1.2;
        }

        .progress-sub {
          font-size: 0.775rem;
          color: var(--text-secondary);
          margin-top: 0.15rem;
        }

        .progress-percent-large {
          font-size: 1.85rem;
          font-weight: 900;
          color: var(--primary);
          line-height: 1;
        }

        /* Checklist board styles */
        .checklist-board-card {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          max-height: 400px;
          height: 100%;
        }

        .checklist-header-tabs {
          display: flex;
          border-bottom: 1.5px solid var(--border);
          margin-bottom: 0.75rem;
          gap: 0.5rem;
          padding-bottom: 0.25rem;
        }

        .checklist-tab-btn {
          flex: 1;
          padding: 0.65rem 0.5rem;
          border: none;
          background: transparent;
          font-family: var(--font-family);
          font-size: 0.85rem;
          font-weight: 650;
          color: var(--text-secondary);
          cursor: pointer;
          border-bottom: 2.5px solid transparent;
          transition: all var(--transition-fast);
          text-align: center;
        }

        .checklist-tab-btn:hover {
          color: var(--text-primary);
        }

        .checklist-tab-btn.tab-active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }

        .checklist-items-scroll {
          overflow-y: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .checklist-item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.65rem 0.85rem;
          background-color: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }

        .checklist-item-row:hover {
          border-color: var(--primary);
          background-color: var(--bg-secondary);
        }

        .item-row-completed {
          background-color: rgba(16, 185, 129, 0.01);
          border-color: rgba(16, 185, 129, 0.15);
        }

        .item-meta {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          max-width: 65%;
        }

        .item-code {
          font-size: 0.7rem;
          font-family: monospace;
          color: var(--text-muted);
          font-weight: 550;
        }

        .item-title {
          font-size: 0.825rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .item-loc {
          font-size: 0.725rem;
          color: var(--text-secondary);
        }

        .btn-quick-survey {
          padding: 0.35rem 0.6rem;
          font-size: 0.75rem;
          border-radius: var(--radius-sm);
          flex-shrink: 0;
        }

        .check-mark-completed {
          font-size: 0.725rem;
          padding: 0.25rem 0.5rem;
          flex-shrink: 0;
        }

        .empty-checklist-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 3rem 1.5rem;
          gap: 0.75rem;
          color: var(--text-muted);
        }

        .empty-checklist-state h4 {
          font-size: 0.9rem;
          font-weight: 750;
          color: var(--text-primary);
        }

        .empty-checklist-state p {
          font-size: 0.775rem;
          max-width: 240px;
        }

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
