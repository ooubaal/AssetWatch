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
  where, 
  limit, 
  addDoc 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Asset, AuditTrail, SurveyRecord, RepairCase, SurveyRound, DepartmentLocationConfig, UserAccount, PMContract, PMSchedule, PMNotification, SparePart, INITIAL_ASSETS, INITIAL_AUDITS, INITIAL_REPAIRS, INITIAL_DEPARTMENTS, INITIAL_USERS, INITIAL_CONTRACTS, INITIAL_SCHEDULES, INITIAL_NOTIFICATIONS, INITIAL_SPARE_PARTS } from '../utils/mockData';
import { RESTORED_FURNITURE_SURVEYS } from '../utils/restoredSurveysData';
import {
  fetchAssetsManifestDoc,
  saveAssetsManifestDoc,
  fetchSurveysManifestDoc,
  saveSurveysManifestDoc,
  fetchRepairsManifestDoc,
  saveRepairsManifestDoc,
  fetchPMManifestDoc,
  savePMManifestDoc,
  fetchSparePartsManifestDoc,
  saveSparePartsManifestDoc,
  mergeAssetsWithLocalCache,
  mergeSurveysWithLocalCache,
  fetchAssetDeepDetail,
  fetchSurveyDeepDetail,
  fetchRepairDeepDetail
} from './manifestService';

export {
  fetchAssetDeepDetail,
  fetchSurveyDeepDetail,
  fetchRepairDeepDetail
};

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
const sanitizeForFirestore = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj
      .filter(item => item !== undefined)
      .map(item => (typeof item === 'object' && item !== null ? sanitizeForFirestore(item) : item));
  }
  if (typeof obj === 'object') {
    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        clean[key] = typeof value === 'object' && value !== null ? sanitizeForFirestore(value) : value;
      }
    }
    return clean;
  }
  return obj;
};

// --- FIRESTORE CLOUD QUOTA EXCEEDED SENTINEL & NOTIFIER ---
export const isFirestoreQuotaError = (error: any): boolean => {
  if (!error) return false;
  const code = String(error.code || '').toLowerCase();
  const msg = String(error.message || '').toLowerCase();
  return (
    code.includes('resource-exhausted') ||
    code.includes('quota') ||
    msg.includes('resource_exhausted') ||
    msg.includes('quota exceeded') ||
    msg.includes('exceeded its quota') ||
    msg.includes('quota metric') ||
    msg.includes('quota limit')
  );
};

export const notifyQuotaExceeded = (operationName?: string) => {
  try {
    sessionStorage.setItem('assetwatch_quota_exceeded', 'true');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('assetwatch-quota-exceeded', {
        detail: { operation: operationName, timestamp: new Date().toISOString() }
      }));
    }
  } catch {}
};

export const clearQuotaExceededState = (): void => {
  try {
    sessionStorage.removeItem('assetwatch_quota_exceeded');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('assetwatch-quota-resolved'));
    }
  } catch {}
};

export const checkAndNotifyQuotaError = (error: any, operationName?: string): boolean => {
  if (!error) return false;
  if (isFirestoreQuotaError(error)) {
    console.warn(`[AssetWatch Quota Sentinel] Cloud quota exceeded during operation: ${operationName || 'unknown'}`);
    notifyQuotaExceeded(operationName);
    return true;
  }
  return false;
};

// Global unhandled promise rejection listener for Firestore quota errors
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && checkAndNotifyQuotaError(event.reason, 'unhandled_rejection')) {
      event.preventDefault();
    }
  });
}

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
  if (!localStorage.getItem('assetwatch_spare_parts')) {
    localStorage.setItem('assetwatch_spare_parts', JSON.stringify(INITIAL_SPARE_PARTS));
  }
};
initLocalStorageIfNeeded();

// --- LOCAL STORAGE QUOTA SAFE SETTER ---
export const safeSetItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (e: any) {
    if (e?.name === 'QuotaExceededError' || e?.code === 22 || e?.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e?.number === -2147024882) {
      console.warn(`LocalStorage quota exceeded while writing "${key}". Auto-cleaning older Base64 images to free cache...`);
      try {
        // 1. Purge old base64 images from survey records in localStorage (keep only last 10 images)
        const rawSurveys = localStorage.getItem('assetwatch_surveys');
        if (rawSurveys) {
          const parsedSurveys: SurveyRecord[] = JSON.parse(rawSurveys);
          const purgedSurveys = parsedSurveys.map((s, idx) => {
            if (idx < parsedSurveys.length - 10 && s.imageUrl && s.imageUrl.startsWith('data:image/')) {
              return { ...s, imageUrl: '' };
            }
            return s;
          });
          localStorage.setItem('assetwatch_surveys', JSON.stringify(purgedSurveys));
        }

        // 2. Purge old base64 images from repairs in localStorage
        const rawRepairs = localStorage.getItem('assetwatch_repairs');
        if (rawRepairs) {
          const parsedRepairs: any[] = JSON.parse(rawRepairs);
          const purgedRepairs = parsedRepairs.map((r, idx) => {
            if (idx < parsedRepairs.length - 10) {
              if (r.imageUrl && typeof r.imageUrl === 'string' && r.imageUrl.startsWith('data:image/')) {
                return { ...r, imageUrl: '' };
              }
              if (r.photo && typeof r.photo === 'string' && r.photo.startsWith('data:image/')) {
                return { ...r, photo: '' };
              }
            }
            return r;
          });
          localStorage.setItem('assetwatch_repairs', JSON.stringify(purgedRepairs));
        }

        // 3. Purge old audits if too large (keep last 100)
        const rawAudits = localStorage.getItem('assetwatch_audits');
        if (rawAudits) {
          const parsedAudits = JSON.parse(rawAudits);
          if (Array.isArray(parsedAudits) && parsedAudits.length > 100) {
            localStorage.setItem('assetwatch_audits', JSON.stringify(parsedAudits.slice(0, 100)));
          }
        }

        // 4. Try setting the item again
        localStorage.setItem(key, value);
      } catch (retryErr) {
        console.warn(`Could not set "${key}" in LocalStorage even after auto-cleanup:`, retryErr);
      }
    } else {
      console.warn(`LocalStorage error for "${key}":`, e);
    }
  }
};

// --- DYNAMIC IMAGE & PDF COMPRESSION HELPER (HD CLARITY & MINIMAL STORAGE SIZE) ---

