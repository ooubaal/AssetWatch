import React from 'react';
import { 
  Database, 
  QrCode, 
  Wrench, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle,
  FileSpreadsheet,
  Plus
} from 'lucide-react';
import { Asset, RepairCase, SurveyRecord, UserAccount } from '../utils/mockData';

interface DashboardProps {
  assets: Asset[];
  repairs: RepairCase[];
  surveys: SurveyRecord[];
  setCurrentTab: (tab: string) => void;
  currentUser: UserAccount | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  assets, 
  repairs, 
  surveys,
  setCurrentTab,
  currentUser
}) => {
  // Department-scoped filtering: operators and heads only see their own department
  const isOrgWideView = currentUser?.role === 'admin' || currentUser?.role === 'manager';
  const userDept = currentUser?.department;

  const scopedAssets = isOrgWideView ? assets : assets.filter(a => a.department === userDept);
  const scopedRepairs = isOrgWideView ? repairs : repairs.filter(r => {
    const asset = assets.find(a => a.id === r.assetId);
    return asset?.department === userDept;
  });
  const scopedSurveys = isOrgWideView ? surveys : surveys.filter(s => {
    const asset = assets.find(a => a.id === s.assetId);
    return asset?.department === userDept;
  });

  // Analytical Calculations
  const totalAssets = scopedAssets.length;
  
  const activeRepairs = scopedRepairs.filter(r => r.status !== 'completed').length;
  
  // Surveys done today
  const todayStr = new Date().toISOString().split('T')[0];
  const surveysToday = scopedSurveys.filter(s => {
    try {
      const sDate = new Date(s.timestamp).toISOString().split('T')[0];
      return sDate === todayStr;
    } catch {
      return false;
    }
  }).length;

  // Survey Coverage calculation
  // Distinct assets surveyed today or overall in current session
  const distinctSurveyedIds = new Set(scopedSurveys.map(s => s.assetId));
  const totalSurveyed = distinctSurveyedIds.size;
  const surveyPercent = totalAssets > 0 ? Math.round((totalSurveyed / totalAssets) * 100) : 0;

  // Status Distribution
  const statusCounts = scopedAssets.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusColors: Record<string, string> = {
    'ใช้งานได้': 'success',
    'ชำรุด': 'danger',
    'รอจำหน่าย': 'warning',
    'ขอป้ายรหัสใหม่': 'info',
    'รอโอน': 'primary',
    'อื่นๆ': 'muted'
  };

  // Recent 3 repairs
  const recentRepairs = scopedRepairs.slice(0, 3);

  // High-fidelity active analytics summary
  return (
    <div className="dashboard-wrapper animate-fade-in">
      
      {/* Dashboard Welcome Header */}
      <div className="dashboard-header">
        <div>
          <h1>แผงควบคุมหลัก (Dashboard)</h1>
          <p className="subtitle">
            {isOrgWideView 
              ? 'ภาพรวมสถิติมูลค่าและการสำรวจครุภัณฑ์ขององค์กรในปัจจุบัน'
              : `ข้อมูลเฉพาะฝ่าย: ${userDept || 'ไม่ระบุ'}`
            }
          </p>
        </div>
        <div className="dashboard-header-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setCurrentTab('module3')}>
            <Plus size={16} /> เพิ่มครุภัณฑ์ใหม่
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="stats-grid">
        
        {/* Card 1: Total Assets */}
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper bg-blue-light">
            <Database size={24} className="text-blue" />
          </div>
          <div className="stat-info">
            <span className="stat-label">ครุภัณฑ์ในระบบทั้งหมด</span>
            <h3 className="stat-value">{totalAssets} <span className="stat-unit">รายการ</span></h3>
          </div>
        </div>

        {/* Card 2: Active Repairs */}
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper bg-red-light">
            <Wrench size={24} className="text-red" />
          </div>
          <div className="stat-info">
            <span className="stat-label">อยู่ระหว่างการส่งซ่อม</span>
            <h3 className="stat-value">{activeRepairs} <span className="stat-unit">รายการ</span></h3>
          </div>
        </div>

        {/* Card 3: Today Survey Count */}
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper bg-emerald-light">
            <QrCode size={24} className="text-emerald" />
          </div>
          <div className="stat-info">
            <span className="stat-label">แสกนสำรวจพบแล้ววันนี้</span>
            <h3 className="stat-value">{surveysToday} <span className="stat-unit">ครั้ง</span></h3>
          </div>
        </div>

        {/* Card 4: Overall Progress */}
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper bg-cyan-light">
            <TrendingUp size={24} className="text-cyan" />
          </div>
          <div className="stat-info">
            <span className="stat-label">ความคืบหน้าการสำรวจปีนี้</span>
            <h3 className="stat-value">{surveyPercent}% <span className="stat-unit">({totalSurveyed}/{totalAssets})</span></h3>
          </div>
        </div>

      </div>

      {/* Main Analytical Layout */}
      <div className="dashboard-content-grid">
        
        {/* Left Column: Progress & Status Charts */}
        <div className="grid-card glass-panel col-span-7">
          <div className="card-header">
            <h3>สัดส่วนสถานะครุภัณฑ์ปัจจุบัน</h3>
            <span className="card-header-sub">สถิติแบ่งตามประเภทความพร้อมการใช้งาน</span>
          </div>
          
          <div className="status-bars-container">
            {Object.keys(statusColors).map((status) => {
              const count = statusCounts[status] || 0;
              const percent = totalAssets > 0 ? Math.round((count / totalAssets) * 100) : 0;
              const type = statusColors[status];
              
              return (
                <div key={status} className="status-bar-row">
                  <div className="status-bar-label-group">
                    <span className="status-bar-name">
                      <span className={`status-dot dot-${type}`}></span>
                      {status}
                    </span>
                    <span className="status-bar-values">
                      <strong>{count}</strong> รายการ ({percent}%)
                    </span>
                  </div>
                  <div className="progress-bar-bg">
                    <div 
                      className={`progress-bar-fill fill-${type}`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="survey-progress-box">
            <div className="survey-progress-text">
              <h4>🎯 การสำรวจครุภัณฑ์พร้อมกันแบบกลุ่ม (Multi-user Survey)</h4>
              <p>ระบบอนุญาตให้เปิดเว็บโปรแกรมผ่านโทรศัพท์มือถือหลายเครื่องพร้อมกันเพื่อสแกนบาร์โค้ดตรวจนับได้แบบเรียลไทม์</p>
            </div>
            <button className="btn btn-secondary" onClick={() => setCurrentTab('module2')}>
              <QrCode size={16} /> เริ่มแสกนสำรวจพัสดุ
            </button>
          </div>
        </div>

        {/* Right Column: Recent Activity & Pending Repairs */}
        <div className="grid-card glass-panel col-span-5">
          <div className="card-header">
            <h3>ประวัติการแจ้งซ่อมล่าสุด</h3>
            <span className="card-header-sub">เคสซ่อมแซมที่ต้องการการติดตาม</span>
          </div>

          <div className="recent-repairs-list">
            {recentRepairs.length === 0 ? (
              <div className="empty-repairs-state">
                <CheckCircle size={32} color="var(--success)" />
                <p>ไม่มีรายการแจ้งซ่อมค้างในขณะนี้</p>
              </div>
            ) : (
              recentRepairs.map((item) => (
                <div key={item.id} className="mini-repair-card">
                  <div className="mini-repair-meta">
                    <span className={`badge ${
                      item.status === 'open' ? 'badge-danger' : 
                      item.status === 'sent' ? 'badge-warning' : 'badge-success'
                    }`}>
                      {item.status === 'open' ? 'แจ้งซ่อมใหม่' : 
                       item.status === 'sent' ? 'ส่งร้านซ่อมแล้ว' : 'ซ่อมเสร็จแล้ว'}
                    </span>
                    <span className="mini-repair-date">{item.dateOpened}</span>
                  </div>
                  <h4 className="mini-repair-title">{item.assetName}</h4>
                  <p className="mini-repair-desc">{item.symptom}</p>
                </div>
              ))
            )}
          </div>

          <button 
            className="btn btn-secondary w-full" 
            style={{ marginTop: '1.25rem' }}
            onClick={() => setCurrentTab('module5_repair')}
          >
            ดูรายการส่งซ่อมทั้งหมด
          </button>
        </div>

      </div>

      <style>{`
        .dashboard-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .dashboard-header h1 {
          font-size: 1.6rem;
          font-weight: 800;
        }

        .dashboard-header .subtitle {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }

        .stat-card {
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon-wrapper {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* Color classes */
        .bg-blue-light { background-color: var(--primary-light); }
        .text-blue { color: var(--primary); }
        
        .bg-red-light { background-color: var(--danger-light); }
        .text-red { color: var(--danger); }
        
        .bg-emerald-light { background-color: var(--success-light); }
        .text-emerald { color: var(--success); }
        
        .bg-cyan-light { background-color: var(--info-light); }
        .text-cyan { color: var(--info); }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.775rem;
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .stat-value {
          font-size: 1.35rem;
          font-weight: 800;
          line-height: 1.2;
        }

        .stat-unit {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .dashboard-content-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 1.5rem;
        }

        .col-span-7 { grid-column: span 7; }
        .col-span-5 { grid-column: span 5; }

        .grid-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }

        .card-header {
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 0.75rem;
        }

        .card-header h3 {
          font-size: 1.1rem;
          font-weight: 750;
        }

        .card-header-sub {
          font-size: 0.775rem;
          color: var(--text-muted);
        }

        /* Status Bars */
        .status-bars-container {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          flex: 1;
        }

        .status-bar-row {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .status-bar-label-group {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .status-bar-name {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 550;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .dot-success { background-color: var(--success); }
        .dot-danger { background-color: var(--danger); }
        .dot-warning { background-color: var(--warning); }
        .dot-info { background-color: var(--info); }
        .dot-primary { background-color: var(--primary); }
        .dot-muted { background-color: var(--text-muted); }

        .progress-bar-bg {
          width: 100%;
          height: 8px;
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 0.8s ease-out;
        }

        .fill-success { background-color: var(--success); }
        .fill-danger { background-color: var(--danger); }
        .fill-warning { background-color: var(--warning); }
        .fill-info { background-color: var(--info); }
        .fill-primary { background-color: var(--primary); }
        .fill-muted { background-color: var(--text-muted); }

        .survey-progress-box {
          margin-top: 1.5rem;
          padding: 1rem 1.25rem;
          background-color: var(--primary-light);
          border: 1px solid rgba(59, 130, 246, 0.15);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
        }

        .survey-progress-text h4 {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--primary);
        }

        .survey-progress-text p {
          font-size: 0.775rem;
          color: var(--text-secondary);
          margin-top: 0.15rem;
          line-height: 1.4;
        }

        /* Recent repairs list */
        .recent-repairs-list {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          flex: 1;
        }

        .empty-repairs-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem;
          gap: 0.75rem;
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        .mini-repair-card {
          padding: 0.85rem 1rem;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .mini-repair-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .mini-repair-date {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .mini-repair-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .mini-repair-desc {
          font-size: 0.775rem;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .w-full {
          width: 100%;
        }

        @media (max-width: 992px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .dashboard-content-grid {
            grid-template-columns: 1fr;
          }
          .col-span-7, .col-span-5 {
            grid-column: span 12;
          }
        }

        @media (max-width: 576px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .dashboard-header-actions {
            width: 100%;
          }
          .dashboard-header-actions button {
            width: 100%;
          }
          .survey-progress-box {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }
          .survey-progress-box button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
