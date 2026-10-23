import React, { useRef, useState, useEffect } from 'react';
import { 
  Settings, 
  Download, 
  Upload, 
  Trash2, 
  BookOpen, 
  CloudOff, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  Database,
  ArrowRight,
  User,
  Wrench,
  HelpCircle,
  Copy,
  Check,
  FileCode,
  X,
  Loader2,
  FileText
} from 'lucide-react';
import { getStoredFirebaseConfig, clearFirebaseConfig, FirebaseConfig } from '../firebase';
import { exportBackupData, importBackupData, factoryResetDatabase, RestoreProgress } from '../services/dbService';
import { QRCodeSVG } from 'qrcode.react';
import { Asset, AuditTrail, RepairCase, SurveyRecord, SurveyRound, DepartmentLocationConfig, UserAccount } from '../utils/mockData';

interface Module7SettingsProps {
  onClearConfig: () => void;
  onImportSuccess: () => void;
  assets: Asset[];
  audits: AuditTrail[];
  repairs: RepairCase[];
  surveys: SurveyRecord[];
  rounds: SurveyRound[];
  departments: DepartmentLocationConfig[];
  users: UserAccount[];
  currentUser: UserAccount | null;
}

export const Module7_Settings: React.FC<Module7SettingsProps> = ({
  onClearConfig,
  onImportSuccess,
  assets,
  audits,
  repairs,
  surveys,
  rounds,
  departments,
  users,
  currentUser
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'config' | 'backup' | 'guide'>('config');
  const [copied, setCopied] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [stagedBackup, setStagedBackup] = useState<{
    fileName: string;
    fileSizeFormatted: string;
    jsonText: string;
    counts: {
      assets: number;
      surveys: number;
      repairs: number;
      audits: number;
      departments: number;
      users: number;
      rounds: number;
      total: number;
    };
  } | null>(null);
  const [restoreProgress, setRestoreProgress] = useState<RestoreProgress | null>(null);
  const [readingFile, setReadingFile] = useState(false);
  const [hideDemoBypass, setHideDemoBypass] = useState(localStorage.getItem('assetwatch_hide_demo_bypass') === 'true');
  const [forceBase64, setForceBase64] = useState(localStorage.getItem('assetwatch_force_base64_images') !== 'false');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [githubRepoSizeKb, setGithubRepoSizeKb] = useState<number | null>(null);
  const [loadingGithubSize, setLoadingGithubSize] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState('');

  useEffect(() => {
    setLoadingGithubSize(true);
    fetch('https://api.github.com/repos/ooubaal/AssetWatch')
      .then(res => {
        if (!res.ok) throw new Error('Not found or private repository');
        return res.json();
      })
      .then(data => {
        if (data && typeof data.size === 'number') {
          setGithubRepoSizeKb(data.size);
        }
      })
      .catch(err => {
        console.error('Failed to fetch GitHub repo size:', err);
        // Fallback to estimated repository size
        setGithubRepoSizeKb(480);
      })
      .finally(() => setLoadingGithubSize(false));
  }, []);

  const getFirestoreSizeEstimation = () => {
    try {
      const dataToMeasure = {
        assets,
        audits,
        repairs,
        surveys,
        rounds,
        departments,
        users
      };
      const jsonString = JSON.stringify(dataToMeasure);
      const byteSize = new Blob([jsonString]).size;
      return byteSize;
    } catch (e) {
      return 0;
    }
  };

  const currentConfig = getStoredFirebaseConfig();

  const handleToggleHideDemoBypass = (checked: boolean) => {
    localStorage.setItem('assetwatch_hide_demo_bypass', checked ? 'true' : 'false');
    setHideDemoBypass(checked);
  };

  const handleToggleForceBase64 = (checked: boolean) => {
    localStorage.setItem('assetwatch_force_base64_images', checked ? 'true' : 'false');
    setForceBase64(checked);
  };

  const handleCopyConfig = () => {
    if (!currentConfig) return;
    navigator.clipboard.writeText(JSON.stringify(currentConfig, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearConnection = () => {
    if (window.confirm('คุณต้องการตัดการเชื่อมต่อกับ Firebase Cloud หรือไม่? (ข้อมูลที่เซฟในระบบเดโมออฟไลน์จะไม่ได้รับผลกระทบ)')) {
      clearFirebaseConfig();
      onClearConfig();
    }
  };

  const handleExportBackup = async () => {
    try {
      const backupStr = await exportBackupData();
      const blob = new Blob([backupStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `AssetWatch_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert('เกิดข้อผิดพลาดในการส่งออกไฟล์แบคอัพ');
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReadingFile(true);
      setImportStatus(null);
      setRestoreProgress(null);

      const sizeFormatted = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${(file.size / 1024).toFixed(0)} KB`;

      const reader = new FileReader();
      reader.onload = async (event) => {
        setReadingFile(false);
        const text = event.target?.result as string;
        try {
          const parsed = JSON.parse(text);
          if (!parsed.assets || !Array.isArray(parsed.assets)) {
            setImportStatus({ 
              success: false, 
              message: 'ไฟล์ที่เลือกไม่ใช่ไฟล์สำรองข้อมูลที่ถูกต้องของระบบ AssetWatch (ไม่พบโครงสร้างข้อมูลครุภัณฑ์)' 
            });
            setStagedBackup(null);
            return;
          }

          const assetsCount = parsed.assets?.length || 0;
          const surveysCount = parsed.surveys?.length || 0;
          const repairsCount = parsed.repairs?.length || 0;
          const auditsCount = parsed.audits?.length || 0;
          const deptsCount = parsed.departments?.length || 0;
          const usersCount = parsed.users?.length || 0;
          const roundsCount = parsed.rounds?.length || 0;
          const totalCount = assetsCount + surveysCount + repairsCount + auditsCount + deptsCount + usersCount + roundsCount;

          setStagedBackup({
            fileName: file.name,
            fileSizeFormatted: sizeFormatted,
            jsonText: text,
            counts: {
              assets: assetsCount,
              surveys: surveysCount,
              repairs: repairsCount,
              audits: auditsCount,
              departments: deptsCount,
              users: usersCount,
              rounds: roundsCount,
              total: totalCount
            }
          });
        } catch (err: any) {
          setImportStatus({ success: false, message: `ไฟล์ JSON เสียหายหรือไม่ถูกต้อง: ${err.message}` });
          setStagedBackup(null);
        }
      };
      reader.onerror = () => {
        setReadingFile(false);
        setImportStatus({ success: false, message: 'เกิดข้อผิดพลาดในการอ่านไฟล์จากอุปกรณ์' });
        setStagedBackup(null);
      };
      reader.readAsText(file);
    }
  };

  const handleExecuteRestore = async () => {
    if (!stagedBackup) return;
    setImporting(true);
    setImportStatus(null);
    setRestoreProgress({
      current: 0,
      total: stagedBackup.counts.total,
      percent: 0,
      currentStep: 'เริ่มต้นการกู้คืนข้อมูล...',
      detail: `กำลังเตรียมนำเข้า ${stagedBackup.counts.total.toLocaleString()} รายการ`
    });

    try {
      const res = await importBackupData(stagedBackup.jsonText, (progress) => {
        setRestoreProgress(progress);
      });
      setImportStatus(res);
      if (res.success) {
        onImportSuccess();
        // Clear staged backup on success so UI returns to clean state
        setTimeout(() => {
          setStagedBackup(null);
          setRestoreProgress(null);
        }, 1500);
      }
    } catch (err: any) {
      setImportStatus({ success: false, message: `การกู้คืนข้อมูลล้มเหลว: ${err.message}` });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCancelStaged = () => {
    setStagedBackup(null);
    setImportStatus(null);
    setRestoreProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFactoryReset = async () => {
    if (!currentUser || currentUser.role !== 'admin') {
      setResetError('คุณไม่มีสิทธิ์ในการดำเนินการนี้');
      return;
    }

    if (confirmPassword !== currentUser.password) {
      setResetError('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      return;
    }

    setResetting(true);
    setResetError('');
    try {
      await factoryResetDatabase();

      setShowResetModal(false);
      setConfirmPassword('');
      onImportSuccess(); // Force refresh parent data

      alert('รีเซ็ตฐานข้อมูลทั้งหมดเป็นค่าเริ่มต้นสำเร็จเรียบร้อยแล้ว');
    } catch (e: any) {
      setResetError(`เกิดข้อผิดพลาดในการรีเซ็ตระบบ: ${e.message}`);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="module-container animate-fade-in">
      <div className="module-title-section">
        <h2>แผงตั้งค่า แบคอัพข้อมูล และคู่มือโปรแกรม (Module 7)</h2>
        <p>ตั้งค่าคลาวด์แชร์ทีมงาน สำรอง/กู้คืนฐานข้อมูลครุภัณฑ์ และคู่มือการใช้งานระบบสำหรับฝ่ายพัสดุ</p>
      </div>

      <div className="settings-layout">
        
        {/* Left Sub-nav */}
        <aside className="settings-sidebar glass-panel">
          <button 
            className={`settings-tab-btn ${activeSubTab === 'config' ? 'active-sub-tab' : ''}`}
            onClick={() => setActiveSubTab('config')}
          >
            <Settings size={18} /> ตั้งค่าฐานข้อมูลคลาวด์
          </button>
          <button 
            className={`settings-tab-btn ${activeSubTab === 'backup' ? 'active-sub-tab' : ''}`}
            onClick={() => setActiveSubTab('backup')}
          >
            <Database size={18} /> สำรอง & กู้คืนข้อมูล (Backup)
          </button>
          <button 
            className={`settings-tab-btn ${activeSubTab === 'guide' ? 'active-sub-tab' : ''}`}
            onClick={() => setActiveSubTab('guide')}
          >
            <BookOpen size={18} /> คู่มือการใช้งานระบบ
          </button>
        </aside>

        {/* Right content view area */}
        <main className="settings-content-pane glass-panel">
          
          {/* TAB 1: Firebase dynamic configurations */}
          {activeSubTab === 'config' && (
            <div className="setting-view-box animate-fade-in">
              <div className="card-header" style={{ marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
                <h3>ตั้งค่าคลาวด์ออนไลน์ (Firebase Config)</h3>
                <span className="card-header-sub">แชร์การเข้าถึงเชื่อมต่อในโครงการเดียวกับทีมงานของคุณ</span>
              </div>

              {!currentConfig ? (
                <>
                  <div className="no-config-warning-box">
                    <CloudOff size={36} color="var(--warning)" />
                    <div>
                      <h4>ปัจจุบันระบบกำลังทำงานบน "โหมดตัวอย่างออฟไลน์" (Demo Mode)</h4>
                      <p>
                        ข้อมูลทั้งหมดถูกบันทึกชั่วคราวอยู่ในเว็บบราวเซอร์ของคุณ (LocalStorage) 
                        หากปิดบราวเซอร์หรือล้างคุ้กกี้ข้อมูลจะหายไป เพื่อการใช้งานจริงร่วมกันหลายคน โปรดกดติดตั้ง Firebase
                      </p>
                    </div>
                    {currentUser?.role === 'admin' && (
                      <button className="btn btn-warning btn-sm" onClick={onClearConfig} style={{ marginLeft: 'auto', flexShrink: 0 }}>
                        ตั้งค่าเชื่อมต่อคลาวด์
                      </button>
                    )}
                  </div>

                  {/* Standalone production settings */}
                  <div className="standalone-production-settings-box glass-panel" style={{ marginTop: '1.5rem', padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 750, color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      ⚙️ โหมดใช้งานจริงแบบเก็บข้อมูลในเครื่อง (Standalone Production Settings)
                    </h4>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '1.25rem' }}>
                      หากคุณต้องการนำระบบนี้ไปใช้งานจริงในแบบ <strong>Standalone (บันทึกข้อมูลแบบออฟไลน์ในเครื่องนี้เครื่องเดียวอย่างปลอดภัย)</strong> คุณสามารถสั่งซ่อนปุ่มบัญชีทดสอบด่วน (Demo Bypass) ที่หน้าแรกได้ เพื่อความปลอดภัยและให้หน้าจอลงชื่อเข้าใช้งานมีความเป็นทางการ
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.25rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 650, display: 'block', color: 'var(--text-primary)' }}>🔒 ซ่อนปุ่มบัญชีทดสอบด่วนบนหน้าแรก (Hide Demo Bypass Buttons)</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>เมื่อเปิดใช้งาน จะต้องป้อนชื่อผู้ใช้งานและรหัสผ่านจริงเท่านั้นเพื่อเข้าระบบ</span>
                      </div>
                      <div className="toggle-switch-wrapper">
                        <input 
                          type="checkbox" 
                          id="hide-demo-toggle"
                          checked={hideDemoBypass}
                          onChange={(e) => handleToggleHideDemoBypass(e.target.checked)}
                          style={{ cursor: 'pointer', width: '20px', height: '20px' }}
                        />
                      </div>
                    </div>

                    {hideDemoBypass && (
                      <div className="alert alert-info animate-fade-in" style={{ marginTop: '1.25rem', fontSize: '0.8rem', padding: '1rem', backgroundColor: 'var(--primary-light)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-md)', display: 'block' }}>
                        <span style={{ display: 'block', fontWeight: 750, color: 'var(--primary)', marginBottom: '0.5rem' }}>💡 ข้อมูลการล็อคอินเริ่มต้นหลังจากซ่อนปุ่มเดโม:</span>
                        <span style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>คุณยังคงสามารถล็อคอินเข้าสู่ระบบด้วยบัญชีผู้ใช้เริ่มต้นที่มีอยู่ในระบบได้ดังนี้:</span>
                        <ul style={{ paddingLeft: '1.25rem', margin: '0.5rem 0', listStyleType: 'disc', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <li>👑 <strong>สิทธิ์แอดมินสูงสุด (Admin):</strong> ชื่อผู้ใช้ <code>admin</code> | รหัสผ่าน <code>admin</code> (จัดการระบบและสิทธิ์ผู้ใช้อื่น)</li>
                          <li>💻 <strong>สิทธิ์ฝ่ายเทคโนโลยี (IT User):</strong> ชื่อผู้ใช้ <code>it_user</code> | รหัสผ่าน <code>123</code> (จัดการครุภัณฑ์แผนก IT)</li>
                          <li>💼 <strong>สิทธิ์ฝ่ายบริหารทั่วไป (General Admin):</strong> ชื่อผู้ใช้ <code>admin_general</code> | รหัสผ่าน <code>123</code> (จัดการครุภัณฑ์แผนกบริหาร)</li>
                        </ul>
                        <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem' }}>*คุณสามารถเพิ่มบัญชี ลบรหัส หรือเปลี่ยนเป็นชื่อและรหัสผ่านจริงของคุณเองได้ตลอดเวลาใน <strong>"โมดูล 9: สิทธิ์และการเข้าถึง"</strong></span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="configured-box">
                  <div className="config-grid-layout">
                    
                    {/* Left: QR code to share connection details with team */}
                    <div className="config-share-qr-card">
                      <div className="qr-box-outline">
                        <QRCodeSVG value={JSON.stringify(currentConfig)} size={180} level="L" />
                      </div>
                      <h4>QR Code สิทธิ์เข้าถึงฐานข้อมูล</h4>
                      <p>ให้เพื่อนร่วมงานเปิดเว็บโปรแกรมผ่านมือถือ กด "เข้าร่วมผ่าน QR Code" แล้วสแกนหน้านี้เพื่อเชื่อมต่อทันที</p>
                      
                      <div className="qr-action-buttons">
                        <button className="btn btn-secondary btn-xs" onClick={handleCopyConfig}>
                          {copied ? <Check size={12} color="var(--success)" /> : <Copy size={12} />} 
                          {copied ? ' คัดลอกแล้ว' : ' คัดลอกข้อมูล Config'}
                        </button>
                      </div>
                    </div>

                    {/* Right: details details */}
                    <div className="config-data-details">
                      <h4 className="section-small-title">📍 พารามิเตอร์การเชื่อมต่อปัจจุบัน</h4>
                      <div className="meta-info-list">
                        <div className="meta-line"><span>Project ID:</span> <code>{currentConfig.projectId}</code></div>
                        <div className="meta-line"><span>Auth Domain:</span> <code>{currentConfig.authDomain}</code></div>
                        <div className="meta-line"><span>Storage Bucket:</span> <code>{currentConfig.storageBucket}</code></div>
                        <div className="meta-line"><span>API Key:</span> <code>{currentConfig.apiKey.substring(0, 10)}...</code></div>
                      </div>

                      <div className="standalone-production-settings-box" style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(59, 130, 246, 0.03)', marginTop: '1rem' }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 750, color: 'var(--primary)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          ⚡ โหมดใช้งานรูปถ่ายฟรี 100% (Free Cloud Photo Mode)
                        </h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.85rem' }}>
                          หากคุณใช้งานโปรเจกต์คลาวด์ฟรีและไม่ได้อัปเกรดแผนกชำระเงิน (Blaze Plan) การถ่ายรูปพัสดุจะค้างและช้ามาก ให้เปิดระบบนี้เพื่อ<strong>บังคับข้าม Firebase Storage</strong> และสลับมาใช้ระบบแปลงรูปภาพแบบ Base64 ซึ่งทำงานเสร็จใน 0.1 วินาที และบันทึกผ่านฐานข้อมูลออนไลน์ฟรีทันที!
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.85rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 650, color: 'var(--text-primary)' }}>🚀 บังคับข้ามคลาวด์ Storage (Base64 Fast Mode)</span>
                          <input 
                            type="checkbox" 
                            id="force-base64-toggle"
                            checked={forceBase64}
                            onChange={(e) => handleToggleForceBase64(e.target.checked)}
                            style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                          />
                        </div>
                      </div>

                      {currentUser?.role === 'admin' && (
                        <div className="danger-zone-settings">
                          <h4>🚨 พื้นที่อันตราย (Danger Zone)</h4>
                          <p>การตัดการเชื่อมต่อจะยุติการอ่านข้อมูลออนไลน์ และให้คุณสลับไปเปลี่ยน Firebase Project อื่นหรือสลับไปทดสอบออฟไลน์</p>
                          <button className="btn btn-danger btn-sm" onClick={handleClearConnection} style={{ marginTop: '0.75rem' }}>
                            <Trash2 size={14} /> ตัดการเชื่อมต่อฐานข้อมูลคลาวด์นี้
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* Capacity Status Dashboard */}
              <div className="capacity-dashboard-box glass-panel" style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 750, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  📊 สถิติความจุและคลังเก็บข้อมูล (Storage & Repository Capacity)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  
                  {/* Firestore / LocalStorage Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Database size={16} /> ฐานข้อมูล {currentConfig ? 'Cloud Firestore' : 'LocalStorage (บราวเซอร์)'}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span>ปริมาณการใช้งานปัจจุบัน:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>
                        {(getFirestoreSizeEstimation() / 1024).toFixed(2)} KB 
                        / {currentConfig ? '1,048,576 KB (1 GB)' : '5,120 KB (5 MB)'}
                      </strong>
                    </div>
                    
                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${Math.min(100, (getFirestoreSizeEstimation() / (currentConfig ? 1024 * 1024 * 1024 : 5 * 1024 * 1024)) * 100)}%`, 
                        height: '100%', 
                        backgroundColor: 'var(--primary)',
                        borderRadius: '999px',
                        transition: 'width 0.5s ease-in-out'
                      }} />
                    </div>

                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      {currentConfig ? (
                        <span>*คำนวณจากปริมาณตัวอักษรของข้อมูลพัสดุและไฟล์รูปภาพ Base64 ทั้งหมด โดยอิงตามข้อจำกัดโควตาฟรี (Free Tier 1GB) ของ Google Cloud Firestore</span>
                      ) : (
                        <span>*ข้อมูลกำลังบันทึกเก็บไว้ใน LocalStorage ของเว็บบราวเซอร์นี้ ซึ่งมีขีดจำกัดมาตรฐานของบราวเซอร์อยู่ที่ประมาณ 5MB</span>
                      )}
                    </div>

                    {/* Dataset Breakdown */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.35rem', marginTop: '0.5rem', padding: '0.5rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border)' }}>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>📦 พัสดุ: <strong>{assets.length}</strong> รายการ</div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>📝 บันทึกตรวจ: <strong>{surveys.length}</strong> รายการ</div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>🔧 แจ้งซ่อม: <strong>{repairs.length}</strong> เคส</div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>👤 ผู้ใช้: <strong>{users.length}</strong> บัญชี</div>
                    </div>
                  </div>

                  {/* GitHub Repository Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FileCode size={16} /> พื้นที่จัดเก็บบน GitHub Repository
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span>ขนาดโปรเจกต์ (Code & Assets):</span>
                      <strong style={{ color: 'var(--text-primary)' }}>
                        {loadingGithubSize ? 'กำลังคำนวณ...' : githubRepoSizeKb ? `${githubRepoSizeKb.toLocaleString()} KB` : '480 KB'} 
                        / 1,048,576 KB (1 GB)
                      </strong>
                    </div>
                    
                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${Math.min(100, ((githubRepoSizeKb || 480) / (1024 * 1024)) * 100)}%`, 
                        height: '100%', 
                        backgroundColor: 'var(--success)',
                        borderRadius: '999px',
                        transition: 'width 0.5s ease-in-out'
                      }} />
                    </div>

                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      *ดึงข้อมูลขนาดเนื้อที่โดยตรงจาก GitHub API สำหรับโปรเจกต์ <code>ooubaal/AssetWatch</code> (ขีดจำกัดแนะนำคือ 1GB ต่อ Repository)
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                      <a 
                        href="https://github.com/ooubaal/AssetWatch" 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 650, display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'underline' }}
                      >
                        🌐 ไปที่หน้าคลัง GitHub Repository ของคุณ <ArrowRight size={12} />
                      </a>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Backup and Restore JSON formats */}
          {activeSubTab === 'backup' && (
            <div className="setting-view-box animate-fade-in">
              <div className="card-header" style={{ marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
                <h3>สำรองและกู้คืนฐานข้อมูลครุภัณฑ์ (Backup & Restore)</h3>
                <span className="card-header-sub">ส่งออกข้อมูลเก็บไว้ในเครื่องคอมพิวเตอร์ของคุณเพื่อความปลอดภัยสูงสุด</span>
              </div>

              <div className="backup-actions-grid">
                
                <div className="backup-action-card">
                  <Download size={32} color="var(--primary)" />
                  <h4>สำรองข้อมูลระบบ (Export JSON Backup)</h4>
                  <p>ดาวน์โหลดไฟล์ข้อมูลพัสดุ ประวัติกิจกรรม เคสแจ้งซ่อม และผลการสแกนทั้งหมดเก็บไว้ในเครื่องอย่างปลอดภัย</p>
                  <button className="btn btn-primary w-full" onClick={handleExportBackup} style={{ marginTop: 'auto' }}>
                    <Download size={14} /> ส่งออกข้อมูลแบคอัพทั้งหมด
                  </button>
                </div>

                <div className="backup-action-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ 
                      width: '42px', 
                      height: '42px', 
                      borderRadius: 'var(--radius-md)', 
                      backgroundColor: 'var(--success-light)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Upload size={24} color="var(--success)" />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>กู้คืนระบบจากไฟล์แบคอัพ (Import Restore)</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>นำเข้าไฟล์ JSON เพื่อกู้คืนฐานข้อมูลครุภัณฑ์และผลการสำรวจ</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    อัปโหลดไฟล์สำรองข้อมูล JSON กลับเข้าสู่ระบบ ระบบจะกู้คืนข้อมูลครุภัณฑ์ ผลการสำรวจ และข้อมูลการตั้งค่าเดิมของคุณอย่างครบถ้วน
                  </p>
                  
                  {currentUser?.role === 'admin' ? (
                    <>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        accept=".json" 
                        onChange={handleFileImport} 
                        style={{ display: 'none' }} 
                      />

                      {/* File Reading Spinner */}
                      {readingFile && (
                        <div style={{ 
                          padding: '1.25rem', 
                          borderRadius: 'var(--radius-md)', 
                          backgroundColor: 'var(--bg-tertiary)', 
                          textAlign: 'center',
                          margin: '0.75rem 0'
                        }}>
                          <Loader2 className="animate-spin" size={24} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
                          <div style={{ fontSize: '0.875rem', fontWeight: 650 }}>กำลังโหลดและตรวจสอบไฟล์...</div>
                        </div>
                      )}

                      {/* STAGED FILE PREVIEW & PROGRESS BOX */}
                      {stagedBackup && !readingFile && (
                        <div className="staged-restore-box animate-fade-in" style={{
                          margin: '0.5rem 0 1rem',
                          padding: '1rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1.5px solid rgba(16, 185, 129, 0.35)',
                          backgroundColor: 'rgba(16, 185, 129, 0.04)'
                        }}>
                          {/* File Header */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                              <FileText size={20} color="var(--success)" style={{ flexShrink: 0 }} />
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                                  {stagedBackup.fileName}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  ขนาดไฟล์: {stagedBackup.fileSizeFormatted}
                                </div>
                              </div>
                            </div>
                            {!importing && (
                              <button 
                                onClick={handleCancelStaged}
                                title="ยกเลิก / เลือกไฟล์ใหม่"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: 'var(--text-muted)',
                                  padding: '0.2rem',
                                  borderRadius: 'var(--radius-sm)'
                                }}
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>

                          {/* Data Summary Grid */}
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(2, 1fr)', 
                            gap: '0.4rem', 
                            fontSize: '0.775rem',
                            backgroundColor: 'var(--bg-secondary)',
                            padding: '0.65rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)',
                            marginBottom: '0.85rem'
                          }}>
                            <div>📦 ครุภัณฑ์: <strong style={{ color: 'var(--primary)' }}>{stagedBackup.counts.assets.toLocaleString()}</strong> รายการ</div>
                            <div>📸 ผลสำรวจ: <strong style={{ color: 'var(--success)' }}>{stagedBackup.counts.surveys.toLocaleString()}</strong> รายการ</div>
                            <div>🔧 เคสซ่อม: <strong>{stagedBackup.counts.repairs.toLocaleString()}</strong> รายการ</div>
                            <div>🏢 หน่วยงาน: <strong>{stagedBackup.counts.departments}</strong> แห่ง</div>
                            <div style={{ gridColumn: 'span 2', borderTop: '1px dashed var(--border)', paddingTop: '0.35rem', marginTop: '0.15rem' }}>
                              รวมข้อมูลที่จะกู้คืน: <strong style={{ color: 'var(--text-primary)' }}>{stagedBackup.counts.total.toLocaleString()}</strong> รายการ
                            </div>
                          </div>

                          {/* PROGRESS BAR WITH LIVE PERCENTAGE */}
                          {importing && (
                            <div className="restore-progress-section animate-fade-in" style={{ marginBottom: '0.85rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                                <span style={{ fontSize: '0.825rem', fontWeight: 650, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <Loader2 className="animate-spin" size={15} />
                                  {restoreProgress?.currentStep || 'กำลังกู้คืนข้อมูล...'}
                                </span>
                                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)', letterSpacing: '-0.5px' }}>
                                  {restoreProgress?.percent || 0}%
                                </span>
                              </div>

                              {/* Progress Track */}
                              <div style={{ 
                                width: '100%', 
                                height: '14px', 
                                backgroundColor: 'var(--border)', 
                                borderRadius: '999px', 
                                overflow: 'hidden',
                                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                              }}>
                                <div 
                                  className="restore-progress-bar-fill"
                                  style={{ 
                                    width: `${restoreProgress?.percent || 0}%`, 
                                    height: '100%', 
                                    transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                                  }} 
                                />
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem', fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                                <span>{restoreProgress?.detail || `${restoreProgress?.current || 0} / ${restoreProgress?.total || 0} รายการ`}</span>
                                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>⏳ กำลังดำเนินการ กรุณารอสักครู่...</span>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons inside staged box */}
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <button
                              className="btn btn-success"
                              onClick={handleExecuteRestore}
                              disabled={importing}
                              style={{ 
                                flex: 1, 
                                fontWeight: 700, 
                                fontSize: '0.875rem',
                                padding: '0.65rem 1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                              }}
                            >
                              {importing ? (
                                <>
                                  <Loader2 className="animate-spin" size={16} />
                                  กำลังกู้คืนข้อมูล ({restoreProgress?.percent || 0}%)...
                                </>
                              ) : (
                                <>
                                  <Upload size={16} />
                                  กู้คืนข้อมูลเข้าสู่ระบบทันที
                                </>
                              )}
                            </button>
                            {!importing && (
                              <button
                                className="btn btn-muted"
                                onClick={handleCancelStaged}
                                style={{ padding: '0.65rem 0.85rem' }}
                              >
                                ยกเลิก
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Default Button when no file staged yet */}
                      {!stagedBackup && !readingFile && (
                        <button 
                          className="btn btn-success w-full" 
                          onClick={handleImportClick} 
                          disabled={importing}
                          style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 650 }}
                        >
                          <Upload size={16} /> เลือกไฟล์แบคอัพ JSON เพื่อกู้คืน
                        </button>
                      )}
                    </>
                  ) : (
                    <button 
                      className="btn btn-muted w-full" 
                      disabled
                      style={{ marginTop: 'auto', cursor: 'not-allowed', opacity: 0.6 }}
                    >
                      🔒 สงวนสิทธิ์สำหรับผู้ดูแลระบบ (Admin)
                    </button>
                  )}
                </div>

              </div>

              {/* Factory Reset Section */}
              {currentUser?.role === 'admin' ? (
                <div className="factory-reset-section glass-panel" style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239, 68, 68, 0.02)' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 750, color: 'var(--danger)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Trash2 size={18} /> 🚨 รีเซ็ตระบบทั้งหมดเป็นค่าเริ่มต้น (Factory Reset)
                  </h4>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '1rem' }}>
                    การรีเซ็ตระบบจะทำการลบข้อมูลครุภัณฑ์พัสดุ เคสส่งซ่อม ประวัติการสำรวจ และข้อมูลการตั้งค่าทั้งหมดออกจากระบบอย่างถาวร (ทั้งบนคลาวด์และหน่วยความจำเครื่อง) และย้อนกลับไปใช้ค่าเริ่มต้นจากโรงงาน
                  </p>
                  <div className="alert alert-warning" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.85rem', backgroundColor: 'rgba(245, 158, 11, 0.08)', border: '1px solid var(--warning)', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.8rem', color: 'var(--warning-dark)' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                    <div>
                      <strong>คำเตือนสำคัญ:</strong> เพื่อความปลอดภัย กรุณากดปุ่ม <strong>"ส่งออกข้อมูลแบคอัพทั้งหมด"</strong> ด้านบนเพื่อสำรองข้อมูลเก็บไว้เป็นไฟล์สำรองก่อนทำการรีเซ็ตทุกครั้ง
                    </div>
                  </div>
                  <button 
                    className="btn btn-danger" 
                    onClick={() => {
                      setConfirmPassword('');
                      setResetError('');
                      setShowResetModal(true);
                    }}
                    style={{ fontWeight: 650 }}
                  >
                    <Trash2 size={14} /> ล้างข้อมูลและรีเซ็ตระบบทั้งหมด (Factory Reset)
                  </button>
                </div>
              ) : (
                <div className="factory-reset-section glass-panel" style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', opacity: 0.8 }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 750, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Trash2 size={18} /> 🔒 รีเซ็ตระบบทั้งหมดเป็นค่าเริ่มต้น (Factory Reset)
                  </h4>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: 0 }}>
                    ฟังก์ชันรีเซ็ตระบบทั้งหมดถูกจำกัดสิทธิ์ไว้สำหรับผู้ดูแลระบบสูงสุด (Admin) เท่านั้น บัญชีระดับสิทธิ์ของคุณไม่สามารถดำเนินการนี้ได้
                  </p>
                </div>
              )}

              {importStatus && (
                <div className={`alert ${importStatus.success ? 'alert-success' : 'alert-danger'} animate-fade-in`} style={{ marginTop: '1.5rem' }}>
                  {importStatus.success ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                  <span>{importStatus.message}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Guide/Manual pages */}
          {activeSubTab === 'guide' && (
            <div className="setting-view-box animate-fade-in user-guide-panel">
              <div className="card-header" style={{ marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
                <h3>คู่มือการใช้งานระบบ AssetWatch (User Manual v2.0)</h3>
                <span className="card-header-sub">คำแนะนำและคู่มือการปฏิบัติงานฉบับสมบูรณ์สำหรับเจ้าหน้าที่พัสดุ ผู้ตรวจนับ และผู้ดูแลระบบ</span>
              </div>

              {/* 1. SCAN SURVEY */}
              <div className="guide-section">
                <h4>1. 📸 วิธีสแกนสำรวจตรวจนับครุภัณฑ์ (โมดูล 2: Scan Survey)</h4>
                <div className="guide-steps-list">
                  <div className="guide-step-row">
                    <span className="step-num">1</span>
                    <p><strong>เปิดกล้องสแกน</strong>: ใช้งานผ่านมือถือหรือแท็บเล็ต อนุญาตการเข้าถึงกล้อง แล้วส่องไปที่ **QR Code** หรือ **บาร์โค้ด** บนตัวครุภัณฑ์ ระบบจะดึงข้อมูลพัสดุขึ้นมาแสดงผลทันที</p>
                  </div>
                  <div className="guide-step-row">
                    <span className="step-num">2</span>
                    <p><strong>เลือกห้องที่ตั้งพัสดุ (Searchable Room)</strong>: มีช่องค้นหาห้องที่ตั้ง สามารถพิมพ์ค้นหาชื่อห้อง เช่น <em>"BR 46"</em> หรือ <em>"ห้องหัวหน้า"</em> ได้สะดวกรวดเร็ว</p>
                  </div>
                  <div className="guide-step-row">
                    <span className="step-num">3</span>
                    <p><strong>ระบุสถานะและถ่ายรูป</strong>: ตรวจสอบสถานะ (ใช้งานได้, ชำรุด, รอจำหน่าย ฯลฯ) ซึ่งมีแถบสีเน้นข้อความชัดเจน สามารถกดถ่ายภาพสภาพจริงของครุภัณฑ์เพื่อแนบเป็นหลักฐานการสำรวจได้</p>
                  </div>
                  <div className="guide-step-row">
                    <span className="step-num">4</span>
                    <p><strong>ตรวจสอบรายการ "ตรวจแล้ว" (เรียงล่าสุด)</strong>: สลับไปที่แถบ <strong>"ตรวจแล้ว"</strong> เพื่อดูรายการที่สำรวจไปแล้ว โดยมีตัวเลือกจัดเรียงแบบ <strong>"เรียงล่าสุด (Recently Scanned)"</strong> เพื่อให้รายการที่เพิ่งสแกนเสร็จแสดงอยู่บนสุดเสมอ</p>
                  </div>
                </div>
              </div>

              {/* 2. REGISTRATION */}
              <div className="guide-section">
                <h4>2. ➕ วิธีลงทะเบียนทรัพย์สินใหม่และพิมพ์ฉลาก (โมดูล 3: Add Asset)</h4>
                <div className="guide-steps-list">
                  <div className="guide-step-row">
                    <span className="step-num">1</span>
                    <p><strong>ลงทะเบียนครุภัณฑ์เดี่ยว</strong>: กรอกรหัสครุภัณฑ์, ชื่อพัสดุ, หมายเลขซีเรียล (S/N), หมวดหมู่, หน่วยงาน/ห้อง และแนบรูปภาพ จากนั้นกดบันทึกเข้าสู่ฐานข้อมูล</p>
                  </div>
                  <div className="guide-step-row">
                    <span className="step-num">2</span>
                    <p><strong>นำเข้าแบบกลุ่มจาก Excel</strong>: สลับไปที่แท็บ <strong>"นำเข้าจากไฟล์ Excel"</strong> ดาวน์โหลดเทมเพลต กรอกข้อมูลแล้วอัปโหลดเข้าระบบพร้อมกันหลายร้อยรายการได้ในคลิกเดียว</p>
                  </div>
                  <div className="guide-step-row">
                    <span className="step-num">3</span>
                    <p><strong>พิมพ์ฉลากบาร์โค้ด / QR Code</strong>: ไปที่หน้ารายละเอียดครุภัณฑ์ในโมดูล 1 หรือ 3 เพื่อกดสั่งพิมพ์สติกเกอร์บาร์โค้ดนำไปติดบนตัวพัสดุ</p>
                  </div>
                </div>
              </div>

              {/* 3. MAINTENANCE & PM */}
              <div className="guide-section">
                <h4>3. 🔧 การแจ้งซ่อมและงานบำรุงรักษาเชิงป้องกัน (โมดูล 10: Maintenance & PM)</h4>
                <div className="guide-steps-list">
                  <div className="guide-step-row">
                    <span className="step-num">1</span>
                    <p><strong>เปิดเคสแจ้งชำรุด</strong>: ค้นหาพัสดุที่เสีย ระบุอาการขัดข้อง ถ่ายรูปแนบ และระบุระดับความเร่งด่วนเพื่อส่งเรื่องเข้าสู่กระบวนการซ่อมแซม</p>
                  </div>
                  <div className="guide-step-row">
                    <span className="step-num">2</span>
                    <p><strong>ติดตามสถานะงานซ่อม</strong>: อัปเดตสถานะ เช่น ส่งช่างซ่อมภายนอก, รออะไหล่ พร้อมแนบใบรับเครื่องหรือใบเสนอราคา</p>
                  </div>
                  <div className="guide-step-row">
                    <span className="step-num">3</span>
                    <p><strong>ตรวจรับเครื่องคืน</strong>: เมื่อซ่อมเสร็จ ให้กดตรวจรับคืน ระบุค่าใช้จ่าย และถ่ายรูปสภาพพร้อมใช้งาน ระบบจะปรับสถานะครุภัณฑ์กลับเป็น "ใช้งานได้" ให้อัตโนมัติ</p>
                  </div>
                  <div className="guide-step-row">
                    <span className="step-num">4</span>
                    <p><strong>แผนบำรุงรักษา PM & อะไหล่ (โมดูล 10 & 12)</strong>: จัดทำสัญญาบำรุงรักษา วางรอบตรวจเช็ค PM ล่วงหน้า โดยระบบจะแจ้งเตือนอัตโนมัติเมื่อใกล้ถึงกำหนดตรวจเช็ค และสามารถบันทึกเบิกจ่ายอะไหล่สำรองได้ในคลังอะไหล่</p>
                  </div>
                </div>
              </div>

              {/* 4. BACKUP & RESTORE */}
              <div className="guide-section">
                <h4>4. 💾 การสำรองและกู้คืนฐานข้อมูล (โมดูล 7: Backup & Restore)</h4>
                <div className="guide-steps-list">
                  <div className="guide-step-row">
                    <span className="step-num">1</span>
                    <p><strong>สำรองข้อมูล (Export JSON Backup)</strong>: ไปที่แท็บ <strong>"สำรอง & กู้คืน"</strong> แล้วกด <strong>"ส่งออกข้อมูลแบคอัพทั้งหมด"</strong> เพื่อดาวน์โหลดไฟล์สำรอง <code>.json</code> เก็บไว้ในคอมพิวเตอร์อย่างปลอดภัย</p>
                  </div>
                  <div className="guide-step-row">
                    <span className="step-num">2</span>
                    <p><strong>เลือกไฟล์กู้คืน (Staged Preview)</strong>: กด <strong>"เลือกไฟล์แบคอัพ JSON เพื่อกู้คืน"</strong> ระบบจะตรวจสอบโครงสร้างไฟล์และแสดงยอดสรุปจำนวนครุภัณฑ์, ผลการสำรวจ, เคสซ่อม ฯลฯ ให้ตรวจสอบความถูกต้องก่อนเริ่มกู้คืน</p>
                  </div>
                  <div className="guide-step-row">
                    <span className="step-num">3</span>
                    <p><strong>แถบเปอร์เซ็นต์ความคืบหน้า (Progress Bar)</strong>: เมื่อกด <strong>"กู้คืนข้อมูลเข้าสู่ระบบทันที"</strong> หน้าจอจะแสดงแถบเปอร์เซ็นต์ (0% - 100%) พร้อมชื่อขั้นตอนและจำนวนรายการที่กำลังนำเข้าแบบ Real-time จนเสร็จสมบูรณ์</p>
                  </div>
                </div>
              </div>

              {/* 5. QUOTA & PERFORMANCE */}
              <div className="guide-section">
                <h4>5. ⚡ การประหยัดโควตาคลาวด์และระบบแจ้งเตือน (Cloud Quota & Offline Sync)</h4>
                <div className="guide-steps-list">
                  <div className="guide-step-row">
                    <span className="step-num">1</span>
                    <p><strong>เทคโนโลยี Smart Delta Sync</strong>: ระบบจะอ่านเฉพาะข้อมูลที่ถูกแก้ไขใหม่บนคลาวด์เท่านั้น ทำให้การเปิดโปรแกรมในแต่ละวันกินโควตา Read เพียง <strong>~45 – 80 ครั้ง</strong> (จากโควตาฟรีวันละ 50,000 ครั้ง)</p>
                  </div>
                  <div className="guide-step-row">
                    <span className="step-num">2</span>
                    <p><strong>การค้นหาและกรองข้อมูลไม่เสียโควตา</strong>: การพิมพ์ค้นหาชื่อ, กรองห้อง, ดูรายละเอียด หรือพิมพ์สติกเกอร์ ทำงานบนหน่วยความจำของเครื่อง (0 Read / 0 Write)</p>
                  </div>
                  <div className="guide-step-row">
                    <span className="step-num">3</span>
                    <p><strong>ระบบแจ้งเตือนเมื่อโควตาคลาวด์เต็ม (Quota Sentinel)</strong>: หากโควตาคลาวด์ Firebase เต็ม ระบบจะแสดงป้ายเตือนสีส้มด้านบนพร้อมคำแนะนำที่เข้าใจง่าย โดยผู้ใช้ยังคงทำงานและสำรวจต่อผ่านหน่วยความจำของเครื่องได้โดยข้อมูลไม่สูญหาย</p>
                  </div>
                </div>
              </div>

              {/* 6. SECURITY */}
              <div className="guide-section" style={{ borderBottom: 'none' }}>
                <h4>6. 🛡️ ความปลอดภัยของระบบและการแบ่งสิทธิ์ (Security & Access Control)</h4>
                <div className="guide-steps-list">
                  <div className="guide-step-row">
                    <span className="step-num">1</span>
                    <p><strong>ระดับสิทธิ์ 3 ระดับ (RBAC)</strong>: 
                      <br />• <strong>Admin (ผู้ดูแลระบบ)</strong>: มีสิทธิ์สูงสุด จัดการระบบ กู้คืนข้อมูล นำเข้าไฟล์ และตัดจำหน่ายพัสดุ
                      <br />• <strong>Manager (ผู้บริหาร)</strong>: ดูรายงาน สถิติ ผลการสำรวจ และข้อมูลพัสดุทุกแผนกแบบอ่านอย่างเดียว (Read-Only)
                      <br />• <strong>Operator (เจ้าหน้าที่สำรวจ)</strong>: สแกนสำรวจ ตรวจนับ บันทึกรูปถ่าย และแจ้งซ่อมพัสดุในแผนกที่รับผิดชอบ
                    </p>
                  </div>
                  <div className="guide-step-row">
                    <span className="step-num">2</span>
                    <p><strong>ความปลอดภัยของข้อมูล</strong>: ข้อมูลและภาพถ่ายส่งผ่านระบบความปลอดภัย HTTPS เสมอ และไม่มีการบันทึกข้อมูลครุภัณฑ์หรือรหัสผ่านไว้บน GitHub ข้อมูลทั้งหมดจะถูกเก็บอยู่ใน Firebase Cloud และคอมพิวเตอร์ของคุณเท่านั้น</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>

      </div>

      {showResetModal && (
        <div className="modal-backdrop" style={{ zIndex: 99999 }}>
          <div className="modal-content glass-panel animate-scale-up" style={{ maxWidth: '480px', width: '90%', padding: '1.75rem' }}>
            
            <div className="modal-header" style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', fontSize: '1.15rem', fontWeight: 800 }}>
                <Trash2 size={20} /> ยืนยันการรีเซ็ตระบบทั้งหมด
              </h3>
              <button className="btn btn-ghost btn-icon-only" onClick={() => setShowResetModal(false)} disabled={resetting}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                คุณกำลังจะทำการรีเซ็ตข้อมูลครุภัณฑ์พัสดุ เคสแจ้งซ่อม และผลการสำรวจสภาพทั้งหมดในระบบให้ย้อนกลับเป็นค่าเริ่มต้นจากโรงงาน (Factory Reset)
              </p>
              
              <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.85rem', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.775rem', color: '#dc2626' }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                <div>
                  <strong>⚠️ คำเตือน:</strong> ข้อมูลทั้งหมดที่ถูกลบไปแล้วจะไม่สามารถกู้คืนกลับมาได้อีก โปรดตรวจสอบให้แน่ใจว่าคุณได้สำรองข้อมูล (Backup) เรียบร้อยแล้วก่อนทำการรีเซ็ต
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label className="form-label" style={{ fontSize: '0.825rem', fontWeight: 650, color: 'var(--text-secondary)' }}>
                  🔑 กรุณากรอกรหัสผ่านบัญชีผู้ใช้ปัจจุบันเพื่อยืนยัน (Confirm Password)
                </label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="ป้อนรหัสผ่านปัจจุบันของคุณ"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setResetError('');
                  }}
                  disabled={resetting}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)' }}
                  required
                />
              </div>

              {resetError && (
                <div className="alert alert-danger animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', fontSize: '0.775rem', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', color: '#dc2626' }}>
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  <span>{resetError}</span>
                </div>
              )}
            </div>

            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowResetModal(false)}
                disabled={resetting}
                style={{ minWidth: '80px' }}
              >
                ยกเลิก
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleFactoryReset}
                disabled={resetting || !confirmPassword}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', minWidth: '140px', justifyContent: 'center' }}
              >
                {resetting ? (
                  <>กำลังรีเซ็ตระบบ...</>
                ) : (
                  <>
                    <Trash2 size={14} /> ยืนยันการรีเซ็ตระบบ
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      <style>{`
        .settings-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        .settings-sidebar {
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .settings-tab-btn {
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
          font-size: 0.9rem;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .settings-tab-btn:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .active-sub-tab {
          background-color: var(--primary-light);
          color: var(--primary);
        }

        .settings-content-pane {
          padding: 2rem;
          min-height: 480px;
        }

        /* Firebase configurations box */
        .no-config-warning-box {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.25rem;
          background-color: var(--warning-light);
          border: 1px solid var(--warning);
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }

        .no-config-warning-box h4 {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--warning-hover);
          margin-bottom: 0.25rem;
        }

        .no-config-warning-box p {
          color: var(--text-secondary);
          line-height: 1.45;
        }

        .config-grid-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 2rem;
          align-items: start;
        }

        .config-share-qr-card {
          padding: 1.25rem;
          background-color: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .qr-box-outline {
          padding: 0.5rem;
          background-color: #ffffff;
          border-radius: var(--radius-sm);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          margin-bottom: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .config-share-qr-card h4 {
          font-size: 0.85rem;
          font-weight: 750;
          margin-bottom: 0.25rem;
        }

        .config-share-qr-card p {
          font-size: 0.725rem;
          color: var(--text-muted);
          line-height: 1.45;
          margin-bottom: 1rem;
        }

        .qr-action-buttons {
          width: 100%;
        }

        .config-data-details {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .section-small-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .meta-info-list {
          background-color: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 1rem;
          font-size: 0.825rem;
        }

        .meta-line {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px dashed var(--border);
          padding: 0.45rem 0;
        }

        .meta-line:last-child {
          border-bottom: none;
        }

        .meta-line span {
          color: var(--text-secondary);
          font-weight: 550;
        }

        .meta-line code {
          font-weight: 600;
          color: var(--text-primary);
        }

        .danger-zone-settings {
          border: 1px solid var(--danger);
          background-color: var(--danger-light);
          padding: 1.25rem;
          border-radius: var(--radius-md);
        }

        .danger-zone-settings h4 {
          color: var(--danger);
          font-size: 0.9rem;
          font-weight: 750;
          margin-bottom: 0.25rem;
        }

        .danger-zone-settings p {
          font-size: 0.775rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        /* Backup view cards */
        .backup-actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .backup-action-card {
          padding: 1.5rem;
          background-color: var(--bg-primary);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.75rem;
          min-height: 260px;
        }

        .backup-action-card h4 {
          font-size: 1rem;
          font-weight: 750;
        }

        .backup-action-card p {
          font-size: 0.825rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        /* Alert notifications */
        .alert-success {
          background-color: var(--success-light);
          color: var(--success);
          border: 1px solid var(--success);
        }

        /* User Guide */
        .user-guide-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .guide-section {
          border-bottom: 1px solid var(--border);
          padding-bottom: 1.25rem;
        }

        .guide-section h4 {
          font-size: 0.95rem;
          font-weight: 750;
          color: var(--primary);
          margin-bottom: 0.75rem;
        }

        .guide-steps-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .guide-step-row {
          display: flex;
          gap: 0.85rem;
          align-items: flex-start;
        }

        .step-num {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background-color: var(--primary-light);
          border: 1.5px solid var(--primary);
          color: var(--primary);
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 0.15rem;
        }

        .guide-step-row p {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        @media (max-width: 992px) {
          .settings-layout {
            grid-template-columns: 1fr;
          }
          .settings-sidebar {
            flex-direction: row;
            overflow-x: auto;
            gap: 0.5rem;
          }
          .settings-tab-btn {
            white-space: nowrap;
            width: auto;
          }
          .config-grid-layout {
            grid-template-columns: 1fr;
            justify-items: center;
          }
          .config-share-qr-card {
            width: 100%;
            max-width: 320px;
          }
        }

        @media (max-width: 576px) {
          .backup-actions-grid {
            grid-template-columns: 1fr;
          }
          .backup-action-card {
            min-height: auto;
          }
        }
      `}</style>
    </div>
  );
};
