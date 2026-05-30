import React from 'react';
import { 
  LayoutDashboard, 
  Database, 
  QrCode, 
  PlusCircle, 
  Trash2, 
  Move, 
  Wrench, 
  History, 
  Settings, 
  Sun, 
  Moon,
  Menu,
  X,
  Building
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  isFirebaseConfigured: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  setCurrentTab, 
  theme, 
  setTheme,
  isFirebaseConfigured
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'แผงควบคุม (Dashboard)', icon: LayoutDashboard },
    { id: 'module1', label: 'ฐานข้อมูลครุภัณฑ์', icon: Database },
    { id: 'module2', label: 'แสกนตรวจนับครุภัณฑ์', icon: QrCode },
    { id: 'module3', label: 'ลงทะเบียนใหม่', icon: PlusCircle },
    { id: 'module4', label: 'จำหน่ายครุภัณฑ์', icon: Trash2 },
    { id: 'module5_transfer', label: 'โอนย้ายครุภัณฑ์', icon: Move },
    { id: 'module5_repair', label: 'ประวัติการส่งซ่อม', icon: Wrench },
    { id: 'module6', label: 'ประวัติกิจกรรม (Audit)', icon: History },
    { id: 'module8', label: 'ตั้งค่าหน่วยงาน & ห้อง', icon: Building },
    { id: 'module7', label: 'ตั้งค่า & คู่มือการใช้งาน', icon: Settings },
  ];

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="mobile-header">
        <div className="logo-container">
          <div className="logo-icon-pulse"></div>
          <span className="logo-text">AssetWatch</span>
        </div>
        <div className="mobile-header-actions">
          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button className="menu-btn" onClick={() => setIsOpen(!isOpen)} aria-label="Open menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Sidebar Container */}
      <aside className={`sidebar-container ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-symbol">
            <QrCode size={24} color="#ffffff" />
          </div>
          <div>
            <h2 className="logo-title">AssetWatch</h2>
            <span className="logo-subtitle">ระบบจัดการครุภัณฑ์</span>
          </div>
        </div>

        {/* Firebase Config Indicator */}
        <div className="firebase-badge-container">
          <div className={`firebase-status-dot ${isFirebaseConfigured ? 'status-online' : 'status-demo'}`}></div>
          <span className="firebase-status-text">
            {isFirebaseConfigured ? 'เชื่อมต่อ Cloud' : 'ทดสอบออฟไลน์ (Demo)'}
          </span>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <li key={item.id}>
                  <button 
                    className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                    onClick={() => {
                      setCurrentTab(item.id);
                      setIsOpen(false);
                    }}
                  >
                    <Icon size={20} className={`nav-icon ${isActive ? 'nav-icon-active' : ''}`} />
                    <span className="nav-label">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Theme toggle & Footer */}
        <div className="sidebar-footer">
          <button className="theme-switch" onClick={toggleTheme}>
            {theme === 'light' ? (
              <>
                <Moon size={18} />
                <span>โหมดกลางคืน (Dark)</span>
              </>
            ) : (
              <>
                <Sun size={18} />
                <span>โหมดกลางวัน (Light)</span>
              </>
            )}
          </button>
          <div className="footer-copyright">
            v1.0.0 © ooubaal / AssetWatch
          </div>
        </div>
      </aside>

      {/* Overlay for mobile menu */}
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}

      {/* Mobile Bottom Tab Bar (Quick access to Database and Scanner) */}
      <nav className="mobile-bottom-nav">
        <button 
          className={`bottom-nav-item ${currentTab === 'dashboard' ? 'bottom-nav-active' : ''}`}
          onClick={() => setCurrentTab('dashboard')}
        >
          <LayoutDashboard size={20} />
          <span>แผงควบคุม</span>
        </button>
        <button 
          className={`bottom-nav-item ${currentTab === 'module1' ? 'bottom-nav-active' : ''}`}
          onClick={() => setCurrentTab('module1')}
        >
          <Database size={20} />
          <span>ครุภัณฑ์</span>
        </button>
        <button 
          className="bottom-nav-item scanner-fab"
          onClick={() => setCurrentTab('module2')}
        >
          <div className="fab-inner">
            <QrCode size={24} color="#ffffff" />
          </div>
        </button>
        <button 
          className={`bottom-nav-item ${currentTab === 'module5_repair' ? 'bottom-nav-active' : ''}`}
          onClick={() => setCurrentTab('module5_repair')}
        >
          <Wrench size={20} />
          <span>งานซ่อม</span>
        </button>
        <button 
          className={`bottom-nav-item ${currentTab === 'module7' ? 'bottom-nav-active' : ''}`}
          onClick={() => setCurrentTab('module7')}
        >
          <Settings size={20} />
          <span>ตั้งค่า</span>
        </button>
      </nav>

      {/* Adding custom styles directly relevant to the Sidebar shell layout */}
      <style>{`
        /* Sidebar styles */
        .sidebar-container {
          width: 260px;
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          background-color: var(--bg-secondary);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          z-index: 100;
          transition: transform var(--transition-normal);
        }

        .sidebar-logo {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.85rem;
          border-bottom: 1px solid var(--border);
        }

        .logo-symbol {
          width: 42px;
          height: 42px;
          background: linear-gradient(135deg, var(--primary), var(--info));
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2);
        }

        .logo-title {
          font-size: 1.2rem;
          font-weight: 800;
          line-height: 1.1;
          background: linear-gradient(120deg, var(--primary), var(--info));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .logo-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .firebase-badge-container {
          margin: 1rem 1.25rem 0.5rem 1.25rem;
          padding: 0.5rem 0.75rem;
          background-color: var(--bg-primary);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .firebase-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-online {
          background-color: var(--success);
          box-shadow: 0 0 8px var(--success);
        }

        .status-demo {
          background-color: var(--warning);
          box-shadow: 0 0 8px var(--warning);
        }

        .firebase-status-text {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .sidebar-nav {
          flex: 1;
          padding: 1.25rem;
          overflow-y: auto;
        }

        .sidebar-nav ul {
          list-style: none;
        }

        .sidebar-nav li {
          margin-bottom: 0.35rem;
        }

        .nav-link {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-family: var(--font-family);
          font-size: 0.925rem;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .nav-link:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .nav-link-active {
          background-color: var(--primary-light);
          color: var(--primary);
          font-weight: 600;
        }

        .nav-icon {
          color: var(--text-muted);
          transition: color var(--transition-fast);
        }

        .nav-icon-active {
          color: var(--primary);
        }

        .sidebar-footer {
          padding: 1.25rem;
          border-top: 1px solid var(--border);
          background-color: var(--bg-secondary);
        }

        .theme-switch {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.65rem;
          border-radius: var(--radius-sm);
          background-color: var(--bg-primary);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-family: var(--font-family);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .theme-switch:hover {
          background-color: var(--border);
          color: var(--text-primary);
        }

        .footer-copyright {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-align: center;
          margin-top: 0.75rem;
          font-weight: 500;
        }

        /* Mobile top bar and bottom nav styles */
        .mobile-header {
          display: none;
          height: 60px;
          background-color: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
          padding: 0 1.25rem;
          align-items: center;
          justify-content: space-between;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 100;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .logo-icon-pulse {
          width: 10px;
          height: 10px;
          background-color: var(--primary);
          border-radius: 50%;
          position: relative;
        }

        .logo-icon-pulse::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background-color: var(--primary);
          animation: pulse 2s infinite;
          left: 0;
          top: 0;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(2.5); opacity: 0; }
        }

        .logo-text {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .mobile-header-actions {
          display: flex;
          gap: 0.75rem;
        }

        .theme-toggle-btn, .menu-btn {
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem;
        }

        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 64px;
          background-color: var(--bg-secondary);
          border-top: 1px solid var(--border);
          z-index: 100;
          justify-content: space-around;
          align-items: center;
          padding: 0 0.5rem;
          box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.05);
        }

        .bottom-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 0.7rem;
          font-family: var(--font-family);
          gap: 0.2rem;
          cursor: pointer;
          flex: 1;
        }

        .bottom-nav-active {
          color: var(--primary);
          font-weight: 600;
        }

        /* Scanner Floating Action Button */
        .scanner-fab {
          position: relative;
          top: -15px;
          z-index: 101;
        }

        .fab-inner {
          width: 54px;
          height: 54px;
          background: linear-gradient(135deg, var(--primary), var(--info));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
          border: 4px solid var(--bg-secondary);
          transition: transform 0.2s;
        }

        .fab-inner:active {
          transform: scale(0.9);
        }

        @media (max-width: 768px) {
          .sidebar-container {
            transform: translateX(-100%);
          }
          
          .sidebar-open {
            transform: translateX(0);
          }

          .sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(4px);
            z-index: 99;
          }

          .mobile-header {
            display: flex;
          }

          .mobile-bottom-nav {
            display: flex;
          }
          
          body {
            padding-top: 60px; /* Offset for top bar */
          }
        }
      `}</style>
    </>
  );
};
