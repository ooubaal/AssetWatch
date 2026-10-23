import { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import { Sidebar } from './components/Sidebar';
import { SetupWizard } from './components/SetupWizard';
import { Dashboard } from './components/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SearchableSelect } from './components/SearchableSelect';

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
  deleteAsset,
  addAuditTrail,
  addSurvey,
  addRepair,
  updateRepair,
  deleteRepair,
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
  deletePMSchedule,
  getPMNotifications,
  addPMNotification,
  updatePMNotification,
  deletePMNotification,
  fetchSpareParts,
  saveSparePart,
  deleteSparePart,
  syncAssetsWithSurveyPhotos,
  isDefaultPlaceholder,
  clearQuotaExceededState,
  checkAndNotifyQuotaError
} from './services/dbService';

// Module Components (Lazy loaded for lean initial bundle and fast load)
const Module1_Database = lazy(() => import('./modules/Module1_Database').then(m => ({ default: m.Module1_Database })));
const Module2_ScanSurvey = lazy(() => import('./modules/Module2_ScanSurvey').then(m => ({ default: m.Module2_ScanSurvey })));
const Module3_AddAsset = lazy(() => import('./modules/Module3_AddAsset').then(m => ({ default: m.Module3_AddAsset })));
const Module4_Dispose = lazy(() => import('./modules/Module4_Dispose').then(m => ({ default: m.Module4_Dispose })));
const Module5_Transfer = lazy(() => import('./modules/Module5_Transfer').then(m => ({ default: m.Module5_Transfer })));
const Module6_AuditTrail = lazy(() => import('./modules/Module6_AuditTrail').then(m => ({ default: m.Module6_AuditTrail })));
const Module7_Settings = lazy(() => import('./modules/Module7_Settings').then(m => ({ default: m.Module7_Settings })));
const Module8_Departments = lazy(() => import('./modules/Module8_Departments').then(m => ({ default: m.Module8_Departments })));
const Module9_AccessControl = lazy(() => import('./modules/Module9_AccessControl').then(m => ({ default: m.Module9_AccessControl })));
const Module10_Maintenance = lazy(() => import('./modules/Module10_Maintenance').then(m => ({ default: m.Module10_Maintenance })));
const Module11_QualityDocs = lazy(() => import('./modules/Module11_QualityDocs').then(m => ({ default: m.Module11_QualityDocs })));
const Module12_SpareParts = lazy(() => import('./modules/Module12_SpareParts').then(m => ({ default: m.Module12_SpareParts })));

const ModuleLoadingFallback = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '1rem', color: '#64748b' }}>
    <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>กำลังโหลดข้อมูลโมดูล...</span>
  </div>
);

import { Asset, AuditTrail, SurveyRecord, RepairCase, SurveyRound, DepartmentLocationConfig, UserAccount, INITIAL_USERS, PMContract, PMSchedule, PMNotification, SparePart } from './utils/mockData';
import { X, Camera, AlertCircle, AlertTriangle, Lock, Bell, MapPin, Building, Trash2, RotateCw, CheckCircle2 } from 'lucide-react';
import { uploadImage } from './services/dbService';

