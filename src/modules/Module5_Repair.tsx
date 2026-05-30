import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  Camera, 
  Search, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Truck, 
  X,
  HelpCircle,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { Asset, RepairCase, UserAccount } from '../utils/mockData';
import { uploadImage } from '../services/dbService';
import confetti from 'canvas-confetti';

interface Module5RepairProps {
  assets: Asset[];
  repairs: RepairCase[];
  onAddRepair: (repair: Omit<RepairCase, 'id'>) => Promise<string>;
  onUpdateRepair: (id: string, updates: Partial<RepairCase>) => Promise<void>;
  onUpdateAssetStatus: (id: string, status: Asset['status']) => Promise<void>;
  onLogAudit: (trail: { assetId: string; assetName: string; action: any; operator: string; details: string }) => Promise<void>;
  currentUser: UserAccount | null;
}

export const Module5_Repair: React.FC<Module5RepairProps> = ({
  assets,
  repairs,
  onAddRepair,
  onUpdateRepair,
  onUpdateAssetStatus,
  onLogAudit,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'board' | 'open_case'>('board');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Open Case Form States
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [symptom, setSymptom] = useState('');
  const [symptomFile, setSymptomFile] = useState<File | null>(null);
  const [symptomPreview, setSymptomPreview] = useState<string | null>(null);
  const [submittingCase, setSubmittingCase] = useState(false);

  // Workflow Dialog States (Sent & Receive Modals)
  const [workflowCase, setWorkflowCase] = useState<RepairCase | null>(null);
  const [workflowAction, setWorkflowAction] = useState<'send' | 'receive' | null>(null);
  
  // Sent form states
  const [vendorName, setVendorName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [sendProofFile, setSendProofFile] = useState<File | null>(null);
  const [sendProofPreview, setSendProofPreview] = useState<string | null>(null);
  const [submittingSend, setSubmittingSend] = useState(false);

  // Receive form states
  const [receiveDate, setReceiveDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [receiveProofFile, setReceiveProofFile] = useState<File | null>(null);
  const [receiveProofPreview, setReceiveProofPreview] = useState<string | null>(null);
  const [submittingReceive, setSubmittingReceive] = useState(false);

  // Search active assets for open case selection
  const supportAssets = assets.filter(a => {
    const isSupportable = a.status !== 'รอจำหน่าย' && a.status !== 'อื่นๆ';
    if (currentUser?.role === 'user') {
      return isSupportable && a.department === currentUser.department;
    }
    return isSupportable;
  });
  const filteredAssets = supportAssets.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter repairs depending on role
  const myRepairs = repairs.filter(c => {
    if (currentUser?.role === 'user') {
      const asset = assets.find(a => a.id === c.assetId);
      return asset ? asset.department === currentUser.department : false;
    }
    return true;
  });

  const handleSymptomImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSymptomFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setSymptomPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSendProofImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSendProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setSendProofPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleReceiveProofImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiveProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setReceiveProofPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 1. OPEN NEW REPAIR CASE
  const handleOpenCaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;

    setSubmittingCase(true);
    try {
      let uploadedUrl = '';
      if (symptomFile) {
        uploadedUrl = await uploadImage(symptomFile, 'repairs');
      }

      const operatorName = localStorage.getItem('assetwatch_operator') || 'ผู้แจ้งเรื่อง';

      // 1.1 Save Repair Case
      const caseId = await onAddRepair({
        assetId: selectedAsset.id,
        assetName: selectedAsset.name,
        symptom,
        symptomImageUrl: uploadedUrl || undefined,
        dateOpened: new Date().toISOString().split('T')[0],
        status: 'open',
        operator: operatorName,
        updatedAt: new Date().toISOString()
      });

      // 1.2 Force asset status to "ชำรุด"
      await onUpdateAssetStatus(selectedAsset.id, 'ชำรุด');

      // 1.3 Write to Audit Logs
      await onLogAudit({
        assetId: selectedAsset.id,
        assetName: selectedAsset.name,
        action: 'repair_open',
        operator: operatorName,
        details: `แจ้งเรื่องอาการชำรุดพัสดุและเปิดเคสซ่อมแซม เลขที่แจ้ง: ${caseId} อาการ: ${symptom}`
      });

      confetti({
        particleCount: 50,
        spread: 40
      });

      // Reset Form & Redirect
      setSelectedAsset(null);
      setSymptom('');
      setSymptomFile(null);
      setSymptomPreview(null);
      setActiveTab('board');
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการเปิดเคสซ่อมพัสดุ');
    } finally {
      setSubmittingCase(false);
    }
  };

  // 2. DISPATCH TO VENDOR
  const handleSentToVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workflowCase) return;

    setSubmittingSend(true);
    try {
      let proofUrl = '';
      if (sendProofFile) {
        proofUrl = await uploadImage(sendProofFile, 'repairs');
      }

      const operatorName = localStorage.getItem('assetwatch_operator') || 'แอดมินส่งซ่อม';

      // 2.1 Update Repair Case properties
      await onUpdateRepair(workflowCase.id, {
        status: 'sent',
        dateSent: new Date().toISOString().split('T')[0],
        repairCompany: vendorName,
        contactPerson: contactPhone,
        sentProofUrl: proofUrl || undefined,
        updatedAt: new Date().toISOString()
      });

      // 2.2 Write to Audit Log
      await onLogAudit({
        assetId: workflowCase.assetId,
        assetName: workflowCase.assetName,
        action: 'repair_send',
        operator: operatorName,
        details: `นำส่งครุภัณฑ์ไปยังช่างซ่อม บริษัท: ${vendorName} เบอร์โทร: ${contactPhone}`
      });

      // Reset
      setWorkflowCase(null);
      setWorkflowAction(null);
      setVendorName('');
      setContactPhone('');
      setSendProofFile(null);
      setSendProofPreview(null);
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการส่งร้านซ่อม');
    } finally {
      setSubmittingSend(false);
    }
  };

  // 3. RECEIVE COMPLETED REPAIR
  const handleReceiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workflowCase) return;

    setSubmittingReceive(true);
    try {
      let returnedProofUrl = '';
      if (receiveProofFile) {
        returnedProofUrl = await uploadImage(receiveProofFile, 'repairs');
      }

      const operatorName = localStorage.getItem('assetwatch_operator') || 'แอดมินรับคืน';

      // 3.1 Update Repair case to completed status
      await onUpdateRepair(workflowCase.id, {
        status: 'completed',
        dateReceived: receiveDate,
        receivedProofUrl: returnedProofUrl || undefined,
        updatedAt: new Date().toISOString()
      });

      // 3.2 Update Asset Status back to 'ใช้งานได้'
      await onUpdateAssetStatus(workflowCase.assetId, 'ใช้งานได้');

      // 3.3 Write to Audit Logs
      await onLogAudit({
        assetId: workflowCase.assetId,
        assetName: workflowCase.assetName,
        action: 'repair_receive',
        operator: operatorName,
        details: `ตรวจรับครุภัณฑ์พัสดุส่งซ่อมคืนคลังสำเร็จ ตรวจเช็คเครื่องแล้วสามารถนำกลับมา "ใช้งานได้" ตามปกติ`
      });

      confetti({
        particleCount: 100,
        spread: 80
      });

      // Reset
      setWorkflowCase(null);
      setWorkflowAction(null);
      setReceiveProofFile(null);
      setReceiveProofPreview(null);
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการตรวจรับพัสดุคืนคลัง');
    } finally {
      setSubmittingReceive(false);
    }
  };

  return (
    <div className="module-container animate-fade-in">
      <div className="module-title-section">
        <h2>ระบบติดตามงานส่งซ่อมครุภัณฑ์ (Module 5)</h2>
        <p>บันทึกเคสอาการชำรุด ประเมินความคืบหน้าของบริษัทช่างซ่อม คุมหลักฐานและประวัติก่อนปิดเคสรับสินค้าคืน</p>
      </div>

      {/* Repair view options tabs */}
      <div className="repair-tabs-header">
        <button 
          className={`repair-tab-btn ${activeTab === 'board' ? 'repair-tab-active' : ''}`}
          onClick={() => setActiveTab('board')}
        >
          🗂️ กระดานติดตามเคสซ่อมแซม ({myRepairs.length})
        </button>
        <button 
          className={`repair-tab-btn ${activeTab === 'open_case' ? 'repair-tab-active' : ''}`}
          onClick={() => setActiveTab('open_case')}
        >
          🚨 เปิดเคสแจ้งชำรุดใหม่ (Open Case)
        </button>
      </div>

      {/* WORKFLOW VIEW 1: Cases Table/Board */}
      {activeTab === 'board' && (
        <div className="repairs-board-panel">
          {myRepairs.length === 0 ? (
            <div className="empty-repairs-board glass-panel">
              <CheckCircle2 size={48} color="var(--success)" />
              <h3>ปัจจุบันไม่มีข้อมูลการแจ้งซ่อมในระบบ</h3>
              <p>เครื่องมือครุภัณฑ์ทั้งหมดอยู่ในสภาพสมบูรณ์ หากมีพัสดุชำรุด สามารถกดแท็บด้านบนเพื่อเปิดเคสใหม่ได้</p>
            </div>
          ) : (
            <div className="table-container glass-panel">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>หมายเลขเคส</th>
                    <th>ครุภัณฑ์</th>
                    <th>อาการชำรุด</th>
                    <th>ประวัติขั้นตอน</th>
                    <th>สถานะเคส</th>
                    <th style={{ textAlign: 'right' }}>การจัดการเคส</th>
                  </tr>
                </thead>
                <tbody>
                  {myRepairs.map((item) => (
                    <tr key={item.id}>
                      <td><code style={{ fontSize: '0.8rem' }}>{item.id}</code></td>
                      <td>
                        <div className="board-asset-cell">
                          <strong>{item.assetName}</strong>
                          <span>รหัส: <code>{item.assetId}</code></span>
                        </div>
                      </td>
                      <td>
                        <div className="board-symptom-cell">
                          <p>{item.symptom}</p>
                          {item.symptomImageUrl && (
                            <a href={item.symptomImageUrl} target="_blank" rel="noreferrer" className="img-attachment-link">
                              🖼️ ดูภาพอาการ
                            </a>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="board-history-cell">
                          <div>📅 แจ้งเมื่อ: <strong>{item.dateOpened}</strong> ({item.operator})</div>
                          {item.dateSent && (
                            <div>🚚 ส่งซ่อม: <strong>{item.dateSent}</strong> ({item.repairCompany})</div>
                          )}
                          {item.dateReceived && (
                            <div style={{ color: 'var(--success)' }}>
                              ✅ รับคืนเมื่อ: <strong>{item.dateReceived}</strong>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          item.status === 'open' ? 'badge-danger' : 
                          item.status === 'sent' ? 'badge-warning' : 'badge-success'
                        }`}>
                          {item.status === 'open' ? 'แจ้งชำรุด' : 
                           item.status === 'sent' ? 'ร้านซ่อมรับไป' : 'ซ่อมรับกลับแล้ว'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="board-action-buttons">
                          {item.status === 'open' && (
                            <button 
                              className="btn btn-warning btn-xs"
                              onClick={() => {
                                setWorkflowCase(item);
                                setWorkflowAction('send');
                              }}
                            >
                              🚚 นำส่งช่างซ่อม
                            </button>
                          )}
                          {item.status === 'sent' && (
                            <button 
                              className="btn btn-success btn-xs"
                              onClick={() => {
                                setWorkflowCase(item);
                                setWorkflowAction('receive');
                              }}
                            >
                              ✅ ตรวจรับคืน
                            </button>
                          )}
                          {item.status === 'completed' && (
                            <span className="case-closed-check">🔒 ปิดเคสประวัติ</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* WORKFLOW VIEW 2: Open Case Intake */}
      {activeTab === 'open_case' && (
        <div className="survey-layout-grid animate-fade-in">
          
          {/* Left Sub-column: Asset Selection list */}
          <div className="scanner-column">
            <div className="selection-list-panel glass-panel">
              <div className="card-header" style={{ marginBottom: '1rem', paddingBottom: '0.5rem' }}>
                <h3>เลือกครุภัณฑ์ที่พบอาการชำรุด</h3>
                <span className="card-header-sub">ค้นหาทรัพย์สินเพื่อออกเอกสารแจ้งซ่อม</span>
              </div>
              
              <div className="search-box" style={{ marginBottom: '1rem', minWidth: '100%' }}>
                <Search size={16} className="search-icon" />
                <input 
                  type="text" 
                  className="form-input search-input" 
                  placeholder="ป้อนรหัส หรือ ชื่อครุภัณฑ์..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="assets-selection-scroll" style={{ maxHeight: '340px' }}>
                {filteredAssets.length === 0 ? (
                  <p className="empty-scroll-text">ไม่พบรายการครุภัณฑ์</p>
                ) : (
                  filteredAssets.map(item => (
                    <button 
                      key={item.id} 
                      type="button"
                      className={`select-asset-row ${selectedAsset?.id === item.id ? 'row-selected' : ''}`}
                      onClick={() => setSelectedAsset(item)}
                    >
                      <div className="select-asset-brief">
                        <span className="brief-id">{item.id}</span>
                        <h4>{item.name}</h4>
                        <div className="brief-meta-line">
                          <span>📍 {item.location}</span>
                          <span className={`badge ${
                            item.status === 'ชำรุด' ? 'badge-danger' : 'badge-success'
                          }`}>{item.status}</span>
                        </div>
                      </div>
                      <ArrowRight size={16} className="chevron-icon" />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Sub-column: Intake symptoms form */}
          <div className="form-column">
            {!selectedAsset ? (
              <div className="survey-wait-card glass-panel" style={{ minHeight: '380px' }}>
                <Clock size={48} color="var(--text-muted)" />
                <h3>ยังไม่ได้ระบุทรัพย์สิน</h3>
                <p>โปรดเลือกรายการครุภัณฑ์จากด้านซ้ายมือเพื่อกรอกข้อมูลรายละเอียดประเมินเคสชำรุด</p>
              </div>
            ) : (
              <form onSubmit={handleOpenCaseSubmit} className="survey-form-panel glass-panel">
                <div className="survey-asset-brief">
                  <img 
                    src={selectedAsset.imageUrl} 
                    alt={selectedAsset.name} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60';
                    }}
                  />
                  <div className="brief-details">
                    <span className="brief-id">{selectedAsset.id}</span>
                    <h3>{selectedAsset.name}</h3>
                    <span>📍 ปัจจุบันอยู่ที่: {selectedAsset.location}</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">⚠️ อาการขัดข้องทางเทคนิค / สภาพชำรุดที่พบ</label>
                  <textarea 
                    className="form-textarea"
                    placeholder="ป้อนรายละเอียด เช่น เปิดสวิตช์เครื่องไม่ติดไฟไม่เข้าบอร์ด, ลูกกลิ้งดึงกระดาษติดขัดอย่างหนัก..."
                    value={symptom}
                    onChange={(e) => setSymptom(e.target.value)}
                    required
                  />
                </div>

                {/* Symptom photo capture */}
                <div className="form-group">
                  <label className="form-label">📷 ถ่ายภาพอ้างอิงความเสียหาย (ตัวเลือกแนบหลักฐาน)</label>
                  <div className="survey-upload-trigger">
                    <input 
                      type="file" 
                      id="symptom-image-picker"
                      accept="image/*"
                      capture="environment"
                      className="file-hidden-input"
                      onChange={handleSymptomImageChange}
                    />
                    <label htmlFor="symptom-image-picker" className="upload-box-dashed">
                      {symptomPreview ? (
                        <div className="preview-image-box">
                          <img src={symptomPreview} alt="Symptom preview" />
                          <span className="preview-indicator"><RefreshCw size={12} /> ถ่ายใหม่</span>
                        </div>
                      ) : (
                        <>
                          <Camera size={20} color="var(--text-muted)" />
                          <span>เปิดกล้องถ่ายรูปอาการชำรุดเพื่อแจ้งช่าง</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setSelectedAsset(null)}>
                    ยกเลิก
                  </button>
                  <button type="submit" className="btn btn-danger" disabled={submittingCase}>
                    {submittingCase ? 'กำลังเปิดใบงาน...' : '🚨 ออกคำขอเปิดเคสแจ้งชำรุด'}
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      )}

      {/* WORKFLOW DIALOG OVERLAY: Sent to vendor Dialog Form */}
      {workflowAction === 'send' && workflowCase && (
        <div className="modal-backdrop">
          <form onSubmit={handleSentToVendorSubmit} className="modal-card glass-panel animate-fade-in" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="badge badge-warning">ขั้นนำส่งของซ่อม</span>
                <h2>ใบรายการส่งซ่อม: {workflowCase.assetName}</h2>
                <span className="modal-asset-id">หมายเลขเคส: <code>{workflowCase.id}</code></span>
              </div>
              <button type="button" className="btn-close" onClick={() => setWorkflowAction(null)}><X size={18} /></button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div className="form-group">
                <label className="form-label">🏢 บริษัทร้านค้าช่างผู้ดูแลซ่อมแซม</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="เช่น บริษัทแอดไวซ์ ไอที สาขากรุงเทพ, ช่างชาติซ่อมแอร์..."
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">📞 เบอร์โทรศัพท์ช่องทางติดต่อผู้รับสินค้าซ่อม</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="เช่น 081-XXXXXXX"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">📷 ถ่ายรูปหลักฐานการเซ็นส่งของ / ใบรับเคลม (ตัวเลือก)</label>
                <div className="survey-upload-trigger">
                  <input 
                    type="file" 
                    id="send-proof-picker"
                    accept="image/*"
                    capture="environment"
                    className="file-hidden-input"
                    onChange={handleSendProofImageChange}
                  />
                  <label htmlFor="send-proof-picker" className="upload-box-dashed" style={{ padding: '1.5rem 1rem' }}>
                    {sendProofPreview ? (
                      <div className="preview-image-box" style={{ maxWidth: '180px' }}>
                        <img src={sendProofPreview} alt="Send proof preview" />
                        <span className="preview-indicator"><RefreshCw size={12} /> ถ่ายใบนำส่งใหม่</span>
                      </div>
                    ) : (
                      <>
                        <Camera size={18} color="var(--text-muted)" />
                        <span>ถ่ายรูปใบนำส่งเคลมเก็บเป็นหลักฐานคลาวด์</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

            </div>

            <div className="modal-header" style={{ borderTop: '1px solid var(--border)', borderBottom: 'none', padding: '1rem 1.5rem' }}>
              <div></div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setWorkflowAction(null)}>ยกเลิก</button>
                <button type="submit" className="btn btn-warning" disabled={submittingSend}>
                  {submittingSend ? 'กำลังอัปเดต...' : '🚚 อัปเดตสถานะขนส่งแล้ว'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* WORKFLOW DIALOG OVERLAY: Triage received Completeness Dialog Form */}
      {workflowAction === 'receive' && workflowCase && (
        <div className="modal-backdrop">
          <form onSubmit={handleReceiveSubmit} className="modal-card glass-panel animate-fade-in" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="badge badge-success">ตรวจรับของคืนคลัง</span>
                <h2>ปิดใบเคสส่งซ่อม: {workflowCase.assetName}</h2>
                <span className="modal-asset-id">ประวัติช่างดูแล: <strong>{workflowCase.repairCompany}</strong></span>
              </div>
              <button type="button" className="btn-close" onClick={() => setWorkflowAction(null)}><X size={18} /></button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div className="form-group">
                <label className="form-label">📅 วันที่ตรวจรับของส่งกลับคืนคลังสำเร็จ</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={receiveDate}
                  onChange={(e) => setReceiveDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">📷 ถ่ายรูปทรัพย์สินสภาพหลังเสร็จสมบูรณ์ / ใบเสร็จปิดงาน (ตัวเลือก)</label>
                <div className="survey-upload-trigger">
                  <input 
                    type="file" 
                    id="receive-proof-picker"
                    accept="image/*"
                    capture="environment"
                    className="file-hidden-input"
                    onChange={handleReceiveProofImageChange}
                  />
                  <label htmlFor="receive-proof-picker" className="upload-box-dashed" style={{ padding: '1.5rem 1rem' }}>
                    {receiveProofPreview ? (
                      <div className="preview-image-box" style={{ maxWidth: '180px' }}>
                        <img src={receiveProofPreview} alt="Receive proof preview" />
                        <span className="preview-indicator"><RefreshCw size={12} /> ถ่ายใหม่</span>
                      </div>
                    ) : (
                      <>
                        <Camera size={18} color="var(--text-muted)" />
                        <span>ถ่ายสภาพของที่รับคืนเพื่อปิดเคส</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

            </div>

            <div className="modal-header" style={{ borderTop: '1px solid var(--border)', borderBottom: 'none', padding: '1rem 1.5rem' }}>
              <div></div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setWorkflowAction(null)}>ยกเลิก</button>
                <button type="submit" className="btn btn-success" disabled={submittingReceive}>
                  {submittingReceive ? 'กำลังตรวจรับของ...' : '✅ ปิดเคสซ่อมสมบูรณ์'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <style>{`
        .repair-tabs-header {
          display: flex;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: 1.5rem;
          padding: 0.25rem;
        }

        .repair-tab-btn {
          flex: 1;
          padding: 0.85rem;
          background: transparent;
          border: none;
          font-family: var(--font-family);
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }

        .repair-tab-active {
          background-color: var(--bg-secondary);
          color: var(--primary);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .board-asset-cell {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .board-asset-cell span {
          font-size: 0.725rem;
          color: var(--text-muted);
        }

        .board-symptom-cell p {
          max-width: 280px;
          line-height: 1.4;
          font-size: 0.85rem;
        }

        .img-attachment-link {
          font-size: 0.75rem;
          color: var(--primary);
          text-decoration: underline;
          font-weight: 550;
        }

        .board-history-cell {
          font-size: 0.775rem;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .board-action-buttons {
          display: inline-flex;
          gap: 0.5rem;
        }

        .case-closed-check {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .empty-repairs-board {
          padding: 5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 1rem;
        }

        .empty-repairs-board p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          max-width: 380px;
        }
      `}</style>
    </div>
  );
};
