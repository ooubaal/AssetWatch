import React, { useRef, useState } from 'react';
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
  Check
} from 'lucide-react';
import { getStoredFirebaseConfig, clearFirebaseConfig, FirebaseConfig } from '../firebase';
import { exportBackupData, importBackupData } from '../services/dbService';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';

interface Module7SettingsProps {
  onClearConfig: () => void;
  onImportSuccess: () => void;
}

export const Module7_Settings: React.FC<Module7SettingsProps> = ({
  onClearConfig,
  onImportSuccess
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'config' | 'backup' | 'guide'>('config');
  const [copied, setCopied] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [hideDemoBypass, setHideDemoBypass] = useState(localStorage.getItem('assetwatch_hide_demo_bypass') === 'true');
  const [forceBase64, setForceBase64] = useState(localStorage.getItem('assetwatch_force_base64_images') === 'true');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      
      confetti({
        particleCount: 50,
        spread: 30,
        origin: { y: 0.8 }
      });
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
      setImporting(true);
      setImportStatus(null);
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        try {
          const res = await importBackupData(text);
          setImportStatus(res);
          if (res.success) {
            confetti({
              particleCount: 100,
              spread: 60
            });
            onImportSuccess();
          }
        } catch (err: any) {
          setImportStatus({ success: false, message: `การอ่านไฟล์ล้มเหลว: ${err.message}` });
        } finally {
          setImporting(false);
        }
      };
      reader.readAsText(file);
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
                    <button className="btn btn-warning btn-sm" onClick={onClearConfig} style={{ marginLeft: 'auto', flexShrink: 0 }}>
                      ตั้งค่าเชื่อมต่อคลาวด์
                    </button>
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

                      <div className="danger-zone-settings">
                        <h4>🚨 พื้นที่อันตราย (Danger Zone)</h4>
                        <p>การตัดการเชื่อมต่อจะยุติการอ่านข้อมูลออนไลน์ และให้คุณสลับไปเปลี่ยน Firebase Project อื่นหรือสลับไปทดสอบออฟไลน์</p>
                        <button className="btn btn-danger btn-sm" onClick={handleClearConnection} style={{ marginTop: '0.75rem' }}>
                          <Trash2 size={14} /> ตัดการเชื่อมต่อฐานข้อมูลคลาวด์นี้
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}
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

                <div className="backup-action-card">
                  <Upload size={32} color="var(--success)" />
                  <h4>กู้คืนระบบจากไฟล์แบคอัพ (Import Restore)</h4>
                  <p>อัปโหลดไฟล์สำรองข้อมูล JSON กลับเข้าสู่คลาวด์และหน่วยความจำเพื่อกู้ข้อมูลพัสดุเดิมของคุณ</p>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept=".json" 
                    onChange={handleFileImport} 
                    style={{ display: 'none' }} 
                  />
                  <button 
                    className="btn btn-success w-full" 
                    onClick={handleImportClick} 
                    disabled={importing}
                    style={{ marginTop: 'auto' }}
                  >
                    <Upload size={14} /> {importing ? 'กำลังนำเข้าข้อมูล...' : 'กู้คืนฐานข้อมูลจากไฟล์ JSON'}
                  </button>
                </div>

              </div>

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
                <h3>คู่มือการใช้งานระบบ AssetWatch (User Manual)</h3>
                <span className="card-header-sub">คำแนะนำและวิธีการทำงานสำหรับเจ้าหน้าที่พัสดุและฝ่ายสำรวจ</span>
              </div>

              <div className="guide-section">
                <h4>1. 📸 วิธีสแกนสำรวจครุภัณฑ์ผ่านมือถือ (โมดูล 2)</h4>
                <div className="guide-steps-list">
                  <div className="guide-step-row">
                    <span className="step-num">1</span>
                    <p>เปิดโปรแกรม <strong>AssetWatch</strong> ผ่านเบราว์เซอร์ของมือถือ โดยให้แอดมินเปิดสิทธิ์กล้อง</p>
                  </div>
                  <div className="guide-step-row">
                    <span className="step-num">2</span>
                    <p>หันกล้องมือถือไปที่ **ฉลากบาร์โค้ด** หรือ **QR Code** บนตัวครุภัณฑ์ ระบบจะทำการดึงข้อมูลมาแสดงผลใน 0.5 วินาที</p>
                  </div>
                  <div className="guide-step-row">
                    <span className="step-num">3</span>
                    <p>ตรวจสอบความถูกต้องของสถานที่ตั้ง หากเจอชำรุด สามารถอัปเดตสถานะและกดถ่ายรูปบันทึกหลักฐานสภาพเครื่องเสียหายได้ทันที</p>
                  </div>
                </div>
              </div>

              <div className="guide-section">
                <h4>2. ➕ วิธีลงทะเบียนทรัพย์สินใหม่และสั่งพิมพ์บาร์โค้ด (โมดูล 3)</h4>
                <div className="guide-steps-list">
                  <div className="guide-step-row">
                    <span className="step-num">1</span>
                    <p>เปิดไปที่หน้า **"ลงทะเบียนใหม่"** ป้อนรายละเอียด ถ่ายรูปอุปกรณ์แนบประวัติการรับ</p>
                  </div>
                  <div className="guide-step-row">
                    <span className="step-num">2</span>
                    <p>กรณีไม่มีเลขบาร์โค้ดเดิม ให้กด **"สุ่มสร้างรหัส"** เพื่อให้ระบบออกรหัสควบคุมให้เองแบบเป็นระเบียบ</p>
                  </div>
                  <div className="guide-step-row">
                    <span className="step-num">3</span>
                    <p>เมื่อลงทะเบียนสำเร็จ ให้ไปที่หน้ารายละเอียดครุภัณฑ์ชิ้นนั้น และคลิก **"ดาวน์โหลดฉลาก"** เพื่อเซฟภาพบาร์โค้ดและพิมพ์ไปติดบนทรัพย์สิน</p>
                  </div>
                </div>
              </div>

              <div className="guide-section" style={{ borderBottom: 'none' }}>
                <h4>3. 🔧 การติดตามและติดตามความคืบหน้านำซ่อม (โมดูล 5)</h4>
                <div className="guide-steps-list">
                  <div className="guide-step-row">
                    <span className="step-num">1</span>
                    <p><strong>เปิดเคสแจ้งชำรุด</strong>: ค้นหาพัสดุ ระบุอาการ ถ่ายรูปอาการขัดข้องเพื่อเก็บประวัติและแจ้งเตือนให้เจ้าหน้าที่อื่นรับทราบ</p>
                  </div>
                  <div className="guide-step-row">
                    <span className="step-num">2</span>
                    <p><strong>ส่งไปร้านซ่อม</strong>: เมื่อส่งเครื่องให้ร้านค้าซ่อมแซม ให้กดปุ่ม **"นำส่งช่างซ่อม"** เพื่อระบุบริษัทและแนบรูปใบรับเครื่อง</p>
                  </div>
                  <div className="guide-step-row">
                    <span className="step-num">3</span>
                    <p><strong>รับกลับพัสดุคืน</strong>: เมื่อร้านซ่อมเสร็จส่งคืน ให้กดปุ่ม **"ตรวจรับคืน"** เพื่อตรวจสอบความถูกต้อง ถ่ายรูปยืนยันสภาพพร้อมใช้งาน และเปลี่ยนสถานะกลับเป็นปกติโดยอัตโนมัติ</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>

      </div>

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
