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
import { Asset, AuditTrail, SurveyRecord, RepairCase, SurveyRound, DepartmentLocationConfig, UserAccount, PMContract, PMSchedule, PMNotification, INITIAL_ASSETS, INITIAL_AUDITS, INITIAL_REPAIRS, INITIAL_DEPARTMENTS, INITIAL_USERS, INITIAL_CONTRACTS, INITIAL_SCHEDULES, INITIAL_NOTIFICATIONS } from '../utils/mockData';
import { BLOOD_BAG_ASSETS } from '../utils/bloodBagAssetsData';

// Helper to check if we are using Firebase
const getServices = () => {
  const services = getFirebaseServices();
  // We double check if we have a valid projectId and db to avoid errors
  if (services.isConfigured && services.db) {
    return { isFirebase: true, db: services.db, storage: services.storage };
  }
  return { isFirebase: false, db: null, storage: null };
};

// Utility to strip undefined values from objects before sending to Firestore
// Firestore rejects undefined values in setDoc/updateDoc calls
const sanitizeForFirestore = (obj: Record<string, any>): Record<string, any> => {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = value;
    }
  }
  return clean;
};

// --- INITIALIZE LOCAL STORAGE MOCK DATA IF EMPTY ---
const initLocalStorageIfNeeded = () => {
  if (!localStorage.getItem('assetwatch_assets')) {
    localStorage.setItem('assetwatch_assets', JSON.stringify(INITIAL_ASSETS));
  }
  if (!localStorage.getItem('assetwatch_audits')) {
    localStorage.setItem('assetwatch_audits', JSON.stringify(INITIAL_AUDITS));
  }
  if (!localStorage.getItem('assetwatch_users')) {
    localStorage.setItem('assetwatch_users', JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem('assetwatch_repairs')) {
    localStorage.setItem('assetwatch_repairs', JSON.stringify(INITIAL_REPAIRS));
  }
  if (!localStorage.getItem('assetwatch_surveys')) {
    localStorage.setItem('assetwatch_surveys', JSON.stringify([]));
  }
  if (!localStorage.getItem('assetwatch_departments')) {
    localStorage.setItem('assetwatch_departments', JSON.stringify(INITIAL_DEPARTMENTS));
  }
  if (!localStorage.getItem('assetwatch_contracts')) {
    localStorage.setItem('assetwatch_contracts', JSON.stringify(INITIAL_CONTRACTS));
  }
  if (!localStorage.getItem('assetwatch_schedules')) {
    localStorage.setItem('assetwatch_schedules', JSON.stringify(INITIAL_SCHEDULES));
  }
  if (!localStorage.getItem('assetwatch_pm_notifications')) {
    localStorage.setItem('assetwatch_pm_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
  }
  if (!localStorage.getItem('assetwatch_survey_rounds')) {
    const defaultActiveRound: SurveyRound = {
      id: 'round-default',
      name: 'รอบสำรวจประจำปีงบประมาณ 2569 (ปีปัจจุบัน)',
      dateCreated: new Date().toISOString(),
      status: 'active',
      totalAssets: 5,
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
      operator: 'ระบบอัตโนมัติ'
    };
    localStorage.setItem('assetwatch_survey_rounds', JSON.stringify([defaultActiveRound]));
  }
};
initLocalStorageIfNeeded();

// --- DYNAMIC IMAGE COMPRESSION HELPER (PREVENTS MOBILE OUT-OF-MEMORY ERRORS) ---
export const compressImage = (file: File, maxWidth = 1280, maxHeight = 1280, quality = 0.75): Promise<File> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const img = new Image();
    // Memory Optimization: Using objectURL instead of FileReader Base64 string prevents RAM spikes
    const url = URL.createObjectURL(file);
    img.src = url;

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Fit dimensions within max limits while maintaining ratio
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name.substring(0, file.name.lastIndexOf('.')) + '_compressed.jpg', {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // Fallback: return original file
    };
  });
};

// --- IMAGE UPLOAD HELPER ---
export const uploadImage = async (file: File, path: string = 'assets'): Promise<string> => {
  const { isFirebase, storage } = getServices();
  
  // Compress image to prevent Out of Memory on mobile and speed up uploading
  let processedFile = file;
  try {
    // If it is a PM proof photo, compress aggressively to ~800px at 0.6 quality to keep DB size minimal
    // For general assets, use 1024px at 0.7 quality
    const targetSize = path === 'pm_proofs' ? 800 : 1024;
    const targetQuality = path === 'pm_proofs' ? 0.6 : 0.7;
    processedFile = await compressImage(file, targetSize, targetSize, targetQuality);
  } catch (err) {
    console.error('Image compression failed, using original file:', err);
  }

  const forceBase64 = localStorage.getItem('assetwatch_force_base64_images') !== 'false';

  if (isFirebase && storage && !forceBase64) {
    try {
      const storageRef = ref(storage, `${path}/${Date.now()}_${processedFile.name}`);
      
      // Setup an 8-second timeout promise to prevent hanging on slow/blocked connections
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Firebase Storage upload timed out after 8s')), 8000)
      );

      // Race uploadBytes against the timeout
      const snapshot = await Promise.race([
        uploadBytes(storageRef, processedFile),
        timeoutPromise
      ]) as any;

      const url = await getDownloadURL(snapshot.ref);
      return url;
    } catch (e) {
      console.error('Firebase Storage upload failed or timed out, falling back to base64:', e);
    }
  }

  // Fallback: Convert to Base64 for localStorage or demo mode
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(processedFile);
  });
};

