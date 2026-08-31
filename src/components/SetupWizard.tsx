import React, { useState } from 'react';
import { Database, Cloud, FileCode, CheckCircle2, AlertCircle, Play, QrCode, Sparkles } from 'lucide-react';
import { saveFirebaseConfig } from '../firebase';
import { BarcodeScanner } from './BarcodeScanner';
import confetti from 'canvas-confetti';

interface SetupWizardProps {
  onSetupComplete: () => void;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ onSetupComplete }) => {
  const [setupMode, setSetupMode] = useState<'welcome' | 'firebase' | 'qr'>('welcome');
  const [configText, setConfigText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDemoBypass = () => {
    // Generate beautiful confetti to make offline mode entry exciting!
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 }
    });
    onSetupComplete();
  };

  const handleFirebaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Clean up inputs (remove comments, extract JSON object)
      let cleanedText = configText.trim();
      
      // If they pasted a script tag or object declaration, try to extract the JSON part
      if (cleanedText.includes('const firebaseConfig =')) {
        const match = cleanedText.match(/const firebaseConfig = ({[\s\S]+?});/);
        if (match && match[1]) {
          cleanedText = match[1];
        }
      }
      
      // Convert standard JS object syntax to valid JSON (quotes around keys)
      // Since it might be copy-pasted as raw JS object, let's use a loose JS parser approach or loose JSON parse
      // A safe way to parse a standard JS object in browser is using Function constructor (sandbox-safe here since it's user input client-side)
      const parseLooseObject = (str: string) => {
        return new Function(`return ${str};`)();
      };

      const parsed = parseLooseObject(cleanedText);

      if (parsed && parsed.apiKey && parsed.projectId) {
        const success = saveFirebaseConfig({
          apiKey: parsed.apiKey,
          authDomain: parsed.authDomain || `${parsed.projectId}.firebaseapp.com`,
          projectId: parsed.projectId,
          storageBucket: parsed.storageBucket || `${parsed.projectId}.appspot.com`,
          messagingSenderId: parsed.messagingSenderId || '',
          appId: parsed.appId || '',
        });

        if (success) {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
          });
          onSetupComplete();
        } else {
          setError('การตั้งค่าล้มเหลว โปรดตรวจสอบสิทธิ์การอ่านเขียนของ Firebase Credentials');
        }
      } else {
        setError('รูปแบบข้อมูลไม่ถูกต้อง โปรดตรวจสอบว่ามีช่อง "apiKey" และ "projectId"');
      }
    } catch (err: any) {
      console.error(err);
      setError(`ไม่สามารถอ่านข้อมูล Config ได้: ${err.message || 'โปรดตรวจสอบความถูกต้องของวงเล็บปีกกาและเครื่องหมายจุลภาค'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQrSuccess = (decodedText: string) => {
    setError(null);
    try {
      const parsed = JSON.parse(decodedText);
      if (parsed && parsed.apiKey && parsed.projectId) {
        const success = saveFirebaseConfig(parsed);
        if (success) {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 }
          });
          onSetupComplete();
        } else {
          setError('การเชื่อมต่อผ่าน QR Code ล้มเหลว โปรดสแกน QR Code ที่ถูกต้อง');
        }
      } else {
        setError('QR Code นี้ไม่ใช่การตั้งค่าของ AMIS');
      }
    } catch (e) {
      setError('ไม่สามารถถอดรหัส QR Code ได้ โปรดสแกนการแชร์ข้อมูลจากหน้าตั้งค่าของเครื่องอื่น');
    }
  };

  return (
    <div className="wizard-backdrop">
      <div className="wizard-card glass-panel animate-fade-in">
        
        {/* Welcome Screen */}
        {setupMode === 'welcome' && (
          <div className="wizard-content">
            <div className="wizard-hero-icon">
              <Sparkles size={40} className="glow-icon" />
            </div>
            <h1 className="wizard-title">ยินดีต้อนรับสู่ระบบจัดการครุภัณฑ์ AMIS</h1>
            <p className="wizard-desc">
              ระบบสแกนตรวจนับและจัดการครุภัณฑ์ผ่านเว็บแอปพลิเคชัน 
              ช่วยอำนวยความสะดวกให้ฝ่ายพัสดุตรวจนับครุภัณฑ์ผ่านมือถือได้พร้อมกันหลายคน
            </p>

            <div className="wizard-choices">
              <button className="choice-card" onClick={() => setSetupMode('firebase')}>
                <div className="choice-icon primary-gradient">
                  <Cloud size={24} color="#ffffff" />
                </div>
                <div className="choice-text">
                  <h3>เชื่อมต่อ Firebase Cloud Database</h3>
                  <p>เก็บข้อมูลออนไลน์ร่วมกันแบบเรียลไทม์ เหมาะสำหรับการใช้งานจริงแบบกลุ่ม</p>
                </div>
              </button>

              <button className="choice-card" onClick={() => setSetupMode('qr')}>
                <div className="choice-icon success-gradient">
                  <QrCode size={24} color="#ffffff" />
                </div>
                <div className="choice-text">
                  <h3>สแกนเข้าร่วมฐานข้อมูลด้วย QR Code</h3>
                  <p>สำหรับโทรศัพท์มือถือของทีมงาน สแกน QR Code จากหน้าจอแอดมินเพื่อเชื่อมต่อทันที</p>
                </div>
              </button>

              <button className="choice-card choice-demo" onClick={handleDemoBypass}>
                <div className="choice-icon warning-gradient">
                  <Database size={24} color="#ffffff" />
                </div>
                <div className="choice-text">
                  <h3>ทดลองใช้งานออฟไลน์ (Demo Mode)</h3>
                  <p>เล่นได้ทันทีแบบไม่มีค่าใช้จ่าย ข้อมูลจะบันทึกชั่วคราวในบราวเซอร์นี้เท่านั้น</p>
                </div>
              </button>
            </div>
            
            <div className="wizard-footer-note">
              พัฒนาเพื่อติดตั้งและโฮสต์ผ่าน GitHub Pages ได้อย่างปลอดภัย 100%
            </div>
          </div>
        )}

        {/* Real Firebase Configuration Input Form */}
        {setupMode === 'firebase' && (
          <div className="wizard-content">
            <h2 className="wizard-title">ตั้งค่าการเชื่อมต่อ Firebase</h2>
            <p className="wizard-desc">
              วางข้อมูลการตั้งค่า **Firebase SDK Configuration** เพื่อเปิดใช้งานฐานข้อมูลแบบออนไลน์ร่วมกัน
            </p>

            <form onSubmit={handleFirebaseSubmit} className="wizard-form">
              <div className="form-group">
                <label className="form-label">Firebase Config Snippet (JS หรือ JSON)</label>
                <textarea 
                  className="form-textarea config-textarea" 
                  placeholder={`{
  apiKey: "AIzaSy...",
  authDomain: "...",
  projectId: "assetwatch-...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
}`}
                  value={configText}
                  onChange={(e) => setConfigText(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="alert alert-danger animate-fade-in">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              <div className="wizard-helper-box">
                <h4>💡 วิธีเปิดใช้งาน Firebase ของตัวเอง:</h4>
                <ol>
                  <li>สร้างโปรเจกต์ใหม่ใน <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer">Firebase Console</a></li>
                  <li>สร้าง <strong>Web App</strong> ในโปรเจกต์ของคุณ</li>
                  <li>คัดลอกส่วน <code>firebaseConfig</code> มาวางลงในกล่องด้านบน</li>
                  <li>เปิดบริการ <strong>Cloud Firestore</strong> และ <strong>Cloud Storage</strong> ในคอนโซล</li>
                </ol>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setSetupMode('welcome')}>
                  ย้อนกลับ
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'กำลังเชื่อมต่อ...' : 'บันทึกและเชื่อมต่อ Cloud'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* QR Code Configuration Scanner Screen */}
        {setupMode === 'qr' && (
          <div className="wizard-content">
            <h2 className="wizard-title">สแกนเชื่อมต่อ</h2>
            <p className="wizard-desc">
              อนุญาตให้ใช้กล้องมือถือแล้วสแกน <strong>QR Code การตั้งค่าคลาวด์</strong> จากหน้าจอคอมพิวเตอร์ของหัวหน้างาน
            </p>

            <div className="qr-scanner-box">
              <BarcodeScanner onScanSuccess={handleQrSuccess} />
            </div>

            {error && (
              <div className="alert alert-danger animate-fade-in" style={{ marginTop: '1rem' }}>
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-actions" style={{ marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSetupMode('welcome')}>
                ย้อนกลับ
              </button>
            </div>
          </div>
        )}

      </div>

      <style>{`
        .wizard-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: radial-gradient(circle at top right, rgba(59,130,246,0.1), transparent 40%),
                      radial-gradient(circle at bottom left, rgba(6,182,212,0.1), transparent 40%),
                      var(--bg-primary);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          overflow-y: auto;
        }

        .wizard-card {
          width: 100%;
          max-width: 600px;
          padding: 2.5rem;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
        }

        .wizard-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .wizard-hero-icon {
          width: 80px;
          height: 80px;
          border-radius: var(--radius-lg);
          background: linear-gradient(135deg, var(--primary-light), var(--info-light));
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.1);
          border: 1px solid var(--border);
        }

        .glow-icon {
          color: var(--primary);
          animation: logo-glow 3s infinite alternate;
        }

        @keyframes logo-glow {
          0% { transform: scale(1); filter: drop-shadow(0 0 2px var(--primary)); }
          100% { transform: scale(1.15); filter: drop-shadow(0 0 12px var(--info)); }
        }

        .wizard-title {
          font-size: 1.75rem;
          font-weight: 800;
          margin-bottom: 0.75rem;
        }

        .wizard-desc {
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
          max-width: 480px;
          line-height: 1.6;
        }

        .wizard-choices {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .choice-card {
          width: 100%;
          padding: 1rem 1.25rem;
          border-radius: var(--radius-md);
          background-color: var(--bg-secondary);
          border: 1.5px solid var(--border);
          display: flex;
          align-items: center;
          gap: 1.25rem;
          cursor: pointer;
          text-align: left;
          transition: all var(--transition-fast);
        }

        .choice-card:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.05);
        }

        .choice-demo:hover {
          border-color: var(--warning);
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.05);
        }

        .choice-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .primary-gradient { background: linear-gradient(135deg, var(--primary), #2563eb); }
        .success-gradient { background: linear-gradient(135deg, var(--success), #059669); }
        .warning-gradient { background: linear-gradient(135deg, var(--warning), #d97706); }

        .choice-text h3 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.15rem;
        }

        .choice-text p {
          font-size: 0.825rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .wizard-footer-note {
          font-size: 0.775rem;
          color: var(--text-muted);
          margin-top: 1rem;
        }

        .wizard-form {
          width: 100%;
          text-align: left;
        }

        .config-textarea {
          font-family: monospace;
          font-size: 0.85rem;
          min-height: 180px;
          background-color: var(--bg-primary);
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          font-weight: 550;
          margin-bottom: 1.5rem;
        }

        .alert-danger {
          background-color: var(--danger-light);
          color: var(--danger);
          border: 1px solid var(--danger);
        }

        .wizard-helper-box {
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
        }

        .wizard-helper-box h4 {
          font-size: 0.9rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .wizard-helper-box ol {
          padding-left: 1.25rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .wizard-helper-box a {
          color: var(--primary);
          text-decoration: underline;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          width: 100%;
        }

        .qr-scanner-box {
          width: 100%;
          max-width: 380px;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 2px solid var(--border);
          background-color: #000000;
        }

        @media (max-width: 576px) {
          .wizard-card {
            padding: 1.5rem;
          }
          .wizard-title {
            font-size: 1.4rem;
          }
          .choice-card {
            gap: 0.75rem;
            padding: 0.75rem;
          }
          .choice-icon {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
    </div>
  );
};
