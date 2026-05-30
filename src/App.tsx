import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { SetupWizard } from './components/SetupWizard';
import { Dashboard } from './components/Dashboard';

// Database Services
import { getFirebaseServices } from './firebase';
import { 
  getAssets, 
  getAuditTrails, 
  getRepairs, 
  getSurveys,
  addAsset,
  updateAsset,
  addAuditTrail,
  addSurvey,
  addRepair,
  updateRepair,
  getSurveyRounds,
  addSurveyRound,
  updateSurveyRound
} from './services/dbService';

// Module Components
import { Module1_Database } from './modules/Module1_Database';
import { Module2_ScanSurvey } from './modules/Module2_ScanSurvey';
import { Module3_AddAsset } from './modules/Module3_AddAsset';
import { Module4_Dispose } from './modules/Module4_Dispose';
import { Module5_Transfer } from './modules/Module5_Transfer';
import { Module5_Repair } from './modules/Module5_Repair';
import { Module6_AuditTrail } from './modules/Module6_AuditTrail';
import { Module7_Settings } from './modules/Module7_Settings';

import { Asset, AuditTrail, SurveyRecord, RepairCase, SurveyRound } from './utils/mockData';
import { X, Camera, AlertCircle } from 'lucide-react';
import { uploadImage } from './services/dbService';

