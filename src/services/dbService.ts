import { getFirebaseServices } from '../firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  addDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Asset, AuditTrail, SurveyRecord, RepairCase, INITIAL_ASSETS, INITIAL_AUDITS, INITIAL_REPAIRS } from '../utils/mockData';

// Helper to check if we are using Firebase
const getServices = () => {
  const services = getFirebaseServices();
  // We double check if we have a valid projectId and db to avoid errors
  if (services.isConfigured && services.db) {
    return { isFirebase: true, db: services.db, storage: services.storage };
  }
  return { isFirebase: false, db: null, storage: null };
};

// --- INITIALIZE LOCAL STORAGE MOCK DATA IF EMPTY ---
const initLocalStorageIfNeeded = () => {
  if (!localStorage.getItem('assetwatch_assets')) {
    localStorage.setItem('assetwatch_assets', JSON.stringify(INITIAL_ASSETS));
  }
  if (!localStorage.getItem('assetwatch_audits')) {
    localStorage.setItem('assetwatch_audits', JSON.stringify(INITIAL_AUDITS));
  }
  if (!localStorage.getItem('assetwatch_repairs')) {
    localStorage.setItem('assetwatch_repairs', JSON.stringify(INITIAL_REPAIRS));
  }
  if (!localStorage.getItem('assetwatch_surveys')) {
    localStorage.setItem('assetwatch_surveys', JSON.stringify([]));
  }
};
initLocalStorageIfNeeded();

// --- IMAGE UPLOAD HELPER ---
export const uploadImage = async (file: File, path: string = 'assets'): Promise<string> => {
  const { isFirebase, storage } = getServices();
  
  if (isFirebase && storage) {
    try {
      const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      return url;
    } catch (e) {
      console.error('Firebase Storage upload failed, falling back to base64:', e);
    }
  }

  // Fallback: Convert to Base64 for localStorage or demo mode
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// --- ASSET SERVICES ---
export const getAssets = async (): Promise<Asset[]> => {
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      const q = query(collection(db, 'assets'));
      const snapshot = await getDocs(q);
      const list: Asset[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Asset);
      });
      return list;
    } catch (e) {
      console.error('Firebase getAssets failed, falling back to localStorage:', e);
    }
  }

  // LocalStorage Fallback
  initLocalStorageIfNeeded();
  return JSON.parse(localStorage.getItem('assetwatch_assets') || '[]');
};

export const getAsset = async (id: string): Promise<Asset | null> => {
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      const docRef = doc(db, 'assets', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Asset;
      }
      return null;
    } catch (e) {
      console.error('Firebase getAsset failed, falling back to localStorage:', e);
    }
  }

  // LocalStorage Fallback
  initLocalStorageIfNeeded();
  const assets: Asset[] = JSON.parse(localStorage.getItem('assetwatch_assets') || '[]');
  return assets.find(a => a.id === id) || null;
};

export const addAsset = async (asset: Asset): Promise<void> => {
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      const docRef = doc(db, 'assets', asset.id);
      await setDoc(docRef, asset);
      return;
    } catch (e) {
      console.error('Firebase addAsset failed, falling back to localStorage:', e);
    }
  }

  // LocalStorage Fallback
  initLocalStorageIfNeeded();
  const assets: Asset[] = JSON.parse(localStorage.getItem('assetwatch_assets') || '[]');
  // Check if exists
  if (assets.some(a => a.id === asset.id)) {
    throw new Error('รหัสครุภัณฑ์นี้มีอยู่แล้วในระบบ');
  }
  assets.push(asset);
  localStorage.setItem('assetwatch_assets', JSON.stringify(assets));
};

