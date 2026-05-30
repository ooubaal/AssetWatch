import React, { useState, useEffect } from 'react';
import { PlusCircle, QrCode, FileText, Camera, AlertCircle, CheckCircle } from 'lucide-react';
import { Asset } from '../utils/mockData';
import { uploadImage } from '../services/dbService';
import confetti from 'canvas-confetti';

interface Module3AddAssetProps {
  onAddAsset: (asset: Asset) => Promise<void>;
  onLogAudit: (trail: { assetId: string; assetName: string; action: any; operator: string; details: string }) => Promise<void>;
  prefilledAssetId: string | null;
  clearPrefilledAssetId: () => void;
  setCurrentTab: (tab: string) => void;
}

export const Module3_AddAsset: React.FC<Module3AddAssetProps> = ({
  onAddAsset,
  onLogAudit,
  prefilledAssetId,
  clearPrefilledAssetId,
  setCurrentTab
}) => {
  // Form states
  const [assetId, setAssetId] = useState('');
  const [name, setName] = useState('');
  const [receivedDate, setReceivedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [source, setSource] = useState(''); // Represent Seller / Supplier / Donor
  const [location, setLocation] = useState('');
  const [department, setDepartment] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<Asset['status']>('ใช้งานได้');
  
  // Image Upload States
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // If there's a prefilled ID from Module 2 (Scanned but unregistered), prefill it
  useEffect(() => {
    if (prefilledAssetId) {
      setAssetId(prefilledAssetId);
    }
  }, [prefilledAssetId]);

  const handleGenerateId = () => {
    // Generate unique standard format ID: YYMM-XXX-XXXX
    const thaiYear = String(new Date().getFullYear() + 543).slice(-2);
    const randomDept = Math.floor(100 + Math.random() * 900); // 3 digits
    const randomSeq = Math.floor(1000 + Math.random() * 9000); // 4 digits
    const generated = `${thaiYear}01-${randomDept}-${randomSeq}`;
    setAssetId(generated);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      // 1. Process image upload
      let finalImageUrl = '';
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile, 'assets');
      } else {
        // Fallback default image placeholder
        finalImageUrl = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60';
      }

      const operatorName = localStorage.getItem('assetwatch_operator') || 'แอดมินพัสดุ';

      const newAsset: Asset = {
        id: assetId.trim().toUpperCase(),
        name: name.trim(),
        imageUrl: finalImageUrl,
        receivedDate,
        source: source.trim(),
        location: location.trim() || 'คลังพัสดุกลาง',
        department: department.trim() || 'ฝ่ายพัสดุหลัก',
        responsiblePerson: responsiblePerson.trim() || 'ไม่มี',
        note: note.trim(),
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // 2. Add to database
      await onAddAsset(newAsset);

      // 3. Log Audit Trail
      await onLogAudit({
        assetId: newAsset.id,
        assetName: newAsset.name,
        action: 'create',
        operator: operatorName,
        details: `ขึ้นทะเบียนครุภัณฑ์รหัสใหม่ ผู้ขาย/ผู้บริจาค: ${newAsset.source} ตั้งที่: ${newAsset.location}`
      });

      // Show confetti for premium feeling!
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
      });

      setSuccess(true);
      clearPrefilledAssetId();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'รหัสครุภัณฑ์ซ้ำหรือเซิร์ฟเวอร์เกิดปัญหา โปรดกรอกข้อมูลให้ครบถ้วน');
    } finally {
      setSaving(false);
    }
  };

  const handleResetForm = () => {
    setAssetId('');
    setName('');
    setImageFile(null);
    setImagePreview(null);
    setLocation('');
    setDepartment('');
    setResponsiblePerson('');
    setNote('');
    setSuccess(false);
    setError(null);
  };

  if (success) {
    return (
      <div className="module-container animate-fade-in">
        <div className="success-wizard-card glass-panel text-center">
          <div className="success-checkmark-wrapper">
            <CheckCircle size={44} color="var(--success)" />
          </div>
          <h2>ขึ้นทะเบียนครุภัณฑ์สำเร็จ!</h2>
          <p>
            ทรัพย์สินรหัส <code>{assetId}</code> ได้รับการขึ้นทะเบียนบัญชีควบคุมและบันทึกลงในคลาวด์เรียบร้อยแล้ว
          </p>

          <div className="success-intake-details">
            <div className="intake-detail-line"><span>ชื่ออุปกรณ์:</span> <strong>{name}</strong></div>
            <div className="intake-detail-line"><span>รหัสครุภัณฑ์:</span> <code>{assetId}</code></div>
            <div className="intake-detail-line"><span>สถานที่ติดตั้ง:</span> <span>📍 {location || 'คลังพัสดุกลาง'}</span></div>
          </div>

          <div className="success-card-actions">
            <button className="btn btn-secondary" onClick={() => setCurrentTab('module1')}>
              เปิดดูบัญชีคลัง (Module 1)
            </button>
            <button className="btn btn-primary" onClick={handleResetForm}>
              ลงทะเบียนเครื่องอื่นถัดไป
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="module-container animate-fade-in">
      <div className="module-title-section">
        <h2>ขึ้นทะเบียนรับครุภัณฑ์ใหม่เข้าคลัง (Module 3)</h2>
        <p>บันทึกประวัติการรับมอบ ค้นหาภาพถ่าย อ้างอิงสัญญาสั่งซื้อพร้อมออกรหัสคุมบาร์โค้ด</p>
      </div>

      <form onSubmit={handleSubmit} className="intake-form glass-panel">
        
        {/* Row 1: Asset ID & Name */}
        <div className="form-row-double">
          <div className="form-group flex-1">
            <label className="form-label">🏷️ รหัสครุภัณฑ์ (สแกนจากบาร์โค้ด หรือ กดสุ่มสร้าง)</label>
            <div className="input-with-action">
              <input 
                type="text" 
                className="form-input code-input-field" 
                placeholder="เช่น 6901-001-0001"
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="btn btn-secondary btn-sm-action" 
                onClick={handleGenerateId}
                title="สุ่มสร้างรหัสบาร์โค้ด"
              >
                <QrCode size={16} /> สุ่มสร้างรหัส
              </button>
            </div>
          </div>

          <div className="form-group flex-1">
            <label className="form-label">🖥️ ชื่อครุภัณฑ์ (ภาษาไทยหรืออังกฤษ)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="เช่น คอมพิวเตอร์ All-in-One Dell Inspiron..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Row 2: Visual Upload Drawer */}
        <div className="form-group">
          <label className="form-label">📷 ถ่ายรูป หรืออัปโหลดรูปภาพครุภัณฑ์</label>
          <div className="image-dropzone">
            <input 
              type="file" 
              id="asset-image-picker"
              accept="image/*"
              className="file-hidden-input"
              onChange={handleImageChange}
            />
            <label htmlFor="asset-image-picker" className="dropzone-label">
              {imagePreview ? (
                <div className="intake-preview-wrapper">
                  <img src={imagePreview} alt="Intake asset preview" />
                  <span className="change-pic-badge"><Camera size={12} /> เปลี่ยนรูป</span>
                </div>
              ) : (
                <>
                  <Camera size={32} color="var(--text-muted)" className="camera-bounce" />
                  <span>ลากไฟล์รูปภาพมาวางที่นี่ หรือ กดคลิกเพื่ออัปโหลด</span>
                  <span className="subtitle-help">รองรับไฟล์ JPG, PNG และการถ่ายภาพด่วนผ่านมือถือ</span>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Row 3: Dates & Source */}
        <div className="form-row-double">
          <div className="form-group flex-1">
            <label className="form-label">📅 วันที่เซ็นเอกสารตรวจรับ</label>
            <input 
              type="date" 
              className="form-input"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group flex-1">
            <label className="form-label">🧾 ผู้จำหน่าย / ผู้ขาย / ผู้บริจาค</label>
            <input 
              type="text" 
              className="form-input"
              placeholder="เช่น บริษัท เอ บี ซี จำกัด, บริจาคโดยสมาคม..."
              value={source}
              onChange={(e) => setSource(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Row 4: Location, Dept, Responsible */}
        <div className="grid-cols-3">
          <div className="form-group">
            <label className="form-label">📍 สถานที่จัดเก็บ/ติดตั้งเริ่มต้น</label>
            <input 
              type="text" 
              className="form-input"
              placeholder="เช่น ห้องประชุมไอที ชั้น 3"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">🏢 ฝ่าย/หน่วยงานที่ดูแลทรัพย์สิน</label>
            <input 
              type="text" 
              className="form-input"
              placeholder="เช่น ฝ่ายธุรการ, ส่วนคอมพิวเตอร์"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">👤 ผู้ดูแล / เจ้าหน้าที่ผู้รับผิดชอบ</label>
            <input 
              type="text" 
              className="form-input"
              placeholder="เช่น นายสมจิต รอดพ้น"
              value={responsiblePerson}
              onChange={(e) => setResponsiblePerson(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Row 5: Notes & Status */}
        <div className="form-row-double">
          <div className="form-group flex-1">
            <label className="form-label">🔍 สถานะเริ่มต้นครุภัณฑ์</label>
            <select 
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as Asset['status'])}
              required
            >
              <option value="ใช้งานได้">ใช้งานได้ (ปกติ)</option>
              <option value="ชำรุด">ชำรุด (มีปัญหา)</option>
              <option value="ขอป้ายรหัสใหม่">ขอป้ายรหัสใหม่</option>
              <option value="รอโอน">รอโอน</option>
            </select>
          </div>

          <div className="form-group flex-1">
            <label className="form-label">📝 หมายเหตุเพิ่มเติม (ความจำเฉพาะตัวเครื่อง)</label>
            <input 
              type="text" 
              className="form-input"
              placeholder="เช่น สเปคเครื่อง Core i7 RAM 16GB, ยี่ห้อแท้ศูนย์..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="alert alert-danger animate-fade-in">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="form-actions-bar">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'กำลังอัปโหลดและลงทะเบียน...' : '➕ ลงทะเบียนประวัติรับของใหม่'}
          </button>
        </div>

      </form>

      <style>{`
        .intake-form {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-row-double {
          display: flex;
          gap: 1.5rem;
          width: 100%;
        }

        .flex-1 {
          flex: 1;
        }

        .input-with-action {
          display: flex;
          gap: 0.5rem;
        }

        .code-input-field {
          font-family: monospace;
          font-weight: 700;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }

        .btn-sm-action {
          padding: 0 1rem;
          white-space: nowrap;
          font-size: 0.85rem;
        }

        /* Image dropzone */
        .image-dropzone {
          width: 100%;
        }

        .dropzone-label {
          width: 100%;
          border: 2px dashed var(--border);
          background-color: var(--bg-primary);
          border-radius: var(--radius-md);
          padding: 2.5rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: center;
        }

        .dropzone-label:hover {
          border-color: var(--primary);
          background-color: rgba(59, 130, 246, 0.01);
        }

        .camera-bounce {
          animation: camera-float 3s infinite alternate ease-in-out;
        }

        @keyframes camera-float {
          0% { transform: translateY(0); }
          100% { transform: translateY(-6px); }
        }

        .intake-preview-wrapper {
          position: relative;
          width: 100%;
          max-width: 380px;
          aspect-ratio: 16/10;
          border-radius: var(--radius-sm);
          overflow: hidden;
          border: 1px solid var(--border);
        }

        .intake-preview-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .change-pic-badge {
          position: absolute;
          bottom: 0.75rem;
          right: 0.75rem;
          background-color: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(2px);
          color: #ffffff;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.7rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .subtitle-help {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .grid-cols-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .form-actions-bar {
          margin-top: 1rem;
          border-top: 1px solid var(--border);
          padding-top: 1.5rem;
          display: flex;
          justify-content: flex-end;
        }

        /* Success Card layout */
        .success-wizard-card {
          padding: 4rem 2rem;
          max-width: 600px;
          margin: 0 auto;
          box-shadow: var(--glass-shadow);
        }

        .text-center {
          text-align: center;
        }

        .success-checkmark-wrapper {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          background-color: var(--success-light);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.25);
          margin-bottom: 1.5rem;
        }

        .success-intake-details {
          background-color: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          max-width: 440px;
          margin: 1.5rem auto;
          text-align: left;
        }

        .intake-detail-line {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          border-bottom: 1px dashed var(--border);
          padding: 0.5rem 0;
        }

        .intake-detail-line:last-child {
          border-bottom: none;
        }

        .intake-detail-line span {
          color: var(--text-secondary);
        }

        .success-card-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .form-row-double {
            flex-direction: column;
            gap: 0;
          }
          .grid-cols-3 {
            grid-template-columns: 1fr;
            gap: 0;
          }
          .intake-form {
            padding: 1.25rem;
          }
          .success-card-actions {
            flex-direction: column;
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};
