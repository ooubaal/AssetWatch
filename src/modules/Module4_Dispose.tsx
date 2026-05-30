import React, { useState } from 'react';
import { Trash2, AlertTriangle, FileText, CheckCircle2, Search, ArrowRight } from 'lucide-react';
import { Asset, UserAccount } from '../utils/mockData';
import confetti from 'canvas-confetti';

interface Module4DisposeProps {
  assets: Asset[];
  onUpdateAssetStatus: (id: string, status: Asset['status']) => Promise<void>;
  onLogAudit: (trail: { assetId: string; assetName: string; action: any; operator: string; details: string }) => Promise<void>;
  currentUser: UserAccount | null;
}

export const Module4_Dispose: React.FC<Module4DisposeProps> = ({
  assets,
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

  // Search assets (only display assets that are NOT already disposed)
  const activeAssets = assets.filter(a => {
    const isNotDisposed = a.status !== 'รอจำหน่าย' && a.status !== 'อื่นๆ';
    if (currentUser?.role === 'user') {
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

  return (
    <div className="module-container animate-fade-in">
      <div className="module-title-section">
        <h2>จำหน่ายพัสดุชำรุดออกจากบัญชีคุม (Module 4)</h2>
        <p>บันทึกประวัติการตัดทรัพย์สิน แทงบัญชีจำหน่าย อ้างอิงคำขอและคณะกรรมการพิจารณาเพื่อการตรวจสอบย้อนหลัง</p>
      </div>

      {success && selectedAsset ? (
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
      )}

      <style>{`
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
