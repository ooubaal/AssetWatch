import React, { useState } from 'react';
import { History, Search, Filter, ShieldAlert, ArrowRight } from 'lucide-react';
import { AuditTrail } from '../utils/mockData';

interface Module6AuditTrailProps {
  audits: AuditTrail[];
}

export const Module6_AuditTrail: React.FC<Module6AuditTrailProps> = ({ audits }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  // Filter logs
  const filteredAudits = audits.filter(item => {
    const matchesSearch = 
      item.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.details.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesAction = actionFilter ? item.action === actionFilter : true;

    return matchesSearch && matchesAction;
  });

  const actionLabels: Record<AuditTrail['action'], string> = {
    'create': 'ขึ้นทะเบียนใหม่',
    'edit': 'แก้ไขฐานข้อมูล',
    'dispose': 'จำหน่ายคลัง',
    'transfer': 'โอนย้ายสถานที่',
    'repair_open': 'เปิดแจ้งซ่อม',
    'repair_send': 'นำส่งช่างซ่อม',
    'repair_receive': 'ตรวจรับซ่อมคืน',
    'survey': 'แสกนตรวจนับ'
  };

  const actionBadges: Record<AuditTrail['action'], string> = {
    'create': 'badge-success',
    'edit': 'badge-primary',
    'dispose': 'badge-danger',
    'transfer': 'badge-info',
    'repair_open': 'badge-danger',
    'repair_send': 'badge-warning',
    'repair_receive': 'badge-success',
    'survey': 'badge-success'
  };

  const fieldTranslations: Record<string, string> = {
    name: 'ชื่อครุภัณฑ์',
    location: 'สถานที่ติดตั้ง',
    department: 'หน่วยงานผู้ดูแล',
    responsiblePerson: 'ผู้ดูแลรักษาสิ่งของ',
    status: 'สถานะพัสดุ',
    note: 'หมายเหตุ',
    source: 'แหล่งงบประมาณ/สัญญา',
    receivedDate: 'วันที่จัดซื้อจัดจ้าง',
    imageUrl: 'ภาพถ่ายครุภัณฑ์'
  };

  return (
    <div className="module-container animate-fade-in">
      <div className="module-title-section">
        <h2>บันทึกประวัติการใช้ความโปร่งใส (Audit Trails - Module 6)</h2>
        <p>ประวัติกิจกรรมแบบย้อนกลับไม่ได้ (Immutable timeline) ตรวจสอบการทุจริต การโยกย้ายพัสดุ และบันทึกประวัติการจำหน่าย</p>
      </div>

      {/* Filter Options */}
      <div className="filter-panel glass-panel">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="สืบค้นประวัติด้วยชื่อพนักงาน, รหัสครุภัณฑ์ หรือ คำอธิบาย..." 
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
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              style={{ minWidth: '180px' }}
            >
              <option value="">ทุกประเภทการบันทึก</option>
              <option value="create">ขึ้นทะเบียนใหม่ (Create)</option>
              <option value="edit">แก้ไขข้อมูล (Edit)</option>
              <option value="survey">แสกนตรวจนับ (Survey)</option>
              <option value="transfer">โอนย้ายฝ่าย (Transfer)</option>
              <option value="dispose">ตัดจำหน่ายออกจากบัญชี (Dispose)</option>
              <option value="repair_open">แจ้งชำรุด (Repair Opened)</option>
              <option value="repair_receive">รับกลับคืนคลัง (Repair Closed)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Chronology Table */}
      {filteredAudits.length === 0 ? (
        <div className="empty-results glass-panel">
          <ShieldAlert size={40} color="var(--text-muted)" />
          <h3>ไม่พบข้อมูลประวัติบันทึกการกระทำที่ค้นหา</h3>
          <p>ลองขยายขอบเขตการค้นหาหรือนำตัวกรองประเภทการดำเนินการออก</p>
        </div>
      ) : (
        <div className="table-container glass-panel">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '170px' }}>วันเวลาที่ดำเนินการ</th>
                <th style={{ width: '130px' }}>ประเภทการทำ</th>
                <th>ข้อมูลพัสดุ</th>
                <th>รายละเอียดของรายการ</th>
                <th style={{ width: '140px' }}>ผู้ทำรายการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredAudits.map((item) => (
                <tr key={item.id} className="audit-table-row animate-fade-in">
                  <td>
                    <div className="audit-date-cell">
                      <strong>{new Date(item.timestamp).toLocaleDateString('th-TH')}</strong>
                      <span>{new Date(item.timestamp).toLocaleTimeString('th-TH')}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${actionBadges[item.action] || 'badge-muted'}`}>
                      {actionLabels[item.action] || item.action}
                    </span>
                  </td>
                  <td>
                    <div className="board-asset-cell">
                      <strong>{item.assetName}</strong>
                      <span>รหัส: <code>{item.assetId}</code></span>
                    </div>
                  </td>
                  <td>
                    <div className="audit-details-cell">
                      <p>{item.details}</p>
                      
                      {/* Diff Comparison View Box */}
                      {item.changes && Object.keys(item.changes).length > 0 && (
                        <div className="audit-diff-box">
                          {Object.keys(item.changes).map(field => {
                            const val = item.changes?.[field];
                            const label = fieldTranslations[field] || field;
                            
                            return (
                              <div key={field} className="diff-item-line">
                                <strong>{label}:</strong> 
                                <span className="diff-old">{String(val?.old ?? 'ไม่มี')}</span>
                                <ArrowRight size={12} style={{ margin: '0 0.25rem', color: 'var(--text-muted)' }} />
                                <span className="diff-new">{String(val?.new ?? 'ไม่มี')}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="audit-operator-cell">
                      👤 {item.operator}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .audit-date-cell {
          display: flex;
          flex-direction: column;
          font-size: 0.85rem;
          color: var(--text-primary);
        }

        .audit-date-cell span {
          font-size: 0.725rem;
          color: var(--text-muted);
          font-weight: 550;
        }

        .audit-details-cell {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.45;
        }

        .audit-diff-box {
          margin-top: 0.5rem;
          padding: 0.65rem 0.85rem;
          background-color: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 0.775rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .diff-item-line {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
        }

        .diff-item-line strong {
          color: var(--text-secondary);
          margin-right: 0.5rem;
        }

        .diff-old {
          color: var(--danger);
          text-decoration: line-through;
          background-color: var(--danger-light);
          padding: 0.05rem 0.25rem;
          border-radius: 2px;
        }

        .diff-new {
          color: var(--success);
          font-weight: 600;
          background-color: var(--success-light);
          padding: 0.05rem 0.25rem;
          border-radius: 2px;
        }

        .audit-operator-cell {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .audit-table-row:hover td {
          background-color: rgba(0, 0, 0, 0.005);
        }
      `}</style>
    </div>
  );
};
