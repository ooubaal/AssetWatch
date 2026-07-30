import React, { useState, useEffect } from 'react';
import { Move, Search, ArrowRight, CheckCircle2, AlertCircle, Building, Printer } from 'lucide-react';
import { Asset, DepartmentLocationConfig, UserAccount, AuditTrail } from '../utils/mockData';
import confetti from 'canvas-confetti';
import { SearchableSelect } from '../components/SearchableSelect';

interface Module5TransferProps {
  assets: Asset[];
  audits: AuditTrail[];
  onUpdateAssetTransfer: (id: string, transferData: { location: string; department: string; responsiblePerson: string }) => Promise<void>;
  onLogAudit: (trail: { assetId: string; assetName: string; action: any; operator: string; details: string; changes?: any }) => Promise<void>;
  departments: DepartmentLocationConfig[];
  currentUser: UserAccount | null;
}

export const Module5_Transfer: React.FC<Module5TransferProps> = ({
  assets,
  audits,
  onUpdateAssetTransfer,
  onLogAudit,
  departments,
  currentUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Transfer Form States
  const [newLocation, setNewLocation] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newResponsible, setNewResponsible] = useState('');
  const [transferDoc, setTransferDoc] = useState('');
  const [isCustomInput, setIsCustomInput] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Tab Control State
  const [activeSubTab, setActiveSubTab] = useState<'single' | 'report'>('single');

  // Report States
  const [selectedReportDept, setSelectedReportDept] = useState(() => {
    return (currentUser?.role === 'head' || currentUser?.role === 'operator' || currentUser?.role === 'user') ? currentUser.department : 'all';
  });
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isReportPrintOpen, setIsReportPrintOpen] = useState(false);

  // Sync operator user's department restriction
  useEffect(() => {
    if (currentUser?.role === 'head' || currentUser?.role === 'operator' || currentUser?.role === 'user') {
      setSelectedReportDept(currentUser.department);
    }
  }, [currentUser]);

  // Search active assets (only active/usable ones can be transferred)
  const transferrableAssets = assets.filter(a => {
    const isTransferrable = a.status !== 'รอจำหน่าย' && a.status !== 'อื่นๆ';
    if (currentUser?.role === 'head' || currentUser?.role === 'operator' || currentUser?.role === 'user') {
      return isTransferrable && a.department === currentUser.department;
    }
    return isTransferrable;
  });
  const filteredAssets = transferrableAssets.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setNewLocation(asset.location);
    setNewDepartment(asset.department);
    setNewResponsible(asset.responsiblePerson);
    
    // Auto-detect if department is configured in system
    const isDeptInConfig = departments.some(d => d.name === asset.department);
    if (isDeptInConfig) {
      setIsCustomInput(false);
    } else {
      setIsCustomInput(true);
    }
    
    setSuccess(false);
  };

  const handleDepartmentSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deptName = e.target.value;
    setNewDepartment(deptName);
    const found = departments.find(d => d.name === deptName);
    if (found && found.locations.length > 0) {
      setNewLocation(found.locations[0]);
    } else {
      setNewLocation('');
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;

    setSaving(true);
    try {
      const operatorName = localStorage.getItem('assetwatch_operator') || 'แอดมินพัสดุ';
      
      // Calculate changes for Audit Trail Diff Viewer
      const changes: Record<string, { old: string; new: string }> = {};
      if (selectedAsset.location !== newLocation) {
        changes.location = { old: selectedAsset.location, new: newLocation };
      }
      if (selectedAsset.department !== newDepartment) {
        changes.department = { old: selectedAsset.department, new: newDepartment };
      }
      if (selectedAsset.responsiblePerson !== newResponsible) {
        changes.responsiblePerson = { old: selectedAsset.responsiblePerson, new: newResponsible };
      }

      // If no change made, alert
      if (Object.keys(changes).length === 0) {
        alert('กรุณากรอกข้อมูลสถานที่ตั้งใหม่ หรือหน่วยงานดูแลใหม่ที่แตกต่างจากข้อมูลเดิม');
        setSaving(false);
        return;
      }

      // 1. Update Asset properties
      await onUpdateAssetTransfer(selectedAsset.id, {
        location: newLocation,
        department: newDepartment,
        responsiblePerson: newResponsible
      });

      // 2. Log in Audit Trails with Diff Viewer parameters
      await onLogAudit({
        assetId: selectedAsset.id,
        assetName: selectedAsset.name,
        action: 'transfer',
        operator: operatorName,
        details: `ทำรายการอนุมัติย้ายครุภัณฑ์ เลขที่คำขอ: ${transferDoc || 'ไม่มี'} ย้ายสถานที่และหน่วยงานผู้รับผิดชอบใหม่`,
        changes
      });

      // Polish
      confetti({
        particleCount: 100,
        spread: 70,
        colors: ['#3b82f6', '#06b6d4', '#ffffff']
      });

      setSuccess(true);
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการทำเรื่องโอนย้ายครุภัณฑ์');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedAsset(null);
    setTransferDoc('');
    setSuccess(false);
  };

  // Helper to extract transfer details from audit log and changes
  const parseTransferDetails = (audit: AuditTrail) => {
    const docMatch = audit.details.match(/เลขที่คำขอ:\s*([^\s]+)/);
    const docRef = docMatch ? docMatch[1] : 'ไม่ระบุ';
    
    const asset = assets.find(a => a.id === audit.assetId);
    
    const oldDept = audit.changes?.department?.old || 'ไม่ระบุ';
    const newDept = audit.changes?.department?.new || asset?.department || 'ไม่ระบุ';
    
    const oldLoc = audit.changes?.location?.old || 'ไม่ระบุ';
    const newLoc = audit.changes?.location?.new || asset?.location || 'ไม่ระบุ';
    
    const oldResp = audit.changes?.responsiblePerson?.old || 'ไม่ระบุ';
    const newResp = audit.changes?.responsiblePerson?.new || asset?.responsiblePerson || 'ไม่ระบุ';
    
    return {
      docRef,
      oldDept,
      newDept,
      oldLoc,
      newLoc,
      oldResp,
      newResp
    };
  };

  // Filter transfer logs from audits
  const transferAudits = audits.filter(a => {
    if (a.action !== 'transfer') return false;

    const auditDateStr = a.timestamp.split('T')[0];
    const isWithinDateRange = auditDateStr >= startDate && auditDateStr <= endDate;
    if (!isWithinDateRange) return false;

    if (selectedReportDept !== 'all') {
      const asset = assets.find(as => as.id === a.assetId);
      const oldDept = a.changes?.department?.old;
      const newDept = a.changes?.department?.new;
      
      const relatedToDept = 
        (oldDept && oldDept === selectedReportDept) ||
        (newDept && newDept === selectedReportDept) ||
        (asset && asset.department === selectedReportDept) ||
        a.details.includes(selectedReportDept);
        
      if (!relatedToDept) return false;
    }
    
    return true;
  });

  return (
    <div className="module-container animate-fade-in">
      <div className="module-title-section">
        <h2>โอนย้ายครุภัณฑ์ระหว่างหน่วยงาน (Module 5)</h2>
        <p>บันทึกประวัติการเปลี่ยนสถานที่ตั้ง (Relocation) เปลี่ยนฝ่ายผู้ถือครอง ปรับปรุงฐานข้อมูลพัสดุให้เป็นปัจจุบัน</p>
      </div>

      {/* Sub-tabs for Transfer and Report */}
      <div className="sub-tabs-container">
        <button 
          type="button" 
          className={`sub-tab ${activeSubTab === 'single' ? 'active' : ''}`}
          onClick={() => {
            setActiveSubTab('single');
            setSuccess(false);
            setSelectedAsset(null);
          }}
        >
          ✍️ บันทึกโอนย้ายครุภัณฑ์ (Single Transfer)
        </button>
        <button 
          type="button" 
          className={`sub-tab ${activeSubTab === 'report' ? 'active' : ''}`}
          onClick={() => {
            setActiveSubTab('report');
          }}
        >
          🖨️ ออกรายงานการโอนย้ายพัสดุ (Transfer Report)
        </button>
      </div>

      {activeSubTab === 'single' ? (
        success && selectedAsset ? (
          <div className="success-wizard-card glass-panel text-center">
            <div className="success-checkmark-wrapper" style={{ backgroundColor: 'var(--primary-light)', boxShadow: '0 4px 15px rgba(59,130,246,0.2)' }}>
              <Move size={40} color="var(--primary)" />
            </div>
            <h2>บันทึกเรื่องโอนย้ายสำเร็จ!</h2>
            <p>
              ครุภัณฑ์รหัส <code>{selectedAsset.id}</code> ได้รับการปรับปรุงตำแหน่งติดตั้งและหน่วยงานรับผิดชอบในระบบเรียบร้อยแล้ว
            </p>

            <div className="success-intake-details">
              <div className="intake-detail-line"><span>ชื่อครุภัณฑ์:</span> <strong>{selectedAsset.name}</strong></div>
              <div className="intake-detail-line"><span>ย้ายไปที่:</span> <span>📍 {newLocation}</span></div>
              <div className="intake-detail-line"><span>หน่วยงานใหม่:</span> <span>🏢 {newDepartment}</span></div>
              <div className="intake-detail-line"><span>ผู้รับผิดชอบใหม่:</span> <span>👤 {newResponsible}</span></div>
            </div>

            <div className="success-card-actions">
              <button className="btn btn-primary animate-bounce-slow" onClick={handleReset}>
                ทำเรื่องโอนย้ายชิ้นถัดไป
              </button>
            </div>
          </div>
        ) : (
          <div className="survey-layout-grid">
            
            {/* Left Column: Asset Selection */}
            <div className="scanner-column">
              <div className="selection-list-panel glass-panel">
                <div className="card-header" style={{ marginBottom: '1rem', paddingBottom: '0.5rem' }}>
                  <h3>เลือกครุภัณฑ์ที่ต้องการโอนย้าย</h3>
                  <span className="card-header-sub">ค้นหาพัสดุเพื่อจัดแจงตำแหน่งย้ายปลายทาง</span>
                </div>
                
                <div className="search-box" style={{ marginBottom: '1rem', minWidth: '100%' }}>
                  <Search size={16} className="search-icon" />
                  <input 
                    type="text" 
                    className="form-input search-input" 
                    placeholder="ป้อนรหัส หรือ ชื่ออุปกรณ์..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="assets-selection-scroll">
                  {filteredAssets.length === 0 ? (
                    <p className="empty-scroll-text">ไม่พบรายการครุภัณฑ์ที่ย้ายได้</p>
                  ) : (
                    filteredAssets.map(item => (
                      <button 
                        key={item.id} 
                        className={`select-asset-row ${selectedAsset?.id === item.id ? 'row-selected' : ''}`}
                        onClick={() => handleSelectAsset(item)}
                      >
                        <div className="select-asset-brief">
                          <span className="brief-id">{item.id}</span>
                          <h4>{item.name}</h4>
                          <div className="brief-meta-line">
                            <span>📍 {item.location}</span>
                            <span>🏢 {item.department}</span>
                          </div>
                        </div>
                        <ArrowRight size={16} className="chevron-icon" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Transfer Form */}
            <div className="form-column">
              {!selectedAsset ? (
                <div className="survey-wait-card glass-panel" style={{ minHeight: '380px' }}>
                  <Move size={48} color="var(--text-muted)" />
                  <h3>ยังไม่ได้เลือกครุภัณฑ์</h3>
                  <p>เลือกรายการครุภัณฑ์ที่คุณมีใบสั่งสั่งการย้ายตำแหน่ง เพื่อออกบันทึกโอนย้ายพัสดุ</p>
                </div>
              ) : (
                <form onSubmit={handleTransferSubmit} className="survey-form-panel glass-panel animate-fade-in">
                  <div className="survey-asset-brief">
                    <img 
                      src={selectedAsset.imageUrl} 
                      alt={selectedAsset.name} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60';
                      }}
                    />
                    <div className="brief-details">
                      <span className="brief-id">{selectedAsset.id}</span>
                      <h3>{selectedAsset.name}</h3>
                      <span>📍 ที่อยู่เดิม: {selectedAsset.location}</span>
                    </div>
                  </div>

                  {/* Transfer reference document ID */}
                  <div className="form-group">
                    <label className="form-label">🧾 เลขที่ใบสั่งอนุมัติการโอนย้าย/บันทึกข้อความ</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="เช่น ศธ 6901-ย.25/2569"
                      value={transferDoc}
                      onChange={(e) => setTransferDoc(e.target.value)}
                      required
                    />
                  </div>

                  {/* Relocation input options */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 650, color: 'var(--text-muted)' }}>📍 ฝ่ายปลายทางและห้องติดตั้งใหม่</span>
                    <button 
                      type="button" 
                      className="btn btn-ghost btn-xs"
                      onClick={() => {
                        const nextVal = !isCustomInput;
                        setIsCustomInput(nextVal);
                        if (nextVal) {
                          setNewDepartment('');
                          setNewLocation('');
                        } else {
                          if (departments.length > 0) {
                            setNewDepartment(departments[0].name);
                            setNewLocation(departments[0].locations[0] || '');
                          }
                        }
                      }}
                      style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', border: '1px solid var(--border)', background: 'var(--bg-secondary)', height: 'auto', outline: 'none' }}
                    >
                      {isCustomInput ? '🏢 ใช้รายการระบบ' : '✍️ พิมพ์กรอกข้อมูลเอง'}
                    </button>
                  </div>

                  <div className="form-row-double">
                    {isCustomInput ? (
                      <>
                        <div className="form-group flex-1">
                          <label className="form-label">🏢 ฝ่าย/หน่วยงานที่รับโอนดูแล</label>
                          <input 
                            type="text" 
                            className="form-input"
                            placeholder="พิมพ์ฝ่าย/แผนกใหม่..."
                            value={newDepartment}
                            onChange={(e) => setNewDepartment(e.target.value)}
                            required
                          />
                        </div>

                        <div className="form-group flex-1">
                          <label className="form-label">📍 ปลายทางสถานที่ติดตั้งแห่งใหม่</label>
                          <input 
                            type="text" 
                            className="form-input"
                            placeholder="พิมพ์ห้องติดตั้งใหม่..."
                            value={newLocation}
                            onChange={(e) => setNewLocation(e.target.value)}
                            required
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex-1">
                          <SearchableSelect
                            label="🏢 ฝ่าย/หน่วยงานที่รับโอนดูแล"
                            options={departments.map(d => d.name)}
                            value={newDepartment}
                            onChange={(val) => {
                              setNewDepartment(val);
                              const found = departments.find(d => d.name === val);
                              if (found && found.locations.length > 0) {
                                setNewLocation(found.locations[0]);
                              } else {
                                setNewLocation('');
                              }
                            }}
                            required
                            placeholder="เลือกหน่วยงาน..."
                          />
                        </div>

                        <div className="flex-1">
                          <SearchableSelect
                            label="📍 ปลายทางสถานที่ติดตั้งแห่งใหม่"
                            options={(() => {
                              const currentDeptObj = departments.find(d => d.name === newDepartment);
                              return currentDeptObj ? currentDeptObj.locations : [];
                            })()}
                            value={newLocation}
                            onChange={(val) => setNewLocation(val)}
                            required
                            placeholder="เลือกสถานที่ติดตั้ง..."
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">👤 ผู้ดูแล / เจ้าหน้าที่ผู้รับมอบกรรมสิทธิ์</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={newResponsible}
                      onChange={(e) => setNewResponsible(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setSelectedAsset(null)}>
                      ยกเลิก
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'กำลังย้ายข้อมูล...' : '🔄 บันทึกใบโอนย้ายทรัพย์สิน'}
                    </button>
                  </div>

                </form>
              )}
            </div>

          </div>
        )
      ) : (
        // Report Config Panel
        <div className="report-config-panel intake-form glass-panel animate-fade-in" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
             ออกรายงานประวัติการโอนย้ายครุภัณฑ์และพัสดุ
          </h3>
           
          <div className="grid-cols-3">
            <div className="form-group">
              <label className="form-label">🏢 ฝ่าย/หน่วยงานที่เกี่ยวข้อง {currentUser?.role === 'user' && '(ล็อคสิทธิ์ตามสังกัด)'}</label>
              <select 
                className="form-select"
                value={selectedReportDept}
                onChange={(e) => setSelectedReportDept(e.target.value)}
                disabled={currentUser?.role === 'head' || currentUser?.role === 'operator' || currentUser?.role === 'user'}
              >
                {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && <option value="all">ทุกหน่วยงาน</option>}
                {currentUser?.role === 'user' ? (
                  <option value={currentUser.department}>{currentUser.department}</option>
                ) : (
                  Array.from(new Set(assets.map(a => a.department).filter(Boolean))).map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))
                )}
              </select>
            </div>
             
            <div className="form-group">
              <label className="form-label">📅 เริ่มต้นตั้งแต่วันที่</label>
               <input 
                 type="date" 
                 className="form-input"
                 value={startDate}
                 onChange={(e) => setStartDate(e.target.value)}
               />
             </div>
             
             <div className="form-group">
               <label className="form-label">📅 จนถึงวันที่</label>
               <input 
                 type="date" 
                 className="form-input"
                 value={endDate}
                 onChange={(e) => setEndDate(e.target.value)}
               />
             </div>
          </div>
           
          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1rem' }}>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => setIsReportPrintOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <Printer size={16} /> 🖨️ แสดงตัวอย่างรายงานและจัดพิมพ์
            </button>
          </div>
        </div>
      )}

      {/* FULLSCREEN PRINT PREVIEW OVERLAY */}
      {isReportPrintOpen && (
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 9999, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '2rem 1rem' }}>
          
          <div className="print-actions-bar glass-panel" style={{ maxWidth: '800px', width: '100%', margin: '0 auto 1.5rem auto', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10000 }}>
            <div>
              <h4 style={{ fontWeight: 800, color: 'var(--primary)' }}>🖨️ ตัวอย่างก่อนพิมพ์รายงานการโอนย้ายพัสดุ (A4 Preview)</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>รายงานประวัติการโอนย้ายพัสดุจัดรูปแบบสำหรับพิมพ์ลงกระดาษ A4</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setIsReportPrintOpen(false)}
              >
                ย้อนกลับ
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => window.print()}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Printer size={16} /> สั่งพิมพ์ / PDF
              </button>
            </div>
          </div>

          <div className="print-paper-a4 printable-a4-document" style={{ background: '#ffffff', color: '#000000', maxWidth: '800px', width: '100%', margin: '0 auto', padding: '2.5rem 3rem', minHeight: '11.28in', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', fontFamily: "'Sarabun', 'Noto Sans Thai', sans-serif", fontSize: '13px', lineHeight: '1.6', colorScheme: 'light', borderRadius: '4px' }}>
            
            <div style={{ textAlign: 'center', position: 'relative', marginBottom: '2.5rem' }}>
              <div style={{ fontSize: '28px', color: '#000000', marginBottom: '0.5rem' }}>🇹🇭</div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#000000', margin: '0.2rem 0' }}>
                รายงานประวัติการโอนย้ายครุภัณฑ์และทรัพย์สิน
              </h1>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#333333', margin: '0.2rem 0' }}>
                ประจำวันที่ {new Date(startDate).toLocaleDateString('th-TH')} ถึงวันที่ {new Date(endDate).toLocaleDateString('th-TH')}
              </h2>
              {selectedReportDept !== 'all' && (
                <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.25rem' }}>หน่วยงาน/ฝ่ายที่เกี่ยวข้อง: {selectedReportDept}</div>
              )}
              <div style={{ fontSize: '0.85rem', color: '#666666', marginTop: '0.5rem' }}>
                ระบบคลังข้อมูลครุภัณฑ์ AssetWatch
              </div>
            </div>

            <hr style={{ border: '0', borderTop: '2px double #333333', margin: '1rem 0 1.5rem 0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', background: '#f8f9fa', padding: '1rem', border: '1px solid #dddddd', borderRadius: '4px' }}>
              <div>
                <div><strong>👤 ผู้ออกรายงาน:</strong> {currentUser?.name || 'ไม่ได้ระบุ'}</div>
                <div><strong>🏢 บทบาทหน้าที่:</strong> {currentUser?.role === 'admin' ? 'แอดมินสูงสุด' : (currentUser?.role === 'manager' ? 'ผู้จัดการ' : 'ผู้ปฏิบัติงาน')}</div>
              </div>
              <div style={{ borderLeft: '1px solid #dddddd', paddingLeft: '1rem' }}>
                <div><strong>🔄 รายการโอนย้าย:</strong> {transferAudits.length} รายการ</div>
                <div><strong>📅 วันเวลาที่ออกเอกสาร:</strong> {new Date().toLocaleDateString('th-TH')} {new Date().toLocaleTimeString('th-TH')} น.</div>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', fontSize: '11px' }}>
              <thead>
                <tr style={{ background: '#f2f2f2', borderBottom: '1.5px solid #000000', borderTop: '1px solid #dddddd' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'center', border: '1px solid #dddddd', width: '35px' }}>ลำดับ</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #dddddd', width: '80px' }}>วันที่โอนย้าย</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #dddddd', width: '100px' }}>รหัสครุภัณฑ์</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #dddddd' }}>ชื่อรายการครุภัณฑ์</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #dddddd', width: '90px' }}>เลขที่ใบอนุมัติ</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #dddddd', width: '120px' }}>ฝ่ายเดิม → ฝ่ายใหม่</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #dddddd', width: '120px' }}>สถานที่เดิม → ใหม่</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #dddddd', width: '90px' }}>ผู้ดูแลเดิม → ใหม่</th>
                </tr>
              </thead>
              <tbody>
                {transferAudits.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '1.5rem', textAlign: 'center', border: '1px solid #dddddd', color: '#666666' }}>
                      ไม่พบประวัติการโอนย้ายครุภัณฑ์ในช่วงเวลาหรือหน่วยงานที่เลือก
                    </td>
                  </tr>
                ) : (
                  transferAudits.map((audit, idx) => {
                    const { docRef, oldDept, newDept, oldLoc, newLoc, oldResp, newResp } = parseTransferDetails(audit);
                    return (
                      <tr key={audit.id} style={{ borderBottom: '1px solid #dddddd' }}>
                        <td style={{ padding: '0.5rem', textAlign: 'center', border: '1px solid #dddddd' }}>{idx + 1}</td>
                        <td style={{ padding: '0.5rem', border: '1px solid #dddddd' }}>{new Date(audit.timestamp).toLocaleDateString('th-TH')}</td>
                        <td style={{ padding: '0.5rem', border: '1px solid #dddddd', fontFamily: 'monospace', fontWeight: 'bold' }}>{audit.assetId}</td>
                        <td style={{ padding: '0.5rem', border: '1px solid #dddddd' }}>{audit.assetName}</td>
                        <td style={{ padding: '0.5rem', border: '1px solid #dddddd' }}>{docRef}</td>
                        <td style={{ padding: '0.5rem', border: '1px solid #dddddd', fontSize: '10px' }}>{oldDept} <ArrowRight size={10} style={{ display: 'inline', margin: '0 2px' }} /> {newDept}</td>
                        <td style={{ padding: '0.5rem', border: '1px solid #dddddd', fontSize: '10px' }}>{oldLoc} <ArrowRight size={10} style={{ display: 'inline', margin: '0 2px' }} /> {newLoc}</td>
                        <td style={{ padding: '0.5rem', border: '1px solid #dddddd', fontSize: '10px' }}>{oldResp} <ArrowRight size={10} style={{ display: 'inline', margin: '0 2px' }} /> {newResp}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            <div style={{ marginTop: '5rem', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ textAlign: 'center', width: '280px' }}>
                <div style={{ marginBottom: '3.5rem' }}>ลงชื่อ.................................................................. ผู้ส่งมอบ</div>
                <div>( .............................................................. )</div>
                <div style={{ fontSize: '0.85rem', color: '#666666', marginTop: '0.35rem' }}>ตำแหน่ง: เจ้าหน้าที่แผนกส่งมอบพัสดุ</div>
              </div>
              <div style={{ textAlign: 'center', width: '280px' }}>
                <div style={{ marginBottom: '3.5rem' }}>ลงชื่อ.................................................................. ผู้รับมอบ</div>
                <div>( .............................................................. )</div>
                <div style={{ fontSize: '0.85rem', color: '#666666', marginTop: '0.35rem' }}>ตำแหน่ง: เจ้าหน้าที่แผนกรับมอบพัสดุ</div>
              </div>
            </div>

          </div>
        </div>
      )}

      <style>{`
        /* Sub-tabs premium styles */
        .sub-tabs-container {
          display: flex;
          gap: 0.25rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 0.25rem;
        }
        .sub-tab {
          padding: 0.75rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          background: none;
          border: none;
          border-bottom: 2.5px solid transparent;
          cursor: pointer;
          transition: all var(--transition-fast);
          outline: none;
        }
        .sub-tab:hover {
          color: var(--primary);
        }
        .sub-tab.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }
        .report-config-panel {
          max-width: 800px;
          margin: 0 auto;
        }

        .selection-list-panel {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          max-height: 480px;
        }

        .assets-selection-scroll {
          overflow-y: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-right: 0.25rem;
        }

        .select-asset-row {
          width: 100%;
          text-align: left;
          background-color: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .select-asset-row:hover {
          border-color: var(--primary);
          background-color: var(--bg-secondary);
        }

        .row-selected {
          border-color: var(--primary);
          background-color: var(--primary-light);
        }

        .select-asset-brief h4 {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0.1rem 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 220px;
        }

        .brief-meta-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .chevron-icon {
          color: var(--text-muted);
        }

        .empty-scroll-text {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-align: center;
          padding: 2rem 0;
        }

        @media (max-width: 768px) {
          .assets-selection-scroll {
            max-height: 250px;
          }
        }
      `}</style>
    </div>
  );
};