// --- ASSET SERVICES ---
// Helper to ensure all Blood Bag assets from PDF are synced into LocalStorage and Firestore
const syncBloodBagAssets = async (assetsList: Asset[], isFirebase: boolean, db: any): Promise<Asset[]> => {
  // Normalize all incoming assets in the list first
  let listHasChanged = false;
  const normalizedList = assetsList.map(a => {
    let changed = false;
    let dept = a.department;
    let resp = a.responsiblePerson;
    
    // Normalize both variants of the department name to the correct longer name
    if (dept === "ฝ่ายผลิตถุงบรรจุโลหิต" || dept === "ฝ่ายผลิตถุงบรรจุโลหิต ") {
      dept = "ฝ่ายผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา";
      changed = true;
    }
    if (resp === "ฝ่ายผลิตถุงบรรจุโลหิต" || resp === "ฝ่ายผลิตถุงบรรจุโลหิต ") {
      resp = "ฝ่ายผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา";
      changed = true;
    }
    
    if (changed) {
      listHasChanged = true;
      return { ...a, department: dept, responsiblePerson: resp };
    }
    return a;
  });

  const existingIdSet = new Set(normalizedList.map(a => a.id));
  const missingAssets = BLOOD_BAG_ASSETS.filter(a => !existingIdSet.has(a.id));

  let updatedList = normalizedList;
  if (missingAssets.length > 0) {
    console.log(`Syncing ${missingAssets.length} missing Blood Bag assets...`);
    updatedList = [...normalizedList, ...missingAssets];
    listHasChanged = true;
  }

  if (listHasChanged) {
    localStorage.setItem('assetwatch_assets', JSON.stringify(updatedList));

    if (isFirebase && db) {
      try {
        // Also update any normalized/migrated/missing assets in Firestore
        const changedAssets = updatedList.filter(a => {
          const original = assetsList.find(orig => orig.id === a.id);
          // Update in Firestore if it was missing or had the old value
          return !original || 
                 original.department === "ฝ่ายผลิตถุงบรรจุโลหิต" || 
                 original.department === "ฝ่ายผลิตถุงบรรจุโลหิต " ||
                 original.responsiblePerson === "ฝ่ายผลิตถุงบรรจุโลหิต" ||
                 original.responsiblePerson === "ฝ่ายผลิตถุงบรรจุโลหิต ";
        });

        for (const asset of changedAssets) {
          await setDoc(doc(db, 'assets', asset.id), sanitizeForFirestore(asset));
        }
        console.log(`Successfully migrated/synced ${changedAssets.length} assets to Firestore.`);
      } catch (e) {
        console.error('Failed to sync migrated/missing assets to Firestore:', e);
      }
    }
  }

  return updatedList;
};

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

      // Seeding Firestore if completely empty
      if (list.length === 0) {
        initLocalStorageIfNeeded();
        const localAssets: Asset[] = JSON.parse(localStorage.getItem('assetwatch_assets') || '[]');
        const seedAssets = localAssets.length > 0 ? localAssets : INITIAL_ASSETS;
        for (const asset of seedAssets) {
          await setDoc(doc(db, 'assets', asset.id), sanitizeForFirestore(asset));
        }
        return seedAssets;
      }

      const syncedList = await syncBloodBagAssets(list, isFirebase, db);
      return syncedList;
    } catch (e) {
      console.error('Firebase getAssets failed, falling back to localStorage:', e);
    }
  }

  // LocalStorage Fallback
  initLocalStorageIfNeeded();
  const localList: Asset[] = JSON.parse(localStorage.getItem('assetwatch_assets') || '[]');
  const syncedLocal = await syncBloodBagAssets(localList, false, null);
  return syncedLocal;
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

export const addAssetsBulk = async (newAssets: Asset[]): Promise<void> => {
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      // In Firestore, we can set docs in parallel.
      await Promise.all(newAssets.map(async (asset) => {
        const docRef = doc(db, 'assets', asset.id);
        await setDoc(docRef, asset);
      }));
      return;
    } catch (e) {
      console.error('Firebase addAssetsBulk failed, falling back to localStorage:', e);
    }
  }

  // LocalStorage Fallback
  initLocalStorageIfNeeded();
  const assets: Asset[] = JSON.parse(localStorage.getItem('assetwatch_assets') || '[]');
  
  // Filter out duplicates that might be already in database (though live validated beforehand)
  const existingIds = new Set(assets.map(a => a.id));
  const uniqueNewAssets = newAssets.filter(a => !existingIds.has(a.id));
  
  assets.push(...uniqueNewAssets);
  localStorage.setItem('assetwatch_assets', JSON.stringify(assets));
};