export const updateAsset = async (id: string, updates: Partial<Asset>): Promise<void> => {
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      const docRef = doc(db, 'assets', id);
      await updateDoc(docRef, updates as any);
      return;
    } catch (e) {
      console.error('Firebase updateAsset failed, falling back to localStorage:', e);
    }
  }

  // LocalStorage Fallback
  initLocalStorageIfNeeded();
  const assets: Asset[] = JSON.parse(localStorage.getItem('assetwatch_assets') || '[]');
  const index = assets.findIndex(a => a.id === id);
  if (index !== -1) {
    assets[index] = { ...assets[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem('assetwatch_assets', JSON.stringify(assets));
  } else {
    throw new Error('ไม่พบข้อมูลครุภัณฑ์ที่ต้องการแก้ไข');
  }
};

export const deleteAsset = async (id: string): Promise<void> => {
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      const docRef = doc(db, 'assets', id);
      await deleteDoc(docRef);
      return;
    } catch (e) {
      console.error('Firebase deleteAsset failed, falling back to localStorage:', e);
    }
  }

  // LocalStorage Fallback
  initLocalStorageIfNeeded();
  const assets: Asset[] = JSON.parse(localStorage.getItem('assetwatch_assets') || '[]');
  const filtered = assets.filter(a => a.id !== id);
  localStorage.setItem('assetwatch_assets', JSON.stringify(filtered));
};

// --- AUDIT TRAIL SERVICES ---
export const getAuditTrails = async (): Promise<AuditTrail[]> => {
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      const q = query(collection(db, 'audit_trails'), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      const list: AuditTrail[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as AuditTrail);
      });
      return list;
    } catch (e) {
      console.error('Firebase getAuditTrails failed, falling back to localStorage:', e);
    }
  }

  // LocalStorage Fallback
  initLocalStorageIfNeeded();
  const audits: AuditTrail[] = JSON.parse(localStorage.getItem('assetwatch_audits') || '[]');
  return audits.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const addAuditTrail = async (trail: Omit<AuditTrail, 'id'>): Promise<void> => {
  const id = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const fullTrail: AuditTrail = { id, ...trail };
  
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      const docRef = doc(db, 'audit_trails', id);
      await setDoc(docRef, fullTrail);
      return;
    } catch (e) {
      console.error('Firebase addAuditTrail failed, falling back to localStorage:', e);
    }
  }

  // LocalStorage Fallback
  initLocalStorageIfNeeded();
  const audits: AuditTrail[] = JSON.parse(localStorage.getItem('assetwatch_audits') || '[]');
  audits.push(fullTrail);
  localStorage.setItem('assetwatch_audits', JSON.stringify(audits));
};

// --- SURVEY SERVICES ---
export const getSurveys = async (): Promise<SurveyRecord[]> => {
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      const q = query(collection(db, 'surveys'), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      const list: SurveyRecord[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as SurveyRecord);
      });
      return list;
    } catch (e) {
      console.error('Firebase getSurveys failed, falling back to localStorage:', e);
    }
  }

  // LocalStorage Fallback
  initLocalStorageIfNeeded();
  const surveys: SurveyRecord[] = JSON.parse(localStorage.getItem('assetwatch_surveys') || '[]');
  return surveys.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const addSurvey = async (survey: Omit<SurveyRecord, 'id'>): Promise<void> => {
  const id = `survey-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const fullSurvey: SurveyRecord = { id, ...survey };
  
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      const docRef = doc(db, 'surveys', id);
      await setDoc(docRef, fullSurvey);
      return;
    } catch (e) {
      console.error('Firebase addSurvey failed, falling back to localStorage:', e);
    }
  }

  // LocalStorage Fallback
  initLocalStorageIfNeeded();
  const surveys: SurveyRecord[] = JSON.parse(localStorage.getItem('assetwatch_surveys') || '[]');
  surveys.push(fullSurvey);
  localStorage.setItem('assetwatch_surveys', JSON.stringify(surveys));
};

// --- REPAIR SERVICES ---
export const getRepairs = async (): Promise<RepairCase[]> => {
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      const q = query(collection(db, 'repairs'), orderBy('updatedAt', 'desc'));
      const snapshot = await getDocs(q);
      const list: RepairCase[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as RepairCase);
      });
      return list;
    } catch (e) {
      console.error('Firebase getRepairs failed, falling back to localStorage:', e);
    }
  }

  // LocalStorage Fallback
  initLocalStorageIfNeeded();
  const repairs: RepairCase[] = JSON.parse(localStorage.getItem('assetwatch_repairs') || '[]');
  return repairs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

export const addRepair = async (repair: Omit<RepairCase, 'id'>): Promise<string> => {
  const id = `rep-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const fullRepair: RepairCase = { id, ...repair };
  
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      const docRef = doc(db, 'repairs', id);
      await setDoc(docRef, fullRepair);
      return id;
    } catch (e) {
      console.error('Firebase addRepair failed, falling back to localStorage:', e);
    }
  }

  // LocalStorage Fallback
  initLocalStorageIfNeeded();
  const repairs: RepairCase[] = JSON.parse(localStorage.getItem('assetwatch_repairs') || '[]');
  repairs.push(fullRepair);
  localStorage.setItem('assetwatch_repairs', JSON.stringify(repairs));
  return id;
};