function App() {
  const [isSetupWizardNeeded, setIsSetupWizardNeeded] = useState(() => {
    // If Firebase config is stored, we bypass the setup wizard on initial load
    const services = getFirebaseServices();
    const demoBypass = localStorage.getItem('assetwatch_demo_bypass');
    return !services.isConfigured && demoBypass !== 'true';
  });

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('assetwatch_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // App-wide dataset states
  const [assets, setAssets] = useState<Asset[]>([]);
  const [audits, setAudits] = useState<AuditTrail[]>([]);
  const [repairs, setRepairs] = useState<RepairCase[]>([]);
  const [surveys, setSurveys] = useState<SurveyRecord[]>([]);
  const [rounds, setRounds] = useState<SurveyRound[]>([]);
  const [activeRound, setActiveRound] = useState<SurveyRound | null>(null);

  // Prefilled Asset ID used for onboarding scanned unregistered barcodes
  const [prefilledAssetId, setPrefilledAssetId] = useState<string | null>(null);

  // Editing Asset states (Module 6)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editResponsible, setEditResponsible] = useState('');
  const [editStatus, setEditStatus] = useState<Asset['status']>('ใช้งานได้');
  const [editNote, setEditNote] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Sync theme attribute to HTML tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('assetwatch_theme', theme);
  }, [theme]);

  // Load all data from Firestore/LocalStorage
  const fetchAllData = async () => {
    try {
      const allAssets = await getAssets();
      const allAudits = await getAuditTrails();
      const allRepairs = await getRepairs();
      const allSurveys = await getSurveys();
      const allRounds = await getSurveyRounds();

      setAssets(allAssets);
      setAudits(allAudits);
      setRepairs(allRepairs);
      setSurveys(allSurveys);
      setRounds(allRounds);

      const active = allRounds.find(r => r.status === 'active');
      setActiveRound(active || null);
    } catch (e) {
      console.error('Error fetching datasets:', e);
    }
  };

  useEffect(() => {
    if (!isSetupWizardNeeded) {
      fetchAllData();
    }
  }, [isSetupWizardNeeded]);

  const handleSetupComplete = () => {
    localStorage.setItem('assetwatch_demo_bypass', 'true');
    setIsSetupWizardNeeded(false);
  };

  const handleClearConfig = () => {
    localStorage.removeItem('assetwatch_demo_bypass');
    setIsSetupWizardNeeded(true);
    setCurrentTab('dashboard');
  };

  // --- DATABASE TRIGGER WRAPPERS ---
  const handleAddNewAsset = async (newAsset: Asset) => {
    await addAsset(newAsset);
    await fetchAllData();
  };

  const handleUpdateAssetStatus = async (id: string, status: Asset['status']) => {
    await updateAsset(id, { status });
    await fetchAllData();
  };

  const handleUpdateAssetTransfer = async (id: string, transferData: { location: string; department: string; responsiblePerson: string }) => {
    await updateAsset(id, transferData);
    await fetchAllData();
  };

  const handleLogAudit = async (trail: Omit<AuditTrail, 'id' | 'timestamp'>) => {
    await addAuditTrail({
      ...trail,
      timestamp: new Date().toISOString()
    });
    await fetchAllData();
  };

  const handleAddSurvey = async (survey: Omit<SurveyRecord, 'id'>) => {
    await addSurvey(survey);
    await fetchAllData();
  };

  const handleCreateSurveyRound = async (name: string, operator: string) => {
    const active = rounds.find(r => r.status === 'active');
    if (active) {
      alert('มีรอบการสำรวจที่กำลังดำเนินการอยู่แล้ว กรุณาปิดรอบการสำรวจเดิมก่อน');
      return;
    }

    const newRound: SurveyRound = {
      id: `round-${Date.now()}`,
      name: name.trim(),
      dateCreated: new Date().toISOString(),
      status: 'active',
      totalAssets: assets.length,
      surveyedAssets: 0,
      completionRate: 0,
      statusBreakdown: {
        'ใช้งานได้': 0,
        'ชำรุด': 0,
        'รอจำหน่าย': 0,
        'ขอป้ายรหัสใหม่': 0,
        'รอโอน': 0,
        'อื่นๆ': 0
      },
      operator: operator || 'แอดมินพัสดุ'
    };

    await addSurveyRound(newRound);
    await fetchAllData();
  };

  const handleCloseActiveRound = async (operator: string) => {
    if (!activeRound) return;

    const latestSurveys = await getSurveys();
    const activeSurveys = latestSurveys.filter(s => s.roundId === activeRound.id);
    
    const totalAssetsCount = assets.length;
    const surveyedCount = activeSurveys.length;
    const rate = totalAssetsCount > 0 ? Math.round((surveyedCount / totalAssetsCount) * 100) : 0;

    const breakdown = {
      'ใช้งานได้': 0,
      'ชำรุด': 0,
      'รอจำหน่าย': 0,
      'ขอป้ายรหัสใหม่': 0,
      'รอโอน': 0,
      'อื่นๆ': 0
    };

    activeSurveys.forEach(record => {
      const s = record.status as keyof typeof breakdown;
      if (s in breakdown) {
        breakdown[s]++;
      } else {
        breakdown['อื่นๆ']++;
      }
    });

    const closedRoundUpdates: Partial<SurveyRound> = {
      status: 'closed',
      dateClosed: new Date().toISOString(),
      totalAssets: totalAssetsCount,
      surveyedAssets: surveyedCount,
      completionRate: rate,
      statusBreakdown: breakdown,
      operator: operator || activeRound.operator
    };

    await updateSurveyRound(activeRound.id, closedRoundUpdates);
    
    await handleLogAudit({
      assetId: 'SYSTEM',
      assetName: `รอบการสำรวจ: ${activeRound.name}`,
      action: 'survey',
      operator: operator || 'แอดมินพัสดุ',
      details: `ปิดรอบการสำรวจประจำปีสำเร็จ อัตราการตรวจสอบ ${rate}% (ตรวจสอบแล้ว ${surveyedCount}/${totalAssetsCount} รายการ)`,
    });

    await fetchAllData();
  };

  const handleAddRepair = async (repair: Omit<RepairCase, 'id'>) => {
    const id = await addRepair(repair);
    await fetchAllData();
    return id;
  };

  const handleUpdateRepair = async (id: string, updates: Partial<RepairCase>) => {
    await updateRepair(id, updates);
    await fetchAllData();
  };

  // --- MODULE 6: EDIT ASSET LIFECYCLE ---
  const handleStartEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setEditName(asset.name);
    setEditLocation(asset.location);
    setEditDepartment(asset.department);
    setEditResponsible(asset.responsiblePerson);
    setEditStatus(asset.status);
    setEditNote(asset.note);
    setEditImagePreview(asset.imageUrl);
    setEditImageFile(null);
  };

  const handleEditAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;

    setSavingEdit(true);
    try {
      const operatorName = localStorage.getItem('assetwatch_operator') || 'แอดมินพัสดุ';
      let finalUrl = editImagePreview || '';

      if (editImageFile) {
        finalUrl = await uploadImage(editImageFile, 'assets');
      }

      // Calculate changed fields for Audit Trail
      const changes: Record<string, { old: any; new: any }> = {};
      const fieldsToCheck: (keyof Asset)[] = ['name', 'location', 'department', 'responsiblePerson', 'status', 'note'];
      
      fieldsToCheck.forEach(field => {
        let newVal: any = '';
        if (field === 'name') newVal = editName;
        else if (field === 'location') newVal = editLocation;
        else if (field === 'department') newVal = editDepartment;
        else if (field === 'responsiblePerson') newVal = editResponsible;
        else if (field === 'status') newVal = editStatus;
        else if (field === 'note') newVal = editNote;

        if (editingAsset[field] !== newVal) {
          changes[field] = { old: editingAsset[field], new: newVal };
        }
      });

      if (editingAsset.imageUrl !== finalUrl) {
        changes.imageUrl = { old: '[รูปถ่ายเดิม]', new: '[รูปถ่ายใหม่]' };
      }

      if (Object.keys(changes).length === 0) {
        setEditingAsset(null);
        setSavingEdit(false);
        return;
      }

      // 1. Update Asset values
      await updateAsset(editingAsset.id, {
        name: editName.trim(),
        location: editLocation.trim(),
        department: editDepartment.trim(),
        responsiblePerson: editResponsible.trim(),
        status: editStatus,
        note: editNote.trim(),
        imageUrl: finalUrl
      });

      // 2. Log in Audit logs
      await handleLogAudit({
        assetId: editingAsset.id,
        assetName: editName.trim(),
        action: 'edit',
        operator: operatorName,
        details: `แก้ไขรายละเอียดครุภัณฑ์ในระบบโดยฝ่ายทะเบียน`,
        changes
      });

      setEditingAsset(null);
      await fetchAllData();
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถอัปเดตข้อมูลครุภัณฑ์ได้');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleRedirectToRegister = (prefilledId: string) => {
    setPrefilledAssetId(prefilledId);
    setCurrentTab('module3'); // Redirect to Register module
  };

  const services = getFirebaseServices();

  if (isSetupWizardNeeded) {
    return <SetupWizard onSetupComplete={handleSetupComplete} />;
  }

  return (
    <div className="app-container">
      {/* Responsive Elegant Shell */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        theme={theme}
        setTheme={setTheme}
        isFirebaseConfigured={services.isConfigured}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {currentTab === 'dashboard' && (
          <Dashboard 
            assets={assets} 
            repairs={repairs} 
            surveys={surveys}
            setCurrentTab={setCurrentTab}
          />
        )}
        {currentTab === 'module1' && (
          <Module1_Database 
            assets={assets}
            audits={audits}
            repairs={repairs}
            surveys={surveys}
            onAssetEdit={handleStartEditAsset}
          />
        )}
        {currentTab === 'module2' && (
          <Module2_ScanSurvey 
            assets={assets}
            surveys={surveys}
            rounds={rounds}
            activeRound={activeRound}
            onAddSurvey={handleAddSurvey}
            onUpdateAssetStatus={handleUpdateAssetStatus}
            onLogAudit={handleLogAudit}
            onRedirectToAdd={handleRedirectToRegister}
            onCreateSurveyRound={handleCreateSurveyRound}
            onCloseActiveRound={handleCloseActiveRound}
          />
        )}
        {currentTab === 'module3' && (
          <Module3_AddAsset 
            onAddAsset={handleAddNewAsset}
            onLogAudit={handleLogAudit}
            prefilledAssetId={prefilledAssetId}
            clearPrefilledAssetId={() => setPrefilledAssetId(null)}
            setCurrentTab={setCurrentTab}
          />
        )}
        {currentTab === 'module4' && (
          <Module4_Dispose 
            assets={assets}
            onUpdateAssetStatus={handleUpdateAssetStatus}
            onLogAudit={handleLogAudit}
          />
        )}
        {currentTab === 'module5_transfer' && (
          <Module5_Transfer 
            assets={assets}
            onUpdateAssetTransfer={handleUpdateAssetTransfer}
            onLogAudit={handleLogAudit}
          />
        )}
        {currentTab === 'module5_repair' && (
          <Module5_Repair 
            assets={assets}
            repairs={repairs}
            onAddRepair={handleAddRepair}
            onUpdateRepair={handleUpdateRepair}
            onUpdateAssetStatus={handleUpdateAssetStatus}
            onLogAudit={handleLogAudit}
          />
        )}
        {currentTab === 'module6' && (
          <Module6_AuditTrail audits={audits} />
        )}
        {currentTab === 'module7' && (
          <Module7_Settings 
            onClearConfig={handleClearConfig}
            onImportSuccess={fetchAllData}
          />
        )}
      </main>

      {/* OVERLAY DIALOG MODAL: Edit Asset details (Module 6) */}
      {editingAsset && (
        <div className="modal-backdrop">
          <form onSubmit={handleEditAssetSubmit} className="modal-card glass-panel animate-fade-in" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="badge badge-primary">แก้ไขฐานข้อมูลครุภัณฑ์</span>
                <h2>{editingAsset.name}</h2>
                <span className="modal-asset-id">รหัสครุภัณฑ์: <code>{editingAsset.id}</code></span>
              </div>
              <button type="button" className="btn-close" onClick={() => setEditingAsset(null)}><X size={18} /></button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              
              <div className="form-group">
                <label className="form-label">🖥️ ชื่อเครื่องครุภัณฑ์</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div className="form-row-double">
                <div className="form-group flex-1">
                  <label className="form-label">📍 สถานที่จัดเก็บ/ติดตั้งใหม่</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group flex-1">
                  <label className="form-label">🏢 ฝ่าย/หน่วยงานผู้ดูแลพัสดุ</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row-double">
                <div className="form-group flex-1">
                  <label className="form-label">👤 ชื่อเจ้าหน้าที่ผู้ดูแลรับผิดชอบ</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editResponsible}
                    onChange={(e) => setEditResponsible(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group flex-1">
                  <label className="form-label">🔍 ปรับปรุงแก้ไขสถานะ</label>
                  <select 
                    className="form-select"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as Asset['status'])}
                    required
                  >
                    <option value="ใช้งานได้">ใช้งานได้</option>
                    <option value="ชำรุด">ชำรุด</option>
                    <option value="ขอป้ายรหัสใหม่">ขอป้ายรหัสใหม่</option>
                    <option value="รอโอน">รอโอน</option>
                    <option value="รอจำหน่าย">รอจำหน่าย</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">📝 หมายเหตุเพิ่มเติม</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                />
              </div>

              {/* Photo uploader inside editing drawer */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">📷 ถ่ายภาพ/อัปเดตรูปภาพเครื่องใหม่</label>
                <div className="survey-upload-trigger">
                  <input 
                    type="file" 
                    id="edit-pic-picker" 
                    accept="image/*" 
                    className="file-hidden-input"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setEditImageFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => setEditImagePreview(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <label htmlFor="edit-pic-picker" className="upload-box-dashed" style={{ padding: '1rem 0.5rem' }}>
                    {editImagePreview ? (
                      <div className="preview-image-box" style={{ maxHeight: '100px', maxWidth: '140px' }}>
                        <img src={editImagePreview} alt="editing asset preview" />
                        <span className="preview-indicator"><Camera size={10} /> กดถ่ายรูปใหม่</span>
                      </div>
                    ) : (
                      <>
                        <Camera size={18} color="var(--text-muted)" />
                        <span>กดถ่ายเพื่อเปลี่ยนรูปภาพครุภัณฑ์</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

            </div>

            <div className="modal-header" style={{ borderTop: '1px solid var(--border)', borderBottom: 'none', padding: '1rem 1.5rem' }}>
              <div></div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingAsset(null)}>ยกเลิก</button>
                <button type="submit" className="btn btn-primary" disabled={savingEdit}>
                  {savingEdit ? 'กำลังอัปเดตระบบ...' : '💾 บันทึกการแก้ไขข้อมูล'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

export default App;
