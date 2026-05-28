import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  MapPin, 
  Building, 
  User, 
  FileText, 
  Info, 
  History, 
  Wrench, 
  QrCode,
  Download,
  AlertCircle
} from 'lucide-react';
import { Asset, AuditTrail, SurveyRecord, RepairCase } from '../utils/mockData';
import { QRCodeSVG } from 'qrcode.react';

interface AssetModalProps {
  asset: Asset;
  onClose: () => void;
  onEditClick: (asset: Asset) => void;
  audits: AuditTrail[];
  repairs: RepairCase[];
  surveys: SurveyRecord[];
}

export const AssetModal: React.FC<AssetModalProps> = ({
  asset,
  onClose,
  onEditClick,
  audits,
  repairs,
  surveys
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'repairs' | 'surveys'>('info');

  // Filter lists for this specific asset
  const assetAudits = audits.filter(a => a.assetId === asset.id);
  const assetRepairs = repairs.filter(r => r.assetId === asset.id);
  const assetSurveys = surveys.filter(s => s.assetId === asset.id);

  // Status badging styles
  const statusColors: Record<string, string> = {
    'ใช้งานได้': 'badge-success',
    'ชำรุด': 'badge-danger',
    'รอจำหน่าย': 'badge-warning',
    'ขอป้ายรหัสใหม่': 'badge-info',
    'รอโอน': 'badge-primary',
    'อื่นๆ': 'badge-muted'
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById(`qr-svg-${asset.id}`);
    if (svg) {
      const svgString = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);
      
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 450;
        const context = canvas.getContext('2d');
        
        if (context) {
          // Draw white card background
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, 400, 450);
          
          // Draw header
          context.fillStyle = '#1e293b';
          context.font = 'bold 20px "Inter", "Noto Sans Thai"';
          context.textAlign = 'center';
          context.fillText('AssetWatch Program', 200, 40);
          
          // Draw asset name
          context.fillStyle = '#64748b';
          context.font = '14px "Inter", "Noto Sans Thai"';
          context.fillText(asset.name.substring(0, 40) + (asset.name.length > 40 ? '...' : ''), 200, 70);

          // Draw the QR Image
          context.drawImage(image, 75, 100, 250, 250);
          
          // Draw Barcode Text ID
          context.fillStyle = '#0f172a';
          context.font = 'bold 18px monospace';
          context.fillText(asset.id, 200, 390);

          // Draw Footer Note
          context.fillStyle = '#94a3b8';
          context.font = '11px "Inter", "Noto Sans Thai"';
          context.fillText('สแกนผ่านเบราว์เซอร์มือถือเพื่อสำรวจข้อมูลครุภัณฑ์', 200, 420);

          // Trigger download
          const pngURL = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngURL;
          downloadLink.download = `AssetLabel_${asset.id}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
      };
      image.src = blobURL;
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card glass-panel animate-fade-in">
        
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <span className={`badge ${statusColors[asset.status] || 'badge-muted'}`}>
              {asset.status}
            </span>
            <h2>{asset.name}</h2>
            <span className="modal-asset-id">รหัส: <code>{asset.id}</code></span>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close details">
            <X size={20} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="modal-tabs">
          <button 
            className={`modal-tab-btn ${activeTab === 'info' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            <Info size={16} /> รายละเอียดครุภัณฑ์
          </button>
          <button 
            className={`modal-tab-btn ${activeTab === 'history' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={16} /> ประวัติกิจกรรม ({assetAudits.length})
          </button>
          <button 
            className={`modal-tab-btn ${activeTab === 'repairs' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('repairs')}
          >
            <Wrench size={16} /> บันทึกการส่งซ่อม ({assetRepairs.length})
          </button>
          <button 
            className={`modal-tab-btn ${activeTab === 'surveys' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('surveys')}
          >
            <QrCode size={16} /> ผลการตรวจนับ ({assetSurveys.length})
          </button>
        </div>

        {/* Modal Dynamic Content Body */}
        <div className="modal-body">
          
          {/* TAB 1: General Details */}
          {activeTab === 'info' && (
            <div className="tab-info-layout">
              {/* Asset Picture & QR Label Card */}
              <div className="info-visuals-panel">
                <div className="info-image-container">
                  <img 
                    src={asset.imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60'} 
                    alt={asset.name} 
                    className="info-asset-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60';
                    }}
                  />
                </div>
                
                {/* Embedded dynamic label containing asset ID QR */}
                <div className="qr-badge-card">
                  <div style={{ display: 'none' }}>
                    {/* Hidden SVG wrapper used for canvas export download */}
                    <QRCodeSVG 
                      id={`qr-svg-${asset.id}`} 
                      value={asset.id} 
                      size={250} 
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  
                  <div className="visible-qr">
                    <QRCodeSVG value={asset.id} size={110} level="M" />
                  </div>
                  
                  <div className="qr-card-details">
                    <span>ฉลากบาร์โค้ดประจำทรัพย์สิน</span>
                    <h4>{asset.id}</h4>
                    <button className="btn btn-secondary btn-xs" onClick={handleDownloadQR}>
                      <Download size={12} /> ดาวน์โหลดฉลาก
                    </button>
                  </div>
                </div>
              </div>

              {/* Data Properties List */}
              <div className="info-fields-panel">
                <div className="detail-row">
                  <div className="detail-icon"><Calendar size={18} /></div>
                  <div className="detail-content">
                    <span className="detail-label">วันที่ตรวจรับเข้ามา</span>
                    <span className="detail-value">{asset.receivedDate || 'ไม่ระบุ'}</span>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-icon"><FileText size={18} /></div>
                  <div className="detail-content">
                    <span className="detail-label">แหล่งที่มาของงบประมาณ</span>
                    <span className="detail-value">{asset.source || 'ไม่ระบุ'}</span>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-icon"><MapPin size={18} /></div>
                  <div className="detail-content">
                    <span className="detail-label">สถานที่ติดตั้งใช้งาน</span>
                    <span className="detail-value">{asset.location || 'ไม่ระบุ'}</span>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-icon"><Building size={18} /></div>
                  <div className="detail-content">
                    <span className="detail-label">หน่วยงานจัดซื้อจัดจ้าง</span>
                    <span className="detail-value">{asset.department || 'ไม่ระบุ'}</span>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-icon"><User size={18} /></div>
                  <div className="detail-content">
                    <span className="detail-label">ผู้รับผิดชอบการดูแลรักษา</span>
                    <span className="detail-value">{asset.responsiblePerson || 'ไม่ระบุ'}</span>
                  </div>
                </div>

                {asset.note && (
                  <div className="detail-note-box">
                    <h4>📝 หมายเหตุคำอธิบาย:</h4>
                    <p>{asset.note}</p>
                  </div>
                )}

                <div className="modal-actions-footer">
                  <button className="btn btn-secondary w-full" onClick={() => onEditClick(asset)}>
                    แก้ไขฐานข้อมูลครุภัณฑ์นี้ (Module 6)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Specific Audit Trail of logs */}
          {activeTab === 'history' && (
            <div className="modal-logs-list">
              {assetAudits.length === 0 ? (
                <div className="empty-tab-state">
                  <AlertCircle size={28} />
                  <p>ไม่มีประวัติกิจกรรมของครุภัณฑ์นี้ในระบบ</p>
                </div>
              ) : (
                assetAudits.map((item) => (
                  <div key={item.id} className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <div className="timeline-meta">
                        <span className="timeline-operator">{item.operator}</span>
                        <span className="timeline-time">
                          {new Date(item.timestamp).toLocaleString('th-TH')}
                        </span>
                      </div>
                      <h4 className="timeline-title">
                        {item.action === 'create' ? 'เพิ่มทรัพย์สินเข้าใหม่' :
                         item.action === 'edit' ? 'แก้ไขข้อมูล' :
                         item.action === 'dispose' ? 'ทำแทงจำหน่าย' :
                         item.action === 'transfer' ? 'โอนย้ายสถานที่' :
                         item.action === 'survey' ? 'แสกนสำรวจตรวจนับ' : 'อื่น ๆ'}
                      </h4>
                      <p className="timeline-desc">{item.details}</p>
                      
                      {item.changes && (
                        <div className="timeline-changes">
                          {Object.keys(item.changes).map(field => (
                            <div key={field} className="change-field-row">
                              <code>{field}</code>: 
                              <span className="old-val">{String(item.changes?.[field].old || 'ไม่มี')}</span> 
                              ➜ 
                              <span className="new-val">{String(item.changes?.[field].new || 'ไม่มี')}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: Repair cases list */}
          {activeTab === 'repairs' && (
            <div className="modal-repairs-layout">
              {assetRepairs.length === 0 ? (
                <div className="empty-tab-state">
                  <AlertCircle size={28} />
                  <p>ไม่มีรายการแจ้งซ่อมครุภัณฑ์นี้ในอดีต</p>
                </div>
              ) : (
                assetRepairs.map((item) => (
                  <div key={item.id} className="repair-log-card">
                    <div className="repair-log-header">
                      <span className={`badge ${
                        item.status === 'open' ? 'badge-danger' : 
                        item.status === 'sent' ? 'badge-warning' : 'badge-success'
                      }`}>
                        {item.status === 'open' ? 'เคสใหม่' : 
                         item.status === 'sent' ? 'ส่งช่างซ่อม' : 'ปิดงานสำเร็จ'}
                      </span>
                      <span className="repair-log-id">เคส: <code>{item.id}</code></span>
                    </div>
                    
                    <div className="repair-log-desc">
                      <p><strong>อาการชำรุด:</strong> {item.symptom}</p>
                      <p><strong>ผู้แจ้งซ่อม:</strong> {item.operator} ({item.dateOpened})</p>
                      
                      {item.repairCompany && (
                        <p><strong>ร้านที่ส่งซ่อม:</strong> {item.repairCompany} ({item.contactPerson || '-'})</p>
                      )}
                      
                      {item.dateReceived && (
                        <p className="return-note">
                          ✅ <strong>รับของคืนเมื่อ:</strong> {item.dateReceived}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: Surveys and scanning logs */}
          {activeTab === 'surveys' && (
            <div className="modal-surveys-layout">
              {assetSurveys.length === 0 ? (
                <div className="empty-tab-state">
                  <AlertCircle size={28} />
                  <p>ยังไม่มีการตรวจนับครุภัณฑ์นี้ผ่านระบบมือถือ</p>
                </div>
              ) : (
                assetSurveys.map((item) => (
                  <div key={item.id} className="survey-log-row">
                    <div className="survey-log-bullet"></div>
                    <div className="survey-log-text">
                      <div className="survey-log-header-info">
                        <span className="survey-log-op">สำรวจพบโดย {item.operator}</span>
                        <span className="survey-log-time">
                          {new Date(item.timestamp).toLocaleString('th-TH')}
                        </span>
                      </div>
                      <p className="survey-log-status">
                        ตรวจพบสถานะคือ 
                        <span className={`badge ${
                          item.status === 'ใช้งานได้' ? 'badge-success' : 'badge-danger'
                        }`} style={{ marginLeft: '0.5rem', fontSize: '0.75rem', padding: '0.1rem 0.5rem' }}>
                          {item.status}
                        </span>
                      </p>
                      
                      {item.imageUrl && (
                        <div className="survey-attached-pic">
                          <span>รูปแนบการตรวจสอบสภาพ:</span>
                          <img src={item.imageUrl} alt="attached survey proof" />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

      </div>

      <style>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .modal-card {
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          background-color: var(--bg-secondary);
        }

        .modal-title-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          max-width: 90%;
        }

        .modal-title-group h2 {
          font-size: 1.35rem;
          font-weight: 800;
        }

        .modal-asset-id {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .btn-close {
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-secondary);
          transition: background-color var(--transition-fast);
        }

        .btn-close:hover {
          background-color: var(--border);
          color: var(--text-primary);
        }

        .modal-tabs {
          display: flex;
          background-color: var(--bg-tertiary);
          border-bottom: 1px solid var(--border);
          padding: 0 1rem;
          overflow-x: auto;
          gap: 0.5rem;
        }

        .modal-tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.25rem;
          border: none;
          background: transparent;
          font-family: var(--font-family);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          border-bottom: 2.5px solid transparent;
          transition: all var(--transition-fast);
          white-space: nowrap;
        }

        .modal-tab-btn:hover {
          color: var(--text-primary);
        }

        .tab-active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }

        .modal-body {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
          background-color: var(--bg-secondary);
        }

        /* TAB 1 Layout */
        .tab-info-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 1.75rem;
        }

        .info-visuals-panel {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .info-image-container {
          width: 100%;
          aspect-ratio: 4/3;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--border);
          background-color: var(--bg-primary);
        }

        .info-asset-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .qr-badge-card {
          padding: 1rem;
          background-color: var(--bg-primary);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .visible-qr {
          padding: 0.25rem;
          background-color: #ffffff;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .qr-card-details {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .qr-card-details span {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .qr-card-details h4 {
          font-size: 0.875rem;
          font-family: monospace;
          color: var(--text-primary);
        }

        .btn-xs {
          padding: 0.35rem 0.65rem;
          font-size: 0.75rem;
          border-radius: var(--radius-sm);
        }

        .info-fields-panel {
          display: flex;
          flex-direction: column;
          gap: 0.95rem;
        }

        .detail-row {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .detail-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .detail-content {
          display: flex;
          flex-direction: column;
        }

        .detail-label {
          font-size: 0.725rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
        }

        .detail-value {
          font-size: 0.95rem;
          font-weight: 550;
          color: var(--text-primary);
        }

        .detail-note-box {
          background-color: var(--bg-primary);
          border: 1px dashed var(--border);
          border-radius: var(--radius-md);
          padding: 0.85rem 1rem;
          font-size: 0.85rem;
        }

        .detail-note-box h4 {
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .detail-note-box p {
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .modal-actions-footer {
          margin-top: auto;
          padding-top: 1rem;
        }

        /* TAB 2 Timeline Logs */
        .modal-logs-list {
          display: flex;
          flex-direction: column;
          padding-left: 0.75rem;
          border-left: 2px solid var(--border);
          margin-left: 0.5rem;
          gap: 1.5rem;
        }

        .timeline-item {
          position: relative;
        }

        .timeline-dot {
          position: absolute;
          left: -17px;
          top: 6px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: var(--primary);
          border: 2px solid var(--bg-secondary);
        }

        .timeline-content {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .timeline-meta {
          display: flex;
          gap: 0.75rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .timeline-operator {
          font-weight: 600;
          color: var(--text-secondary);
        }

        .timeline-title {
          font-size: 0.95rem;
          font-weight: 750;
        }

        .timeline-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .timeline-changes {
          margin-top: 0.35rem;
          padding: 0.5rem;
          background-color: var(--bg-primary);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          border: 1px solid var(--border);
        }

        .change-field-row {
          margin-bottom: 0.15rem;
        }
        
        .old-val { color: var(--danger); text-decoration: line-through; margin: 0 0.25rem; }
        .new-val { color: var(--success); font-weight: 600; }

        /* TAB 3 Repairs Layout */
        .modal-repairs-layout {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .repair-log-card {
          padding: 1rem;
          background-color: var(--bg-primary);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-md);
        }

        .repair-log-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .repair-log-id {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .repair-log-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .return-note {
          color: var(--success);
        }

        /* TAB 4 Surveys Layout */
        .modal-surveys-layout {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .survey-log-row {
          display: flex;
          gap: 1rem;
        }

        .survey-log-bullet {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--success);
          margin-top: 0.5rem;
          flex-shrink: 0;
        }

        .survey-log-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .survey-log-header-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .survey-log-op {
          font-weight: 600;
          color: var(--text-secondary);
        }

        .survey-log-status {
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .survey-attached-pic {
          margin-top: 0.5rem;
          font-size: 0.775rem;
          color: var(--text-secondary);
        }

        .survey-attached-pic img {
          display: block;
          margin-top: 0.25rem;
          max-width: 180px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
        }

        .empty-tab-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 1.5rem;
          gap: 0.75rem;
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        @media (max-width: 768px) {
          .modal-card {
            height: 100vh;
            max-height: 100vh;
            border-radius: 0;
          }
          .tab-info-layout {
            grid-template-columns: 1fr;
          }
          .info-visuals-panel {
            align-items: center;
          }
          .info-image-container {
            max-width: 320px;
          }
          .qr-badge-card {
            width: 100%;
            max-width: 320px;
          }
        }
      `}</style>
    </div>
  );
};
