import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit3, Grid, List, ShieldAlert, Printer, X, FileSpreadsheet, QrCode, Camera } from 'lucide-react';
import { Asset, AuditTrail, SurveyRecord, RepairCase, UserAccount, PMSchedule, SparePart } from '../utils/mockData';
import { AssetModal } from '../components/AssetModal';
import { BarcodeScanner } from '../components/BarcodeScanner';

interface Module1DatabaseProps {
  assets: Asset[];
  audits: AuditTrail[];
  repairs: RepairCase[];
  surveys: SurveyRecord[];
  schedules: PMSchedule[];
  onAssetEdit: (asset: Asset) => void;
  currentUser: UserAccount | null;
  onRefreshData?: () => void;
  spareParts?: SparePart[];
  onAddSparePart?: (part: SparePart) => Promise<void>;
  onUpdateSparePart?: (part: SparePart) => Promise<void>;
  onDeleteSparePart?: (id: string) => Promise<void>;
}

export const Module1_Database: React.FC<Module1DatabaseProps> = ({
  assets,
  audits,
  repairs,
  surveys,
  schedules,
  onAssetEdit,
  currentUser,
  onRefreshData,
  spareParts = [],
  onAddSparePart,
  onUpdateSparePart,
  onDeleteSparePart
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Selected asset for viewing details in modal
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  
  // State for Report Print Modal & Scanner Modal
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Role permissions check
  const isOrgWide = currentUser?.role === 'admin' || currentUser?.role === 'manager';
  const userDept = currentUser?.department || '';

  // Force department filter for Head / Operator
  useEffect(() => {
    if (!isOrgWide && userDept) {
      setDeptFilter(userDept);
    }
  }, [currentUser, isOrgWide, userDept]);

  // Export to Excel / CSV (supports UTF-8 with BOM for Excel & Google Sheets)
  const handleExportExcel = () => {
    if (filteredAssets.length === 0) {
      alert('ไม่พบข้อมูลครุภัณฑ์สำหรับส่งออกรายงาน');
      return;
    }

    const headers = [
      'ลำดับ',
      'รหัสครุภัณฑ์',
      'ชื่อรายการครุภัณฑ์',
      'สถานะ',
      'หน่วยงาน/ฝ่าย',
      'สถานที่จัดเก็บ/ห้อง',
      'ผู้รับผิดชอบ',
      'ที่มา/งบประมาณ',
      'วันที่รับเข้า',
      'หมายเหตุ',
      'ผู้ลงทะเบียน'
    ];

    const rows = filteredAssets.map((asset, idx) => [
      idx + 1,
      `"${asset.id.replace(/"/g, '""')}"`,
      `"${(asset.name || '').replace(/"/g, '""')}"`,
      `"${(asset.status || '').replace(/"/g, '""')}"`,
      `"${(asset.department || '').replace(/"/g, '""')}"`,
      `"${(asset.location || '').replace(/"/g, '""')}"`,
      `"${(asset.responsiblePerson || '').replace(/"/g, '""')}"`,
      `"${(asset.source || '').replace(/"/g, '""')}"`,
      `"${(asset.receivedDate || '').replace(/"/g, '""')}"`,
      `"${(asset.note || '').replace(/"/g, '""')}"`,
      `"${(asset.createdBy || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\r\n');

    // UTF-8 BOM byte sequence (\uFEFF) ensures Thai characters render properly in Excel & Google Sheets
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const scopeLabel = isOrgWide ? (deptFilter ? deptFilter : 'ทั้งองค์กร') : userDept;
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.setAttribute('download', `รายงานบัญชีครุภัณฑ์_${scopeLabel}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Extract unique departments & locations for filter dropdowns
  const uniqueDepts = Array.from(new Set(assets.map(a => a.department).filter(Boolean)));

  // Filter and search computation
  const filteredAssets = assets.filter((asset) => {
    // Role-based department restriction: Head and Operator see ONLY their department
    if (!isOrgWide && userDept && asset.department !== userDept) {
      return false;
    }

    const matchesSearch = 
      asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.note && asset.note.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesStatus = statusFilter ? asset.status === statusFilter : true;
    const matchesDept = deptFilter ? asset.department === deptFilter : true;

    return matchesSearch && matchesStatus && matchesDept;
  });

  const statusColors: Record<string, string> = {
    'ใช้งานได้': 'badge-success',
    'ชำรุด': 'badge-danger',
    'รอจำหน่าย': 'badge-warning',
    'ขอป้ายรหัสใหม่': 'badge-info',
    'รอโอน': 'badge-primary',
    'อื่นๆ': 'badge-muted'
  };

  const isAllowedToEdit = (asset: Asset) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'manager') return false; // Manager is Read-Only Executive
    if (currentUser.role === 'head') return asset.department === currentUser.department; // Head can edit all in department
    // Operator can edit items in department created by themselves
    return asset.department === currentUser.department && (asset.createdBy === currentUser.id || asset.createdBy === currentUser.username || !asset.createdBy);
  };

  const isAllowedToDelete = (asset: Asset) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'head') return asset.department === currentUser.department;
    if (currentUser.role === 'operator' || currentUser.role === 'user') {
      return asset.department === currentUser.department && (asset.createdBy === currentUser.id || asset.createdBy === currentUser.username);
    }
    return false;
  };

  return (
    <div className="module-container animate-fade-in">
      <div className="module-title-section">
        <h2>ค้นหาและบัญชีครุภัณฑ์ทั้งหมด (Module 1)</h2>
        <p>บัญชีควบคุมทรัพย์สินหลักของทางราชการ ค้นหาสืบค้นข้อมูล พร้อมประวัติย้อนหลังเชิงลึก</p>
      </div>

      {/* Filter and search panel */}
      <div className="filter-panel glass-panel">
        <div className="search-box" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="ค้นหาด้วยรหัสครุภัณฑ์ หรือ ชื่อเครื่องมือ..." 
            className="form-input search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingRight: '2.5rem' }}
          />
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setIsScannerOpen(true)}
            title="เปิดกล้องสแกนบาร์โค้ด/QR Code รหัสครุภัณฑ์"
            style={{
              position: 'absolute',
              right: '0.35rem',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '0.35rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}
          >
            <QrCode size={15} /> สแกน
          </button>
        </div>

        <div className="filter-dropdowns">
          <div className="filter-item">
            <Filter size={14} />
            <select 
              className="form-select filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">ทุกสถานะ</option>
              <option value="ใช้งานได้">ใช้งานได้</option>
              <option value="ชำรุด">ชำรุด</option>
              <option value="รอจำหน่าย">รอจำหน่าย</option>
              <option value="ขอป้ายรหัสใหม่">ขอป้ายรหัสใหม่</option>
              <option value="รอโอน">รอโอน</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>
          </div>

          <div className="filter-item">
            <select 
              className="form-select filter-select"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              disabled={!isOrgWide}
            >
              {isOrgWide ? (
                <>
                  <option value="">ทุกหน่วยงาน (ทั้งองค์กร)</option>
                  {uniqueDepts.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </>
              ) : (
                <option value={userDept}>เฉพาะหน่วยงาน: {userDept}</option>
              )}
            </select>
          </div>

          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={handleExportExcel}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', color: '#10b981', borderColor: '#10b981' }}
            title="ส่งออกรายงานเป็นไฟล์ Excel / Spreadsheet (CSV)"
          >
            <FileSpreadsheet size={15} /> Export Excel / Sheet
          </button>

          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => setShowPrintModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem' }}
          >
            <Printer size={15} /> พิมพ์รายงาน / ออกรายการ
          </button>

          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'grid' ? 'active-toggle' : ''}`}
              onClick={() => setViewMode('grid')}
              title="แสดงแบบการ์ด"
            >
              <Grid size={16} />
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'table' ? 'active-toggle' : ''}`}
              onClick={() => setViewMode('table')}
              title="แสดงแบบตาราง"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Catalog Display */}
      {filteredAssets.length === 0 ? (
        <div className="empty-results glass-panel">
          <ShieldAlert size={40} color="var(--text-muted)" />
          <h3>ไม่พบข้อมูลครุภัณฑ์ที่ค้นหา</h3>
          <p>ลองปรับคำค้นหา หรือเอาฟิลเตอร์ตัวกรองออกเพื่อแสดงผลใหม่อีกครั้ง</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="asset-grid">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className="asset-card glass-panel" onClick={() => setSelectedAsset(asset)}>
              <div className="asset-card-image-box">
                <img 
                  src={asset.imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60'} 
                  alt={asset.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60';
                  }}
                />
                <span className={`badge ${statusColors[asset.status] || 'badge-muted'} asset-status-badge`}>
                  {asset.status}
                </span>
              </div>
              <div className="asset-card-body">
                <span className="asset-card-id">{asset.id}</span>
                <h3 className="asset-card-title">{asset.name}</h3>
                {asset.note && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', padding: '0.15rem 0.4rem', borderRadius: '4px', margin: '0.2rem 0 0.35rem 0', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', maxWidth: '100%' }}>
                    <span>🏷️</span>
                    <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.note}</span>
                  </div>
                )}
                <div className="asset-card-meta">
                  <span className="meta-loc">📍 {asset.location}</span>
                  <span className="meta-dept">🏢 {asset.department}</span>
                </div>
              </div>
              <div className="asset-card-actions">
                <button className="btn btn-secondary btn-xs" onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAsset(asset);
                }}>
                  <Eye size={12} /> รายละเอียด
                </button>
                <button 
                  className="btn btn-primary btn-xs" 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isAllowedToEdit(asset)) {
                      onAssetEdit(asset);
                    }
                  }}
                  disabled={!isAllowedToEdit(asset)}
                  style={!isAllowedToEdit(asset) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  title={!isAllowedToEdit(asset) ? "สงวนสิทธิ์แก้ไขเฉพาะผู้ดูแล หรือฝ่ายที่ครอบครองพัสดุนี้" : "แก้ไขรายละเอียดครุภัณฑ์"}
                >
                  <Edit3 size={12} /> แก้ไข
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-container glass-panel">
          <table className="custom-table">
            <thead>
              <tr>
                <th>รหัสครุภัณฑ์</th>
                <th>ชื่อครุภัณฑ์</th>
                <th>สถานที่</th>
                <th>หน่วยงานรับผิดชอบ</th>
                <th>สถานะ</th>
                <th style={{ textAlign: 'right' }}>เครื่องมือ</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => (
                <tr key={asset.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedAsset(asset)}>
                  <td><code>{asset.id}</code></td>
                  <td>
                    <strong style={{ color: 'var(--text-primary)' }}>{asset.name}</strong>
                    {asset.note && (
                      <div style={{ fontSize: '0.725rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '2px' }}>
                        🏷️ {asset.note}
                      </div>
                    )}
                  </td>
                  <td>{asset.location}</td>
                  <td>{asset.department}</td>
                  <td>
                    <span className={`badge ${statusColors[asset.status] || 'badge-muted'}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary btn-xs" onClick={() => setSelectedAsset(asset)}>
                        <Eye size={12} />
                      </button>
                      <button 
                        className="btn btn-primary btn-xs" 
                        onClick={() => {
                          if (isAllowedToEdit(asset)) {
                            onAssetEdit(asset);
                          }
                        }}
                        disabled={!isAllowedToEdit(asset)}
                        style={!isAllowedToEdit(asset) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                        title={!isAllowedToEdit(asset) ? "สงวนสิทธิ์แก้ไขเฉพาะผู้ดูแล หรือฝ่ายที่ครอบครองพัสดุนี้" : "แก้ไขครุภัณฑ์"}
                      >
                        <Edit3 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Asset Lifecycle Drawer Modal */}
      {selectedAsset && (
        <AssetModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onEditClick={(asset) => {
            if (isAllowedToEdit(asset)) {
              setSelectedAsset(null);
              onAssetEdit(asset);
            } else {
              alert('สงวนสิทธิ์การแก้ไขเฉพาะผู้ดูแลระบบ หรือฝ่ายที่ดูแลครุภัณฑ์ชิ้นนี้เท่านั้น');
            }
          }}
          audits={audits}
          repairs={repairs}
          surveys={surveys}
          schedules={schedules}
          currentUser={currentUser}
          onRefreshData={onRefreshData}
          spareParts={spareParts}
          onAddSparePart={onAddSparePart}
          onUpdateSparePart={onUpdateSparePart}
          onDeleteSparePart={onDeleteSparePart}
        />
      )}

      <style>{`
        .module-title-section {
          margin-bottom: 1.5rem;
        }

        .module-title-section h2 {
          font-size: 1.45rem;
          font-weight: 800;
        }

        .module-title-section p {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .filter-panel {
          padding: 1rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 280px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-input {
          padding-left: 2.75rem;
        }

        .filter-dropdowns {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .filter-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--text-secondary);
        }

        .filter-select {
          padding: 0.5rem 2rem 0.5rem 0.75rem;
          font-size: 0.85rem;
          border-radius: var(--radius-sm);
          width: auto;
          min-width: 140px;
        }

        .view-toggle {
          display: flex;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          overflow: hidden;
          background-color: var(--bg-tertiary);
        }

        .toggle-btn {
          background: none;
          border: none;
          padding: 0.5rem;
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .active-toggle {
          background-color: var(--bg-secondary);
          color: var(--primary);
        }

        /* Asset Grid */
        .asset-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.25rem;
        }

        .asset-card {
          overflow: hidden;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .asset-card-image-box {
          width: 100%;
          aspect-ratio: 16/10;
          overflow: hidden;
          position: relative;
          background-color: var(--bg-tertiary);
          border-bottom: 1px solid var(--border);
        }

        .asset-card-image-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-slow);
        }

        .asset-card:hover .asset-card-image-box img {
          transform: scale(1.05);
        }

        .asset-status-badge {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        }

        .asset-card-body {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          flex: 1;
        }

        .asset-card-id {
          font-size: 0.725rem;
          font-family: monospace;
          color: var(--text-muted);
          font-weight: 550;
        }

        .asset-card-title {
          font-size: 0.95rem;
          font-weight: 750;
          line-height: 1.35;
          color: var(--text-primary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 2.7rem;
        }

        .asset-card-meta {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          font-size: 0.775rem;
          color: var(--text-secondary);
          margin-top: auto;
        }

        .asset-card-actions {
          padding: 0.75rem 1rem;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          background-color: rgba(0, 0, 0, 0.01);
        }

        .empty-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 5rem 2rem;
          text-align: center;
          gap: 0.75rem;
        }

        .empty-results p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          max-width: 320px;
        }

        @media (max-width: 576px) {
          .filter-panel {
            gap: 1rem;
          }
          .search-box {
            min-width: 100%;
          }
          .filter-dropdowns {
            width: 100%;
            justify-content: space-between;
          }
          .filter-select {
            min-width: 120px;
          }
        }
      `}</style>
      {/* REPORT PRINT MODAL OVERLAY */}
      {showPrintModal && (
        <div className="print-preview-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 9999, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '2rem 1rem' }}>
          <div className="print-actions-bar glass-panel" style={{ maxWidth: '900px', width: '100%', margin: '0 auto 1.5rem auto', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10000 }}>
            <div>
              <h4 style={{ fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>📑 พิมพ์รายงานบัญชีครุภัณฑ์</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                {isOrgWide ? (deptFilter ? `หน่วยงาน: ${deptFilter}` : 'ทุกหน่วยงาน (ทั้งองค์กร)') : `เฉพาะหน่วยงาน: ${userDept}`} — รวม {filteredAssets.length} รายการ
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                type="button" 
                className="btn btn-success"
                onClick={handleExportExcel}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#10b981', borderColor: '#10b981', color: '#fff' }}
              >
                <FileSpreadsheet size={16} /> ส่งออก Excel / Sheet
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => window.print()}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Printer size={16} /> สั่งพิมพ์ / บันทึก PDF
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowPrintModal(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <X size={16} /> ปิดหน้าต่าง
              </button>
            </div>
          </div>

          <div className="print-sheet-paper" style={{ background: '#ffffff', color: '#000000', maxWidth: '900px', width: '100%', margin: '0 auto', padding: '2rem', borderRadius: '4px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', fontFamily: 'Sarabun, TH Sarabun New, sans-serif' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #000', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0 0 0.25rem 0' }}>รายงานบัญชีควบคุมครุภัณฑ์พัสดุ</h2>
              <p style={{ fontSize: '0.95rem', margin: 0 }}>
                {isOrgWide ? (deptFilter ? `หน่วยงาน: ${deptFilter}` : 'ข้อมูลครุภัณฑ์ทุกหน่วยงาน (ภาพรวมองค์กร)') : `เฉพาะหน่วยงาน: ${userDept}`}
              </p>
              <p style={{ fontSize: '0.8rem', color: '#555', margin: '0.25rem 0 0 0' }}>
                วันที่พิมพ์รายงาน: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} น. | ผู้พิมพ์: {currentUser?.name || 'แอดมินพัสดุ'}
              </p>
            </div>

            {/* Summary Statistics */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '0.85rem', background: '#f8fafc', padding: '0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
              <div><strong>รายการทั้งหมด:</strong> {filteredAssets.length} ชิ้น</div>
              <div><strong>ใช้งานได้:</strong> {filteredAssets.filter(a => a.status === 'ใช้งานได้').length} ชิ้น</div>
              <div><strong>ชำรุด:</strong> {filteredAssets.filter(a => a.status === 'ชำรุด').length} ชิ้น</div>
              <div><strong>รอจำหน่าย:</strong> {filteredAssets.filter(a => a.status === 'รอจำหน่าย').length} ชิ้น</div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderTop: '1px solid #000', borderBottom: '2px solid #000' }}>
                  <th style={{ padding: '0.5rem', width: '5%' }}>ลำดับ</th>
                  <th style={{ padding: '0.5rem', width: '22%' }}>รหัสครุภัณฑ์</th>
                  <th style={{ padding: '0.5rem', width: '28%' }}>รายการ / ชื่อเครื่องมือ</th>
                  <th style={{ padding: '0.5rem', width: '18%' }}>หน่วยงาน / แผนก</th>
                  <th style={{ padding: '0.5rem', width: '17%' }}>สถานที่จัดเก็บ</th>
                  <th style={{ padding: '0.5rem', width: '10%', textAlign: 'center' }}>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset, idx) => (
                  <tr key={asset.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.45rem 0.5rem', textAlign: 'center' }}>{idx + 1}</td>
                    <td style={{ padding: '0.45rem 0.5rem', fontWeight: 'bold' }}>{asset.id}</td>
                    <td style={{ padding: '0.45rem 0.5rem' }}>{asset.name}</td>
                    <td style={{ padding: '0.45rem 0.5rem' }}>{asset.department || '-'}</td>
                    <td style={{ padding: '0.45rem 0.5rem' }}>{asset.location || '-'}</td>
                    <td style={{ padding: '0.45rem 0.5rem', textAlign: 'center', fontWeight: 'bold' }}>
                      {asset.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Signature Footer */}
            <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', pageBreakInside: 'avoid' }}>
              <div style={{ textAlign: 'center', width: '40%' }}>
                <p>ลงชื่อ......................................................................</p>
                <p style={{ marginTop: '0.25rem' }}>({currentUser?.name || '....................................................'})</p>
                <p style={{ color: '#555', fontSize: '0.8rem' }}>ตำแหน่ง {currentUser?.role?.toUpperCase() || 'เจ้าหน้าที่ผู้รายงาน'}</p>
              </div>

              <div style={{ textAlign: 'center', width: '40%' }}>
                <p>ลงชื่อ......................................................................</p>
                <p style={{ marginTop: '0.25rem' }}>(....................................................)</p>
                <p style={{ color: '#555', fontSize: '0.8rem' }}>หัวหน้างาน / ผู้รับรองรายงาน</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CAMERA BARCODE / QR SCANNER MODAL */}
      {isScannerOpen && (
        <div 
          className="modal-overlay animate-fade-in" 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            background: 'rgba(0,0,0,0.85)', 
            zIndex: 99999, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '1rem' 
          }}
        >
          <div 
            className="glass-panel animate-scale-up" 
            style={{ 
              maxWidth: '500px', 
              width: '100%', 
              padding: '1.25rem', 
              borderRadius: 'var(--radius-lg)', 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                <Camera size={18} color="var(--primary)" /> สแกนป้ายรหัสครุภัณฑ์
              </h4>
              <button 
                type="button" 
                className="btn btn-ghost btn-sm" 
                onClick={() => setIsScannerOpen(false)}
                style={{ padding: '0.25rem 0.5rem' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <BarcodeScanner 
                onScanSuccess={(decodedText) => {
                  const cleanedCode = decodedText.trim();
                  setSearchTerm(cleanedCode);
                  setIsScannerOpen(false);

                  // If exact asset match found, auto open asset detail modal
                  const matchedAsset = assets.find(a => a.id.toLowerCase() === cleanedCode.toLowerCase());
                  if (matchedAsset) {
                    setSelectedAsset(matchedAsset);
                  }
                }}
                onCloseCamera={() => setIsScannerOpen(false)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>📷 ส่องกล้องไปที่ป้ายบาร์โค้ด หรือ QR Code</span>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={() => setIsScannerOpen(false)}
              >
                ปิดกล้อง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable CSS Media Rules */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-preview-overlay, .print-preview-overlay * {
            visibility: visible;
          }
          .print-preview-overlay {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            padding: 0 !important;
          }
          .print-actions-bar {
            display: none !important;
          }
          .print-sheet-paper {
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};
