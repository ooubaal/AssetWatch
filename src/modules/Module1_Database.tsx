import React, { useState } from 'react';
import { Search, Filter, Eye, Edit3, Grid, List, ShieldAlert } from 'lucide-react';
import { Asset, AuditTrail, SurveyRecord, RepairCase, UserAccount } from '../utils/mockData';
import { AssetModal } from '../components/AssetModal';

interface Module1DatabaseProps {
  assets: Asset[];
  audits: AuditTrail[];
  repairs: RepairCase[];
  surveys: SurveyRecord[];
  onAssetEdit: (asset: Asset) => void;
  currentUser: UserAccount | null;
}

export const Module1_Database: React.FC<Module1DatabaseProps> = ({
  assets,
  audits,
  repairs,
  surveys,
  onAssetEdit,
  currentUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Selected asset for viewing details in modal
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Extract unique departments & locations for filter dropdowns
  const uniqueDepts = Array.from(new Set(assets.map(a => a.department).filter(Boolean)));

  // Filter and search computation
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = 
      asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchTerm.toLowerCase());
      
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
    if (currentUser.role === 'manager') return false;
    return asset.department === currentUser.department;
  };

  return (
    <div className="module-container animate-fade-in">
      <div className="module-title-section">
        <h2>ค้นหาและบัญชีครุภัณฑ์ทั้งหมด (Module 1)</h2>
        <p>บัญชีควบคุมทรัพย์สินหลักของทางราชการ ค้นหาสืบค้นข้อมูล พร้อมประวัติย้อนหลังเชิงลึก</p>
      </div>

      {/* Filter and search panel */}
      <div className="filter-panel glass-panel">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="ค้นหาด้วยรหัสครุภัณฑ์ หรือ ชื่อเครื่องมือ..." 
            className="form-input search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
            >
              <option value="">ทุกหน่วยงาน</option>
              {uniqueDepts.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

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
                  <td><strong style={{ color: 'var(--text-primary)' }}>{asset.name}</strong></td>
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
    </div>
  );
};