// Helper to render PDF file to an HD compressed image
export const renderPdfToHdImage = async (file: File): Promise<File> => {
  return new Promise(async (resolve) => {
    try {
      // Load pdfjsLib dynamically from CDN if not already on window
      if (!(window as any).pdfjsLib) {
        await new Promise<void>((res, rej) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          script.onload = () => {
            try {
              (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            } catch {}
            res();
          };
          script.onerror = () => rej(new Error('Cannot load PDF library'));
          document.head.appendChild(script);
        });
      }

      const pdfjsLib = (window as any).pdfjsLib;
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);

      // Render at scale 2.0 (HD resolution ~150-200 DPI) for ultra-crisp readable text and tables
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      // Draw pure white background to avoid transparent PDF issues
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvasContext: ctx, viewport }).promise;

      // Fit maximum width to 1400px while maintaining crystal-clear sharpness
      let finalCanvas = canvas;
      const maxWidth = 1400;
      if (canvas.width > maxWidth) {
        const scale = maxWidth / canvas.width;
        const resizedCanvas = document.createElement('canvas');
        resizedCanvas.width = maxWidth;
        resizedCanvas.height = Math.round(canvas.height * scale);
        const rCtx = resizedCanvas.getContext('2d');
        if (rCtx) {
          rCtx.fillStyle = '#ffffff';
          rCtx.fillRect(0, 0, resizedCanvas.width, resizedCanvas.height);
          rCtx.imageSmoothingEnabled = true;
          rCtx.imageSmoothingQuality = 'high';
          rCtx.drawImage(canvas, 0, 0, resizedCanvas.width, resizedCanvas.height);
          finalCanvas = resizedCanvas;
        }
      }

      finalCanvas.toBlob((blob) => {
        if (blob) {
          const cleanName = file.name.replace(/\.[^/.]+$/, "");
          const compressedFile = new File([blob], `${cleanName}_HD.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        } else {
          resolve(file);
        }
      }, 'image/jpeg', 0.80); // 0.80 provides HD text sharpness with tiny ~60-110KB file size
    } catch (e) {
      console.warn('PDF to HD Image conversion fallback, using original file:', e);
      resolve(file);
    }
  });
};

export const compressImage = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.75): Promise<File> => {
  return new Promise(async (resolve) => {
    if (!file || !file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    try {
      // 1. Hardware-accelerated createImageBitmap with native downscaling
      if (typeof createImageBitmap === 'function') {
        try {
          // Calculate target dimensions before decode to avoid decoding huge 48MP raw images
          let bitmap: ImageBitmap;
          try {
            // Native downscaling hint on decode (resizeWidth preserves aspect ratio automatically)
            bitmap = await createImageBitmap(file, {
              resizeWidth: maxWidth,
              resizeQuality: 'medium'
            });
          } catch {
            bitmap = await createImageBitmap(file);
          }

          let width = bitmap.width;
          let height = bitmap.height;

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

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'medium';
            ctx.drawImage(bitmap, 0, 0, width, height);
            bitmap.close();

            const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', quality));
            // Release canvas GPU memory buffer
            canvas.width = 0;
            canvas.height = 0;

            if (blob) {
              const cleanName = file.name.replace(/\.[^/.]+$/, "");
              resolve(new File([blob], `${cleanName}_compressed.jpg`, {
                type: 'image/jpeg',
                lastModified: Date.now()
              }));
              return;
            }
          }
        } catch (bitmapErr) {
          console.warn('createImageBitmap failed, falling back to standard Image loader:', bitmapErr);
        }
      }

      // 2. Standard Image loader with URL.createObjectURL (Low RAM)
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;

      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

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

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium';

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            canvas.width = 0;
            canvas.height = 0;
            img.src = '';
            if (blob) {
              const cleanName = file.name.replace(/\.[^/.]+$/, "");
              const compressedFile = new File([blob], `${cleanName}_compressed.jpg`, {
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
        img.src = '';
        resolve(file);
      };
    } catch (err) {
      console.warn('Image compression exception:', err);
      resolve(file);
    }
  });
};

// Universal file & image compressor: Handles both PDF and Images with HD text sharpness & minimal file size
export const compressFileOrPdf = async (file: File, maxWidth = 1400, maxHeight = 1400, quality = 0.78): Promise<File> => {
  if (!file) return file;

  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (isPdf) {
    return await renderPdfToHdImage(file);
  }

  if (file.type.startsWith('image/')) {
    return await compressImage(file, maxWidth, maxHeight, quality);
  }

  return file;
};

// --- IMAGE & DOCUMENT UPLOAD HELPER ---
export const uploadImage = async (file: File, path: string = 'assets'): Promise<string> => {
  const { isFirebase, storage } = getServices();
  
  // Compress image or convert/compress PDF to HD readable document with tiny size
  let processedFile = file;
  try {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const targetSize = isPdf ? 1400 : (path === 'surveys' ? 800 : (path === 'pm_proofs' ? 1200 : 1400));
    const targetQuality = isPdf ? 0.80 : (path === 'surveys' ? 0.65 : 0.78);
    processedFile = await compressFileOrPdf(file, targetSize, targetSize, targetQuality);
  } catch (err) {
    console.error('File compression failed, using original file:', err);
  }

  const forceBase64 = localStorage.getItem('assetwatch_force_base64_images') === 'true';

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
export const isDefaultPlaceholder = (url?: string): boolean => {
  if (!url || typeof url !== 'string' || !url.trim()) return true;
  return url.includes('images.unsplash.com') || 
         url.includes('photo-1531403009284-440f080d1e12') || 
         url.includes('photo-1518455027359-f3f8164ba6bd') ||
         url.includes('placeholder') || 
         url === '-';
};

export const cleanAssetNote = (note?: string): string => {
  if (!note || typeof note !== 'string') return '';
  // Strip any parenthesized text containing 'สำรวจ' e.g. (สำรวจล่าสุด: 19/9/2568)
  return note.replace(/\s*\([^)]*สำรวจ[^)]*\)\s*/g, '').trim();
};

// Helper to ensure all Blood Bag assets from PDF are synced into LocalStorage and Firestore
const syncBloodBagAssets = async (assetsList: Asset[], isFirebase: boolean, db: any): Promise<Asset[]> => {
  // Normalize all incoming assets in the list first
  let listHasChanged = false;
  const normalizedList = assetsList.map(a => {
    let changed = false;
    let dept = a.department;
    let resp = a.responsiblePerson;
    let note = a.note;
    
    // Normalize both variants of the department name to the correct longer name
    if (dept === "ฝ่ายผลิตถุงบรรจุโลหิต" || dept === "ฝ่ายผลิตถุงบรรจุโลหิต ") {
      dept = "ฝ่ายผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา";
      changed = true;
    }
    if (resp === "ฝ่ายผลิตถุงบรรจุโลหิต" || resp === "ฝ่ายผลิตถุงบรรจุโลหิต ") {
      resp = "ฝ่ายผลิตถุงบรรจุโลหิต อุปกรณ์และน้ำยา";
      changed = true;
    }

    // Clean legacy "(สำรวจล่าสุด: ...)" debug strings from asset note
    if (note && (note.includes('สำรวจ') || note.includes('สำรวจล่าสุด'))) {
      const cleaned = cleanAssetNote(note);
      if (cleaned !== note) {
        note = cleaned;
        changed = true;
      }
    }
    
    if (changed) {
      listHasChanged = true;
      return { ...a, department: dept, responsiblePerson: resp, note };
    }
    return a;
  });

  const existingIdSet = new Set(normalizedList.map(a => a.id));
  const { BLOOD_BAG_ASSETS } = await import('../utils/bloodBagAssetsData');
  const missingAssets = BLOOD_BAG_ASSETS.filter(a => !existingIdSet.has(a.id));

  let updatedList = normalizedList;
  if (missingAssets.length > 0) {
    console.log(`Syncing ${missingAssets.length} missing Blood Bag assets...`);
    updatedList = [...normalizedList, ...missingAssets];
    listHasChanged = true;

    if (isFirebase && db) {
      try {
        for (const asset of missingAssets) {
          await setDoc(doc(db, 'assets', asset.id), sanitizeForFirestore(asset));
        }
        await saveAssetsManifestDoc(db, updatedList);
      } catch (e) {
        console.warn('Failed to sync missing assets to Firestore:', e);
      }
    }
  }

  if (listHasChanged) {
    localStorage.setItem('assetwatch_assets', JSON.stringify(updatedList));
  }

  return updatedList;
};

export const getAssets = async (forceFull: boolean = false): Promise<Asset[]> => {
  initLocalStorageIfNeeded();
  const localList: Asset[] = JSON.parse(localStorage.getItem('assetwatch_assets') || '[]');

  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      // 1. MANIFEST-FIRST STRATEGY (1 READ ONLY!)
      const manifestDoc = await fetchAssetsManifestDoc(db);
      
      if (manifestDoc && manifestDoc.items && manifestDoc.items.length > 0) {
        const cloudUpdatedAt = manifestDoc.updatedAt || '';
        let localMaxUpdatedAt = '';
        for (const a of localList) {
          if (a.updatedAt && a.updatedAt > localMaxUpdatedAt) {
            localMaxUpdatedAt = a.updatedAt;
          }
        }

        // If local cache is valid and up-to-date, return directly (0 further reads)
        if (!forceFull && localList.length >= manifestDoc.items.length && localMaxUpdatedAt >= cloudUpdatedAt) {
          const syncedLocal = await syncBloodBagAssets(localList, false, null);
          return syncedLocal;
        }

        // Cloud manifest is newer or local cache is empty:
        // Merge manifest with local cache preserving any locally cached images!
        console.log(`[Manifest Engine] Loaded ${manifestDoc.items.length} assets from manifest (1 Read)!`);
        const mergedAssets = mergeAssetsWithLocalCache(manifestDoc.items, localList);
        const syncedList = await syncBloodBagAssets(mergedAssets, isFirebase, db);
        safeSetItem('assetwatch_assets', JSON.stringify(syncedList));
        return syncedList;
      }

      // 2. FALLBACK & AUTO-SEED MANIFEST:
      // If manifests/assets does not exist on cloud yet, query once and generate the manifest!
      console.log('[Manifest Engine] manifests/assets not found on cloud. Auto-generating manifest...');
      const q = query(collection(db, 'assets'));
      const snapshot = await getDocs(q);
      const list: Asset[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Asset);
      });

      // Seeding Firestore if completely empty
      if (list.length === 0) {
        const { BLOOD_BAG_ASSETS } = await import('../utils/bloodBagAssetsData');
        const seedAssets = localList.length > 0 ? localList : [...INITIAL_ASSETS, ...BLOOD_BAG_ASSETS];
        for (const asset of seedAssets) {
          await setDoc(doc(db, 'assets', asset.id), sanitizeForFirestore(asset));
        }
        await saveAssetsManifestDoc(db, seedAssets);
        safeSetItem('assetwatch_assets', JSON.stringify(seedAssets));
        return seedAssets;
      }

      const syncedList = await syncBloodBagAssets(list, isFirebase, db);
      await saveAssetsManifestDoc(db, syncedList);
      safeSetItem('assetwatch_assets', JSON.stringify(syncedList));
      return syncedList;
    } catch (e) {
      checkAndNotifyQuotaError(e, 'getAssets');
      console.error('Firebase getAssets failed, falling back to localStorage:', e);
    }
  }

  // LocalStorage Fallback
  const syncedLocal = await syncBloodBagAssets(localList, false, null);
  return syncedLocal;
};

/**
 * Automatically sync all assets that have surveys with attached photos:
 * If an asset has no real photo or only has a default placeholder image,
 * update its imageUrl to the latest survey photo in both memory, localStorage, and Firestore.
 */
export const syncAssetsWithSurveyPhotos = async (
  assetsList: Asset[], 
  surveysList: SurveyRecord[]
): Promise<{ syncedAssets: Asset[]; updatedCount: number }> => {
  if (!assetsList.length || !surveysList.length) {
    return { syncedAssets: assetsList, updatedCount: 0 };
  }

  // 1. Map each asset to its latest survey photo
  const latestPhotoMap = new Map<string, string>();
  const sortedSurveys = [...surveysList].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  for (const s of sortedSurveys) {
    if (s.assetId && s.imageUrl && s.imageUrl.trim() && !isDefaultPlaceholder(s.imageUrl)) {
      latestPhotoMap.set(s.assetId, s.imageUrl);
    }
  }

  if (latestPhotoMap.size === 0) {
    return { syncedAssets: assetsList, updatedCount: 0 };
  }

  // 2. Identify assets needing photo update
  const toUpdate: Asset[] = [];
  const syncedAssets = assetsList.map(asset => {
    const surveyPhoto = latestPhotoMap.get(asset.id);
    if (surveyPhoto && isDefaultPlaceholder(asset.imageUrl)) {
      const updatedAsset = { ...asset, imageUrl: surveyPhoto };
      toUpdate.push(updatedAsset);
      return updatedAsset;
    }
    return asset;
  });

  if (toUpdate.length === 0) {
    return { syncedAssets: assetsList, updatedCount: 0 };
  }

  console.log(`Auto-syncing ${toUpdate.length} asset photos from survey records...`);

  // 3. Update localStorage
  try {
    safeSetItem('assetwatch_assets', JSON.stringify(syncedAssets));
  } catch (err) {
    console.warn('Failed to update localStorage with synced photos:', err);
  }

  // Note: Individual asset image is already persisted to Firestore upon survey submission (addSurvey).
  // Omitting bulk Firestore write loop here saves hundreds of unnecessary Cloud Writes.
  return { syncedAssets, updatedCount: toUpdate.length };
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

/**
 * On-demand Image Fetcher:
 * Checks local cache (LocalStorage) first for 0 cloud reads.
 * If not present or only placeholder, queries Firestore specifically for this asset's photo (1 Read).
 * Caches the result in LocalStorage to eliminate repeated reads.
 */
export const fetchAssetImageOnDemand = async (
  assetId: string
): Promise<{ imageUrl: string | null; source: 'survey' | 'asset' | null }> => {
  if (!assetId) return { imageUrl: null, source: null };

  // 1. Check LocalStorage first (0 Reads)
  try {
    const localSurveys: SurveyRecord[] = JSON.parse(localStorage.getItem('assetwatch_surveys') || '[]');
    const matchingSurveys = localSurveys
      .filter(s => s.assetId === assetId && s.imageUrl && s.imageUrl.trim() && !isDefaultPlaceholder(s.imageUrl))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    if (matchingSurveys.length > 0 && matchingSurveys[0].imageUrl) {
      return { imageUrl: matchingSurveys[0].imageUrl, source: 'survey' };
    }

    const localAssets: Asset[] = JSON.parse(localStorage.getItem('assetwatch_assets') || '[]');
    const localAsset = localAssets.find(a => a.id === assetId);
    if (localAsset && localAsset.imageUrl && !isDefaultPlaceholder(localAsset.imageUrl)) {
      return { imageUrl: localAsset.imageUrl, source: 'asset' };
    }
  } catch (err) {
    console.warn('LocalStorage check error in fetchAssetImageOnDemand:', err);
  }

  // 2. Query Firestore On-Demand (1 Read)
  const { isFirebase, db } = getServices();
  if (isFirebase && db) {
    try {
      // First check latest survey for this asset
      const surveyQ = query(
        collection(db, 'surveys'),
        where('assetId', '==', assetId),
        limit(3)
      );
      const surveySnap = await getDocs(surveyQ);
      let foundSurveyImg: string | null = null;
      surveySnap.forEach((docSnap) => {
        const data = docSnap.data() as SurveyRecord;
        if (data.imageUrl && !isDefaultPlaceholder(data.imageUrl) && !foundSurveyImg) {
          foundSurveyImg = data.imageUrl;
        }
      });

      if (foundSurveyImg) {
        // Cache to local surveys so future requests cost 0 reads
        try {
          const localSurveys: SurveyRecord[] = JSON.parse(localStorage.getItem('assetwatch_surveys') || '[]');
          const idx = localSurveys.findIndex(s => s.assetId === assetId);
          if (idx !== -1) {
            localSurveys[idx].imageUrl = foundSurveyImg;
            safeSetItem('assetwatch_surveys', JSON.stringify(localSurveys));
          }
        } catch {}
        return { imageUrl: foundSurveyImg, source: 'survey' };
      }

      // If no survey photo, check individual asset document
      const assetDocSnap = await getDoc(doc(db, 'assets', assetId));
      if (assetDocSnap.exists()) {
        const data = assetDocSnap.data() as Asset;
        if (data.imageUrl && !isDefaultPlaceholder(data.imageUrl)) {
          // Cache to local assets so future requests cost 0 reads
          try {
            const localAssets: Asset[] = JSON.parse(localStorage.getItem('assetwatch_assets') || '[]');
            const idx = localAssets.findIndex(a => a.id === assetId);
            if (idx !== -1) {
              localAssets[idx].imageUrl = data.imageUrl;
              safeSetItem('assetwatch_assets', JSON.stringify(localAssets));
            }
          } catch {}
          return { imageUrl: data.imageUrl, source: 'asset' };
        }
      }
    } catch (e) {
      console.warn('On-demand image fetch from Firestore failed:', e);
    }
  }

  return { imageUrl: null, source: null };
};

export const addAsset = async (asset: Asset): Promise<void> => {
  // 1. LocalStorage update
  initLocalStorageIfNeeded();
  const assets: Asset[] = JSON.parse(localStorage.getItem('assetwatch_assets') || '[]');
  if (assets.some(a => a.id === asset.id)) {
    throw new Error('รหัสครุภัณฑ์นี้มีอยู่แล้วในระบบ');
  }
  assets.push(asset);
  safeSetItem('assetwatch_assets', JSON.stringify(assets));

  // 2. Sync to Firebase Firestore
  const { isFirebase, db } = getServices();
  if (isFirebase && db) {
    try {
      const docRef = doc(db, 'assets', asset.id);
      await setDoc(docRef, sanitizeForFirestore(asset as any));
      // Auto-update manifest (1 write)
      await saveAssetsManifestDoc(db, assets);
      return;
    } catch (e) {
      checkAndNotifyQuotaError(e, 'addAsset');
      console.error('Firebase addAsset failed, saved to localStorage:', e);
    }
  }
};

export const addAssetsBulk = async (newAssets: Asset[]): Promise<void> => {
  // 1. LocalStorage update
  initLocalStorageIfNeeded();
  const assets: Asset[] = JSON.parse(localStorage.getItem('assetwatch_assets') || '[]');
  const existingIds = new Set(assets.map(a => a.id));
  const uniqueNewAssets = newAssets.filter(a => !existingIds.has(a.id));
  assets.push(...uniqueNewAssets);
  safeSetItem('assetwatch_assets', JSON.stringify(assets));

  // 2. Sync to Firebase Firestore
  const { isFirebase, db } = getServices();
  if (isFirebase && db) {
    try {
      await Promise.all(newAssets.map(async (asset) => {
        const docRef = doc(db, 'assets', asset.id);
        await setDoc(docRef, sanitizeForFirestore(asset as any));
      }));
      // Auto-update manifest
      await saveAssetsManifestDoc(db, assets);
      return;
    } catch (e) {
      console.error('Firebase addAssetsBulk failed, saved to localStorage:', e);
    }
  }
};


export const updateAsset = async (id: string, updates: Partial<Asset>): Promise<void> => {
  const sanitizedUpdates = { ...updates };
  if (sanitizedUpdates.note && sanitizedUpdates.note.includes('สำรวจล่าสุด:')) {
    sanitizedUpdates.note = cleanAssetNote(sanitizedUpdates.note);
  }

  // 1. Update LocalStorage first to guarantee immediate success locally
  initLocalStorageIfNeeded();
  const assets: Asset[] = JSON.parse(localStorage.getItem('assetwatch_assets') || '[]');
  const index = assets.findIndex(a => a.id === id);
  if (index !== -1) {
    assets[index] = { ...assets[index], ...sanitizedUpdates, updatedAt: new Date().toISOString() };
    safeSetItem('assetwatch_assets', JSON.stringify(assets));
  } else {
    const newAsset = { id, ...sanitizedUpdates, updatedAt: new Date().toISOString() } as Asset;
    assets.push(newAsset);
    safeSetItem('assetwatch_assets', JSON.stringify(assets));
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
      const nowIso = new Date().toISOString();
      const firestorePayload = sanitizeForFirestore({
        ...sanitizedUpdates,
        updatedAt: sanitizedUpdates.updatedAt || nowIso
      });
      await setDoc(doc(db, 'assets', id), firestorePayload, { merge: true });
      // Auto-update manifest in background
      saveAssetsManifestDoc(db, assets);
    } catch (e) {
      checkAndNotifyQuotaError(e, 'updateAsset');
      console.error('Firebase updateAsset failed:', e);
      throw e;
    }
  }
};

export const deleteAsset = async (id: string): Promise<void> => {
  // 1. LocalStorage update first
  initLocalStorageIfNeeded();
  const assets: Asset[] = JSON.parse(localStorage.getItem('assetwatch_assets') || '[]');
  const filtered = assets.filter(a => a.id !== id);
  localStorage.setItem('assetwatch_assets', JSON.stringify(filtered));

  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      const docRef = doc(db, 'assets', id);
      await deleteDoc(docRef);
      // Auto-update manifest
      await saveAssetsManifestDoc(db, filtered);
      return;
    } catch (e) {
      console.error('Firebase deleteAsset failed, falling back to localStorage:', e);
    }
  }
};

// --- AUDIT TRAIL SERVICES ---
export const getAuditTrails = async (): Promise<AuditTrail[]> => {
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      // Hard cap to latest 100 entries to prevent reading unbounded thousands of audit logs
      const q = query(collection(db, 'audit_trails'), orderBy('timestamp', 'desc'), limit(100));
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
        return localAudits.slice(0, 100).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }

      safeSetItem('assetwatch_audits', JSON.stringify(list));
      return list;
    } catch (e) {
      checkAndNotifyQuotaError(e, 'getAuditTrails');
      console.error('Firebase getAuditTrails failed, falling back to localStorage:', e);
    }
  }

  initLocalStorageIfNeeded();
  const localAudits: AuditTrail[] = JSON.parse(localStorage.getItem('assetwatch_audits') || '[]');
  return localAudits.slice(0, 100).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const addAuditTrail = async (trail: Omit<AuditTrail, 'id'>): Promise<void> => {
  const id = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const fullTrail: AuditTrail = { id, ...trail };
  
  // 1. Update LocalStorage first
  initLocalStorageIfNeeded();
  try {
    const audits: AuditTrail[] = JSON.parse(localStorage.getItem('assetwatch_audits') || '[]');
    audits.unshift(fullTrail);
    // Keep max 200 audits in local cache to prevent quota bloating
    safeSetItem('assetwatch_audits', JSON.stringify(audits.slice(0, 200)));
  } catch (err) {
    console.warn('LocalStorage audit cache update failed:', err);
  }

  // 2. Sync to Firebase Firestore
  const { isFirebase, db } = getServices();
  if (isFirebase && db) {
    try {
      const docRef = doc(db, 'audit_trails', id);
      await setDoc(docRef, sanitizeForFirestore(fullTrail as any));
      return;
    } catch (e) {
      checkAndNotifyQuotaError(e, 'addAuditTrail');
      console.error('Firebase addAuditTrail failed, saved to localStorage:', e);
    }
  }
};

// --- SURVEY SERVICES ---

// Deduplicate surveys: keep only the latest survey per (assetId + roundId) pair.
// This prevents phantom duplicates from failed retries or stale localStorage merges.
const deduplicateSurveys = (surveys: SurveyRecord[]): SurveyRecord[] => {
  const map = new Map<string, SurveyRecord>();
  // Sort oldest first so newest overwrites
  const sorted = [...surveys].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  for (const s of sorted) {
    const key = `${s.assetId}__${s.roundId}`;
    map.set(key, s);
  }
  return Array.from(map.values());
};

const syncRestoredSurveys = async (surveys: SurveyRecord[], isFirebase: boolean, db: any): Promise<SurveyRecord[]> => {
  const existingMap = new Map<string, SurveyRecord>();
  surveys.forEach(s => existingMap.set(s.assetId, s));
  
  const missingSurveys = RESTORED_FURNITURE_SURVEYS.filter(s => !existingMap.has(s.assetId));
  if (missingSurveys.length > 0) {
    console.log(`Restoring ${missingSurveys.length} missing furniture surveys...`);
    surveys = [...surveys, ...missingSurveys];
    
    // Save to local storage
    safeSetItem('assetwatch_surveys', JSON.stringify(deduplicateSurveys(surveys)));
    
    // Also sync to Firestore if configured
    if (isFirebase && db) {
      try {
        for (const s of missingSurveys) {
          await setDoc(doc(db, 'surveys', s.id), sanitizeForFirestore(s));
        }
        await saveSurveysManifestDoc(db, surveys);
      } catch (e) {
        console.warn('Failed to sync restored surveys to Firestore:', e);
      }
    }
  }
  return surveys;
};

export const getSurveys = async (forceFull: boolean = false): Promise<SurveyRecord[]> => {
  // Read local cache first
  initLocalStorageIfNeeded();
  let localSurveys: SurveyRecord[] = JSON.parse(localStorage.getItem('assetwatch_surveys') || '[]');

  const { isFirebase, db } = getServices();
  if (isFirebase && db) {
    try {
      // 1. MANIFEST-FIRST STRATEGY (1 READ ONLY!)
      const manifestDoc = await fetchSurveysManifestDoc(db);
      if (manifestDoc && manifestDoc.items && manifestDoc.items.length > 0) {
        const cloudUpdatedAt = manifestDoc.updatedAt || '';
        let localMaxTimestamp = '';
        for (const s of localSurveys) {
          if (s.timestamp && s.timestamp > localMaxTimestamp) {
            localMaxTimestamp = s.timestamp;
          }
        }

        // If local cache is valid and up-to-date, return directly (0 further reads)
        if (!forceFull && localSurveys.length >= manifestDoc.items.length && localMaxTimestamp >= cloudUpdatedAt) {
          const withRestored = await syncRestoredSurveys(localSurveys, isFirebase, db);
          const deduped = deduplicateSurveys(withRestored);
          return deduped.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        }

        console.log(`[Manifest Engine] Loaded ${manifestDoc.items.length} surveys from manifest (1 Read)!`);
        const mergedSurveys = mergeSurveysWithLocalCache(manifestDoc.items, localSurveys);
        const withRestored = await syncRestoredSurveys(mergedSurveys, isFirebase, db);
        const deduped = deduplicateSurveys(withRestored);
        safeSetItem('assetwatch_surveys', JSON.stringify(deduped));
        return deduped.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }

      // 2. FALLBACK & AUTO-SEED MANIFEST:
      console.log('[Manifest Engine] manifests/surveys not found on cloud. Auto-generating manifest...');
      const q = query(collection(db, 'surveys'));
      const snapshot = await getDocs(q);
      const fbList: SurveyRecord[] = [];
      snapshot.forEach((docSnap) => {
        fbList.push({ id: docSnap.id, ...docSnap.data() } as SurveyRecord);
      });

      // Merge local and remote avoiding ID duplicates
      const mergedMap = new Map<string, SurveyRecord>();
      localSurveys.forEach(s => mergedMap.set(s.id, s));
      fbList.forEach(s => mergedMap.set(s.id, s));
      
      const mergedList = deduplicateSurveys(Array.from(mergedMap.values()));
      const withRestored = await syncRestoredSurveys(mergedList, isFirebase, db);
      const deduped = deduplicateSurveys(withRestored);
      await saveSurveysManifestDoc(db, deduped);
      safeSetItem('assetwatch_surveys', JSON.stringify(deduped));
      return deduped.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (e) {
      checkAndNotifyQuotaError(e, 'getSurveys');
      console.error('Firebase getSurveys failed, returning local cache:', e);
    }
  }

  // Deduplicate local cache too
  const withRestored = await syncRestoredSurveys(localSurveys, false, null);
  const deduped = deduplicateSurveys(withRestored);
  safeSetItem('assetwatch_surveys', JSON.stringify(deduped));
  return deduped.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const addSurvey = async (survey: Omit<SurveyRecord, 'id'>): Promise<void> => {
  const id = `survey-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const fullSurvey: SurveyRecord = { id, ...survey };
  
  // 1. Always write to local storage first as a secure offline cache
  initLocalStorageIfNeeded();
  let dedupedList: SurveyRecord[] = [];
  try {
    const localSurveys: SurveyRecord[] = JSON.parse(localStorage.getItem('assetwatch_surveys') || '[]');
    localSurveys.push(fullSurvey);
    // Deduplicate immediately to prevent phantom count growth
    dedupedList = deduplicateSurveys(localSurveys);
    safeSetItem('assetwatch_surveys', JSON.stringify(dedupedList));
  } catch (err) {
    console.warn('LocalStorage survey cache update failed:', err);
  }

  // 2. Then try to sync to Firebase Firestore (sanitize to strip undefined values)
  const { isFirebase, db } = getServices();
  if (isFirebase && db) {
    try {
      const docRef = doc(db, 'surveys', id);
      await setDoc(docRef, sanitizeForFirestore(fullSurvey as any));
      // Auto-update manifest in background (1 write)
      if (dedupedList.length > 0) {
        await saveSurveysManifestDoc(db, dedupedList);
      }
    } catch (e) {
      checkAndNotifyQuotaError(e, 'addSurvey');
      console.error('Firebase addSurvey failed, but saved locally:', e);
    }
  }

  // 3. If survey has an attached photo, automatically sync it as the asset's current photo
  if (survey.imageUrl && survey.imageUrl.trim() && !isDefaultPlaceholder(survey.imageUrl)) {
    try {
      await updateAsset(survey.assetId, { imageUrl: survey.imageUrl });
    } catch (imgErr) {
      console.warn('Failed to auto-update asset image from survey:', imgErr);
    }
  }
};

export const updateSurvey = async (id: string, updates: Partial<SurveyRecord>): Promise<void> => {
  initLocalStorageIfNeeded();
  const surveys: SurveyRecord[] = JSON.parse(localStorage.getItem('assetwatch_surveys') || '[]');
  const index = surveys.findIndex(s => s.id === id);
  if (index !== -1) {
    surveys[index] = { ...surveys[index], ...updates };
    safeSetItem('assetwatch_surveys', JSON.stringify(surveys));
  }
  const { isFirebase, db } = getServices();
  if (isFirebase && db) {
    try {
      const docRef = doc(db, 'surveys', id);
      await setDoc(docRef, sanitizeForFirestore(updates as any), { merge: true });
      await saveSurveysManifestDoc(db, surveys);
    } catch (e) {
      console.error('Firebase updateSurvey failed:', e);
    }
  }
};

// --- REPAIR SERVICES ---
export const getRepairs = async (forceFull: boolean = false): Promise<RepairCase[]> => {
  initLocalStorageIfNeeded();
  const localRepairs: RepairCase[] = JSON.parse(localStorage.getItem('assetwatch_repairs') || '[]');

  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      // 1. MANIFEST-FIRST STRATEGY (1 READ ONLY!)
      const manifestDoc = await fetchRepairsManifestDoc(db);
      if (manifestDoc && manifestDoc.items) {
        const cloudUpdatedAt = manifestDoc.updatedAt || '';
        let localMaxUpdatedAt = '';
        for (const r of localRepairs) {
          if (r.updatedAt && r.updatedAt > localMaxUpdatedAt) {
            localMaxUpdatedAt = r.updatedAt;
          }
        }

        if (!forceFull && localRepairs.length >= manifestDoc.items.length && localMaxUpdatedAt >= cloudUpdatedAt) {
          return localRepairs.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
        }

        console.log(`[Manifest Engine] Loaded ${manifestDoc.items.length} repairs from manifest (1 Read)!`);
        const localMap = new Map<string, RepairCase>();
        localRepairs.forEach(r => localMap.set(r.id, r));
        const manifestIds = new Set<string>();

        const mergedRepairs = manifestDoc.items.map(m => {
          manifestIds.add(m.id);
          const loc = localMap.get(m.id);
          if (loc) {
            return {
              ...m,
              symptomImageUrl: m.symptomImageUrl || loc.symptomImageUrl,
              sentProofUrl: m.sentProofUrl || loc.sentProofUrl,
              receivedProofUrl: m.receivedProofUrl || loc.receivedProofUrl,
              symptomImages: (m.symptomImages && m.symptomImages.length > 0) ? m.symptomImages : loc.symptomImages,
              sentProofImages: (m.sentProofImages && m.sentProofImages.length > 0) ? m.sentProofImages : loc.sentProofImages,
              receivedProofImages: (m.receivedProofImages && m.receivedProofImages.length > 0) ? m.receivedProofImages : loc.receivedProofImages
            };
          }
          return m;
        });

        // Preserve offline-created repairs that have not yet synced to cloud manifest
        for (const local of localRepairs) {
          if (!manifestIds.has(local.id)) {
            mergedRepairs.push(local);
          }
        }

        safeSetItem('assetwatch_repairs', JSON.stringify(mergedRepairs));
        return mergedRepairs.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
      }

      // 2. FALLBACK & AUTO-SEED MANIFEST:
      console.log('[Manifest Engine] manifests/repairs not found on cloud. Auto-generating manifest...');
      const q = query(collection(db, 'repairs'), orderBy('updatedAt', 'desc'));
      const snapshot = await getDocs(q);
      const fbList: RepairCase[] = [];
      snapshot.forEach((doc) => {
        fbList.push({ id: doc.id, ...doc.data() } as RepairCase);
      });

      const map = new Map<string, RepairCase>();
      localRepairs.forEach(r => map.set(r.id, r));
      fbList.forEach(r => map.set(r.id, r));
      const merged = Array.from(map.values()).sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
      
      await saveRepairsManifestDoc(db, merged);
      safeSetItem('assetwatch_repairs', JSON.stringify(merged));
      return merged;
    } catch (e) {
      checkAndNotifyQuotaError(e, 'getRepairs');
      console.error('Firebase getRepairs failed, falling back to localStorage:', e);
    }
  }

  // LocalStorage Fallback
  return localRepairs.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
};

export const addRepair = async (repair: Omit<RepairCase, 'id'>): Promise<string> => {
  const id = `rep-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const fullRepair: RepairCase = { id, ...repair };
  
  // 1. Update LocalStorage first
  initLocalStorageIfNeeded();
  let updatedRepairs: RepairCase[] = [];
  try {
    const repairs: RepairCase[] = JSON.parse(localStorage.getItem('assetwatch_repairs') || '[]');
    const index = repairs.findIndex(r => r.id === id);
    if (index !== -1) {
      repairs[index] = fullRepair;
    } else {
      repairs.push(fullRepair);
    }
    updatedRepairs = repairs;
    safeSetItem('assetwatch_repairs', JSON.stringify(repairs));
  } catch (err) {
    console.warn('LocalStorage addRepair cache failed:', err);
  }

  // 2. Sync to Firebase Firestore
  const { isFirebase, db } = getServices();
  if (isFirebase && db) {
    try {
      const docRef = doc(db, 'repairs', id);
      await setDoc(docRef, sanitizeForFirestore(fullRepair as any));
      if (updatedRepairs.length > 0) {
        await saveRepairsManifestDoc(db, updatedRepairs);
      }
      return id;
    } catch (e) {
      console.error('Firebase addRepair failed, saved to localStorage:', e);
    }
  }

  return id;
};

export const updateRepair = async (id: string, updates: Partial<RepairCase>): Promise<void> => {
  // 1. Update LocalStorage first
  initLocalStorageIfNeeded();
  let updatedRepairs: RepairCase[] = [];
  try {
    const repairs: RepairCase[] = JSON.parse(localStorage.getItem('assetwatch_repairs') || '[]');
    const index = repairs.findIndex(r => r.id === id);
    if (index !== -1) {
      repairs[index] = { ...repairs[index], ...updates, updatedAt: new Date().toISOString() };
      safeSetItem('assetwatch_repairs', JSON.stringify(repairs));
    } else {
      const newRepair = { id, ...updates, updatedAt: new Date().toISOString() } as RepairCase;
      repairs.push(newRepair);
      safeSetItem('assetwatch_repairs', JSON.stringify(repairs));
    }
    updatedRepairs = repairs;
  } catch (err) {
    console.warn('LocalStorage updateRepair cache failed:', err);
  }

  // 2. Sync to Firestore using setDoc with merge
  const { isFirebase, db } = getServices();
  if (isFirebase && db) {
    try {
      await setDoc(doc(db, 'repairs', id), sanitizeForFirestore(updates), { merge: true });
      if (updatedRepairs.length > 0) {
        saveRepairsManifestDoc(db, updatedRepairs);
      }
    } catch (e) {
      console.error('Firebase updateRepair failed:', e);
      throw e;
    }
  }
};

export const deleteRepair = async (id: string): Promise<void> => {
  // 1. Remove from LocalStorage
  initLocalStorageIfNeeded();
  let filtered: RepairCase[] = [];
  try {
    const repairs: RepairCase[] = JSON.parse(localStorage.getItem('assetwatch_repairs') || '[]');
    filtered = repairs.filter(r => r.id !== id);
    safeSetItem('assetwatch_repairs', JSON.stringify(filtered));
  } catch (err) {
    console.warn('LocalStorage deleteRepair cache failed:', err);
  }

  // 2. Remove from Firebase
  const { isFirebase, db } = getServices();
  if (isFirebase && db) {
    try {
      await deleteDoc(doc(db, 'repairs', id));
      await saveRepairsManifestDoc(db, filtered);
    } catch (e) {
      console.error('Firebase deleteRepair failed:', e);
      throw e;
    }
  }
};

// --- SURVEY ROUND SERVICES ---
export const getSurveyRounds = async (): Promise<SurveyRound[]> => {
  // Local-first: always read local cache first
  initLocalStorageIfNeeded();
  const localRounds: SurveyRound[] = JSON.parse(localStorage.getItem('assetwatch_survey_rounds') || '[]');

  const { isFirebase, db } = getServices();
  if (isFirebase && db) {
    try {
      // No orderBy to avoid needing a Firestore index
      const q = query(collection(db, 'survey_rounds'));
      const snapshot = await getDocs(q);
      const fbList: SurveyRound[] = [];
      snapshot.forEach((docSnap) => {
        fbList.push({ id: docSnap.id, ...docSnap.data() } as SurveyRound);
      });

      // Seeding Firestore if completely empty — push local rounds to cloud
      if (fbList.length === 0 && localRounds.length > 0) {
        for (const round of localRounds) {
          await setDoc(doc(db, 'survey_rounds', round.id), sanitizeForFirestore(round as any));
        }
        return localRounds.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
      }

      // Merge local and remote avoiding duplicates (cloud wins on conflicts)
      const mergedMap = new Map<string, SurveyRound>();
      localRounds.forEach(r => mergedMap.set(r.id, r));
      fbList.forEach(r => mergedMap.set(r.id, r));
      
      const mergedList = Array.from(mergedMap.values());
      localStorage.setItem('assetwatch_survey_rounds', JSON.stringify(mergedList));
      return mergedList.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
    } catch (e) {
      console.error('Firebase getSurveyRounds failed, returning local cache:', e);
    }
  }

  return localRounds.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
};

export const addSurveyRound = async (round: SurveyRound): Promise<void> => {
  // 1. Always write to local storage first
  initLocalStorageIfNeeded();
  const rounds: SurveyRound[] = JSON.parse(localStorage.getItem('assetwatch_survey_rounds') || '[]');
  rounds.push(round);
  localStorage.setItem('assetwatch_survey_rounds', JSON.stringify(rounds));

  // 2. Then sync to Firestore
  const { isFirebase, db } = getServices();
  if (isFirebase && db) {
    try {
      const docRef = doc(db, 'survey_rounds', round.id);
      await setDoc(docRef, sanitizeForFirestore(round as any));
    } catch (e) {
      console.error('Firebase addSurveyRound failed, but saved locally:', e);
    }
  }
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
          await setDoc(doc(db, 'departments', dept.id), sanitizeForFirestore(dept as any));
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
  // 1. LocalStorage update
  initLocalStorageIfNeeded();
  const depts: DepartmentLocationConfig[] = JSON.parse(localStorage.getItem('assetwatch_departments') || '[]');
  depts.push(dept);
  localStorage.setItem('assetwatch_departments', JSON.stringify(depts));

  // 2. Sync to Firebase Firestore
  const { isFirebase, db } = getServices();
  if (isFirebase && db) {
    try {
      const docRef = doc(db, 'departments', dept.id);
      await setDoc(docRef, sanitizeForFirestore(dept as any));
      return;
    } catch (e) {
      console.error('Firebase addDepartment failed, saved to localStorage:', e);
    }
  }
};

export const updateDepartment = async (id: string, updates: Partial<DepartmentLocationConfig>): Promise<void> => {
  // 1. LocalStorage update
  initLocalStorageIfNeeded();
  const depts: DepartmentLocationConfig[] = JSON.parse(localStorage.getItem('assetwatch_departments') || '[]');
  const index = depts.findIndex(d => d.id === id);
  if (index !== -1) {
    depts[index] = { ...depts[index], ...updates };
    localStorage.setItem('assetwatch_departments', JSON.stringify(depts));
  }

  // 2. Sync to Firebase Firestore
  const { isFirebase, db } = getServices();
  if (isFirebase && db) {
    try {
      await setDoc(doc(db, 'departments', id), sanitizeForFirestore(updates), { merge: true });
    } catch (e) {
      console.error('Firebase updateDepartment failed:', e);
    }
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
  const contracts = await getPMContracts();
  const schedules = await getPMSchedules();
  const spareParts = await fetchSpareParts();

  const backupObj = {
    version: '1.2.0',
    exportedAt: new Date().toISOString(),
    assets,
    audits,
    repairs,
    surveys,
    rounds,
    departments,
    users,
    contracts,
    schedules,
    spareParts
  };

  return JSON.stringify(backupObj, null, 2);
};

export interface RestoreProgress {
  current: number;
  total: number;
  percent: number;
  currentStep: string;
  detail?: string;
}

export interface ImportResult {
  success: boolean;
  message: string;
  stats?: {
    assets: number;
    surveys: number;
    repairs: number;
    audits: number;
    departments: number;
    users: number;
    rounds: number;
    contracts?: number;
    schedules?: number;
    spareParts?: number;
  };
}

export const importBackupData = async (
  jsonString: string,
  onProgress?: (progress: RestoreProgress) => void
): Promise<ImportResult> => {
  try {
    const backupObj = JSON.parse(jsonString);
    if (!backupObj.assets || !Array.isArray(backupObj.assets)) {
      return { success: false, message: 'โครงสร้างไฟล์สำรองข้อมูลไม่ถูกต้อง (ไม่พบข้อมูลครุภัณฑ์ assets)' };
    }

    const assets = Array.isArray(backupObj.assets) ? backupObj.assets : [];
    const audits = Array.isArray(backupObj.audits) ? backupObj.audits : [];
    const repairs = Array.isArray(backupObj.repairs) ? backupObj.repairs : [];
    const surveys = Array.isArray(backupObj.surveys) ? backupObj.surveys : [];
    const rounds = Array.isArray(backupObj.rounds) ? backupObj.rounds : [];
    const departments = Array.isArray(backupObj.departments) ? backupObj.departments : [];
    const users = Array.isArray(backupObj.users) ? backupObj.users : [];
    const contracts = Array.isArray(backupObj.contracts) ? backupObj.contracts : [];
    const schedules = Array.isArray(backupObj.schedules) ? backupObj.schedules : [];
    const spareParts = Array.isArray(backupObj.spareParts) ? backupObj.spareParts : [];

    const totalRecords = assets.length + audits.length + repairs.length + surveys.length + rounds.length + departments.length + users.length + contracts.length + schedules.length + spareParts.length;
    let processedRecords = 0;

    const reportProgress = (stepName: string, detailText?: string) => {
      const percent = totalRecords > 0 
        ? Math.min(95, Math.max(1, Math.round((processedRecords / totalRecords) * 95))) 
        : 10;
      onProgress?.({
        current: processedRecords,
        total: totalRecords,
        percent,
        currentStep: stepName,
        detail: detailText || `${processedRecords} / ${totalRecords} รายการ (${percent}%)`
      });
    };

    onProgress?.({
      current: 0,
      total: totalRecords,
      percent: 2,
      currentStep: 'กำลังเตรียมข้อมูลและโครงสร้าง...',
      detail: `พบข้อมูลทั้งหมด ${totalRecords.toLocaleString()} รายการ`
    });

    const { isFirebase, db } = getServices();

    if (isFirebase && db) {
      // Chunked writes to Firestore
      const chunkAndWrite = async (collectionName: string, items: any[], label: string) => {
        if (!items || items.length === 0) return;
        const CHUNK_SIZE = 25;
        for (let i = 0; i < items.length; i += CHUNK_SIZE) {
          const chunk = items.slice(i, i + CHUNK_SIZE);
          await Promise.all(
            chunk.map(async (item) => {
              if (item && item.id) {
                await setDoc(doc(db, collectionName, item.id), sanitizeForFirestore(item));
              }
            })
          );
          processedRecords += chunk.length;
          reportProgress(`กำลังบันทึก${label} ขึ้นระบบคลาวด์...`, `${processedRecords} / ${totalRecords} รายการ (${label} ${Math.min(i + CHUNK_SIZE, items.length)}/${items.length})`);
        }
      };

      try {
        await chunkAndWrite('assets', assets, 'ข้อมูลครุภัณฑ์');
        await chunkAndWrite('surveys', surveys, 'ผลการสำรวจและรูปภาพ');
        await chunkAndWrite('repairs', repairs, 'เคสแจ้งซ่อม');
        await chunkAndWrite('audit_trails', audits, 'ประวัติกิจกรรม');
        await chunkAndWrite('survey_rounds', rounds, 'รอบสำรวจ');
        await chunkAndWrite('departments', departments, 'ข้อมูลหน่วยงาน');
        await chunkAndWrite('users', users, 'บัญชีผู้ใช้งาน');
        if (contracts.length > 0) await chunkAndWrite('pm_contracts', contracts, 'สัญญา PM');
        if (schedules.length > 0) await chunkAndWrite('pm_schedules', schedules, 'แผนบำรุงรักษา PM');
        if (spareParts.length > 0) await chunkAndWrite('spare_parts', spareParts, 'คลังอะไหล่');

        // Regenerate Cloud Manifest Indexes for All Modules
        reportProgress('กำลังสร้างไฟล์สารบัญคลาวด์ Manifest Index...', 'บันทึกสารบัญครุภัณฑ์, สำรวจ, แจ้งซ่อม, PM และอะไหล่');
        if (assets.length > 0) await saveAssetsManifestDoc(db, assets);
        if (surveys.length > 0) await saveSurveysManifestDoc(db, surveys);
        if (repairs.length > 0) await saveRepairsManifestDoc(db, repairs);
        const finalContracts = contracts.length > 0 ? contracts : JSON.parse(localStorage.getItem('assetwatch_contracts') || '[]');
        const finalSchedules = schedules.length > 0 ? schedules : JSON.parse(localStorage.getItem('assetwatch_schedules') || '[]');
        const finalSpareParts = spareParts.length > 0 ? spareParts : JSON.parse(localStorage.getItem('assetwatch_spare_parts') || '[]');
        await savePMManifestDoc(db, finalContracts, finalSchedules);
        await saveSparePartsManifestDoc(db, finalSpareParts);
      } catch (err: any) {
        checkAndNotifyQuotaError(err, 'importBackupData');
        console.warn('Firebase batch restore warning, continuing to local storage:', err);
      }
    } else {
      // Offline / LocalStorage only mode
      const stages = [
        { count: assets.length, label: 'ข้อมูลครุภัณฑ์' },
        { count: surveys.length, label: 'ผลการสำรวจ' },
        { count: repairs.length, label: 'เคสแจ้งซ่อม' },
        { count: audits.length, label: 'ประวัติกิจกรรม' },
        { count: rounds.length + departments.length + users.length, label: 'การตั้งค่าและผู้ใช้' },
        { count: contracts.length + schedules.length + spareParts.length, label: 'สัญญา PM และอะไหล่' }
      ];

      for (const stage of stages) {
        processedRecords += stage.count;
        reportProgress(`กำลังบันทึก ${stage.label}...`, `${processedRecords} / ${totalRecords} รายการ`);
        await new Promise(resolve => setTimeout(resolve, 80));
      }
    }

    // Always keep LocalStorage in sync or write to LocalStorage
    onProgress?.({
      current: totalRecords,
      total: totalRecords,
      percent: 98,
      currentStep: 'กำลังอัปเดตระบบแคช LocalStorage...',
      detail: 'บันทึกข้อมูลและรีเฟรชหน่วยความจำ'
    });

    safeSetItem('assetwatch_assets', JSON.stringify(assets));
    safeSetItem('assetwatch_audits', JSON.stringify(audits));
    safeSetItem('assetwatch_repairs', JSON.stringify(repairs));
    safeSetItem('assetwatch_surveys', JSON.stringify(surveys));
    safeSetItem('assetwatch_survey_rounds', JSON.stringify(rounds.length > 0 ? rounds : JSON.parse(localStorage.getItem('assetwatch_survey_rounds') || '[]')));
    safeSetItem('assetwatch_departments', JSON.stringify(departments.length > 0 ? departments : INITIAL_DEPARTMENTS));
    if (users.length > 0) {
      safeSetItem('assetwatch_users', JSON.stringify(users));
    }
    if (contracts.length > 0) safeSetItem('assetwatch_contracts', JSON.stringify(contracts));
    if (schedules.length > 0) safeSetItem('assetwatch_schedules', JSON.stringify(schedules));
    if (spareParts.length > 0) safeSetItem('assetwatch_spare_parts', JSON.stringify(spareParts));

    onProgress?.({
      current: totalRecords,
      total: totalRecords,
      percent: 100,
      currentStep: 'กู้คืนฐานข้อมูลเสร็จสมบูรณ์ 100%',
      detail: `นำเข้าข้อมูลเรียบร้อยทั้งหมด ${totalRecords.toLocaleString()} รายการ`
    });

    return { 
      success: true, 
      message: `กู้คืนฐานข้อมูลสำเร็จเรียบร้อยทั้งหมด ${totalRecords.toLocaleString()} รายการ (ครุภัณฑ์ ${assets.length} รายการ, ผลสำรวจ ${surveys.length} รายการ)`,
      stats: {
        assets: assets.length,
        surveys: surveys.length,
        repairs: repairs.length,
        audits: audits.length,
        departments: departments.length,
        users: users.length,
        rounds: rounds.length,
        contracts: contracts.length,
        schedules: schedules.length,
        spareParts: spareParts.length
      }
    };
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
  // 1. LocalStorage update
  initLocalStorageIfNeeded();
  const users: UserAccount[] = JSON.parse(localStorage.getItem('assetwatch_users') || '[]');
  const index = users.findIndex(u => u.id === user.id);
  if (index !== -1) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem('assetwatch_users', JSON.stringify(users));

  // 2. Sync to Firebase Firestore
  const { isFirebase, db } = getServices();
  if (isFirebase && db) {
    try {
      const docRef = doc(db, 'users', user.id);
      await setDoc(docRef, sanitizeForFirestore(user as any));
      return;
    } catch (e) {
      console.error('Firebase addOrUpdateUser failed, saved to localStorage:', e);
    }
  }
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

// Helper to sync PM Manifest Doc
const syncCurrentPMManifest = async (db: any) => {
  try {
    const contracts: PMContract[] = JSON.parse(localStorage.getItem('assetwatch_contracts') || '[]');
    const schedules: PMSchedule[] = JSON.parse(localStorage.getItem('assetwatch_schedules') || '[]');
    await savePMManifestDoc(db, contracts, schedules);
  } catch (err) {
    console.warn('Failed to sync PM manifest:', err);
  }
};

// --- PM CONTRACT SERVICES ---
export const getPMContracts = async (): Promise<PMContract[]> => {
  initLocalStorageIfNeeded();
  const localContracts: PMContract[] = JSON.parse(localStorage.getItem('assetwatch_contracts') || '[]');
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      // 1. MANIFEST-FIRST STRATEGY (1 READ ONLY!)
      const manifestDoc = await fetchPMManifestDoc(db);
      if (manifestDoc && manifestDoc.contracts) {
        console.log(`[Manifest Engine] Loaded ${manifestDoc.contracts.length} PM contracts & ${manifestDoc.schedules?.length || 0} schedules from manifest (1 Read)!`);
        localStorage.setItem('assetwatch_contracts', JSON.stringify(manifestDoc.contracts));
        if (manifestDoc.schedules && manifestDoc.schedules.length > 0) {
          localStorage.setItem('assetwatch_schedules', JSON.stringify(manifestDoc.schedules));
        }
        return manifestDoc.contracts;
      }

      // 2. FALLBACK & AUTO-SEED MANIFEST:
      console.log('[Manifest Engine] manifests/pm not found on cloud. Auto-generating manifest...');
      const q = query(collection(db, 'pm_contracts'));
      const snapshot = await getDocs(q);
      const list: PMContract[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as PMContract);
      });

      const localSchedules: PMSchedule[] = JSON.parse(localStorage.getItem('assetwatch_schedules') || '[]');
      if (list.length === 0) {
        const seedContracts = localContracts.length > 0 ? localContracts : INITIAL_CONTRACTS;
        for (const contract of seedContracts) {
          await setDoc(doc(db, 'pm_contracts', contract.id), contract);
        }
        await savePMManifestDoc(db, seedContracts, localSchedules);
        return seedContracts;
      }

      await savePMManifestDoc(db, list, localSchedules);
      localStorage.setItem('assetwatch_contracts', JSON.stringify(list));
      return list;
    } catch (e) {
      console.error('Firebase getPMContracts failed, falling back to localStorage:', e);
    }
  }

  return localContracts;
};

export const addPMContract = async (contract: PMContract): Promise<void> => {
  // 1. Update LocalStorage first
  initLocalStorageIfNeeded();
  const contracts: PMContract[] = JSON.parse(localStorage.getItem('assetwatch_contracts') || '[]');
  contracts.push(contract);
  localStorage.setItem('assetwatch_contracts', JSON.stringify(contracts));

  // 2. Sync to Firebase Firestore
  const { isFirebase, db } = getServices();
  if (isFirebase && db) {
    try {
      await setDoc(doc(db, 'pm_contracts', contract.id), sanitizeForFirestore(contract as any));
      await syncCurrentPMManifest(db);
      return;
    } catch (e) {
      console.error('Firebase addPMContract failed, saved to localStorage:', e);
    }
  }
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
      syncCurrentPMManifest(db);
    } catch (e) {
      console.error('Firebase updatePMContract failed:', e);
      throw e;
    }
  }
};

export const deletePMContract = async (id: string): Promise<void> => {
  initLocalStorageIfNeeded();
  const contracts: PMContract[] = JSON.parse(localStorage.getItem('assetwatch_contracts') || '[]');
  const filtered = contracts.filter(c => c.id !== id);
  localStorage.setItem('assetwatch_contracts', JSON.stringify(filtered));

  const { isFirebase, db } = getServices();
  if (isFirebase && db) {
    try {
      await deleteDoc(doc(db, 'pm_contracts', id));
      await syncCurrentPMManifest(db);
      return;
    } catch (e) {
      console.error('Firebase deletePMContract failed, falling back to localStorage:', e);
    }
  }
};

// --- PM SCHEDULE SERVICES ---
export const getPMSchedules = async (): Promise<PMSchedule[]> => {
  initLocalStorageIfNeeded();
  const localSchedules: PMSchedule[] = JSON.parse(localStorage.getItem('assetwatch_schedules') || '[]');
  const { isFirebase, db } = getServices();
  
  if (isFirebase && db) {
    try {
      // 1. MANIFEST-FIRST STRATEGY (1 READ ONLY!)
      const manifestDoc = await fetchPMManifestDoc(db);
      if (manifestDoc && manifestDoc.schedules) {
        console.log(`[Manifest Engine] Loaded ${manifestDoc.schedules.length} PM schedules from manifest (1 Read)!`);
        if (manifestDoc.contracts && manifestDoc.contracts.length > 0) {
          localStorage.setItem('assetwatch_contracts', JSON.stringify(manifestDoc.contracts));
        }
        localStorage.setItem('assetwatch_schedules', JSON.stringify(manifestDoc.schedules));
        return manifestDoc.schedules;
      }

      // 2. FALLBACK & AUTO-SEED MANIFEST:
      console.log('[Manifest Engine] manifests/pm not found on cloud. Auto-generating manifest...');
      const q = query(collection(db, 'pm_schedules'));
      const snapshot = await getDocs(q);
      const list: PMSchedule[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as PMSchedule);
      });

      const localContracts: PMContract[] = JSON.parse(localStorage.getItem('assetwatch_contracts') || '[]');
      if (list.length === 0) {
        const seedSchedules = localSchedules.length > 0 ? localSchedules : INITIAL_SCHEDULES;
        for (const sched of seedSchedules) {
          await setDoc(doc(db, 'pm_schedules', sched.id), sanitizeForFirestore(sched as any));
        }
        await savePMManifestDoc(db, localContracts, seedSchedules);
        return seedSchedules;
      }

      await savePMManifestDoc(db, localContracts, list);
      localStorage.setItem('assetwatch_schedules', JSON.stringify(list));
      return list;
    } catch (e) {
      console.error('Firebase getPMSchedules failed, falling back to localStorage:', e);
    }
  }

  return localSchedules;
};

export const addPMSchedule = async (schedule: PMSchedule): Promise<void> => {
  // 1. Update LocalStorage first
  initLocalStorageIfNeeded();
  const schedules: PMSchedule[] = JSON.parse(localStorage.getItem('assetwatch_schedules') || '[]');
  schedules.push(schedule);
  localStorage.setItem('assetwatch_schedules', JSON.stringify(schedules));

  // 2. Sync to Firebase Firestore
  const { isFirebase, db } = getServices();
  if (isFirebase && db) {
    try {
      await setDoc(doc(db, 'pm_schedules', schedule.id), sanitizeForFirestore(schedule as any));
      await syncCurrentPMManifest(db);
      return;
    } catch (e) {
      console.error('Firebase addPMSchedule failed, saved to localStorage:', e);
    }
  }
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
      syncCurrentPMManifest(db);
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
      const q = query(collection(db, 'pm_notifications'), limit(100));
      const snapshot = await getDocs(q);
      const list: PMNotification[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as PMNotification);
      });

      if (list.length === 0) {
        initLocalStorageIfNeeded();
        const localNotifications: PMNotification[] = JSON.parse(localStorage.getItem('assetwatch_pm_notifications') || '[]');
        for (const notif of localNotifications) {
          await setDoc(doc(db, 'pm_notifications', notif.id), sanitizeForFirestore(notif as any));
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
  // 1. Update LocalStorage first
  initLocalStorageIfNeeded();
  const notifications: PMNotification[] = JSON.parse(localStorage.getItem('assetwatch_pm_notifications') || '[]');
  notifications.push(notification);
  localStorage.setItem('assetwatch_pm_notifications', JSON.stringify(notifications));

  // 2. Sync to Firebase Firestore
  const { isFirebase, db } = getServices();
  if (isFirebase && db) {
    try {
      await setDoc(doc(db, 'pm_notifications', notification.id), sanitizeForFirestore(notification as any));
      return;
    } catch (e) {
      console.error('Firebase addPMNotification failed, saved to localStorage:', e);
    }
  }
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
  initLocalStorageIfNeeded();
  const schedules: PMSchedule[] = JSON.parse(localStorage.getItem('assetwatch_schedules') || '[]');
  const filtered = schedules.filter(s => s.id !== id);
  localStorage.setItem('assetwatch_schedules', JSON.stringify(filtered));

  const { isFirebase, db } = getServices();
  if (isFirebase && db) {
    try {
      await deleteDoc(doc(db, 'pm_schedules', id));
      await syncCurrentPMManifest(db);
    } catch (e) {
      console.error('Firebase deletePMSchedule failed, falling back to localStorage:', e);
    }
  }
};

// --- SPARE PARTS (คลังอะไหล่) DATABASE OPERATIONS ---
export const fetchSpareParts = async (forceFull: boolean = false): Promise<SparePart[]> => {
  initLocalStorageIfNeeded();
  const localParts: SparePart[] = JSON.parse(localStorage.getItem('assetwatch_spare_parts') || '[]');
  const { isFirebase, db } = getServices();

  if (isFirebase && db) {
    try {
      // 1. MANIFEST-FIRST STRATEGY (1 READ ONLY!)
      const manifestDoc = await fetchSparePartsManifestDoc(db);
      if (manifestDoc && manifestDoc.items) {
        console.log(`[Manifest Engine] Loaded ${manifestDoc.items.length} spare parts from manifest (1 Read)!`);
        safeSetItem('assetwatch_spare_parts', JSON.stringify(manifestDoc.items));
        return manifestDoc.items;
      }

      // 2. FALLBACK & AUTO-SEED MANIFEST:
      console.log('[Manifest Engine] manifests/spare_parts not found on cloud. Auto-generating manifest...');
      const q = query(collection(db, 'spare_parts'));
      const snapshot = await getDocs(q);
      const fbList: SparePart[] = [];
      snapshot.forEach((docSnap) => {
        fbList.push(docSnap.data() as SparePart);
      });

      if (fbList.length === 0 && localParts.length === 0) {
        const seedParts = INITIAL_SPARE_PARTS;
        for (const p of seedParts) {
          await setDoc(doc(db, 'spare_parts', p.id), sanitizeForFirestore(p));
        }
        await saveSparePartsManifestDoc(db, seedParts);
        safeSetItem('assetwatch_spare_parts', JSON.stringify(seedParts));
        return seedParts;
      }

      const map = new Map<string, SparePart>();
      localParts.forEach(p => map.set(p.id, p));
      fbList.forEach(p => map.set(p.id, p));
      const merged = Array.from(map.values());
      await saveSparePartsManifestDoc(db, merged);
      safeSetItem('assetwatch_spare_parts', JSON.stringify(merged));
      return merged;
    } catch (err) {
      console.error('Failed to fetch spare parts from Firestore, falling back to LocalStorage:', err);
    }
  }
  return localParts;
};

export const saveSparePart = async (part: SparePart): Promise<void> => {
  const partWithTime = {
    ...part,
    updatedAt: part.updatedAt || new Date().toISOString()
  };
  const parts: SparePart[] = JSON.parse(localStorage.getItem('assetwatch_spare_parts') || '[]');
  const index = parts.findIndex(p => p.id === part.id);
  if (index !== -1) {
    parts[index] = partWithTime;
  } else {
    parts.push(partWithTime);
  }
  safeSetItem('assetwatch_spare_parts', JSON.stringify(parts));

  const { isFirebase, db } = getServices();
  if (isFirebase && db) {
    try {
      await setDoc(doc(db, 'spare_parts', part.id), sanitizeForFirestore(partWithTime));
      await saveSparePartsManifestDoc(db, parts);
    } catch (err) {
      console.error('Failed to save spare part to Firestore, falling back to LocalStorage:', err);
    }
  }
};

export const deleteSparePart = async (id: string): Promise<void> => {
  const parts: SparePart[] = JSON.parse(localStorage.getItem('assetwatch_spare_parts') || '[]');
  const filtered = parts.filter(p => p.id !== id);
  localStorage.setItem('assetwatch_spare_parts', JSON.stringify(filtered));

  const { isFirebase, db } = getServices();
  if (isFirebase && db) {
    try {
      await deleteDoc(doc(db, 'spare_parts', id));
      await saveSparePartsManifestDoc(db, filtered);
    } catch (err) {
      console.error('Failed to delete spare part from Firestore, falling back to LocalStorage:', err);
    }
  }
};

export const factoryResetDatabase = async (): Promise<void> => {
  // 1. Clear LocalStorage
  const keysToClear = [
    'assetwatch_assets',
    'assetwatch_audits',
    'assetwatch_users',
    'assetwatch_repairs',
    'assetwatch_surveys',
    'assetwatch_departments',
    'assetwatch_contracts',
    'assetwatch_schedules',
    'assetwatch_pm_notifications',
    'assetwatch_survey_rounds',
    'assetwatch_spare_parts'
  ];
  keysToClear.forEach(key => localStorage.removeItem(key));

  const { isFirebase, db } = getServices();
  if (isFirebase && db) {
    // 2. Fetch and delete all documents in each collection
    const collectionsToClear = [
      'assets',
      'audit_trails',
      'repairs',
      'surveys',
      'survey_rounds',
      'departments',
      'users',
      'pm_contracts',
      'pm_schedules',
      'pm_notifications',
      'spare_parts',
      'manifests'
    ];

    for (const collName of collectionsToClear) {
      try {
        const q = query(collection(db, collName));
        const snapshot = await getDocs(q);
        const deletePromises: Promise<void>[] = [];
        snapshot.forEach((docSnap) => {
          deletePromises.push(deleteDoc(doc(db, collName, docSnap.id)));
        });
        await Promise.all(deletePromises);
      } catch (err) {
        console.error(`Failed to clear Firestore collection ${collName}:`, err);
      }
    }

    // 3. Write initial seed data back to Firestore
    try {
      const { BLOOD_BAG_ASSETS } = await import('../utils/bloodBagAssetsData');
      const seedAssets = [...INITIAL_ASSETS, ...BLOOD_BAG_ASSETS];
      for (const asset of seedAssets) {
        await setDoc(doc(db, 'assets', asset.id), sanitizeForFirestore(asset));
      }
      for (const audit of INITIAL_AUDITS) {
        await setDoc(doc(db, 'audit_trails', audit.id), sanitizeForFirestore(audit));
      }
      for (const user of INITIAL_USERS) {
        await setDoc(doc(db, 'users', user.id), sanitizeForFirestore(user));
      }
      for (const repair of INITIAL_REPAIRS) {
        await setDoc(doc(db, 'repairs', repair.id), sanitizeForFirestore(repair));
      }
      for (const dept of INITIAL_DEPARTMENTS) {
        await setDoc(doc(db, 'departments', dept.id), sanitizeForFirestore(dept));
      }
      for (const contract of INITIAL_CONTRACTS) {
        await setDoc(doc(db, 'pm_contracts', contract.id), sanitizeForFirestore(contract));
      }
      for (const schedule of INITIAL_SCHEDULES) {
        await setDoc(doc(db, 'pm_schedules', schedule.id), sanitizeForFirestore(schedule));
      }
      for (const notification of INITIAL_NOTIFICATIONS) {
        await setDoc(doc(db, 'pm_notifications', notification.id), sanitizeForFirestore(notification));
      }
      for (const part of INITIAL_SPARE_PARTS) {
        await setDoc(doc(db, 'spare_parts', part.id), sanitizeForFirestore(part));
      }

      // Default active survey round
      const defaultActiveRound: SurveyRound = {
        id: 'round-default',
        name: 'รอบสำรวจประจำปีงบประมาณ 2569 (ปีปัจจุบัน)',
        dateCreated: new Date().toISOString(),
        status: 'active',
        totalAssets: seedAssets.length,
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
      await setDoc(doc(db, 'survey_rounds', defaultActiveRound.id), sanitizeForFirestore(defaultActiveRound));

      // 4. Save initial manifests
      await saveAssetsManifestDoc(db, seedAssets);
      await saveSurveysManifestDoc(db, []);
      await saveRepairsManifestDoc(db, INITIAL_REPAIRS);
      await savePMManifestDoc(db, INITIAL_CONTRACTS, INITIAL_SCHEDULES);
      await saveSparePartsManifestDoc(db, INITIAL_SPARE_PARTS);
    } catch (err) {
      console.error('Failed to seed Firestore initial data after clear:', err);
      throw err;
    }
  }

  // 5. Initialize LocalStorage
  initLocalStorageIfNeeded();
};
