import React, { useState } from 'react';
import { Move, Search, ArrowRight, CheckCircle2, AlertCircle, Building } from 'lucide-react';
import { Asset, DepartmentLocationConfig, UserAccount } from '../utils/mockData';
import confetti from 'canvas-confetti';

interface Module5TransferProps {
  assets: Asset[];
  onUpdateAssetTransfer: (id: string, transferData: { location: string; department: string; responsiblePerson: string }) => Promise<void>;
  onLogAudit: (trail: { assetId: string; assetName: string; action: any; operator: string; details: string; changes?: any }) => Promise<void>;
  departments: DepartmentLocationConfig[];
  currentUser: UserAccount | null;
}

export const Module5_Transfer: React.FC<Module5TransferProps> = ({
  assets,
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

  // Search active assets (only active/usable ones can be transferred)
  const transferrableAssets = assets.filter(a => {
    const isTransferrable = a.status !== 'รอจำหน่าย' && a.status !== 'อื่นๆ';
    if (currentUser?.role === 'user') {
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

  return (
    <div className="module-container animate-fade-in">
      <div className="module-title-section">
        <h2>โอนย้ายครุภัณฑ์ระหว่างหน่วยงาน (Module 5)</h2>
        <p>บันทึกประวัติการเปลี่ยนสถานที่ตั้ง (Relocation) เปลี่ยนฝ่ายผู้ถือครอง ปรับปรุงฐานข้อมูลพัสดุให้เป็นปัจจุบัน</p>
      </div>

      {success && selectedAsset ? (
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
                      <div className="form-group flex-1">
                        <label className="form-label">🏢 ฝ่าย/หน่วยงานที่รับโอนดูแล</label>
                        <select 
                          className="form-select"
                          value={newDepartment}
                          onChange={handleDepartmentSelectChange}
                          required
                        >
                          {departments.length === 0 ? (
                            <option value="">ไม่มีหน่วยงาน (โปรดกดพิมพ์กรอกเอง)</option>
                          ) : (
                            departments.map(dept => (
                              <option key={dept.id} value={dept.name}>{dept.name}</option>
                            ))
                          )}
                        </select>
                      </div>

                      <div className="form-group flex-1">
                        <label className="form-label">📍 ปลายทางสถานที่ติดตั้งแห่งใหม่</label>
                        <select 
                          className="form-select"
                          value={newLocation}
                          onChange={(e) => setNewLocation(e.target.value)}
                          required
                        >
                          {(() => {
                            const currentDeptObj = departments.find(d => d.name === newDepartment);
                            if (!currentDeptObj || currentDeptObj.locations.length === 0) {
                              return <option value="">ไม่มีห้องระบุ (โปรดกดพิมพ์กรอกเอง)</option>;
                            }
                            return currentDeptObj.locations.map(loc => (
                              <option key={loc} value={loc}>{loc}</option>
                            ));
                          })()}
                        </select>
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
      )}
    </div>
  );
};