export const updateAsset = async (id: string, updates: Partial<Asset>): Promise<void> => {
  // 1. Update LocalStorage first to guarantee immediate success locally
  initLocalStorageIfNeeded();
  const assets: Asset[] = JSON.parse(localStorage.getItem('assetwatch_assets') || '[]');
  const index = assets.findIndex(a => a.id === id);
  if (index !== -1) {
    assets[index] = { ...assets[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem('assetwatch_assets', JSON.stringify(assets));
  } else {
    const newAsset = { id, ...updates, updatedAt: new Date().toISOString() } as Asset;
    assets.push(newAsset);
    localStorage.setItem('assetwatch_assets', JSON.stringify(assets));
  }

  // Sync updated assetName to existing schedules and repairs if name changed
  if (updates.name) {
    const newName = updates.name;
    try {
      const schedules = JSON.parse(localStorage.getItem('assetwatch_pm_schedules') || '[]');
      let schedMod = false;
      schedules.forEach((s: any) => {
        if (s.assetId === id) { s.assetName = newName; schedMod = true; }
      });
      if (schedMod) localStorage.setItem('assetwatch_pm_schedules', JSON.stringify(schedules));

      const repairs = JSON.parse(localStorage.getItem('assetwatch_repairs') || '[]');
      let repMod = false;
      repairs.forEach((r: any) => {
        if (r.assetId === id) { r.assetName = newName; repMod = true; }
      });
      if (repMod) localStorage.setItem('assetwatch_repairs', JSON.stringify(repairs));
    } catch (err) {
      console.error('Error syncing assetName to schedules/repairs:', err);
    }
  }

  // 2. Synchronize to Firestore using setDoc with merge: true to avoid "document not found" errors
  const { isFirebase, db } = getServices();
  if (isFirebase && db) {
    try {
      await setDoc(doc(db, 'assets', id), sanitizeForFirestore(updates), { merge: true });
    } catch (e) {
      console.error('Firebase updateAsset failed:', e);
      throw e;
    }
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

      // Seeding Firestore if completely empty
      if (list.length === 0) {
        initLocalStorageIfNeeded();
        const localAudits: AuditTrail[] = JSON.parse(localStorage.getItem('assetwatch_audits') || '[]');
        for (const audit of localAudits) {
          await setDoc(doc(db, 'audit_trails', audit.id), audit);
        }
        return localAudits.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }

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
  // Read local cache first
  initLocalStorageIfNeeded();
  const localSurveys: SurveyRecord[] = JSON.parse(localStorage.getItem('assetwatch_surveys') || '[]');

  const { isFirebase, db } = getServices();
  if (isFirebase && db) {
    try {
      const q = query(collection(db, 'surveys'));
      const snapshot = await getDocs(q);
      const fbList: SurveyRecord[] = [];
      snapshot.forEach((doc) => {
        fbList.push({ id: doc.id, ...doc.data() } as SurveyRecord);
      });

      // Merge local and remote avoiding duplicates
      const mergedMap = new Map<string, SurveyRecord>();
      localSurveys.forEach(s => mergedMap.set(s.id, s));
      fbList.forEach(s => mergedMap.set(s.id, s));
      
      const mergedList = Array.from(mergedMap.values());
      localStorage.setItem('assetwatch_surveys', JSON.stringify(mergedList));
      return mergedList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (e) {
      console.error('Firebase getSurveys failed, returning local cache:', e);
    }
  }

  return localSurveys.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const addSurvey = async (survey: Omit<SurveyRecord, 'id'>): Promise<void> => {
  const id = `survey-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const fullSurvey: SurveyRecord = { id, ...survey };
  
  // 1. Always write to local storage first as a secure offline cache
  initLocalStorageIfNeeded();
  const localSurveys: SurveyRecord[] = JSON.parse(localStorage.getItem('assetwatch_surveys') || '[]');
  localSurveys.push(fullSurvey);
  localStorage.setItem('assetwatch_surveys', JSON.stringify(localSurveys));

  // 2. Then try to sync to Firebase Firestore
  const { isFirebase, db } = getServices();
  if (isFirebase && db) {
    try {
      const docRef = doc(db, 'surveys', id);
      await setDoc(docRef, fullSurvey);
    } catch (e) {
      console.error('Firebase addSurvey failed, but saved locally:', e);
    }
  }
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

      // Seeding Firestore if completely empty
      if (list.length === 0) {
        initLocalStorageIfNeeded();
        const localRepairs: RepairCase[] = JSON.parse(localStorage.getItem('assetwatch_repairs') || '[]');
        for (const repair of localRepairs) {
          await setDoc(doc(db, 'repairs', repair.id), repair);
        }
        return localRepairs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      }

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
  // 1. Update LocalStorage first
  initLocalStorageIfNeeded();
  const repairs: RepairCase[] = JSON.parse(localStorage.getItem('assetwatch_repairs') || '[]');
  const index = repairs.findIndex(r => r.id === id);
  if (index !== -1) {
    repairs[index] = { ...repairs[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem('assetwatch_repairs', JSON.stringify(repairs));
  } else {
    const newRepair = { id, ...updates, updatedAt: new Date().toISOString() } as RepairCase;
    repairs.push(newRepair);
    localStorage.setItem('assetwatch_repairs', JSON.stringify(repairs));
  }

  // 2. Sync to Firestore using setDoc with merge
  const { isFirebase, db } = getServices();
  if (isFirebase && db) {
    try {
      await setDoc(doc(db, 'repairs', id), sanitizeForFirestore(updates), { merge: true });
    } catch (e) {
      console.error('Firebase updateRepair failed:', e);
      throw e;
    }
  }
};

// --- SURVEY ROUND SERVICES ---
export const getSurveyRounds = async (): Promise<SurveyRound[]> => {
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      const q = query(collection(db, 'survey_rounds'), orderBy('dateCreated', 'desc'));
      const snapshot = await getDocs(q);
      const list: SurveyRound[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as SurveyRound);
      });

      // Seeding Firestore if completely empty
      if (list.length === 0) {
        initLocalStorageIfNeeded();
        const localRounds: SurveyRound[] = JSON.parse(localStorage.getItem('assetwatch_survey_rounds') || '[]');
        for (const round of localRounds) {
          await setDoc(doc(db, 'survey_rounds', round.id), round);
        }
        return localRounds.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
      }

      return list;
    } catch (e) {
      console.error('Firebase getSurveyRounds failed, falling back to localStorage:', e);
    }
  }

  // LocalStorage Fallback
  initLocalStorageIfNeeded();
  const rounds: SurveyRound[] = JSON.parse(localStorage.getItem('assetwatch_survey_rounds') || '[]');
  return rounds.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
};

export const addSurveyRound = async (round: SurveyRound): Promise<void> => {
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      const docRef = doc(db, 'survey_rounds', round.id);
      await setDoc(docRef, round);
      return;
    } catch (e) {
      console.error('Firebase addSurveyRound failed, falling back to localStorage:', e);
    }
  }

  // LocalStorage Fallback
  initLocalStorageIfNeeded();
  const rounds: SurveyRound[] = JSON.parse(localStorage.getItem('assetwatch_survey_rounds') || '[]');
  rounds.push(round);
  localStorage.setItem('assetwatch_survey_rounds', JSON.stringify(rounds));
};

export const updateSurveyRound = async (id: string, updates: Partial<SurveyRound>): Promise<void> => {
  // 1. Update LocalStorage first
  initLocalStorageIfNeeded();
  const rounds: SurveyRound[] = JSON.parse(localStorage.getItem('assetwatch_survey_rounds') || '[]');
  const index = rounds.findIndex(r => r.id === id);
  if (index !== -1) {
    rounds[index] = { ...rounds[index], ...updates };
    localStorage.setItem('assetwatch_survey_rounds', JSON.stringify(rounds));
  } else {
    const newRound = { id, ...updates } as SurveyRound;
    rounds.push(newRound);
    localStorage.setItem('assetwatch_survey_rounds', JSON.stringify(rounds));
  }

  // 2. Sync to Firestore using setDoc with merge
  const { isFirebase, db } = getServices();
  if (isFirebase && db) {
    try {
      await setDoc(doc(db, 'survey_rounds', id), sanitizeForFirestore(updates), { merge: true });
    } catch (e) {
      console.error('Firebase updateSurveyRound failed:', e);
      throw e;
    }
  }
};

// --- DEPARTMENT & LOCATION CONFIG SERVICES ---
// Helper to ensure 'ฝ่ายผลิตถุงบรรจุโลหิต' exists with all 85 rooms in PDF
const syncBloodBagDepartment = async (depts: DepartmentLocationConfig[], isFirebase: boolean, db: any): Promise<DepartmentLocationConfig[]> => {
  // Auto-migration: Merge duplicate department "ฝ่ายผลิตถุงบรรจุโลหิต" into "ฝ่ายผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา"
  const oldDeptIdx = depts.findIndex(d => d.name === "ฝ่ายผลิตถุงบรรจุโลหิต");
  if (oldDeptIdx !== -1) {
    const oldDept = depts[oldDeptIdx];
    const newDeptIdx = depts.findIndex(d => d.name === "ฝ่ายผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา");
    if (newDeptIdx !== -1) {
      depts[newDeptIdx].locations = Array.from(new Set([...depts[newDeptIdx].locations, ...oldDept.locations]));
      depts.splice(oldDeptIdx, 1);
    } else {
      depts[oldDeptIdx].name = "ฝ่ายผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา";
    }
    localStorage.setItem('assetwatch_departments', JSON.stringify(depts));

    // Also migrate assets in localStorage
    try {
      const storedAssets = JSON.parse(localStorage.getItem('assetwatch_assets') || '[]');
      let assetChanged = false;
      storedAssets.forEach((a: any) => {
        if (a.department === "ฝ่ายผลิตถุงบรรจุโลหิต") { a.department = "ฝ่ายผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา"; assetChanged = true; }
        if (a.responsiblePerson === "ฝ่ายผลิตถุงบรรจุโลหิต") { a.responsiblePerson = "ฝ่ายผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา"; assetChanged = true; }
      });
      if (assetChanged) {
        localStorage.setItem('assetwatch_assets', JSON.stringify(storedAssets));
      }

      const storedUsers = JSON.parse(localStorage.getItem('assetwatch_users') || '[]');
      let userChanged = false;
      storedUsers.forEach((u: any) => {
        if (u.department === "ฝ่ายผลิตถุงบรรจุโลหิต") { u.department = "ฝ่ายผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา"; userChanged = true; }
      });
      if (userChanged) {
        localStorage.setItem('assetwatch_users', JSON.stringify(storedUsers));
      }
    } catch (e) {
      console.error('Error migrating local storage for department merge:', e);
    }
  }
  const targetName = "ฝ่ายผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา";
  const defaultBloodBagDept = INITIAL_DEPARTMENTS.find(d => d.name === targetName);
  if (!defaultBloodBagDept) return depts;

  let existingIdx = depts.findIndex(d => d.name === targetName);
  let changed = false;

  if (existingIdx === -1) {
    depts.push(defaultBloodBagDept);
    changed = true;
    if (isFirebase && db) {
      try {
        await setDoc(doc(db, 'departments', defaultBloodBagDept.id), defaultBloodBagDept);
      } catch (e) {
        console.error('Failed to sync new Blood Bag Dept to Firestore:', e);
      }
    }
  } else {
    // Check if any rooms from default 85 rooms are missing
    const currentRoomsSet = new Set(depts[existingIdx].locations);
    const missingRooms = defaultBloodBagDept.locations.filter(r => !currentRoomsSet.has(r));
    if (missingRooms.length > 0) {
      const mergedLocations = Array.from(new Set([...depts[existingIdx].locations, ...defaultBloodBagDept.locations]));
      depts[existingIdx].locations = mergedLocations;
      changed = true;
      if (isFirebase && db) {
        try {
          await updateDoc(doc(db, 'departments', depts[existingIdx].id), { locations: mergedLocations });
        } catch (e) {
          console.error('Failed to update Blood Bag Dept locations in Firestore:', e);
        }
      }
    }
  }

  if (changed) {
    localStorage.setItem('assetwatch_departments', JSON.stringify(depts));
  }

  return depts;
};

export const getDepartments = async (): Promise<DepartmentLocationConfig[]> => {
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      const q = query(collection(db, 'departments'), orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      const list: DepartmentLocationConfig[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as DepartmentLocationConfig);
      });

      // Seeding Firestore if completely empty
      if (list.length === 0) {
        initLocalStorageIfNeeded();
        const localDepts: DepartmentLocationConfig[] = JSON.parse(localStorage.getItem('assetwatch_departments') || '[]');
        const seedDepts = localDepts.length > 0 ? localDepts : INITIAL_DEPARTMENTS;
        for (const dept of seedDepts) {
          await setDoc(doc(db, 'departments', dept.id), dept);
        }
        const syncedSeed = await syncBloodBagDepartment(seedDepts, isFirebase, db);
        return syncedSeed.sort((a, b) => a.name.localeCompare(b.name, 'th'));
      }

      const syncedList = await syncBloodBagDepartment(list, isFirebase, db);
      return syncedList.sort((a, b) => a.name.localeCompare(b.name, 'th'));
    } catch (e) {
      console.error('Firebase getDepartments failed, falling back to localStorage:', e);
    }
  }

  // LocalStorage Fallback
  initLocalStorageIfNeeded();
  const depts: DepartmentLocationConfig[] = JSON.parse(localStorage.getItem('assetwatch_departments') || '[]');
  const syncedLocal = await syncBloodBagDepartment(depts, false, null);
  return syncedLocal.sort((a, b) => a.name.localeCompare(b.name, 'th'));
};

export const addDepartment = async (dept: DepartmentLocationConfig): Promise<void> => {
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      const docRef = doc(db, 'departments', dept.id);
      await setDoc(docRef, dept);
      return;
    } catch (e) {
      console.error('Firebase addDepartment failed, falling back to localStorage:', e);
    }
  }

  // LocalStorage Fallback
  initLocalStorageIfNeeded();
  const depts: DepartmentLocationConfig[] = JSON.parse(localStorage.getItem('assetwatch_departments') || '[]');
  depts.push(dept);
  localStorage.setItem('assetwatch_departments', JSON.stringify(depts));
};

export const updateDepartment = async (id: string, updates: Partial<DepartmentLocationConfig>): Promise<void> => {
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      const docRef = doc(db, 'departments', id);
      await updateDoc(docRef, updates as any);
      return;
    } catch (e) {
      console.error('Firebase updateDepartment failed, falling back to localStorage:', e);
    }
  }

  // LocalStorage Fallback
  initLocalStorageIfNeeded();
  const depts: DepartmentLocationConfig[] = JSON.parse(localStorage.getItem('assetwatch_departments') || '[]');
  const index = depts.findIndex(d => d.id === id);
  if (index !== -1) {
    depts[index] = { ...depts[index], ...updates };
    localStorage.setItem('assetwatch_departments', JSON.stringify(depts));
  } else {
    throw new Error('ไม่พบข้อมูลหน่วยงานที่ต้องการอัปเดต');
  }
};

export const deleteDepartment = async (id: string): Promise<void> => {
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      const docRef = doc(db, 'departments', id);
      await deleteDoc(docRef);
      return;
    } catch (e) {
      console.error('Firebase deleteDepartment failed, falling back to localStorage:', e);
    }
  }

  // LocalStorage Fallback
  initLocalStorageIfNeeded();
  const depts: DepartmentLocationConfig[] = JSON.parse(localStorage.getItem('assetwatch_departments') || '[]');
  const filtered = depts.filter(d => d.id !== id);
  localStorage.setItem('assetwatch_departments', JSON.stringify(filtered));
};

// --- BACKUP & RESTORE ALL DATA ---
export const exportBackupData = async (): Promise<string> => {
  const assets = await getAssets();
  const audits = await getAuditTrails();
  const repairs = await getRepairs();
  const surveys = await getSurveys();
  const rounds = await getSurveyRounds();
  const departments = await getDepartments();
  const users = await getUsers();

  const backupObj = {
    version: '1.1.0',
    exportedAt: new Date().toISOString(),
    assets,
    audits,
    repairs,
    surveys,
    rounds,
    departments,
    users
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
      if (backupObj.rounds) {
        for (const round of backupObj.rounds) {
          await setDoc(doc(db, 'survey_rounds', round.id), round);
        }
      }
      if (backupObj.departments) {
        for (const dept of backupObj.departments) {
          await setDoc(doc(db, 'departments', dept.id), dept);
        }
      }
      if (backupObj.users) {
        for (const user of backupObj.users) {
          await setDoc(doc(db, 'users', user.id), user);
        }
      }
    }

    // Always keep LocalStorage in sync or write to LocalStorage if offline
    localStorage.setItem('assetwatch_assets', JSON.stringify(backupObj.assets));
    localStorage.setItem('assetwatch_audits', JSON.stringify(backupObj.audits || []));
    localStorage.setItem('assetwatch_repairs', JSON.stringify(backupObj.repairs || []));
    localStorage.setItem('assetwatch_surveys', JSON.stringify(backupObj.surveys || []));
    localStorage.setItem('assetwatch_survey_rounds', JSON.stringify(backupObj.rounds || []));
    localStorage.setItem('assetwatch_departments', JSON.stringify(backupObj.departments || INITIAL_DEPARTMENTS));
    if (backupObj.users) {
      localStorage.setItem('assetwatch_users', JSON.stringify(backupObj.users));
    }

    return { success: true, message: `นำเข้าข้อมูลครุภัณฑ์สำเร็จทั้งหมด ${backupObj.assets.length} รายการ` };
  } catch (e: any) {
    return { success: false, message: `การนำเข้าข้อมูลล้มเหลว: ${e.message}` };
  }
};

// --- USER ACCESS & AUTHORIZATION SERVICES ---
export const getUsers = async (): Promise<UserAccount[]> => {
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      const q = query(collection(db, 'users'));
      const snapshot = await getDocs(q);
      const list: UserAccount[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as UserAccount);
      });

      // Seeding Firestore if completely empty
      if (list.length === 0) {
        initLocalStorageIfNeeded();
        const localUsers: UserAccount[] = JSON.parse(localStorage.getItem('assetwatch_users') || '[]');
        const seedUsers = localUsers.length > 0 ? localUsers : INITIAL_USERS;
        for (const user of seedUsers) {
          await setDoc(doc(db, 'users', user.id), user);
        }
        return seedUsers.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }

      return list;
    } catch (e) {
      console.error('Firebase getUsers failed, falling back to localStorage:', e);
    }
  }

  // LocalStorage Fallback
  initLocalStorageIfNeeded();
  const users: UserAccount[] = JSON.parse(localStorage.getItem('assetwatch_users') || '[]');
  return users.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

export const addOrUpdateUser = async (user: UserAccount): Promise<void> => {
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      const docRef = doc(db, 'users', user.id);
      await setDoc(docRef, user);
      return;
    } catch (e) {
      console.error('Firebase addOrUpdateUser failed, falling back to localStorage:', e);
    }
  }

  // LocalStorage Fallback
  initLocalStorageIfNeeded();
  const users: UserAccount[] = JSON.parse(localStorage.getItem('assetwatch_users') || '[]');
  const index = users.findIndex(u => u.id === user.id);
  if (index !== -1) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem('assetwatch_users', JSON.stringify(users));
};

export const deleteUser = async (id: string): Promise<void> => {
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      const docRef = doc(db, 'users', id);
      await deleteDoc(docRef);
      return;
    } catch (e) {
      console.error('Firebase deleteUser failed, falling back to localStorage:', e);
    }
  }

  // LocalStorage Fallback
  initLocalStorageIfNeeded();
  const users: UserAccount[] = JSON.parse(localStorage.getItem('assetwatch_users') || '[]');
  const filtered = users.filter(u => u.id !== id);
  localStorage.setItem('assetwatch_users', JSON.stringify(filtered));
};

// --- PM CONTRACT SERVICES ---
export const getPMContracts = async (): Promise<PMContract[]> => {
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      const q = query(collection(db, 'pm_contracts'));
      const snapshot = await getDocs(q);
      const list: PMContract[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as PMContract);
      });

      if (list.length === 0) {
        initLocalStorageIfNeeded();
        const localContracts: PMContract[] = JSON.parse(localStorage.getItem('assetwatch_contracts') || '[]');
        for (const contract of localContracts) {
          await setDoc(doc(db, 'pm_contracts', contract.id), contract);
        }
        return localContracts;
      }
      return list;
    } catch (e) {
      console.error('Firebase getPMContracts failed, falling back to localStorage:', e);
    }
  }

  initLocalStorageIfNeeded();
  return JSON.parse(localStorage.getItem('assetwatch_contracts') || '[]');
};

export const addPMContract = async (contract: PMContract): Promise<void> => {
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      await setDoc(doc(db, 'pm_contracts', contract.id), contract);
      return;
    } catch (e) {
      console.error('Firebase addPMContract failed, falling back to localStorage:', e);
    }
  }

  initLocalStorageIfNeeded();
  const contracts: PMContract[] = JSON.parse(localStorage.getItem('assetwatch_contracts') || '[]');
  contracts.push(contract);
  localStorage.setItem('assetwatch_contracts', JSON.stringify(contracts));
};

export const updatePMContract = async (id: string, updates: Partial<PMContract>): Promise<void> => {
  // 1. Update LocalStorage first
  initLocalStorageIfNeeded();
  const contracts: PMContract[] = JSON.parse(localStorage.getItem('assetwatch_contracts') || '[]');
  const index = contracts.findIndex(c => c.id === id);
  if (index !== -1) {
    contracts[index] = { ...contracts[index], ...updates };
    localStorage.setItem('assetwatch_contracts', JSON.stringify(contracts));
  } else {
    const newContract = { id, ...updates } as PMContract;
    contracts.push(newContract);
    localStorage.setItem('assetwatch_contracts', JSON.stringify(contracts));
  }

  // 2. Sync to Firestore using setDoc with merge
  const { isFirebase, db } = getServices();
  if (isFirebase && db) {
    try {
      await setDoc(doc(db, 'pm_contracts', id), sanitizeForFirestore(updates), { merge: true });
    } catch (e) {
      console.error('Firebase updatePMContract failed:', e);
      throw e;
    }
  }
};

export const deletePMContract = async (id: string): Promise<void> => {
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      await deleteDoc(doc(db, 'pm_contracts', id));
      return;
    } catch (e) {
      console.error('Firebase deletePMContract failed, falling back to localStorage:', e);
    }
  }

  initLocalStorageIfNeeded();
  const contracts: PMContract[] = JSON.parse(localStorage.getItem('assetwatch_contracts') || '[]');
  const filtered = contracts.filter(c => c.id !== id);
  localStorage.setItem('assetwatch_contracts', JSON.stringify(filtered));
};

// --- PM SCHEDULE SERVICES ---
export const getPMSchedules = async (): Promise<PMSchedule[]> => {
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      const q = query(collection(db, 'pm_schedules'));
      const snapshot = await getDocs(q);
      const list: PMSchedule[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as PMSchedule);
      });

      if (list.length === 0) {
        initLocalStorageIfNeeded();
        const localSchedules: PMSchedule[] = JSON.parse(localStorage.getItem('assetwatch_schedules') || '[]');
        for (const sched of localSchedules) {
          await setDoc(doc(db, 'pm_schedules', sched.id), sched);
        }
        return localSchedules;
      }
      return list;
    } catch (e) {
      console.error('Firebase getPMSchedules failed, falling back to localStorage:', e);
    }
  }

  initLocalStorageIfNeeded();
  return JSON.parse(localStorage.getItem('assetwatch_schedules') || '[]');
};

export const addPMSchedule = async (schedule: PMSchedule): Promise<void> => {
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      await setDoc(doc(db, 'pm_schedules', schedule.id), schedule);
      return;
    } catch (e) {
      console.error('Firebase addPMSchedule failed, falling back to localStorage:', e);
    }
  }

  initLocalStorageIfNeeded();
  const schedules: PMSchedule[] = JSON.parse(localStorage.getItem('assetwatch_schedules') || '[]');
  schedules.push(schedule);
  localStorage.setItem('assetwatch_schedules', JSON.stringify(schedules));
};

export const updatePMSchedule = async (id: string, updates: Partial<PMSchedule>): Promise<void> => {
  // 1. Update LocalStorage first
  initLocalStorageIfNeeded();
  const schedules: PMSchedule[] = JSON.parse(localStorage.getItem('assetwatch_schedules') || '[]');
  const index = schedules.findIndex(s => s.id === id);
  if (index !== -1) {
    schedules[index] = { ...schedules[index], ...updates };
    localStorage.setItem('assetwatch_schedules', JSON.stringify(schedules));
  } else {
    const newSched = { id, ...updates } as PMSchedule;
    schedules.push(newSched);
    localStorage.setItem('assetwatch_schedules', JSON.stringify(schedules));
  }

  // 2. Sync to Firestore using setDoc with merge
  const { isFirebase, db } = getServices();
  if (isFirebase && db) {
    try {
      await setDoc(doc(db, 'pm_schedules', id), sanitizeForFirestore(updates), { merge: true });
    } catch (e) {
      console.error('Firebase updatePMSchedule failed:', e);
      throw e;
    }
  }
};

// --- PM NOTIFICATION SERVICES ---
export const getPMNotifications = async (): Promise<PMNotification[]> => {
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      const q = query(collection(db, 'pm_notifications'));
      const snapshot = await getDocs(q);
      const list: PMNotification[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as PMNotification);
      });

      if (list.length === 0) {
        initLocalStorageIfNeeded();
        const localNotifications: PMNotification[] = JSON.parse(localStorage.getItem('assetwatch_pm_notifications') || '[]');
        for (const notif of localNotifications) {
          await setDoc(doc(db, 'pm_notifications', notif.id), notif);
        }
        return localNotifications;
      }
      return list;
    } catch (e) {
      console.error('Firebase getPMNotifications failed, falling back to localStorage:', e);
    }
  }

  initLocalStorageIfNeeded();
  return JSON.parse(localStorage.getItem('assetwatch_pm_notifications') || '[]');
};

export const addPMNotification = async (notification: PMNotification): Promise<void> => {
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      await setDoc(doc(db, 'pm_notifications', notification.id), notification);
      return;
    } catch (e) {
      console.error('Firebase addPMNotification failed, falling back to localStorage:', e);
    }
  }

  initLocalStorageIfNeeded();
  const notifications: PMNotification[] = JSON.parse(localStorage.getItem('assetwatch_pm_notifications') || '[]');
  notifications.push(notification);
  localStorage.setItem('assetwatch_pm_notifications', JSON.stringify(notifications));
};

export const updatePMNotification = async (id: string, updates: Partial<PMNotification>): Promise<void> => {
  // 1. Update LocalStorage first
  initLocalStorageIfNeeded();
  const notifications: PMNotification[] = JSON.parse(localStorage.getItem('assetwatch_pm_notifications') || '[]');
  const index = notifications.findIndex(n => n.id === id);
  if (index !== -1) {
    notifications[index] = { ...notifications[index], ...updates };
    localStorage.setItem('assetwatch_pm_notifications', JSON.stringify(notifications));
  } else {
    const newNotif = { id, ...updates } as PMNotification;
    notifications.push(newNotif);
    localStorage.setItem('assetwatch_pm_notifications', JSON.stringify(notifications));
  }

  // 2. Sync to Firestore using setDoc with merge
  const { isFirebase, db } = getServices();
  if (isFirebase && db) {
    try {
      await setDoc(doc(db, 'pm_notifications', id), sanitizeForFirestore(updates), { merge: true });
    } catch (e) {
      console.error('Firebase updatePMNotification failed:', e);
      throw e;
    }
  }
};

export const deletePMNotification = async (id: string): Promise<void> => {
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      await deleteDoc(doc(db, 'pm_notifications', id));
      return;
    } catch (e) {
      console.error('Firebase deletePMNotification failed, falling back to localStorage:', e);
    }
  }

  initLocalStorageIfNeeded();
  const notifications: PMNotification[] = JSON.parse(localStorage.getItem('assetwatch_pm_notifications') || '[]');
  const filtered = notifications.filter(n => n.id !== id);
  localStorage.setItem('assetwatch_pm_notifications', JSON.stringify(filtered));
};

export const deletePMSchedule = async (id: string): Promise<void> => {
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      await deleteDoc(doc(db, 'pm_schedules', id));
    } catch (e) {
      console.error('Firebase deletePMSchedule failed, falling back to localStorage:', e);
    }
  }

  initLocalStorageIfNeeded();
  const schedules: PMSchedule[] = JSON.parse(localStorage.getItem('assetwatch_schedules') || '[]');
  const filtered = schedules.filter(s => s.id !== id);
  localStorage.setItem('assetwatch_schedules', JSON.stringify(filtered));
};