export const updateRepair = async (id: string, updates: Partial<RepairCase>): Promise<void> => {
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      const docRef = doc(db, 'repairs', id);
      await updateDoc(docRef, updates as any);
      return;
    } catch (e) {
      console.error('Firebase updateRepair failed, falling back to localStorage:', e);
    }
  }

  // LocalStorage Fallback
  initLocalStorageIfNeeded();
  const repairs: RepairCase[] = JSON.parse(localStorage.getItem('assetwatch_repairs') || '[]');
  const index = repairs.findIndex(r => r.id === id);
  if (index !== -1) {
    repairs[index] = { ...repairs[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem('assetwatch_repairs', JSON.stringify(repairs));
  } else {
    throw new Error('ไม่พบประวัติการซ่อมที่ต้องการอัปเดต');
  }
};

// --- BACKUP & RESTORE ALL DATA ---
export const exportBackupData = async (): Promise<string> => {
  const assets = await getAssets();
  const audits = await getAuditTrails();
  const repairs = await getRepairs();
  const surveys = await getSurveys();

  const backupObj = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    assets,
    audits,
    repairs,
    surveys
  };

  return JSON.stringify(backupObj, null, 2);
};

export const importBackupData = async (jsonString: string): Promise<{ success: boolean; message: string }> => {
  try {
    const backupObj = JSON.parse(jsonString);
    if (!backupObj.assets || !Array.isArray(backupObj.assets)) {
      return { success: false, message: 'โครงสร้างไฟล์สำรองข้อมูลไม่ถูกต้อง' };
    }

    const { isFirebase, db } = getServices();

    if (isFirebase && db) {
      // Restore to Firebase Firestore
      // To prevent locks, we will upload all records.
      // This loop is fine for single client-side imports.
      for (const asset of backupObj.assets) {
        await setDoc(doc(db, 'assets', asset.id), asset);
      }
      if (backupObj.audits) {
        for (const audit of backupObj.audits) {
          await setDoc(doc(db, 'audit_trails', audit.id), audit);
        }
      }
      if (backupObj.repairs) {
        for (const repair of backupObj.repairs) {
          await setDoc(doc(db, 'repairs', repair.id), repair);
        }
      }
      if (backupObj.surveys) {
        for (const survey of backupObj.surveys) {
          await setDoc(doc(db, 'surveys', survey.id), survey);
        }
      }
    }

    // Always keep LocalStorage in sync or write to LocalStorage if offline
    localStorage.setItem('assetwatch_assets', JSON.stringify(backupObj.assets));
    localStorage.setItem('assetwatch_audits', JSON.stringify(backupObj.audits || []));
    localStorage.setItem('assetwatch_repairs', JSON.stringify(backupObj.repairs || []));
    localStorage.setItem('assetwatch_surveys', JSON.stringify(backupObj.surveys || []));

    return { success: true, message: `นำเข้าข้อมูลครุภัณฑ์สำเร็จทั้งหมด ${backupObj.assets.length} รายการ` };
  } catch (e: any) {
    return { success: false, message: `การนำเข้าข้อมูลล้มเหลว: ${e.message}` };
  }
};
