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
  addAssetsBulk,
  updateAsset,
  addAuditTrail,
  addSurvey,
  addRepair,
  updateRepair,
  getSurveyRounds,
  addSurveyRound,
  updateSurveyRound,
  getDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  getUsers,
  addOrUpdateUser,
  deleteUser,
  getPMContracts,
  addPMContract,
  updatePMContract,
  deletePMContract,
  getPMSchedules,
  addPMSchedule,
  updatePMSchedule,
  getPMNotifications,
  addPMNotification,
  updatePMNotification,
  deletePMNotification
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
import { Module8_Departments } from './modules/Module8_Departments';
import { Module9_AccessControl } from './modules/Module9_AccessControl';
import { Module10_Maintenance } from './modules/Module10_Maintenance';

import { Asset, AuditTrail, SurveyRecord, RepairCase, SurveyRound, DepartmentLocationConfig, UserAccount, INITIAL_USERS, PMContract, PMSchedule, PMNotification } from './utils/mockData';
import { X, Camera, AlertCircle, Lock, Bell } from 'lucide-react';
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
  const [departments, setDepartments] = useState<DepartmentLocationConfig[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  
  // PM & CM States
  const [contracts, setContracts] = useState<PMContract[]>([]);
  const [schedules, setSchedules] = useState<PMSchedule[]>([]);
  const [pmNotifications, setPmNotifications] = useState<PMNotification[]>([]);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('assetwatch_session');
    if (saved) {
      try {
        return JSON.parse(saved) as UserAccount;
      } catch (e) {
        console.error('Failed to parse active user session:', e);
      }
    }
    return null;
  });

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

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

  // Automated PM/CM alert check
  const checkAndGeneratePMNotifications = async (scheds: PMSchedule[], notifs: PMNotification[]) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const warningLimit = new Date();
    warningLimit.setDate(warningLimit.getDate() + 7);
    const warningLimitStr = warningLimit.toISOString().split('T')[0];

    for (const s of scheds) {
      if (s.status === 'pending') {
        const isOverdue = s.plannedDate < todayStr;
        const isUpcoming = s.plannedDate >= todayStr && s.plannedDate <= warningLimitStr;

        if (isOverdue || isUpcoming) {
          const notifType = isOverdue ? 'pm_overdue' : 'pm_upcoming';
          const exists = notifs.some(n => n.type === notifType && n.message.includes(s.assetId));
          
          if (!exists) {
            const newNotif: PMNotification = {
              id: `notif-${Date.now()}-${s.id}`,
              title: isOverdue ? `🔴 แผน PM เลยกำหนดตรวจเช็ค (${s.assetId})` : `📅 ใกล้ถึงกำหนดบำรุงรักษา PM (${s.assetId})`,
              message: isOverdue 
                ? `ครุภัณฑ์ ${s.assetName} รหัส ${s.assetId} เลยกำหนดเข้าตรวจบำรุงรักษา PM เมื่อวันที่ ${s.plannedDate}`
                : `ครุภัณฑ์ ${s.assetName} รหัส ${s.assetId} มีแผนเข้าตรวจบำรุงรักษา PM ในวันที่ ${s.plannedDate}`,
              targetDate: todayStr,
              isRead: false,
              type: notifType,
              linkTo: 'module10_pm'
            };
            await addPMNotification(newNotif);
          }
        }
      }
    }
  };

  // Load all data from Firestore/LocalStorage
  const fetchAllData = async () => {
    try {
      const allAssets = await getAssets();
      const allAudits = await getAuditTrails();
      const allRepairs = await getRepairs();
      const allSurveys = await getSurveys();
      const allRounds = await getSurveyRounds();
      const allDepts = await getDepartments();
      const allUsers = await getUsers();
      const allContracts = await getPMContracts();
      const allSchedules = await getPMSchedules();
      const allPMNotifs = await getPMNotifications();

      setAssets(allAssets);
      setAudits(allAudits);
      setRepairs(allRepairs);
      setSurveys(allSurveys);
      setRounds(allRounds);
      setDepartments(allDepts);
      setUsers(allUsers);
      setContracts(allContracts);
      setSchedules(allSchedules);
      setPmNotifications(allPMNotifs);

      // Automated check and notification generation
      await checkAndGeneratePMNotifications(allSchedules, allPMNotifs);
      const updatedPMNotifs = await getPMNotifications();
      setPmNotifications(updatedPMNotifs);

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

  useEffect(() => {
    if (!currentUser && !isSetupWizardNeeded) {
      // If we are logged out (on the login screen), fetch the latest users list so the dropdown is fully synced!
      getUsers().then(latestUsers => {
        setUsers(latestUsers);
      }).catch(err => console.error('Failed to sync users on mount:', err));
    }
  }, [currentUser, isSetupWizardNeeded]);

  // --- AUTO-LOGOUT INACTIVITY TIMEOUT (30 MINUTES) ---
  useEffect(() => {
    if (!currentUser) return;

    // Timeout duration: 30 minutes in milliseconds (30 * 60 * 1000)
    const INACTIVITY_TIMEOUT = 30 * 60 * 1000;
    let timeoutId: any;

    const handleLogoutDueToInactivity = () => {
      handleLogout();
      alert('🔒 ระบบได้นำคุณออกจากระบบโดยอัตโนมัติ เนื่องจากไม่มีการเคลื่อนไหวหรือใช้งานติดต่อกันเกิน 30 นาที เพื่อความปลอดภัยของข้อมูลพัสดุ');
    };

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(handleLogoutDueToInactivity, INACTIVITY_TIMEOUT);
    };

    // Set up activity event listeners
    const activityEvents = ['mousemove', 'keydown', 'mousedown', 'click', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Start initial timer
    resetTimer();

    // Cleanup listeners and timer on unmount or user change
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [currentUser]);

  const handleSetupComplete = () => {
    localStorage.setItem('assetwatch_demo_bypass', 'true');
    setIsSetupWizardNeeded(false);
    
    // Clear any previous active session so that changing database forces a secure login!
    setCurrentUser(null);
    localStorage.removeItem('assetwatch_session');
    localStorage.removeItem('assetwatch_operator');
  };

  const handleClearConfig = () => {
    localStorage.removeItem('assetwatch_demo_bypass');
    setIsSetupWizardNeeded(true);
    setCurrentTab('dashboard');
    
    // Clear active session when disconnecting database configuration
    setCurrentUser(null);
    localStorage.removeItem('assetwatch_session');
    localStorage.removeItem('assetwatch_operator');
  };

  // --- USER ACCESS & ROLE HANDLERS ---
  const handleCreateUser = async (user: UserAccount) => {
    await addOrUpdateUser(user);
    await fetchAllData();
  };

  const handleUpdateUser = async (id: string, updates: Partial<UserAccount>) => {
    const userToUpdate = users.find(u => u.id === id);
    if (userToUpdate) {
      const updatedUser = { ...userToUpdate, ...updates };
      await addOrUpdateUser(updatedUser);
      await fetchAllData();
      
      // If the updated user is the active user, sync session
      if (currentUser && currentUser.id === id) {
        setCurrentUser(updatedUser);
        localStorage.setItem('assetwatch_session', JSON.stringify(updatedUser));
      }
    }
  };

  const handleDeleteUser = async (id: string) => {
    await deleteUser(id);
    await fetchAllData();
  };

  // --- PM & CM MAINTENANCE HANDLERS ---
  const handleAddContract = async (contract: PMContract) => {
    await addPMContract(contract);
    await fetchAllData();
  };

  const handleUpdateContract = async (id: string, updates: Partial<PMContract>) => {
    await updatePMContract(id, updates);
    await fetchAllData();
  };

  const handleDeleteContract = async (id: string) => {
    await deletePMContract(id);
    await fetchAllData();
  };

  const handleAddPMSchedule = async (schedule: PMSchedule) => {
    await addPMSchedule(schedule);
    await fetchAllData();
  };

  const handleUpdatePMSchedule = async (id: string, updates: Partial<PMSchedule>) => {
    await updatePMSchedule(id, updates);
    await fetchAllData();
  };

  const handleUpdatePMNotification = async (id: string, updates: Partial<PMNotification>) => {
    await updatePMNotification(id, updates);
    await fetchAllData();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('assetwatch_session');
    setCurrentTab('dashboard');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    // Fetch the absolute latest users from Firestore/Database to ensure real-time password sync across devices!
    let latestUsers = users;
    try {
      latestUsers = await getUsers();
      setUsers(latestUsers);
    } catch (err) {
      console.error('Failed to sync users before login:', err);
    }

    const foundUser = latestUsers.find(u => u.username.toLowerCase() === loginUsername.trim().toLowerCase());
    if (!foundUser) {
      setLoginError('ไม่พบชื่อผู้ใช้งานนี้ในระบบ');
      return;
    }

    if (foundUser.password !== loginPassword) {
      setLoginError('รหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง');
      return;
    }

    if (foundUser.isBlocked) {
      setLoginError('🚫 บัญชีนี้ถูกระงับการใช้งานชั่วคราว กรุณาติดต่อผู้ดูแลระบบ');
      return;
    }

    // Success
    setCurrentUser(foundUser);
    localStorage.setItem('assetwatch_session', JSON.stringify(foundUser));
    localStorage.setItem('assetwatch_operator', foundUser.name);
    setLoginUsername('');
    setLoginPassword('');
  };

  const handleQuickLogin = (demoUsername: string) => {
    setLoginError(null);
    const foundUser = users.find(u => u.username === demoUsername);
    if (foundUser) {
      if (foundUser.isBlocked) {
        setLoginError('🚫 บัญชีนี้ถูกระงับการใช้งานชั่วคราว กรุณาติดต่อผู้ดูแลระบบ');
        return;
      }
      
      setCurrentUser(foundUser);
      localStorage.setItem('assetwatch_session', JSON.stringify(foundUser));
      localStorage.setItem('assetwatch_operator', foundUser.name);
      setLoginUsername('');
      setLoginPassword('');
    }
  };

  // --- DATABASE TRIGGER WRAPPERS ---
  const handleAddNewAsset = async (newAsset: Asset) => {
    await addAsset(newAsset);
    await fetchAllData();
  };

  const handleBulkAddAssets = async (newAssets: Asset[]) => {
    await addAssetsBulk(newAssets);
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

  // --- MODULE 8: DEPARTMENT CONFIG HANDLERS ---
  const handleCreateDepartment = async (name: string, locations: string[]) => {
    const newDept: DepartmentLocationConfig = {
      id: `dept-${Date.now()}`,
      name: name.trim(),
      locations: locations.map(l => l.trim()).filter(Boolean)
    };
    await addDepartment(newDept);
    await fetchAllData();
  };

  const handleUpdateDepartment = async (id: string, name: string, locations: string[]) => {
    await updateDepartment(id, {
      name: name.trim(),
      locations: locations.map(l => l.trim()).filter(Boolean)
    });
    await fetchAllData();
  };

  const handleDeleteDepartment = async (id: string) => {
    await deleteDepartment(id);
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
      const operatorName = currentUser?.name || 'แอดมินพัสดุ';
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
      {/* Login Screen Visual Overlay */}
      {!currentUser ? (
        <div className="login-overlay-container" data-theme={theme}>
          <div className="login-glass-card glass-panel animate-scale-up">
            
            <div className="login-logo-header">
              <div className="logo-symbol" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={26} color="#ffffff" className="logo-lock-icon" />
              </div>
              <h2>AssetWatch Login</h2>
              <p>ระบบควบคุมการเข้าถึงควบคุมสิทธิ์ทรัพย์สินทางราชการ</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="login-form-fields">
              
              <div className="form-group">
                <label className="form-label">👤 ชื่อผู้ใช้งาน (Username)</label>
                <select 
                  className="form-select monospace-input" 
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">-- เลือกชื่อผู้ใช้งาน (Select User) --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.username}>
                      {u.name} ({u.username}) — {u.role === 'admin' ? '👑 แอดมินสูงสุด' : `💼 ${u.department}`} {u.isBlocked ? '🚫 [ถูกระงับสิทธิ์]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginTop: '0.85rem' }}>
                <label className="form-label">🔑 รหัสผ่าน (Password)</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="ป้อนรหัสผ่าน..."
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              {loginError && (
                <div className="alert alert-danger animate-shake" style={{ marginTop: '1rem', padding: '0.75rem', fontSize: '0.85rem' }}>
                  <AlertCircle size={16} /> <span>{loginError}</span>
                </div>
              )}

              <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '1.25rem', height: '42px', fontSize: '0.95rem' }}>
                🚀 ลงชื่อเข้าใช้งานระบบ
              </button>

            </form>

            {/* Quick Demo Accounts Selector */}
            {!services.isConfigured && localStorage.getItem('assetwatch_hide_demo_bypass') !== 'true' && (
              <div className="quick-demo-accounts">
                <span className="demo-title">⚡ ปุ่มล็อคอินบัญชีทดสอบระดับสิทธิ์ (Demo Bypass)</span>
                <div className="demo-badges-grid">
                  <button className="demo-badge badge-admin" onClick={() => handleQuickLogin('admin')}>
                    👑 แอดมินสูงสุด (Admin)
                  </button>
                  <button className="demo-badge badge-manager" onClick={() => handleQuickLogin('manager')}>
                    💼 ผู้จัดการ (Manager)
                  </button>
                  <button className="demo-badge badge-it" onClick={() => handleQuickLogin('it_user')}>
                    💻 แผนก IT (Operator)
                  </button>
                  <button className="demo-badge badge-general" onClick={() => handleQuickLogin('admin_general')}>
                    💼 บริหารทั่วไป (Operator)
                  </button>
                  <button className="demo-badge badge-blocked" onClick={() => handleQuickLogin('blocked')} style={{ gridColumn: 'span 2' }}>
                    🚫 บัญชีโดนแบน (Blocked)
                  </button>
                </div>
              </div>
            )}

          </div>

          <style>{`
            .login-overlay-container {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              width: 100vw;
              background-color: var(--bg-primary);
              background-image: radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.04) 0%, transparent 40%),
                                radial-gradient(circle at 90% 80%, rgba(99, 102, 241, 0.04) 0%, transparent 40%);
              padding: 1.5rem;
            }

            .login-glass-card {
              max-width: 440px;
              width: 100%;
              padding: 2.5rem 2rem;
              display: flex;
              flex-direction: column;
              box-shadow: var(--glass-shadow);
              border: 1px solid var(--border);
            }

            .login-logo-header {
              text-align: center;
              margin-bottom: 1.75rem;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 0.5rem;
            }

            .login-logo-header h2 {
              font-size: 1.5rem;
              font-weight: 800;
              background: linear-gradient(120deg, var(--primary), var(--info));
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              margin: 0.25rem 0 0 0;
            }

            .login-logo-header p {
              font-size: 0.8rem;
              color: var(--text-muted);
              line-height: 1.35;
            }

            .logo-lock-icon {
              animation: lock-float 3s infinite alternate ease-in-out;
            }

            @keyframes lock-float {
              0% { transform: translateY(0); }
              100% { transform: translateY(-4px); }
            }

            .monospace-input {
              font-family: monospace;
              font-weight: 600;
            }

            .w-full {
              width: 100%;
            }

            .quick-demo-accounts {
              margin-top: 1.75rem;
              border-top: 1px dashed var(--border);
              padding-top: 1.25rem;
              display: flex;
              flex-direction: column;
              gap: 0.75rem;
            }

            .demo-title {
              font-size: 0.75rem;
              font-weight: 650;
              color: var(--text-muted);
              text-align: center;
            }

            .demo-badges-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 0.5rem;
            }

            .demo-badge {
              padding: 0.5rem 0.25rem;
              font-size: 0.725rem;
              font-weight: 650;
              border-radius: var(--radius-sm);
              border: 1px solid var(--border);
              background-color: var(--bg-secondary);
              color: var(--text-secondary);
              cursor: pointer;
              transition: all var(--transition-fast);
              text-align: center;
              height: auto;
            }

            .demo-badge:hover {
              transform: scale(1.02);
            }

            .badge-admin:hover {
              border-color: #6366f1;
              color: #6366f1;
              background-color: rgba(99, 102, 241, 0.05);
            }

            .badge-manager:hover {
              border-color: #8b5cf6;
              color: #8b5cf6;
              background-color: rgba(139, 92, 246, 0.05);
            }

            .badge-it:hover {
              border-color: var(--primary);
              color: var(--primary);
              background-color: rgba(59, 130, 246, 0.05);
            }

            .badge-general:hover {
              border-color: var(--cyan);
              color: var(--cyan);
              background-color: rgba(6, 182, 212, 0.05);
            }

            .badge-blocked:hover {
              border-color: var(--danger);
              color: var(--danger);
              background-color: rgba(239, 68, 68, 0.05);
            }

            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              20%, 60% { transform: translateX(-4px); }
              40%, 80% { transform: translateX(4px); }
            }

            .animate-shake {
              animation: shake 0.3s ease-in-out;
            }
          `}</style>
        </div>
      ) : (
        <>
          <Sidebar 
            currentTab={currentTab} 
            setCurrentTab={setCurrentTab} 
            theme={theme}
            setTheme={setTheme}
            isFirebaseConfigured={services.isConfigured}
            currentUser={currentUser}
            onLogout={handleLogout}
          />

          {/* Main Content Area */}
          <main className="main-content">
            
            {/* Top Bar for Desktop/Mobile Notifications */}
            <div className="top-header-bar glass-panel" style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              border: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Notification Bell */}
                <button 
                  onClick={() => setIsNotifDrawerOpen(!isNotifDrawerOpen)}
                  className="btn btn-ghost" 
                  style={{
                    position: 'relative',
                    padding: '0.4rem',
                    height: 'auto',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-primary)',
                    borderRadius: '50%'
                  }}
                  title="การแจ้งเตือนบำรุงรักษา"
                >
                  <Bell size={16} />
                  {pmNotifications.filter(n => !n.isRead).length > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: 'var(--danger)',
                      color: 'white',
                      fontSize: '9px',
                      fontWeight: 700,
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 0 2px var(--bg-secondary)'
                    }}>
                      {pmNotifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Drawer */}
                {isNotifDrawerOpen && (
                  <div className="notifications-dropdown-menu glass-panel" style={{
                    position: 'absolute',
                    top: '100%',
                    right: '0',
                    marginTop: '0.5rem',
                    width: '320px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    zIndex: 999,
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-lg)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.35rem' }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: 0 }}>🔔 การแจ้งเตือนบำรุงรักษา ({pmNotifications.filter(n => !n.isRead).length})</h4>
                      {pmNotifications.filter(n => !n.isRead).length > 0 && (
                        <button 
                          className="btn btn-ghost btn-xs" 
                          onClick={async () => {
                            for (const n of pmNotifications) {
                              if (!n.isRead) {
                                await handleUpdatePMNotification(n.id, { isRead: true });
                              }
                            }
                          }}
                          style={{ fontSize: '0.7rem', padding: '0 0.25rem' }}
                        >
                          อ่านทั้งหมด
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {pmNotifications.length === 0 ? (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                          ไม่มีแจ้งเตือนบำรุงรักษา
                        </div>
                      ) : (
                        pmNotifications.map(notif => (
                          <div 
                            key={notif.id} 
                            onClick={async () => {
                              if (!notif.isRead) {
                                await handleUpdatePMNotification(notif.id, { isRead: true });
                              }
                              setCurrentTab('module10_pm');
                              setIsNotifDrawerOpen(false);
                            }}
                            style={{
                              background: notif.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                              border: '1px solid var(--border)',
                              padding: '0.6rem 0.75rem',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem', fontWeight: 700 }}>
                              <span>{notif.title}</span>
                              {!notif.isRead && <span style={{ width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%' }}></span>}
                            </div>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.35 }}>{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

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
                currentUser={currentUser}
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
                currentUser={currentUser}
              />
            )}
            {currentTab === 'module3' && (
              <Module3_AddAsset 
                assets={assets}
                onAddAsset={handleAddNewAsset}
                onBulkAddAssets={handleBulkAddAssets}
                onLogAudit={handleLogAudit}
                prefilledAssetId={prefilledAssetId}
                clearPrefilledAssetId={() => setPrefilledAssetId(null)}
                setCurrentTab={setCurrentTab}
                departments={departments}
                currentUser={currentUser}
              />
            )}
            {currentTab === 'module4' && (
              <Module4_Dispose 
                assets={assets}
                audits={audits}
                onUpdateAssetStatus={handleUpdateAssetStatus}
                onLogAudit={handleLogAudit}
                currentUser={currentUser}
              />
            )}
            {currentTab === 'module5_transfer' && (
              <Module5_Transfer 
                assets={assets}
                audits={audits}
                onUpdateAssetTransfer={handleUpdateAssetTransfer}
                onLogAudit={handleLogAudit}
                departments={departments}
                currentUser={currentUser}
              />
            )}
            {currentTab === 'module10_pm' && (
              <Module10_Maintenance 
                assets={assets}
                repairs={repairs}
                contracts={contracts}
                schedules={schedules}
                notifications={pmNotifications}
                onAddContract={handleAddContract}
                onUpdateContract={handleUpdateContract}
                onDeleteContract={handleDeleteContract}
                onAddPMSchedule={handleAddPMSchedule}
                onUpdatePMSchedule={handleUpdatePMSchedule}
                onAddRepair={handleAddRepair}
                onUpdateAssetStatus={handleUpdateAssetStatus}
                onLogAudit={handleLogAudit}
                currentUser={currentUser}
                onRefreshData={fetchAllData}
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
                currentUser={currentUser}
              />
            )}
            {currentTab === 'module6' && (
              <Module6_AuditTrail audits={audits} />
            )}
            {currentTab === 'module7' && (
              <Module7_Settings 
                onClearConfig={handleClearConfig}
                onImportSuccess={fetchAllData}
                assets={assets}
                audits={audits}
                repairs={repairs}
                surveys={surveys}
                rounds={rounds}
                departments={departments}
                users={users}
                currentUser={currentUser}
              />
            )}
            {currentTab === 'module8' && currentUser?.role === 'admin' && (
              <Module8_Departments 
                departments={departments}
                onAddDept={handleCreateDepartment}
                onUpdateDept={handleUpdateDepartment}
                onDeleteDept={handleDeleteDepartment}
              />
            )}
            {currentTab === 'module9' && currentUser?.role === 'admin' && (
              <Module9_AccessControl 
                departments={departments}
                users={users}
                onAddUser={handleCreateUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
                currentUser={currentUser}
              />
            )}
          </main>
        </>
      )}

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
