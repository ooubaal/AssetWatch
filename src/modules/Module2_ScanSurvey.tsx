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
  ClipboardList,
  Printer,
  Lock,
  PlusCircle,
  Calendar,
  History,
  FileText,
  CheckSquare
} from 'lucide-react';
import { Asset, SurveyRecord, SurveyRound, UserAccount } from '../utils/mockData';
import { BarcodeScanner } from '../components/BarcodeScanner';
import { uploadImage } from '../services/dbService';
import confetti from 'canvas-confetti';

interface Module2ScanSurveyProps {
  assets: Asset[];
  surveys: SurveyRecord[];
  rounds: SurveyRound[];
  activeRound: SurveyRound | null;
  onAddSurvey: (survey: Omit<SurveyRecord, 'id'>) => Promise<void>;
  onUpdateAssetStatus: (id: string, status: Asset['status']) => Promise<void>;
  onLogAudit: (trail: { assetId: string; assetName: string; action: any; operator: string; details: string }) => Promise<void>;
  onRedirectToAdd: (prefilledId: string) => void;
  onCreateSurveyRound: (name: string, operator: string) => Promise<void>;
  onCloseActiveRound: (operator: string) => Promise<void>;
  currentUser: UserAccount | null;
}

export const Module2_ScanSurvey: React.FC<Module2ScanSurveyProps> = ({
  assets,
  surveys,
  rounds,
  activeRound,
  onAddSurvey,
  onUpdateAssetStatus,
  onLogAudit,
  onRedirectToAdd,
  onCreateSurveyRound,
  onCloseActiveRound,
  currentUser
}) => {
  const [operator, setOperator] = useState(() => localStorage.getItem('assetwatch_operator') || 'ผู้ตรวจการทั่วไป');

  useEffect(() => {
    if (currentUser) {
      setOperator(currentUser.name);
    }
  }, [currentUser]);
  
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

  // Survey Round Manager States
  const [newRoundName, setNewRoundName] = useState('');
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [closeOperator, setCloseOperator] = useState(operator);
  const [printingRound, setPrintingRound] = useState<SurveyRound | null>(null);
  const [roundHistoryTab, setRoundHistoryTab] = useState<'active' | 'history'>('active');
  const [selectedRoundDept, setSelectedRoundDept] = useState('all');

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

  // Helpers to check if asset was surveyed in active round
  const isAssetSurveyedInRound = (assetId: string) => {
    if (!activeRound) return false;
    return surveys.some(s => s.assetId === assetId && s.roundId === activeRound.id);
  };

  // Calculate filtered checklist based on selected department
  const filteredChecklist = assets.filter(asset => {
    if (selectedDept === 'all') return true;
    return asset.department === selectedDept;
  });

  const pendingList = filteredChecklist.filter(asset => !isAssetSurveyedInRound(asset.id));
  const completedList = filteredChecklist.filter(asset => isAssetSurveyedInRound(asset.id));

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
        timestamp: new Date().toISOString(),
        roundId: activeRound?.id || 'round-default'
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
                {currentUser?.role === 'manager' ? (
                  <button type="button" className="btn btn-muted" disabled style={{ cursor: 'not-allowed', opacity: 0.65 }}>
                    🔒 ผู้จัดการ (Manager) — อ่านอย่างเดียว
                  </button>
                ) : (
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'กำลังบันทึก...' : '✅ ยืนยันความถูกต้องพัสดุ'}
                  </button>
                )}
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

      {/* SECTION: ANNUAL SURVEY ROUND MANAGER & ARCHIVES */}
      <div className="rounds-manager-card glass-panel" style={{ marginTop: '1.75rem', padding: '1.5rem' }}>
        <div className="rounds-manager-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <History size={22} className="text-primary" />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>จัดการรอบการตรวจสอบพัสดุประจำปี</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ปิดรอบการตรวจสอบ ล็อคข้อมูลสถิติประวัติเพื่อรายงาน และเริ่มการตรวจรอบถัดไป</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Department Dropdown Filter inside Rounds Manager */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.725rem', fontWeight: 750, color: 'var(--text-muted)' }}>🏢 หน่วยงาน:</span>
              <select 
                className="form-select select-survey-target" 
                value={selectedRoundDept} 
                onChange={(e) => setSelectedRoundDept(e.target.value)}
                style={{ padding: '0.15rem 1.5rem 0.15rem 0.35rem', fontSize: '0.75rem', border: 'none', background: 'transparent', width: 'auto', fontWeight: 'bold', color: 'var(--primary)', height: 'auto', outline: 'none', boxShadow: 'none' }}
              >
                <option value="all">ทุกหน่วยงาน</option>
                {uniqueDepts.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="tab-pill-group" style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '0.2rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <button 
                type="button" 
                className={`btn btn-xs ${roundHistoryTab === 'active' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setRoundHistoryTab('active')}
                style={{ padding: '0.35rem 0.75rem', borderRadius: 'calc(var(--radius-sm) - 2px)' }}
              >
                🎯 รอบปัจจุบัน
              </button>
              <button 
                type="button" 
                className={`btn btn-xs ${roundHistoryTab === 'history' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setRoundHistoryTab('history')}
                style={{ padding: '0.35rem 0.75rem', borderRadius: 'calc(var(--radius-sm) - 2px)' }}
              >
                📜 ประวัติรอบที่ปิดแล้ว ({rounds.filter(r => r.status === 'closed').length})
              </button>
            </div>
          </div>
        </div>

        {roundHistoryTab === 'active' ? (
          <div>
            {activeRound ? (() => {
              const activeRoundAssets = assets.filter(a => selectedRoundDept === 'all' || a.department === selectedRoundDept);
              const activeRoundSurveys = surveys.filter(s => {
                if (s.roundId !== activeRound.id) return false;
                if (selectedRoundDept === 'all') return true;
                const asset = assets.find(a => a.id === s.assetId);
                return asset?.department === selectedRoundDept;
              });
              
              const totalCount = activeRoundAssets.length;
              const surveyedCount = activeRoundSurveys.length;
              const rate = totalCount > 0 ? Math.round((surveyedCount / totalCount) * 100) : 0;
              
              return (
                <div className="active-round-dashboard" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span className="badge badge-success" style={{ animation: 'pulse 1.5s infinite alternate' }}>✓ กำลังดำเนินการ (Active)</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>เริ่มรอบเมื่อ: {new Date(activeRound.dateCreated).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} น.</span>
                    </div>
                    
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.75rem' }}>{activeRound.name}</h4>
                    
                    <div className="stats-mini-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                      <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ครุภัณฑ์ทั้งหมด {selectedRoundDept !== 'all' ? `(${selectedRoundDept})` : ''}</span>
                        <div style={{ fontSize: '1.35rem', fontWeight: 900 }}>{totalCount} รายการ</div>
                      </div>
                      <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>สแกนตรวจนับแล้ว</span>
                        <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--success)' }}>{surveyedCount} รายการ</div>
                      </div>
                      <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>อัตราความก้าวหน้า</span>
                        <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--primary)' }}>{rate}%</div>
                      </div>
                    </div>

                    {currentUser?.role !== 'manager' ? (
                      !showCloseConfirm ? (
                        <button 
                          type="button" 
                          className="btn btn-danger"
                          onClick={() => {
                            setShowCloseConfirm(true);
                            setCloseOperator(operator);
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
                        >
                          <Lock size={15} /> 🔒 ปิดรอบการสำรวจและบันทึกประวัติ
                        </button>
                      ) : (
                        <div className="close-confirm-card" style={{ background: 'rgba(239, 68, 68, 0.03)', border: '1.5px solid var(--danger)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <AlertTriangle color="var(--danger)" size={18} />
                            <h5 style={{ fontWeight: 800, color: 'var(--danger)' }}>ยืนยันการปิดรอบการสำรวจพัสดุประจำปี?</h5>
                          </div>
                          
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            การปิดรอบจะทำการ **แช่แข็งสถิติ** (อัตราความก้าวหน้า และจำนวนสถานะ) เก็บเข้าสารบบประวัติของรอบนี้ และ **รีเซ็ตเช็คลิสต์ตรวจนับ** ของครุภัณฑ์ทุกชิ้นกลับเป็น "ค้างตรวจนับ" เพื่อเริ่มปีงบประมาณรอบใหม่
                          </p>

                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ color: 'var(--text-primary)' }}>👤 ลงลายมือชื่อแอดมินผู้ปิดรอบ / ตรวจสอบความถูกต้อง</label>
                            <input 
                              type="text" 
                              className="form-input" 
                              placeholder="พิมพ์ชื่อของคุณเพื่อยืนยัน..." 
                              value={closeOperator}
                              onChange={(e) => setCloseOperator(e.target.value)}
                              required
                              style={{ border: '1.5px solid var(--danger)' }}
                            />
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCloseConfirm(false)}>
                              ยกเลิก
                            </button>
                            <button 
                              type="button" 
                              className="btn btn-danger btn-sm" 
                              disabled={!closeOperator.trim()}
                              onClick={async () => {
                                if (!closeOperator.trim()) return;
                                await onCloseActiveRound(closeOperator);
                                setShowCloseConfirm(false);
                                confetti({
                                  particleCount: 150,
                                  spread: 80,
                                  origin: { y: 0.6 }
                                });
                              }}
                            >
                              ยืนยันการปิดรอบและรีเซ็ตระบบ
                            </button>
                          </div>
                        </div>
                      )
                    ) : (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                        <Lock size={14} /> บัญชีผู้จัดการ (Manager) — ไม่มีสิทธิ์ปิดรอบสำรวจพัสดุ
                      </div>
                    )}
                  </div>

                  <div className="active-round-status-box" style={{ flex: 0.8, minWidth: '250px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <h4 style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                      <TrendingUp size={16} color="var(--primary)" /> สถิติสถานะเรียลไทม์ (Active Breakdown)
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {Object.keys(statusColors).map(statusKey => {
                        const count = activeRoundSurveys.filter(s => s.status === statusKey).length;
                        return (
                          <div key={statusKey} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <span className={`badge ${statusColors[statusKey]}`} style={{ width: '10px', height: '10px', padding: 0, borderRadius: '50%' }}></span>
                              <span>{statusKey}</span>
                            </span>
                            <strong style={{ fontSize: '0.95rem' }}>{count} ชิ้น</strong>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })() : (
              <div className="no-active-round-box" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', background: 'rgba(59, 130, 246, 0.02)', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <AlertTriangle size={36} color="var(--primary)" style={{ animation: 'bounce 1s infinite alternate' }} />
                <h4 style={{ fontWeight: 800 }}>ยังไม่มีรอบการตรวจนับครุภัณฑ์ที่เปิดใช้งาน</h4>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', maxWidth: '420px' }}>
                  เมื่อเริ่มเปิดรอบใหม่ ครุภัณฑ์ทั้งหมดจะอยู่ในสถานะ "ค้างสแกน" เพื่อเริ่มดำเนินการเดินสายสแกนตรวจสอบประจำปีใหม่
                </p>

                <div className="new-round-wizard" style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '500px', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="เช่น รอบสำรวจประจำปีงบประมาณ 2570..." 
                    value={newRoundName}
                    onChange={(e) => setNewRoundName(e.target.value)}
                    style={{ flex: 1, minWidth: '220px' }}
                  />
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    disabled={!newRoundName.trim()}
                    onClick={async () => {
                      if (!newRoundName.trim()) return;
                      await onCreateSurveyRound(newRoundName, operator);
                      setNewRoundName('');
                      confetti({
                        particleCount: 100,
                        spread: 50
                      });
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <PlusCircle size={15} /> 🚀 เริ่มรอบการสำรวจใหม่
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="closed-rounds-history">
            {rounds.filter(r => r.status === 'closed').length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                <Clock size={36} style={{ marginBottom: '0.5rem', opacity: 0.6 }} />
                <p style={{ fontSize: '0.85rem' }}>ยังไม่พบประวัติรอบการสำรวจที่เคยปิดเสร็จสิ้นในอดีต</p>
              </div>
            ) : (
              <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)' }}>
                      <th style={{ padding: '0.65rem 0.5rem' }}>🎯 ชื่องานรอบสำรวจ</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>📅 วันที่เริ่มต้น - ปิดรอบ</th>
                      <th style={{ padding: '0.65rem 0.5rem', textAlign: 'center' }}>ความคืบหน้า</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>📊 รายละเอียดสภาพที่พบ</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>👤 ผู้ดำเนินการ</th>
                      <th style={{ padding: '0.65rem 0.5rem', textAlign: 'center' }}>รายงาน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rounds.filter(r => r.status === 'closed').map(round => {
                      const roundAssets = assets.filter(a => selectedRoundDept === 'all' || a.department === selectedRoundDept);
                      const roundSurveys = surveys.filter(s => {
                        if (s.roundId !== round.id) return false;
                        if (selectedRoundDept === 'all') return true;
                        const asset = assets.find(a => a.id === s.assetId);
                        return asset?.department === selectedRoundDept;
                      });

                      const totalCount = roundAssets.length;
                      const surveyedCount = roundSurveys.length;
                      const rate = totalCount > 0 ? Math.round((surveyedCount / totalCount) * 100) : 0;

                      const countBreakdown = (statusKey: string) => {
                        return roundSurveys.filter(s => s.status === statusKey).length;
                      };

                      return (
                        <tr key={round.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>{round.name}</td>
                          <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>
                            <div>เริ่ม: {new Date(round.dateCreated).toLocaleDateString('th-TH')}</div>
                            <div>ปิด: {round.dateClosed ? new Date(round.dateClosed).toLocaleDateString('th-TH') : '-'}</div>
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                            <span className="badge badge-success" style={{ fontWeight: 900 }}>
                              {rate}%
                            </span>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                              ({surveyedCount}/{totalCount})
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', fontSize: '0.7rem' }}>
                              <span className="badge badge-success">ใช้งานได้: {countBreakdown('ใช้งานได้')}</span>
                              <span className="badge badge-danger">ชำรุด: {countBreakdown('ชำรุด')}</span>
                              <span className="badge badge-warning">รอจำหน่าย: {countBreakdown('รอจำหน่าย')}</span>
                              <span className="badge badge-info">ป้ายใหม่: {countBreakdown('ขอป้ายรหัสใหม่')}</span>
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>{round.operator}</td>
                          <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                            <button 
                              type="button" 
                              className="btn btn-secondary btn-xs"
                              onClick={() => setPrintingRound(round)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              <Printer size={12} /> พิมพ์รายงาน
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FULLSCREEN PRINT PREVIEW OVERLAY */}
      {printingRound && (
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 9999, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '2rem 1rem' }}>
          
          <div className="print-actions-bar glass-panel" style={{ maxWidth: '800px', width: '100%', margin: '0 auto 1.5rem auto', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10000 }}>
            <div>
              <h4 style={{ fontWeight: 800, color: 'var(--primary)' }}>🖨️ ตัวอย่างก่อนพิมพ์รายงานราชการ (A4 Preview)</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>เอกสารทางการจัดรูปแบบตามมาตรฐาน สำหรับเสนอรายงานผู้บริหารหรือพิมพ์ลงกระดาษ A4</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setPrintingRound(null)}
              >
                ย้อนกลับ
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => window.print()}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Printer size={16} /> สั่งพิมพ์ / บันทึก PDF
              </button>
            </div>
          </div>

          <div className="print-paper-a4 printable-a4-document" style={{ background: '#ffffff', color: '#000000', maxWidth: '800px', width: '100%', margin: '0 auto', padding: '2.5rem 3rem', minHeight: '11.28in', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', fontFamily: "'Sarabun', 'Noto Sans Thai', sans-serif", fontSize: '13px', lineHeight: '1.6', colorScheme: 'light', borderRadius: '4px' }}>
            
            {(() => {
              // Recalculating round statistics dynamically for selectedRoundDept in print preview
              const printAssets = assets.filter(a => selectedRoundDept === 'all' || a.department === selectedRoundDept);
              const printSurveys = surveys.filter(s => {
                if (s.roundId !== printingRound.id) return false;
                if (selectedRoundDept === 'all') return true;
                const asset = assets.find(a => a.id === s.assetId);
                return asset?.department === selectedRoundDept;
              });

              const printTotal = printAssets.length;
              const printSurveyed = printSurveys.length;
              const printRate = printTotal > 0 ? Math.round((printSurveyed / printTotal) * 100) : 0;

              // Generate breakdown dynamically
              const breakdown = {
                'ใช้งานได้': 0,
                'ชำรุด': 0,
                'รอจำหน่าย': 0,
                'ขอป้ายรหัสใหม่': 0,
                'รอโอน': 0,
                'อื่นๆ': 0
              };
              printSurveys.forEach(s => {
                const key = s.status as keyof typeof breakdown;
                if (key in breakdown) {
                  breakdown[key]++;
                } else {
                  breakdown['อื่นๆ']++;
                }
              });

              const surveyedAssetIds = printSurveys.map(s => s.assetId);
              const printMissed = printAssets.filter(a => !surveyedAssetIds.includes(a.id));

              return (
                <>
                  {/* Government Stylized Header */}
                  <div style={{ textAlign: 'center', position: 'relative', marginBottom: '2.5rem' }}>
                    <div style={{ fontSize: '28px', color: '#000000', marginBottom: '0.5rem' }}>🇹🇭</div>
                    <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#000000', margin: '0.2rem 0' }}>
                      รายงานสรุปผลการตรวจนับครุภัณฑ์ประจำปี
                      {selectedRoundDept !== 'all' ? ` (หน่วยงาน: ${selectedRoundDept})` : ''}
                    </h1>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#333333', margin: '0.2rem 0' }}>ชื่องาน: {printingRound.name}</h2>
                    <div style={{ fontSize: '0.85rem', color: '#666666', marginTop: '0.5rem' }}>
                      หน่วยงาน: คลังข้อมูลพัสดุและครุภัณฑ์กลางระบบ AssetWatch
                    </div>
                  </div>

                  <hr style={{ border: '0', borderTop: '2px double #333333', margin: '1rem 0 1.5rem 0' }} />

                  {/* Document Meta Section */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', background: '#f8f9fa', padding: '1rem', border: '1px solid #dddddd', borderRadius: '4px' }}>
                    <div>
                      <div><strong>📅 วันที่ตรวจสอบเริ่มรอบ:</strong> {new Date(printingRound.dateCreated).toLocaleDateString('th-TH')}</div>
                      <div><strong>📅 วันที่เสร็จสิ้นปิดรอบ:</strong> {printingRound.dateClosed ? new Date(printingRound.dateClosed).toLocaleDateString('th-TH') : '-'}</div>
                      <div><strong>👤 เจ้าหน้าที่แอดมินผู้ประมวลผล:</strong> {printingRound.operator}</div>
                    </div>
                    <div style={{ borderLeft: '1px solid #dddddd', paddingLeft: '1rem' }}>
                      <div><strong>📦 ครุภัณฑ์ทั้งหมด {selectedRoundDept !== 'all' ? `(${selectedRoundDept})` : 'ในคลังระบบ'}:</strong> {printTotal} รายการ</div>
                      <div><strong>✅ สแกนตรวจสอบความถูกต้องแล้ว:</strong> {printSurveyed} รายการ</div>
                      <div><strong>📊 อัตราความก้าวหน้าการสำรวจ:</strong> {printRate}%</div>
                    </div>
                  </div>

                  {/* Section 1: Summary Table */}
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, borderBottom: '1px solid #000000', paddingBottom: '0.25rem', marginBottom: '0.75rem', marginTop: '1.5rem' }}>
                    ๑. รายงานสรุปผลจำแนกตามสภาพครุภัณฑ์ที่สแกนพบ (Condition Breakdown Summary)
                  </h3>
                  
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                    <thead>
                      <tr style={{ background: '#f2f2f2', borderBottom: '1.5px solid #000000', borderTop: '1px solid #dddddd' }}>
                        <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #dddddd' }}>ลำดับที่</th>
                        <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #dddddd' }}>สภาพ/สถานะพัสดุ</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right', border: '1px solid #dddddd' }}>จำนวน (ชิ้น)</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right', border: '1px solid #dddddd' }}>ร้อยละ (%) ของผู้ตรวจรับ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(breakdown).map((statusKey, idx) => {
                        const count = (breakdown as any)[statusKey] || 0;
                        const percent = printSurveyed > 0 ? Math.round((count / printSurveyed) * 100) : 0;
                        return (
                          <tr key={statusKey} style={{ borderBottom: '1px solid #dddddd' }}>
                            <td style={{ padding: '0.5rem', border: '1px solid #dddddd' }}>{idx + 1}</td>
                            <td style={{ padding: '0.5rem', border: '1px solid #dddddd', fontWeight: 'bold' }}>{statusKey}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right', border: '1px solid #dddddd' }}>{count}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right', border: '1px solid #dddddd' }}>{percent}%</td>
                          </tr>
                        );
                      })}
                      <tr style={{ background: '#f8f9fa', borderTop: '1.5px solid #000000', borderBottom: '2px solid #000000', fontWeight: 'bold' }}>
                        <td style={{ padding: '0.5rem', border: '1px solid #dddddd' }} colSpan={2}>รวมรายการครุภัณฑ์ที่ตรวจนับได้สำเร็จในรอบนี้</td>
                        <td style={{ padding: '0.5rem', textAlign: 'right', border: '1px solid #dddddd' }}>{printSurveyed}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'right', border: '1px solid #dddddd' }}>100%</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Section 2: Surveyed List */}
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, borderBottom: '1px solid #000000', paddingBottom: '0.25rem', marginBottom: '0.75rem', marginTop: '1.5rem' }}>
                    ๒. รายละเอียดครุภัณฑ์ที่ได้รับการสแกนยืนยันตัวตนสำเร็จ (Surveyed Assets List)
                  </h3>
                  
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ background: '#f2f2f2', borderBottom: '1.5px solid #000000', borderTop: '1px solid #dddddd' }}>
                        <th style={{ padding: '0.45rem', textAlign: 'left', border: '1px solid #dddddd' }}>รหัสครุภัณฑ์</th>
                        <th style={{ padding: '0.45rem', textAlign: 'left', border: '1px solid #dddddd' }}>ชื่อรายการครุภัณฑ์</th>
                        <th style={{ padding: '0.45rem', textAlign: 'left', border: '1px solid #dddddd' }}>ฝ่าย/แผนก</th>
                        <th style={{ padding: '0.45rem', textAlign: 'left', border: '1px solid #dddddd' }}>สถานที่</th>
                        <th style={{ padding: '0.45rem', textAlign: 'center', border: '1px solid #dddddd' }}>สภาพที่พบ</th>
                        <th style={{ padding: '0.45rem', textAlign: 'left', border: '1px solid #dddddd' }}>ผู้ตรวจ</th>
                        <th style={{ padding: '0.45rem', textAlign: 'left', border: '1px solid #dddddd' }}>เวลาเช็ค</th>
                      </tr>
                    </thead>
                    <tbody>
                      {printSurveys.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: '1rem', textAlign: 'center', border: '1px solid #dddddd', color: '#666666' }}>ไม่มีรายการครุภัณฑ์ที่ตรวจนับในรอบนี้</td>
                        </tr>
                      ) : (
                        printSurveys.map(record => {
                          const matchedAsset = assets.find(a => a.id === record.assetId);
                          return (
                            <tr key={record.id} style={{ borderBottom: '1px solid #dddddd' }}>
                              <td style={{ padding: '0.45rem', border: '1px solid #dddddd', fontFamily: 'monospace', fontWeight: 'bold' }}>{record.assetId}</td>
                              <td style={{ padding: '0.45rem', border: '1px solid #dddddd' }}>{matchedAsset?.name || 'ไม่มีชื่อรหัสพัสดุ'}</td>
                              <td style={{ padding: '0.45rem', border: '1px solid #dddddd' }}>{matchedAsset?.department || '-'}</td>
                              <td style={{ padding: '0.45rem', border: '1px solid #dddddd' }}>{matchedAsset?.location || '-'}</td>
                              <td style={{ padding: '0.45rem', textAlign: 'center', border: '1px solid #dddddd', fontWeight: 'bold', color: record.status === 'ชำรุด' ? '#d9534f' : '#22bb33' }}>
                                {record.status}
                              </td>
                              <td style={{ padding: '0.45rem', border: '1px solid #dddddd' }}>{record.operator}</td>
                              <td style={{ padding: '0.45rem', border: '1px solid #dddddd', whiteSpace: 'nowrap' }}>
                                {new Date(record.timestamp).toLocaleDateString('th-TH')}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>

                  {/* Section 3: Missed Assets List */}
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, borderBottom: '1px solid #000000', paddingBottom: '0.25rem', marginBottom: '0.75rem', marginTop: '1.5rem' }}>
                    ๓. สรุปรายการครุภัณฑ์ที่ขาดหาย / ค้างการแสกนตรวจสอบ (Missed / Unsurveyed Assets List)
                  </h3>

                  <div>
                    <div style={{ marginBottom: '0.5rem' }}>ตรวจพบค้างสำรวจทั้งสิ้น <strong>{printMissed.length}</strong> รายการ ดังนี้:</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ background: '#fff0f0', borderBottom: '1.5px solid #ffcccc', borderTop: '1px solid #ffcccc' }}>
                          <th style={{ padding: '0.45rem', textAlign: 'left', border: '1px solid #ffcccc', color: '#c9302c' }}>รหัสครุภัณฑ์</th>
                          <th style={{ padding: '0.45rem', textAlign: 'left', border: '1px solid #ffcccc', color: '#c9302c' }}>ชื่อรายการครุภัณฑ์</th>
                          <th style={{ padding: '0.45rem', textAlign: 'left', border: '1px solid #ffcccc', color: '#c9302c' }}>ฝ่าย/แผนก</th>
                          <th style={{ padding: '0.45rem', textAlign: 'left', border: '1px solid #ffcccc', color: '#c9302c' }}>สถานที่จัดเก็บตามระบบ</th>
                          <th style={{ padding: '0.45rem', textAlign: 'center', border: '1px solid #ffcccc', color: '#c9302c' }}>ผู้รับผิดชอบ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {printMissed.length === 0 ? (
                          <tr>
                            <td colSpan={5} style={{ padding: '1rem', textAlign: 'center', border: '1px solid #ffcccc', color: '#22bb33', fontWeight: 'bold' }}>✓ ตรวจสอบครบสมบูรณ์ทุกรายการ ไม่มีครุภัณฑ์สูญหาย/ค้างตรวจสอบ</td>
                          </tr>
                        ) : (
                          printMissed.map(asset => (
                            <tr key={asset.id} style={{ borderBottom: '1px solid #ffcccc', background: '#fffafa' }}>
                              <td style={{ padding: '0.45rem', border: '1px solid #ffcccc', fontFamily: 'monospace', fontWeight: 'bold', color: '#c9302c' }}>{asset.id}</td>
                              <td style={{ padding: '0.45rem', border: '1px solid #ffcccc', color: '#333333' }}>{asset.name}</td>
                              <td style={{ padding: '0.45rem', border: '1px solid #ffcccc' }}>{asset.department}</td>
                              <td style={{ padding: '0.45rem', border: '1px solid #ffcccc' }}>{asset.location}</td>
                              <td style={{ padding: '0.45rem', textAlign: 'center', border: '1px solid #ffcccc' }}>{asset.responsiblePerson}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()}

            {/* Signature Block */}
            <div style={{ marginTop: '5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ textAlign: 'center', width: '280px' }}>
                <div style={{ marginBottom: '3rem' }}>ลงชื่อ.................................................................. ผู้รายงานผล</div>
                <div>( {printingRound.operator} )</div>
                <div style={{ fontSize: '0.85rem', color: '#666666', marginTop: '0.35rem' }}>ตำแหน่ง: แอดมินคลังพัสดุและครุภัณฑ์</div>
                <div style={{ fontSize: '0.85rem', color: '#666666' }}>วันที่ {printingRound.dateClosed ? new Date(printingRound.dateClosed).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</div>
              </div>
            </div>

          </div>
        </div>
      )}

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

        /* GOVERNMENT A4 DOCUMENT PRINT STYLES */
        @media print {
          body * {
            visibility: hidden !important;
          }
          #root, #root * {
            visibility: hidden !important;
          }
          .print-preview-overlay, .print-preview-overlay * {
            visibility: visible !important;
          }
          .print-preview-overlay {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          .print-actions-bar {
            display: none !important;
          }
          .printable-a4-document {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};
