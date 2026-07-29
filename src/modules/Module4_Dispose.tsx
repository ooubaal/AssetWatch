import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, FileText, CheckCircle2, Search, ArrowRight, Printer } from 'lucide-react';
import { Asset, UserAccount, AuditTrail } from '../utils/mockData';
import confetti from 'canvas-confetti';

interface Module4DisposeProps {
  assets: Asset[];
  audits: AuditTrail[];
  onUpdateAssetStatus: (id: string, status: Asset['status']) => Promise<void>;
  onLogAudit: (trail: { assetId: string; assetName: string; action: any; operator: string; details: string }) => Promise<void>;
  currentUser: UserAccount | null;
}

export const Module4_Dispose: React.FC<Module4DisposeProps> = ({
  assets,
  audits,
  onUpdateAssetStatus,
  onLogAudit,
  currentUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  
  // Disposal Form States
  const [disposeDate, setDisposeDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('ชำรุดเสื่อมสภาพผุพังไม่สามารถใช้งานได้');
  const [docRef, setDocRef] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Tab control state
  const [activeSubTab, setActiveSubTab] = useState<'single' | 'report'>('single');

  // Report Form States
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

  // Search assets (only display assets that are NOT already disposed)
  const activeAssets = assets.filter(a => {
    const isNotDisposed = a.status !== 'รอจำหน่าย' && a.status !== 'อื่นๆ';
    if (currentUser?.role === 'head' || currentUser?.role === 'operator' || currentUser?.role === 'user') {
      return isNotDisposed && a.department === currentUser.department;
    }
    return isNotDisposed;
  });
  const filteredAssets = activeAssets.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setSuccess(false);
  };

  const handleDisposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;

    setSaving(true);
    try {
      const operatorName = localStorage.getItem('assetwatch_operator') || 'แอดมินพัสดุ';
      const logDetails = `ทำแทงจำหน่ายครุภัณฑ์ออกจากทะเบียนพัสดุ เมื่อวันที่ ${disposeDate} อ้างอิงเอกสารที่: ${docRef || 'ไม่มี'} เนื่องจาก: ${reason}`;

      // 1. Update Asset status to 'รอจำหน่าย'
      await onUpdateAssetStatus(selectedAsset.id, 'รอจำหน่าย');

      // 2. Log in Audit Trails
      await onLogAudit({
        assetId: selectedAsset.id,
        assetName: selectedAsset.name,
        action: 'dispose',
        operator: operatorName,
        details: logDetails
      });

      // Polishing effect
      confetti({
        particleCount: 80,
        spread: 60,
        colors: ['#f59e0b', '#ef4444', '#ffffff']
      });

      setSuccess(true);
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการทำรายการจำหน่ายครุภัณฑ์');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedAsset(null);
    setDocRef('');
    setSuccess(false);
  };

  // Helper to extract doc ref and reason from audit details
  const parseAuditDetails = (details: string) => {
    const docRefMatch = details.match(/อ้างอิงเอกสารที่:\s*([^\s]+)/);
    const reasonMatch = details.match(/เนื่องจาก:\s*(.+)$/);
    
    return {
      docRef: docRefMatch ? docRefMatch[1] : 'ไม่ระบุ',
      reason: reasonMatch ? reasonMatch[1] : 'ชำรุดเสื่อมสภาพ'
    };
  };

  // Filter disposal logs from audits
  const disposalAudits = audits.filter(a => {
    if (a.action !== 'dispose') return false;
    
    const auditDateStr = a.timestamp.split('T')[0];
    const isWithinDateRange = auditDateStr >= startDate && auditDateStr <= endDate;
    if (!isWithinDateRange) return false;

    if (selectedReportDept !== 'all') {
      const asset = assets.find(as => as.id === a.assetId);
      if (asset) {
        if (asset.department !== selectedReportDept) return false;
      } else {
        const detailsContainDept = a.details.includes(selectedReportDept);
        if (!detailsContainDept) return false;
      }
    }
    
    return true;
  });

  return (
    <div className="module-container animate-fade-in">
      <div className="module-title-section">
        <h2>จำหน่ายพัสดุชำรุดออกจากบัญชีคุม (Module 4)</h2>
        <p>บันทึกประวัติการตัดทรัพย์สิน แทงบัญชีจำหน่าย อ้างอิงคำขอและคณะกรรมการพิจารณาเพื่อการตรวจสอบย้อนหลัง</p>
      </div>

      {/* Sub-tabs for Single and Report */}
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
          ✍️ บันทึกตัดจำหน่ายครุภัณฑ์ (Single Disposal)
        </button>
        <button 
          type="button" 
          className={`sub-tab ${activeSubTab === 'report' ? 'active' : ''}`}
          onClick={() => {
            setActiveSubTab('report');
          }}
        >
          🖨️ ออกรายงานการจำหน่ายพัสดุ (Disposal Report)
        </button>
      </div>

      {activeSubTab === 'single' ? (
        success && selectedAsset ? (
          <div className="success-wizard-card glass-panel text-center">
            <div className="success-checkmark-wrapper" style={{ backgroundColor: 'var(--warning-light)', boxShadow: '0 4px 15px rgba(245,158,11,0.2)' }}>
              <Trash2 size={40} color="var(--warning)" />
            </div>
            <h2>ตัดบัญชีจำหน่ายพัสดุสำเร็จ!</h2>
            <p>
              ครุภัณฑ์รหัส <code>{selectedAsset.id}</code> ได้รับการลงบันทึก <strong>"รอจำหน่าย"</strong> ในประวัติพัสดุอย่างเป็นทางการแล้ว
            </p>

            <div className="success-intake-details">
              <div className="intake-detail-line"><span>ชื่อเครื่องที่จำหน่าย:</span> <strong>{selectedAsset.name}</strong></div>
              <div className="intake-detail-line"><span>วันที่แทงจำหน่าย:</span> <span>{disposeDate}</span></div>
              <div className="intake-detail-line"><span>เลขที่เอกสารอ้างอิง:</span> <code>{docRef || 'ไม่ได้ระบุ'}</code></div>
            </div>

            <div className="success-card-actions">
              <button className="btn btn-primary" onClick={handleReset}>
                ทำรายการชิ้นอื่นต่อ
              </button>
            </div>
          </div>
        ) : (
          <div className="survey-layout-grid">
            
            {/* Left Column: Asset Selection Catalog */}
            <div className="scanner-column">
              <div className="selection-list-panel glass-panel">
                <div className="card-header" style={{ marginBottom: '1rem', paddingBottom: '0.5rem' }}>
                  <h3>เลือกครุภัณฑ์ที่ชำรุด/หมดสภาพ</h3>
                  <span className="card-header-sub">ค้นหาพัสดุเพื่อกรอกแบบฟอร์มตัดบัญชีจำหน่าย</span>
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
                    <p className="empty-scroll-text">ไม่พบรายการครุภัณฑ์ที่เข้าเกณฑ์</p>
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
                            <span className={`badge ${
                              item.status === 'ชำรุด' ? 'badge-danger' : 'badge-muted'
                            }`}>{item.status}</span>
                          </div>
                        </div>
                        <ArrowRight size={16} className="chevron-icon" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Disposal Reason Details Form */}
            <div className="form-column">
              {!selectedAsset ? (
                <div className="survey-wait-card glass-panel" style={{ minHeight: '380px' }}>
                  <Trash2 size={48} color="var(--text-muted)" />
                  <h3>ยังไม่ได้เลือกครุภัณฑ์</h3>
                  <p>เลือกรายการครุภัณฑ์จากแถบซ้ายมือเพื่อกรอกข้อมูลหนังสือแทงบัญชีจำหน่าย</p>
                </div>
              ) : (
                <form onSubmit={handleDisposeSubmit} className="survey-form-panel glass-panel">
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
                      <span>📍 {selectedAsset.location}</span>
                    </div>
                  </div>

                  <div className="alert alert-danger" style={{ marginBottom: 0, padding: '0.75rem' }}>
                    <AlertTriangle size={18} />
                    <span style={{ fontSize: '0.8rem' }}><strong>คำเตือน:</strong> การจำหน่ายจะทำการโอนทรัพย์สินนี้ไปเก็บอยู่ในประเภท รอจำหน่าย และเปิดเป็น Audit Logs ตลอดชีพ</span>
                  </div>

                  <div className="form-row-double">
                    <div className="form-group flex-1">
                      <label className="form-label">📅 วันที่คณะกรรมการอนุมัติจำหน่าย</label>
                      <input 
                        type="date" 
                        className="form-input"
                        value={disposeDate}
                        onChange={(e) => setDisposeDate(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group flex-1">
                      <label className="form-label">🧾 เลขที่เอกสาร/หนังสือนำส่งคำขอ</label>
                      <input 
                        type="text" 
                        className="form-input"
                        placeholder="เช่น อว 6901/105"
                        value={docRef}
                        onChange={(e) => setDocRef(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">⚠️ สาเหตุแห่งการจำหน่ายครุภัณฑ์ออกจากทะเบียน</label>
                    <select 
                      className="form-select"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                    >
                      <option value="ชำรุดเสื่อมสภาพผุพังไม่สามารถใช้งานได้">ชำรุดเสื่อมสภาพผุพังใช้งานไม่ได้ (ซ่อมไม่คุ้มทุน)</option>
                      <option value="สูญหายรอดำเนินการทางละเมิด">สูญหาย (รอดำเนินการทางละเมิด)</option>
                      <option value="หมดความจำเป็น/เก่าล้าสมัยมาก">เก่าและเทคโนโลยีล้าสมัย (ยกเลิกการใช้งานระบบ)</option>
                      <option value="อื่นๆ">อื่นๆ</option>
                    </select>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setSelectedAsset(null)}>
                      ยกเลิก
                    </button>
                    <button type="submit" className="btn btn-danger" disabled={saving}>
                      {saving ? 'กำลังประมวลผล...' : '🚨 ยืนยันการตัดจำหน่ายคลัง'}
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
             ออกรายงานประวัติครุภัณฑ์จำหน่ายสะสมออกจากคลัง
          </h3>
           
          <div className="grid-cols-3">
            <div className="form-group">
              <label className="form-label">🏢 ฝ่าย/หน่วยงานผู้ดูแลเดิม {currentUser?.role === 'user' && '(ล็อคสิทธิ์ตามสังกัด)'}</label>
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
              <h4 style={{ fontWeight: 800, color: 'var(--primary)' }}>🖨️ ตัวอย่างก่อนพิมพ์รายงานจำหน่ายพัสดุชำรุด (A4 Preview)</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>รายงานบัญชีจำหน่ายพัสดุจัดรูปแบบสำหรับพิมพ์ลงกระดาษ A4</p>
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
                รายงานบัญชีครุภัณฑ์และพัสดุที่ชำรุดตัดจำหน่ายคลัง
              </h1>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#333333', margin: '0.2rem 0' }}>
                ประจำวันที่ {new Date(startDate).toLocaleDateString('th-TH')} ถึงวันที่ {new Date(endDate).toLocaleDateString('th-TH')}
              </h2>
              {selectedReportDept !== 'all' && (
                <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.25rem' }}>หน่วยงาน/ฝ่าย: {selectedReportDept}</div>
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
                <div><strong>📦 ครุภัณฑ์ที่จำหน่ายจำแนกได้:</strong> {disposalAudits.length} รายการ</div>
                <div><strong>📅 วันเวลาที่ออกเอกสาร:</strong> {new Date().toLocaleDateString('th-TH')} {new Date().toLocaleTimeString('th-TH')} น.</div>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f2f2f2', borderBottom: '1.5px solid #000000', borderTop: '1px solid #dddddd' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'center', border: '1px solid #dddddd', width: '40px' }}>ลำดับ</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #dddddd', width: '90px' }}>วันที่จำหน่าย</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #dddddd', width: '110px' }}>รหัสครุภัณฑ์</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #dddddd' }}>ชื่อรายการครุภัณฑ์</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #dddddd', width: '100px' }}>ฝ่ายที่ดูแลเดิม</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #dddddd', width: '100px' }}>เลขที่หนังสืออนุมัติ</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left', border: '1px solid #dddddd', width: '150px' }}>สาเหตุ/เหตุผลการจำหน่าย</th>
                </tr>
              </thead>
              <tbody>
                {disposalAudits.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '1.5rem', textAlign: 'center', border: '1px solid #dddddd', color: '#666666' }}>
                      ไม่พบประวัติพัสดุชำรุดตัดบัญชีจำหน่ายในช่วงเวลาหรือหน่วยงานที่เลือก
                    </td>
                  </tr>
                ) : (
                  disposalAudits.map((audit, idx) => {
                    const { docRef, reason } = parseAuditDetails(audit.details);
                    const asset = assets.find(a => a.id === audit.assetId);
                    const formerDept = asset?.department || audit.details.match(/ฝ่าย:\s*([^\s]+)/)?.[1] || 'ไม่ระบุ';
                    return (
                      <tr key={audit.id} style={{ borderBottom: '1px solid #dddddd' }}>
                        <td style={{ padding: '0.5rem', textAlign: 'center', border: '1px solid #dddddd' }}>{idx + 1}</td>
                        <td style={{ padding: '0.5rem', border: '1px solid #dddddd' }}>{new Date(audit.timestamp).toLocaleDateString('th-TH')}</td>
                        <td style={{ padding: '0.5rem', border: '1px solid #dddddd', fontFamily: 'monospace', fontWeight: 'bold' }}>{audit.assetId}</td>
                        <td style={{ padding: '0.5rem', border: '1px solid #dddddd' }}>{audit.assetName}</td>
                        <td style={{ padding: '0.5rem', border: '1px solid #dddddd' }}>{formerDept}</td>
                        <td style={{ padding: '0.5rem', border: '1px solid #dddddd' }}>{docRef}</td>
                        <td style={{ padding: '0.5rem', border: '1px solid #dddddd' }}>{reason}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            <div style={{ marginTop: '5rem', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ textAlign: 'center', width: '280px' }}>
                <div style={{ marginBottom: '3.5rem' }}>ลงชื่อ.................................................................. ผู้รายงาน</div>
                <div>( {currentUser?.name || '..............................................'} )</div>
                <div style={{ fontSize: '0.85rem', color: '#666666', marginTop: '0.35rem' }}>ตำแหน่ง: เจ้าหน้าที่ทะเบียนพัสดุ</div>
              </div>
              <div style={{ textAlign: 'center', width: '280px' }}>
                <div style={{ marginBottom: '3.5rem' }}>ลงชื่อ.................................................................. ผู้อนุมัติจำหน่าย</div>
                <div>( .............................................................. )</div>
                <div style={{ fontSize: '0.85rem', color: '#666666', marginTop: '0.35rem' }}>ตำแหน่ง: คณะกรรมการ/ผู้มีอำนาจลงนาม</div>
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