function App() {
  const [isSetupWizardNeeded, setIsSetupWizardNeeded] = useState(() => {
    // If Firebase config is stored, we bypass the setup wizard on initial load
    const services = getFirebaseServices();
    const demoBypass = localStorage.getItem('assetwatch_demo_bypass');
    return !services.isConfigured && demoBypass !== 'true';
  });

  const [currentTab, setCurrentTabState] = useState(() => {
    return localStorage.getItem('assetwatch_active_tab') || 'dashboard';
  });

  const setCurrentTab = (tab: string) => {
    setCurrentTabState(tab);
    localStorage.setItem('assetwatch_active_tab', tab);
  };
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
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
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

  // Locations pool for Edit Asset Modal
  const editLocationOptions = useMemo(() => {
    const locSet = new Set<string>();

    // 1. Current edit location (if any)
    if (editLocation && editLocation.trim()) {
      locSet.add(editLocation.trim());
    }

    // 2. Locations belonging to selected editDepartment first
    const currentDeptObj = departments.find(d => d.name.toLowerCase() === editDepartment.trim().toLowerCase());
    if (currentDeptObj && Array.isArray(currentDeptObj.locations)) {
      currentDeptObj.locations.forEach(loc => {
        if (loc && loc.trim()) locSet.add(loc.trim());
      });
    }

    // 3. Locations from other departments in Module 8
    departments.forEach(d => {
      if (Array.isArray(d.locations)) {
        d.locations.forEach(loc => {
          if (loc && loc.trim()) locSet.add(loc.trim());
        });
      }
    });

    // 4. Locations from existing assets in the same department
    assets.forEach(a => {
      if (a.department === editDepartment && a.location && a.location.trim()) {
        locSet.add(a.location.trim());
      }
    });

    // 5. All remaining locations from all assets
    assets.forEach(a => {
      if (a.location && a.location.trim()) {
        locSet.add(a.location.trim());
      }
    });

    return Array.from(locSet);
  }, [editDepartment, editLocation, departments, assets]);

  // Departments pool for Edit Asset Modal
  const editDepartmentOptions = useMemo(() => {
    const deptSet = new Set<string>();

    if (editDepartment && editDepartment.trim()) {
      deptSet.add(editDepartment.trim());
    }

    departments.forEach(d => {
      if (d.name && d.name.trim()) deptSet.add(d.name.trim());
    });

    assets.forEach(a => {
      if (a.department && a.department.trim()) deptSet.add(a.department.trim());
    });

    return Array.from(deptSet);
  }, [editDepartment, departments, assets]);

  // Sync theme attribute to HTML tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('assetwatch_theme', theme);
  }, [theme]);

  // Automated PM/CM alert check
  const checkAndGeneratePMNotifications = async (scheds: PMSchedule[], notifs: PMNotification[], contractsList: PMContract[]) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const warningLimit = new Date();
    warningLimit.setDate(warningLimit.getDate() + 7);
    const warningLimitStr = warningLimit.toISOString().split('T')[0];

    // 1. Check PM schedules
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

    // 2. Check PM contracts expiring in 3 months (90 days)
    const ninetyDaysLimit = new Date();
    ninetyDaysLimit.setDate(ninetyDaysLimit.getDate() + 90);
    const ninetyDaysLimitStr = ninetyDaysLimit.toISOString().split('T')[0];

    for (const c of contractsList) {
      if (c.endDate >= todayStr && c.endDate <= ninetyDaysLimitStr) {
        const exists = notifs.some(n => n.type === 'contract_expiring' && n.message.includes(c.contractNumber));
        if (!exists) {
          const newNotif: PMNotification = {
            id: `notif-${Date.now()}-${c.id}`,
            title: `⚠️ สัญญา PM ใกล้หมดอายุ (${c.contractNumber})`,
            message: `สัญญาบำรุงรักษาโครงการ "${c.title}" เลขที่ ${c.contractNumber} กำลังจะหมดอายุในวันที่ ${c.endDate} (กรุณาดำเนินการจัดทำสัญญาใหม่ล่วงหน้า 3 เดือน)`,
            targetDate: todayStr,
            isRead: false,
            type: 'contract_expiring',
            linkTo: 'module10_pm'
          };
          await addPMNotification(newNotif);
        }
      }
    }
  };

  // Automated PM/CM alert check (throttled to once every 10 minutes)
  const lastPMCheckRef = useRef<number>(0);
  const fetchAllDataPromiseRef = useRef<Promise<void> | null>(null);

  // Load data from Firestore/LocalStorage (Universal Delta Sync enabled)
  const fetchAllData = async (forcePMCheck = false, forceFull = false) => {
    if (fetchAllDataPromiseRef.current) {
      return fetchAllDataPromiseRef.current;
    }

    const fetchPromise = (async () => {
      try {
        const safeFetch = async <T,>(fn: () => Promise<T>, fallback: T): Promise<T> => {
          try {
            return await fn();
          } catch (err) {
            console.warn('Dataset fetch fallback to local:', err);
            return fallback;
          }
        };

        const [
          allAssets,
          allAudits,
          allRepairs,
          allSurveys,
          allRounds,
          allDepts,
          allUsers,
          allContracts,
          allSchedules,
          allPMNotifs,
          allSpareParts
        ] = await Promise.all([
          safeFetch(() => getAssets(forceFull), assets.length > 0 ? assets : []),
          safeFetch(getAuditTrails, audits),
          safeFetch(() => getRepairs(forceFull), repairs),
          safeFetch(() => getSurveys(forceFull), surveys),
          safeFetch(getSurveyRounds, rounds),
          safeFetch(getDepartments, departments),
          safeFetch(getUsers, users),
          safeFetch(getPMContracts, contracts),
          safeFetch(getPMSchedules, schedules),
          safeFetch(getPMNotifications, pmNotifications),
          safeFetch(() => fetchSpareParts(forceFull), spareParts)
        ]);

        // Auto-sync asset images with survey photos across all items
        const { syncedAssets } = await syncAssetsWithSurveyPhotos(allAssets, allSurveys);

        setAssets(syncedAssets);
        setAudits(allAudits);
        setRepairs(allRepairs);
        setSurveys(allSurveys);
        setRounds(allRounds);
        setDepartments(allDepts);
        setUsers(allUsers);
        setContracts(allContracts);
        setSchedules(allSchedules);
        setPmNotifications(allPMNotifs);
        setSpareParts(allSpareParts);

        // Automated check and notification generation (only on initial load or once every 10 mins)
        const now = Date.now();
        if (forcePMCheck || now - lastPMCheckRef.current > 10 * 60 * 1000) {
          lastPMCheckRef.current = now;
          await checkAndGeneratePMNotifications(allSchedules, allPMNotifs, allContracts);
          const updatedPMNotifs = await getPMNotifications();
          setPmNotifications(updatedPMNotifs);
        }

        const active = allRounds.find(r => r.status === 'active');
        setActiveRound(active || null);
      } catch (e) {
        console.error('Error fetching datasets:', e);
      } finally {
        fetchAllDataPromiseRef.current = null;
      }
    })();

    fetchAllDataPromiseRef.current = fetchPromise;
    return fetchPromise;
  };

  // Device-Specific Sync & Self-Healing Refresh Handler
  const [isDeviceRefreshing, setIsDeviceRefreshing] = useState(false);
  const [isInitialSyncing, setIsInitialSyncing] = useState(true);
  const [syncStatusSuccess, setSyncStatusSuccess] = useState(false);
  const [refreshToastMsg, setRefreshToastMsg] = useState<string | null>(null);
  const lastRefreshClickRef = useRef<number>(0);

  const handleDeviceRefresh = async (forceFull: boolean | React.MouseEvent = false) => {
    const isFull = typeof forceFull === 'boolean' ? forceFull : false;
    const now = Date.now();
    if (isDeviceRefreshing || now - lastRefreshClickRef.current < 4000) {
      return;
    }
    lastRefreshClickRef.current = now;

    setIsDeviceRefreshing(true);
    setSyncStatusSuccess(false);
    setRefreshToastMsg('กำลังดึงข้อมูลอัปเดตและซิงค์เฉพาะเครื่องนี้...');
    
    try {
      // 1. Clear any stuck temporary draft session
      try {
        sessionStorage.removeItem('assetwatch_draft_survey_id');
      } catch {}

      // 2. Pull delta snapshot from database
      await fetchAllData(true, isFull);

      setSyncStatusSuccess(true);
      const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setRefreshToastMsg(`✓ รีเฟรชและซิงค์ข้อมูลเครื่องนี้สำเร็จ (${timeStr} น.)`);
      setTimeout(() => {
        setIsDeviceRefreshing(false);
        setSyncStatusSuccess(false);
      }, 1200);
      setTimeout(() => {
        setRefreshToastMsg(null);
      }, 3500);
    } catch (err: any) {
      console.error('Device refresh error:', err);
      setIsDeviceRefreshing(false);
      setRefreshToastMsg('⚠️ ซิงค์ข้อมูลไม่สำเร็จ: ' + (err?.message || 'กรุณาลองใหม่อีกครั้ง'));
      setTimeout(() => {
        setRefreshToastMsg(null);
      }, 4000);
    }
  };

  useEffect(() => {
    if (!isSetupWizardNeeded) {
      setIsInitialSyncing(true);
      setSyncStatusSuccess(false);

      // On app mount, perform Smart Delta Sync (0 full reads if cache is already present)
      fetchAllData(true, false)
        .then(() => {
          setSyncStatusSuccess(true);
          setTimeout(() => {
            setIsInitialSyncing(false);
            setSyncStatusSuccess(false);
          }, 1200);
        })
        .catch(() => {
          setIsInitialSyncing(false);
        });
    }
  }, [isSetupWizardNeeded]);

  // --- CLOUD QUOTA EXCEEDED MONITORING & USER-FRIENDLY WARNING SYSTEM ---
  const [isQuotaExceeded, setIsQuotaExceeded] = useState<boolean>(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem('assetwatch_quota_exceeded') === 'true';
  });
  const [showQuotaModal, setShowQuotaModal] = useState<boolean>(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem('assetwatch_quota_exceeded') === 'true';
  });

  useEffect(() => {
    const handleQuotaExceeded = () => {
      setIsQuotaExceeded(true);
      setShowQuotaModal(true);
    };
    const handleQuotaResolved = () => {
      setIsQuotaExceeded(false);
      setShowQuotaModal(false);
    };

    window.addEventListener('assetwatch-quota-exceeded', handleQuotaExceeded);
    window.addEventListener('assetwatch-quota-resolved', handleQuotaResolved);

    return () => {
      window.removeEventListener('assetwatch-quota-exceeded', handleQuotaExceeded);
      window.removeEventListener('assetwatch-quota-resolved', handleQuotaResolved);
    };
  }, []);

  const handleRetryQuotaCheck = async () => {
    try {
      clearQuotaExceededState();
      await fetchAllData(true, false);
      setIsQuotaExceeded(false);
      setShowQuotaModal(false);
      setRefreshToastMsg('✓ ตรวจสอบการเชื่อมต่อสำเร็จ โควตาพร้อมใช้งานแล้ว');
      setTimeout(() => setRefreshToastMsg(null), 3000);
    } catch (err: any) {
      if (checkAndNotifyQuotaError(err, 'retryQuotaCheck')) {
        setIsQuotaExceeded(true);
        setShowQuotaModal(true);
      }
    }
  };

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

  // --- USER ACCESS & ROLE HANDLERS (Optimistic UI Updates) ---
  const handleCreateUser = async (user: UserAccount) => {
    await addOrUpdateUser(user);
    setUsers(prev => [...prev.filter(u => u.id !== user.id), user]);
  };

  const handleUpdateUser = async (id: string, updates: Partial<UserAccount>) => {
    const userToUpdate = users.find(u => u.id === id);
    if (userToUpdate) {
      const updatedUser = { ...userToUpdate, ...updates };
      await addOrUpdateUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      
      // If the updated user is the active user, sync session
      if (currentUser && currentUser.id === id) {
        setCurrentUser(updatedUser);
        localStorage.setItem('assetwatch_session', JSON.stringify(updatedUser));
      }
    }
  };

  const handleDeleteUser = async (id: string) => {
    await deleteUser(id);
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  // --- PM & CM MAINTENANCE HANDLERS (Optimistic UI Updates) ---
  const handleAddContract = async (contract: PMContract) => {
    await addPMContract(contract);
    setContracts(prev => [...prev.filter(c => c.id !== contract.id), contract]);
  };

  const handleUpdateContract = async (id: string, updates: Partial<PMContract>) => {
    await updatePMContract(id, updates);
    setContracts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleDeleteContract = async (id: string) => {
    // Delete all schedules under this contract
    const contractSchedules = schedules.filter(s => s.contractId === id);
    for (const s of contractSchedules) {
      await deletePMSchedule(s.id);
    }
    await deletePMContract(id);
    setContracts(prev => prev.filter(c => c.id !== id));
    setSchedules(prev => prev.filter(s => s.contractId !== id));
  };

  const handleAddPMSchedule = async (schedule: PMSchedule) => {
    await addPMSchedule(schedule);
    setSchedules(prev => [...prev.filter(s => s.id !== schedule.id), schedule]);
  };

  const handleUpdatePMSchedule = async (id: string, updates: Partial<PMSchedule>) => {
    await updatePMSchedule(id, updates);
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleDeletePMSchedule = async (id: string) => {
    await deletePMSchedule(id);
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  const handleUpdatePMNotification = async (id: string, updates: Partial<PMNotification>) => {
    await updatePMNotification(id, updates);
    setPmNotifications(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const handleAddSparePart = async (part: SparePart) => {
    await saveSparePart(part);
    setSpareParts(prev => [...prev.filter(p => p.id !== part.id), part]);
  };

  const handleUpdateSparePart = async (part: SparePart) => {
    await saveSparePart(part);
    setSpareParts(prev => prev.map(p => p.id === part.id ? part : p));
  };

  const handleDeleteSparePart = async (id: string) => {
    await deleteSparePart(id);
    setSpareParts(prev => prev.filter(p => p.id !== id));
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

  // --- DATABASE TRIGGER WRAPPERS (Optimistic UI Updates - 0 Cloud Reads) ---
  const handleAddNewAsset = async (newAsset: Asset) => {
    await addAsset(newAsset);
    setAssets(prev => [newAsset, ...prev.filter(a => a.id !== newAsset.id)]);
  };

  const handleBulkAddAssets = async (newAssets: Asset[]) => {
    await addAssetsBulk(newAssets);
    const newIds = new Set(newAssets.map(a => a.id));
    setAssets(prev => [...newAssets, ...prev.filter(a => !newIds.has(a.id))]);
  };

  const handleUpdateAssetStatus = async (id: string, status: Asset['status'], updates?: Partial<Asset>) => {
    await updateAsset(id, { status, ...updates });
    setAssets(prev => prev.map(a => a.id === id ? { ...a, status, ...updates } : a));
  };

  const handleUpdateAssetTransfer = async (id: string, transferData: { location: string; department: string; responsiblePerson: string }) => {
    await updateAsset(id, transferData);
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...transferData } : a));
  };

  const handleLogAudit = async (trail: Omit<AuditTrail, 'id' | 'timestamp'>) => {
    const newTrail: AuditTrail = {
      ...trail,
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    await addAuditTrail(newTrail);
    setAudits(prev => [newTrail, ...prev]);
  };

  const handleAddSurvey = async (survey: Omit<SurveyRecord, 'id'>) => {
    const surveyWithId: SurveyRecord = {
      ...survey,
      id: `survey-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    };
    await addSurvey(surveyWithId);
    
    // 1. Optimistically update local surveys state immediately (0 cloud reads)
    const nextSurveys = [surveyWithId, ...surveys.filter(s => s.id !== surveyWithId.id)];
    setSurveys(nextSurveys);

    // If a photo was attached, optimistically update the asset's image immediately
    if (survey.imageUrl && survey.imageUrl.trim() && !isDefaultPlaceholder(survey.imageUrl)) {
      const newImg = survey.imageUrl;
      setAssets(prev => prev.map(a => a.id === survey.assetId ? { ...a, imageUrl: newImg } : a));
    }

    // 2. Dynamically calculate and update active round stats in DB and in local state (0 cloud reads)
    if (activeRound) {
      const activeSurveys = nextSurveys.filter(s => s.roundId === activeRound.id);
      
      const total = assets.length;
      const completed = activeSurveys.length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      const breakdown = {
        'ใช้งานได้': 0,
        'ชำรุด': 0,
        'รอจำหน่าย': 0,
        'ขอป้ายรหัสใหม่': 0,
        'รอโอน': 0,
        'อื่นๆ': 0
      };
      
      activeSurveys.forEach(s => {
        const status = s.status as keyof typeof breakdown;
        if (breakdown[status] !== undefined) {
          breakdown[status]++;
        } else {
          breakdown['อื่นๆ']++;
        }
      });
      
      const roundUpdates = {
        surveyedAssets: completed,
        completionRate: rate,
        statusBreakdown: breakdown
      };

      await updateSurveyRound(activeRound.id, roundUpdates);

      setActiveRound(prev => prev ? { ...prev, ...roundUpdates } : null);
      setRounds(prev => prev.map(r => r.id === activeRound.id ? { ...r, ...roundUpdates } : r));
    }
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
    setRounds(prev => [newRound, ...prev]);
    setActiveRound(newRound);
  };

  const handleCloseActiveRound = async (operator: string) => {
    if (!activeRound) return;

    const latestSurveys = surveys;
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
    
    const updatedRound = { ...activeRound, ...closedRoundUpdates } as SurveyRound;
    setRounds(prev => prev.map(r => r.id === activeRound.id ? updatedRound : r));
    setActiveRound(null);

    await handleLogAudit({
      assetId: 'SYSTEM',
      assetName: `รอบการสำรวจ: ${activeRound.name}`,
      action: 'survey',
      operator: operator || 'แอดมินพัสดุ',
      details: `ปิดรอบการสำรวจประจำปีสำเร็จ อัตราการตรวจสอบ ${rate}% (ตรวจสอบแล้ว ${surveyedCount}/${totalAssetsCount} รายการ)`,
    });
  };

  const handleDepartmentSignoff = async (department: string, operatorName: string) => {
    if (!activeRound) return;
    const latestSurveys = surveys;
    const deptAssets = assets.filter(a => a.department === department);
    const deptSurveys = latestSurveys.filter(s => {
      if (s.roundId !== activeRound.id) return false;
      const asset = assets.find(a => a.id === s.assetId);
      return asset?.department === department;
    });

    const existingSignoffs = activeRound.departmentSignoffs || {};
    const updatedSignoffs = {
      ...existingSignoffs,
      [department]: {
        department,
        signedBy: operatorName,
        signedAt: new Date().toISOString(),
        status: 'signed' as const,
        surveyedAssets: deptSurveys.length,
        totalAssets: deptAssets.length
      }
    };

    const roundUpdates = {
      departmentSignoffs: updatedSignoffs
    };

    await updateSurveyRound(activeRound.id, roundUpdates);

    setActiveRound(prev => prev ? { ...prev, ...roundUpdates } : null);
    setRounds(prev => prev.map(r => r.id === activeRound.id ? { ...r, ...roundUpdates } : r));

    await handleLogAudit({
      assetId: 'SYSTEM',
      assetName: `รอบการสำรวจ: ${activeRound.name}`,
      action: 'survey',
      operator: operatorName,
      details: `หัวหน้าฝ่าย/หน่วยงาน ${department} ยืนยันปิดรอบระดับฝ่ายเรียบร้อยแล้ว (${deptSurveys.length}/${deptAssets.length} ชิ้น)`,
    });
  };

  const handleReopenSurveyRound = async (roundId: string, operatorName: string, reason?: string) => {
    const targetRound = rounds.find(r => r.id === roundId);
    if (!targetRound) return;

    const existingHistory = targetRound.reopenHistory || [];
    const updatedHistory = [
      ...existingHistory,
      {
        reopenedBy: operatorName,
        reopenedAt: new Date().toISOString(),
        reason: reason || 'ดึงรอบกลับมาแก้ไขตรวจนับเพิ่ม'
      }
    ];

    const roundUpdates: Partial<SurveyRound> = {
      status: 'active',
      dateClosed: undefined,
      reopenHistory: updatedHistory
    };

    await updateSurveyRound(roundId, roundUpdates);

    setRounds(prev => prev.map(r => r.id === roundId ? { ...r, ...roundUpdates } : r));
    const reopenedRound = { ...targetRound, ...roundUpdates };
    setActiveRound(reopenedRound as SurveyRound);

    await handleLogAudit({
      assetId: 'SYSTEM',
      assetName: `รอบการสำรวจ: ${targetRound.name}`,
      action: 'survey',
      operator: operatorName,
      details: `ผู้บริหาร/แอดมินดึงรอบการสำรวจกลับมาแก้ไขตรวจนับเพิ่ม (เหตุผล: ${reason || 'ดึงรอบกลับมาแก้ไข'})`,
    });
  };

  // --- MODULE 8: DEPARTMENT CONFIG HANDLERS (Optimistic UI Updates) ---
  const handleCreateDepartment = async (name: string, locations: string[], createdBy?: string) => {
    const newDept: DepartmentLocationConfig = {
      id: `dept-${Date.now()}`,
      name: name.trim(),
      locations: locations.map(l => l.trim()).filter(Boolean),
      createdBy: createdBy || currentUser?.username || currentUser?.name || 'admin',
      createdAt: new Date().toISOString(),
      locationCreators: {}
    };
    await addDepartment(newDept);
    setDepartments(prev => [...prev.filter(d => d.id !== newDept.id), newDept]);
  };

  const handleUpdateDepartment = async (id: string, name: string, locations: string[], locationCreators?: Record<string, string>) => {
    const updates: Partial<DepartmentLocationConfig> = {
      name: name.trim(),
      locations: locations.map(l => l.trim()).filter(Boolean)
    };
    if (locationCreators !== undefined) {
      updates.locationCreators = locationCreators;
    }
    await updateDepartment(id, updates);
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const handleDeleteDepartment = async (id: string) => {
    await deleteDepartment(id);
    setDepartments(prev => prev.filter(d => d.id !== id));
  };

  const handleAddRepair = async (repair: Omit<RepairCase, 'id'>) => {
    const id = await addRepair(repair);
    const newRepair: RepairCase = { ...repair, id };
    setRepairs(prev => [newRepair, ...prev.filter(r => r.id !== id)]);
    return id;
  };

  const handleUpdateRepair = async (id: string, updates: Partial<RepairCase>) => {
    await updateRepair(id, updates);
    setRepairs(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const handleDeleteRepair = async (id: string) => {
    await deleteRepair(id);
    setRepairs(prev => prev.filter(r => r.id !== id));
  };

  // --- MODULE 6: EDIT ASSET LIFECYCLE ---
  const isAllowedToDeleteImage = (targetAsset: Asset | null): boolean => {
    if (!targetAsset || !currentUser) return false;
    if (currentUser.role === 'admin' || currentUser.role === 'manager') {
      return true;
    }
    if (currentUser.role === 'head') {
      return Boolean(
        targetAsset.department && 
        currentUser.department && 
        targetAsset.department.trim().toLowerCase() === currentUser.department.trim().toLowerCase()
      );
    }
    if (currentUser.role === 'user' || currentUser.role === 'operator') {
      return Boolean(
        targetAsset.createdBy && (
          targetAsset.createdBy === currentUser.username ||
          targetAsset.createdBy === currentUser.name ||
          targetAsset.createdBy === currentUser.id
        )
      );
    }
    return false;
  };

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
        if (!finalUrl && editingAsset.imageUrl) {
          changes.imageUrl = { old: '[รูปภาพเดิม]', new: '[ลบรูปภาพแล้ว]' };
        } else if (finalUrl && !editingAsset.imageUrl) {
          changes.imageUrl = { old: '[ไม่มีรูป]', new: '[อัปโหลดรูปภาพใหม่]' };
        } else {
          changes.imageUrl = { old: '[รูปถ่ายเดิม]', new: '[รูปถ่ายใหม่]' };
        }
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

      // Optimistic local update (0 Cloud Reads)
      const updatedAsset: Asset = {
        ...editingAsset,
        name: editName.trim(),
        location: editLocation.trim(),
        department: editDepartment.trim(),
        responsiblePerson: editResponsible.trim(),
        status: editStatus,
        note: editNote.trim(),
        imageUrl: finalUrl,
        updatedAt: new Date().toISOString()
      };
      setAssets(prev => prev.map(a => a.id === editingAsset.id ? updatedAsset : a));
      setEditingAsset(null);
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถอัปเดตข้อมูลครุภัณฑ์ได้');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    // RBAC Permission Validation:
    // 1. Admin or Manager: Full Org-wide
    // 2. Head: Own Department only
    // 3. User / Operator: Own created only
    const isAdminOrManager = currentUser?.role === 'admin' || currentUser?.role === 'manager';
    const isHead = currentUser?.role === 'head' && asset.department?.trim().toLowerCase() === currentUser?.department?.trim().toLowerCase();
    const isUserOwner = (currentUser?.role === 'user' || currentUser?.role === 'operator') && 
      Boolean(asset.createdBy && (
        asset.createdBy === currentUser.username || 
        asset.createdBy === currentUser.name || 
        asset.createdBy === currentUser.id
      ));

    if (!isAdminOrManager && !isHead && !isUserOwner) {
      alert('คุณไม่มีสิทธิ์ในการลบครุภัณฑ์ชิ้นนี้');
      return;
    }

    try {
      await deleteAsset(assetId);
      await handleLogAudit({
        assetId: asset.id,
        assetName: asset.name,
        action: 'dispose',
        operator: currentUser?.name || 'ผู้ดูแลระบบ',
        details: `ลบข้อมูลครุภัณฑ์ถาวรออกจากระบบ (รหัส: ${asset.id}) โดย ${currentUser?.name || 'ผู้ใช้งาน'}`
      });
      // Optimistic local update (0 Cloud Reads)
      setAssets(prev => prev.filter(a => a.id !== assetId));
    } catch (err) {
      console.error('Failed to delete asset:', err);
      alert('ไม่สามารถลบข้อมูลครุภัณฑ์ได้');
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
              <h2>AMIS Login</h2>
              <p>ระบบควบคุมสิทธิ์และจัดการครุภัณฑ์ภาครัฐ (Asset Management Information System)</p>
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
                      {u.name} ({u.username}) — {u.role === 'admin' ? '👑 แอดมินสูงสุด' : u.role === 'manager' ? '💼 ผู้บริหาร' : u.role === 'head' ? `👔 หัวหน้า (${u.department})` : `🔧 ปฏิบัติงาน (${u.department})`} {u.isBlocked ? '🚫 [ถูกระงับสิทธิ์]' : ''}
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
            onRefreshDevice={handleDeviceRefresh}
            isRefreshing={isDeviceRefreshing}
          />

          {/* Main Content Area */}
          <main className="main-content">
            
            {/* Top Bar for Desktop/Mobile Notifications & Device Sync */}
            <div className="top-header-bar glass-panel" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              border: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              position: 'relative'
            }}>
              {/* Left Side: Status Info or Refresh Toast */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                {refreshToastMsg ? (
                  <span className="animate-fade-in" style={{ 
                    color: refreshToastMsg.startsWith('✓') ? 'var(--success)' : 'var(--primary)', 
                    fontWeight: 650, 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '5px' 
                  }}>
                    {refreshToastMsg.startsWith('✓') && <CheckCircle2 size={16} color="var(--success)" />}
                    {refreshToastMsg}
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: services.isConfigured ? 'var(--success)' : 'var(--warning)', display: 'inline-block' }}></span>
                    {services.isConfigured ? 'เชื่อมต่อ Cloud ส่วนกลางแบบเรียลไทม์' : 'โหมดทดสอบออฟไลน์ (Local Cache)'}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* 🔄 Device-Specific Sync & Refresh Button */}
                <button 
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleDeviceRefresh}
                  disabled={isDeviceRefreshing}
                  title="รีเฟรชและซิงค์ข้อมูลเครื่องนี้กับระบบกลาง"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.8rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-primary)',
                    color: 'var(--primary)',
                    cursor: isDeviceRefreshing ? 'wait' : 'pointer'
                  }}
                >
                  <RotateCw size={14} className={isDeviceRefreshing ? 'animate-spin' : ''} />
                  <span>{isDeviceRefreshing ? 'กำลังซิงค์...' : '🔄 ซิงค์เครื่องนี้'}</span>
                </button>

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

            {/* ⚠️ Persistent Quota Exceeded Header Banner */}
            {isQuotaExceeded && (
              <div className="animate-fade-in" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                borderRadius: 'var(--radius-md)',
                background: '#fef2f2',
                border: '1.5px solid #f87171',
                color: '#991b1b',
                fontSize: '0.85rem',
                boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 650 }}>
                  <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
                  <span>⚠️ ระบบคลาวด์ติด Limit โควตาประจำวันชั่วคราว — ข้อมูลจะทำงานในโหมดออฟไลน์ กรุณาพักการสแกน/บันทึกไว้ก่อน</span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowQuotaModal(true)}
                  style={{
                    flexShrink: 0,
                    padding: '0.3rem 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    borderRadius: '6px',
                    background: '#ffffff',
                    color: '#dc2626',
                    borderColor: '#fca5a5',
                    cursor: 'pointer'
                  }}
                >
                  ดูคำแนะนำ ℹ️
                </button>
              </div>
            )}

            <ErrorBoundary fallbackTitle="เกิดข้อผิดพลาดในการแสดงผลหน้านี้">
              <Suspense fallback={<ModuleLoadingFallback />}>
                {currentTab === 'dashboard' && (
                <Dashboard 
                  assets={assets} 
                  repairs={repairs} 
                  surveys={surveys}
                  setCurrentTab={setCurrentTab}
                  currentUser={currentUser}
                />
              )}
            {currentTab === 'module1' && (
              <Module1_Database 
                assets={assets}
                audits={audits}
                repairs={repairs}
                surveys={surveys}
                schedules={schedules}
                onAssetEdit={handleStartEditAsset}
                onAssetDelete={handleDeleteAsset}
                currentUser={currentUser}
                onRefreshData={fetchAllData}
                spareParts={spareParts}
                onAddSparePart={handleAddSparePart}
                onUpdateSparePart={handleUpdateSparePart}
                onDeleteSparePart={handleDeleteSparePart}
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
                onDepartmentSignoff={handleDepartmentSignoff}
                onReopenSurveyRound={handleReopenSurveyRound}
                currentUser={currentUser}
                onRefreshDevice={handleDeviceRefresh}
                isRefreshing={isDeviceRefreshing || isInitialSyncing}
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
                onDeletePMSchedule={handleDeletePMSchedule}
                onAddRepair={handleAddRepair}
                onUpdateRepair={handleUpdateRepair}
                onDeleteRepair={handleDeleteRepair}
                onUpdateAssetStatus={handleUpdateAssetStatus}
                onLogAudit={handleLogAudit}
                currentUser={currentUser}
                onRefreshData={fetchAllData}
              />
            )}
            {currentTab === 'module11_quality' && (
              <Module11_QualityDocs 
                assets={assets}
                contracts={contracts}
                currentUser={currentUser}
              />
            )}
            {currentTab === 'module12_spareparts' && (
              <Module12_SpareParts 
                assets={assets}
                spareParts={spareParts}
                onAddSparePart={handleAddSparePart}
                onUpdateSparePart={handleUpdateSparePart}
                onDeleteSparePart={handleDeleteSparePart}
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
            {currentTab === 'module8' && (
              <Module8_Departments 
                departments={departments}
                onAddDept={handleCreateDepartment}
                onUpdateDept={handleUpdateDepartment}
                onDeleteDept={handleDeleteDepartment}
                currentUser={currentUser}
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
              </Suspense>
            </ErrorBoundary>
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
                  <SearchableSelect
                    options={editLocationOptions}
                    value={editLocation}
                    onChange={(val) => setEditLocation(val)}
                    placeholder="พิมพ์ค้นหา หรือเลือกห้อง/ที่ตั้ง..."
                    allowCustom={true}
                    icon={<MapPin size={15} color="var(--primary)" />}
                    required
                  />
                </div>

                <div className="form-group flex-1">
                  <label className="form-label">🏢 ฝ่าย/หน่วยงานผู้ดูแลพัสดุ</label>
                  <SearchableSelect
                    options={editDepartmentOptions}
                    value={editDepartment}
                    onChange={(val) => setEditDepartment(val)}
                    placeholder="พิมพ์ค้นหา หรือเลือกฝ่าย..."
                    allowCustom={true}
                    icon={<Building size={15} color="var(--primary)" />}
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
                <label className="form-label">📝 โน้ตบันทึกข้อมูล / ชื่อเล่นเครื่องมือ (Note / Equipment Nickname)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="เช่น เครื่องเป่าอัด 1, ตู้นึ่ง AR-2, ปั๊มหลักตึก 5..."
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                />
              </div>

              {/* Photo uploader inside editing drawer */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>📷 ถ่ายภาพ/อัปเดตรูปภาพเครื่องใหม่</label>
                  {editImagePreview && isAllowedToDeleteImage(editingAsset) && (
                    <button
                      type="button"
                      className="btn btn-danger btn-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditImagePreview('');
                        setEditImageFile(null);
                      }}
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      title="นำรูปภาพนี้ออก (ลบรูป)"
                    >
                      <Trash2 size={11} /> นำรูปภาพออก
                    </button>
                  )}
                </div>
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
                      <div className="preview-image-box" style={{ maxHeight: '120px', maxWidth: '160px' }}>
                        <img src={editImagePreview} alt="editing asset preview" />
                        <span className="preview-indicator"><Camera size={10} /> กดถ่าย/เปลี่ยนรูปใหม่</span>
                      </div>
                    ) : (
                      <>
                        <Camera size={18} color="var(--text-muted)" />
                        <span>กดถ่าย หรือเลือกไฟล์รูปภาพครุภัณฑ์</span>
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

      {/* Global Syncing Popup Alert Modal */}
      {(isInitialSyncing || isDeviceRefreshing) && (
        <div className="global-sync-popup-backdrop animate-fade-in">
          <div className={`global-sync-popup-card ${syncStatusSuccess ? 'sync-success-state' : ''}`}>
            <div className="sync-popup-icon-bubble">
              {syncStatusSuccess ? (
                <CheckCircle2 size={24} color="#10b981" />
              ) : (
                <RotateCw size={24} className="animate-spin text-primary" />
              )}
            </div>
            <div className="sync-popup-text">
              <h4>{syncStatusSuccess ? '✓ ซิงค์ข้อมูลล่าสุดสำเร็จ!' : 'กำลังซิงค์ข้อมูลกับระบบคลาวด์...'}</h4>
              <p>
                {syncStatusSuccess 
                  ? 'ข้อมูลครุภัณฑ์และผลการสำรวจล่าสุดพร้อมใช้งานแล้ว' 
                  : 'ระบบกำลังดึงข้อมูลและอัปเดตความก้าวหน้าล่าสุด โปรดรอสักครู่'}
              </p>
              {!syncStatusSuccess && (
                <div className="sync-popup-progress-track">
                  <div className="sync-popup-progress-bar"></div>
                </div>
              )}
            </div>
            {!syncStatusSuccess && (
              <button 
                type="button" 
                className="btn-sync-dismiss"
                onClick={() => {
                  setIsInitialSyncing(false);
                  setIsDeviceRefreshing(false);
                }}
                title="ปิดการแจ้งเตือน"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* ⚠️ Daily Quota Exceeded Friendly Modal Alert */}
      {showQuotaModal && (
        <div className="modal-backdrop animate-fade-in" style={{ zIndex: 100000, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="modal-card animate-fade-in" style={{ maxWidth: '540px', width: '100%', borderRadius: '16px', border: '1.5px solid #ef4444', background: 'var(--bg-primary)', padding: '0', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.35)' }}>
            
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', padding: '1.25rem 1.5rem', color: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={28} color="#ffffff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
                    ระบบใช้งานเกินโควตาประจำวันชั่วคราว
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: '0.82rem', opacity: 0.9 }}>
                    (Cloud Database Daily Quota Reached)
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
              
              <div style={{ padding: '0.75rem 1rem', background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: '10px', color: '#065f46' }}>
                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <CheckCircle2 size={16} color="#059669" />
                  <span>ข้อมูลของคุณยังคงปลอดภัย (ไม่สูญหาย)</span>
                </div>
                <div style={{ fontSize: '0.82rem' }}>
                  รายการที่คุณบันทึกไปก่อนหน้านี้ ได้ถูกจัดเก็บไว้ในเครื่องนี้ (Local Cache) เรียบร้อยแล้ว
                </div>
              </div>

              <div>
                <p style={{ margin: '0 0 0.5rem', fontWeight: 650, color: 'var(--text-main)' }}>
                  🛑 สิ่งที่ผู้ใช้งานควรปฏิบัติในขณะนี้:
                </p>
                <ol style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.875rem' }}>
                  <li>
                    <strong>ขอให้หยุดการสแกนหรือบันทึกข้อมูลเพิ่มเติมชั่วคราว</strong> เพื่อป้องกันไม่ให้ข้อมูลค้างอยู่ในเครื่องเพียงเครื่องเดียว
                  </li>
                  <li>
                    <strong>รอระบบเติมโควตารอบใหม่</strong>: ระบบ Cloud จะรีเซ็ตโควตาอัตโนมัติทุกวันเวลา <strong>14:00 น.</strong> หรือ <strong>เที่ยงคืน</strong>
                  </li>
                  <li>
                    <strong>กรณีงานเร่งด่วน</strong>: กรุณาแจ้งผู้ดูแลระบบ (Admin) เพื่อทำการขยายขนาดโควตา Cloud (Blaze Plan)
                  </li>
                </ol>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                💡 <em>หมายเหตุ: เมื่อโควตากลับมาเติมแล้ว คุณสามารถกดปุ่ม "🔄 ซิงค์เครื่องนี้" เพื่อส่งข้อมูลขึ้นระบบกลางได้ตามปกติทันที</em>
              </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ padding: '1rem 1.5rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleRetryQuotaCheck}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <RotateCw size={14} />
                <span>ทดสอบเชื่อมต่อใหม่</span>
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setShowQuotaModal(false)}
                style={{ background: '#dc2626', borderColor: '#b91c1c', color: '#fff', fontWeight: 600, padding: '0.5rem 1.25rem' }}
              >
                รับทราบ และพักการใช้งานชั่วคราว
              </button>
            </div>

          </div>
        </div>
      )}

      <style>{`
        .global-sync-popup-backdrop {
          position: fixed;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 92%;
          max-width: 440px;
          pointer-events: auto;
          animation: slide-down-popup 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slide-down-popup {
          from { opacity: 0; transform: translate(-50%, -15px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }

        .global-sync-popup-card {
          width: 100%;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(12px);
          border: 1.5px solid rgba(59, 130, 246, 0.45);
          border-radius: var(--radius-lg, 16px);
          padding: 0.85rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.85rem;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.65), 0 0 20px rgba(59, 130, 246, 0.25);
          color: #ffffff;
          position: relative;
          transition: all 0.3s ease;
        }

        .global-sync-popup-card.sync-success-state {
          border-color: rgba(16, 185, 129, 0.6);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.65), 0 0 20px rgba(16, 185, 129, 0.3);
        }

        .sync-popup-icon-bubble {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sync-success-state .sync-popup-icon-bubble {
          background: rgba(16, 185, 129, 0.2);
        }

        .sync-popup-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .sync-popup-text h4 {
          margin: 0;
          font-size: 0.875rem;
          font-weight: 700;
          color: #ffffff;
        }

        .sync-popup-text p {
          margin: 0;
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.75);
          line-height: 1.35;
        }

        .sync-popup-progress-track {
          width: 100%;
          height: 3px;
          background: rgba(255, 255, 255, 0.12);
          border-radius: 2px;
          overflow: hidden;
          margin-top: 0.35rem;
        }

        .sync-popup-progress-bar {
          width: 45%;
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #38bdf8);
          border-radius: inherit;
          animation: sync-indeterminate 1.3s infinite ease-in-out;
        }

        @keyframes sync-indeterminate {
          0% { transform: translateX(-100%); width: 30%; }
          50% { width: 60%; }
          100% { transform: translateX(300%); width: 30%; }
        }

        .btn-sync-dismiss {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.9rem;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          line-height: 1;
        }

        .btn-sync-dismiss:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>

    </div>
  );
}

export default App;
