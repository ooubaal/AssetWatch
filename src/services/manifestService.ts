import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getFirebaseServices } from '../firebase';
import { 
  Asset, 
  SurveyRecord, 
  RepairCase, 
  PMContract, 
  PMSchedule, 
  SparePart,
  INITIAL_ASSETS,
  INITIAL_REPAIRS,
  INITIAL_CONTRACTS,
  INITIAL_SCHEDULES,
  INITIAL_SPARE_PARTS
} from '../utils/mockData';

// --- MANIFEST TYPES ---

export interface AssetManifestItem {
  id: string;
  name: string;
  location: string;
  department: string;
  status: Asset['status'];
  receivedDate?: string;
  source?: string;
  responsiblePerson?: string;
  note?: string;
  imageUrl?: string; // Kept only if light Storage URL; Base64 is stripped to keep doc < 1MB
  hasImage: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssetsManifestDoc {
  version: number;
  updatedAt: string;
  total: number;
  items: AssetManifestItem[];
  deletedIds?: string[];
}

export interface SurveyManifestItem {
  id: string;
  assetId: string;
  roundId: string;
  status: string;
  operator: string;
  timestamp: string;
  imageUrl?: string; // Kept only if light Storage URL; Base64 is stripped
  hasImage: boolean;
}

export interface SurveysManifestDoc {
  version: number;
  updatedAt: string;
  total: number;
  items: SurveyManifestItem[];
}

export interface RepairsManifestDoc {
  version: number;
  updatedAt: string;
  total: number;
  items: RepairCase[];
}

export interface PMManifestDoc {
  version: number;
  updatedAt: string;
  contracts: PMContract[];
  schedules: PMSchedule[];
}

export interface SparePartsManifestDoc {
  version: number;
  updatedAt: string;
  total: number;
  items: SparePart[];
}

// --- SANITIZE HELPER ---
export const sanitizeForFirestore = (obj: any): any => {
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

// --- PAYLOAD DECOUPLING HELPER ---
// Decouples massive Base64 strings and PDF blobs from the lightweight manifest index.
// Cloud URLs (https://firebasestorage...) or static paths are lightweight and preserved.
export const stripHeavyPayload = (url?: string): { cleanUrl: string; hasHeavyPayload: boolean } => {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return { cleanUrl: '', hasHeavyPayload: false };
  }
  const trimmed = url.trim();
  // Heavy Base64 data URI (data:image/... or data:application/pdf...)
  if (trimmed.startsWith('data:')) {
    return { cleanUrl: '', hasHeavyPayload: true };
  }
  // Standard web URLs, cloud CDN, or relative assets
  return { cleanUrl: trimmed, hasHeavyPayload: false };
};

// --- TRANSFORMERS ---

export const toAssetManifestItem = (asset: Asset): AssetManifestItem => {
  const { cleanUrl, hasHeavyPayload } = stripHeavyPayload(asset.imageUrl);
  return {
    id: asset.id,
    name: asset.name || '',
    location: asset.location || '',
    department: asset.department || '',
    status: asset.status || 'ใช้งานได้',
    receivedDate: asset.receivedDate || '',
    source: asset.source || '',
    responsiblePerson: asset.responsiblePerson || '',
    note: asset.note || '',
    imageUrl: cleanUrl,
    hasImage: hasHeavyPayload || Boolean(cleanUrl),
    createdAt: asset.createdAt || new Date().toISOString(),
    updatedAt: asset.updatedAt || new Date().toISOString()
  };
};

export const toSurveyManifestItem = (survey: SurveyRecord): SurveyManifestItem => {
  const { cleanUrl, hasHeavyPayload } = stripHeavyPayload(survey.imageUrl);
  return {
    id: survey.id,
    assetId: survey.assetId,
    roundId: survey.roundId || 'round-default',
    status: survey.status || 'ใช้งานได้',
    operator: survey.operator || '',
    timestamp: survey.timestamp || new Date().toISOString(),
    imageUrl: cleanUrl,
    hasImage: hasHeavyPayload || Boolean(cleanUrl)
  };
};

// Strip heavy base64 proof images / PDFs from repair cases in manifest
export const toRepairManifestItem = (repair: RepairCase): RepairCase => {
  const { cleanUrl: cleanSymptomImg } = stripHeavyPayload(repair.symptomImageUrl);
  const { cleanUrl: cleanSentProof } = stripHeavyPayload(repair.sentProofUrl);
  const { cleanUrl: cleanReceivedProof } = stripHeavyPayload(repair.receivedProofUrl);

  const cleanSymptomImages = (repair.symptomImages || [])
    .map(url => stripHeavyPayload(url).cleanUrl)
    .filter(Boolean);

  const cleanSentProofImages = (repair.sentProofImages || [])
    .map(url => stripHeavyPayload(url).cleanUrl)
    .filter(Boolean);

  const cleanReceivedProofImages = (repair.receivedProofImages || [])
    .map(url => stripHeavyPayload(url).cleanUrl)
    .filter(Boolean);

  return {
    ...repair,
    symptomImageUrl: cleanSymptomImg,
    sentProofUrl: cleanSentProof,
    receivedProofUrl: cleanReceivedProof,
    symptomImages: cleanSymptomImages,
    sentProofImages: cleanSentProofImages,
    receivedProofImages: cleanReceivedProofImages
  };
};

// --- TOMBSTONE / DELETED ASSET TRACKING ---
const DELETED_ASSETS_KEY = 'assetwatch_deleted_asset_ids';

export const getLocalDeletedAssetIds = (): string[] => {
  try {
    const val = localStorage.getItem(DELETED_ASSETS_KEY);
    const list: string[] = val ? JSON.parse(val) : [];
    // Pre-seed known confirmed deleted item from user
    if (!list.includes('0725606515045440040')) {
      list.push('0725606515045440040');
    }
    return list;
  } catch {
    return ['0725606515045440040'];
  }
};

export const addLocalDeletedAssetId = (id: string): void => {
  if (!id) return;
  try {
    const list = getLocalDeletedAssetIds();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(DELETED_ASSETS_KEY, JSON.stringify(list.slice(-500)));
    }
  } catch (e) {
    console.warn('Failed to save deleted asset id locally:', e);
  }
};

export const recordLocalDeletedAssetIds = (ids: string[]): void => {
  if (!ids || ids.length === 0) return;
  try {
    const list = getLocalDeletedAssetIds();
    const set = new Set([...list, ...ids]);
    localStorage.setItem(DELETED_ASSETS_KEY, JSON.stringify(Array.from(set).slice(-500)));
  } catch (e) {
    console.warn('Failed to record deleted asset ids locally:', e);
  }
};

// --- MERGE WITH LOCAL IMAGES (PRESERVES EXISTING CLIENT CACHE & OFFLINE RECORDS) ---

export const mergeAssetsWithLocalCache = (
  manifestItems: AssetManifestItem[], 
  localAssets: Asset[], 
  cloudDeletedIds: string[] = []
): Asset[] => {
  const localDeleted = getLocalDeletedAssetIds();
  const deletedSet = new Set([...localDeleted, ...cloudDeletedIds]);

  const localMap = new Map<string, Asset>();
  localAssets.forEach(a => {
    if (!deletedSet.has(a.id)) {
      localMap.set(a.id, a);
    }
  });
  const manifestIds = new Set<string>();

  const merged: Asset[] = manifestItems
    .filter(item => !deletedSet.has(item.id))
    .map(item => {
      manifestIds.add(item.id);
      const local = localMap.get(item.id);
      let finalImageUrl = item.imageUrl || '';
      
      // If manifest stripped heavy base64, but local machine already has the image cached, keep the local image!
      if (!finalImageUrl && local && local.imageUrl) {
        finalImageUrl = local.imageUrl;
      }

      return {
        id: item.id,
        name: item.name,
        location: item.location,
        department: item.department,
        status: item.status,
        receivedDate: item.receivedDate || '',
        source: item.source || '',
        responsiblePerson: item.responsiblePerson || '',
        note: item.note || '',
        imageUrl: finalImageUrl,
        createdAt: item.createdAt || '',
        updatedAt: item.updatedAt || ''
      };
    });

  // Preserve offline-created assets that have not yet synced to cloud manifest (AND NOT DELETED)
  for (const local of localAssets) {
    if (!manifestIds.has(local.id) && !deletedSet.has(local.id)) {
      merged.push(local);
    }
  }

  return merged;
};

export const mergeSurveysWithLocalCache = (manifestItems: SurveyManifestItem[], localSurveys: SurveyRecord[]): SurveyRecord[] => {
  const localMap = new Map<string, SurveyRecord>();
  localSurveys.forEach(s => localMap.set(s.id, s));
  const manifestIds = new Set<string>();

  const merged: SurveyRecord[] = manifestItems.map(item => {
    manifestIds.add(item.id);
    const local = localMap.get(item.id);
    let finalImageUrl = item.imageUrl || '';
    
    if (!finalImageUrl && local && local.imageUrl) {
      finalImageUrl = local.imageUrl;
    }

    return {
      id: item.id,
      assetId: item.assetId,
      roundId: item.roundId,
      status: item.status,
      operator: item.operator,
      timestamp: item.timestamp,
      imageUrl: finalImageUrl || undefined
    };
  });

  // Preserve offline-created surveys that have not yet synced to cloud manifest
  for (const local of localSurveys) {
    if (!manifestIds.has(local.id)) {
      merged.push(local);
    }
  }

  return merged;
};

export const mergeSchedulesWithLocalCache = (manifestSchedules: PMSchedule[], localSchedules: PMSchedule[]): PMSchedule[] => {
  const localMap = new Map<string, PMSchedule>();
  localSchedules.forEach(s => localMap.set(s.id, s));
  const manifestIds = new Set<string>();

  const merged: PMSchedule[] = (manifestSchedules || []).map(item => {
    manifestIds.add(item.id);
    const local = localMap.get(item.id);
    let finalProof = item.proofImageUrl || '';

    // If manifest stripped heavy base64 or has an Unsplash stock photo, keep valid local proof image
    if ((!finalProof || finalProof.includes('images.unsplash.com')) && local && local.proofImageUrl && !local.proofImageUrl.includes('images.unsplash.com')) {
      finalProof = local.proofImageUrl;
    }

    return {
      ...item,
      proofImageUrl: finalProof,
      details: item.details || local?.details || '',
      notes: item.notes || local?.notes || '',
      nextPMNotes: item.nextPMNotes || local?.nextPMNotes || ''
    };
  });

  // Preserve offline-created schedules that have not yet synced to cloud manifest
  for (const local of localSchedules) {
    if (!manifestIds.has(local.id)) {
      merged.push(local);
    }
  }

  return merged;
};

export const mergeContractsWithLocalCache = (manifestContracts: PMContract[], localContracts: PMContract[]): PMContract[] => {
  const localMap = new Map<string, PMContract>();
  localContracts.forEach(c => localMap.set(c.id, c));
  const manifestIds = new Set<string>();

  const merged: PMContract[] = (manifestContracts || []).map(item => {
    manifestIds.add(item.id);
    const local = localMap.get(item.id);
    let finalAttachment = item.attachmentUrl || '';

    if (!finalAttachment && local && local.attachmentUrl) {
      finalAttachment = local.attachmentUrl;
    }

    // Merge assetIds to ensure no assigned asset is dropped
    const mergedAssetIds = Array.from(new Set([
      ...(item.assetIds || []),
      ...(local?.assetIds || [])
    ]));

    return {
      ...item,
      attachmentUrl: finalAttachment,
      assetIds: mergedAssetIds
    };
  });

  // Preserve offline-created contracts that have not yet synced to cloud manifest
  for (const local of localContracts) {
    if (!manifestIds.has(local.id)) {
      merged.push(local);
    }
  }

  return merged;
};

// --- FIRESTORE MANIFEST CRUD HELPERS ---

// 1. Assets Manifest
export const fetchAssetsManifestDoc = async (db: any): Promise<AssetsManifestDoc | null> => {
  try {
    const snap = await getDoc(doc(db, 'manifests', 'assets'));
    if (snap.exists()) {
      const data = snap.data() as AssetsManifestDoc;
      if (data.deletedIds && Array.isArray(data.deletedIds)) {
        recordLocalDeletedAssetIds(data.deletedIds);
      }
      return data;
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch manifests/assets doc:', err);
    return null;
  }
};

export const saveAssetsManifestDoc = async (
  db: any, 
  assets: Asset[], 
  extraDeletedIds: string[] = []
): Promise<void> => {
  try {
    const existing = await fetchAssetsManifestDoc(db);
    const existingDeleted = existing?.deletedIds || [];
    const localDeleted = getLocalDeletedAssetIds();
    const allDeletedSet = new Set([...existingDeleted, ...localDeleted, ...extraDeletedIds]);
    const allDeletedIds = Array.from(allDeletedSet).slice(-500);

    recordLocalDeletedAssetIds(allDeletedIds);

    const items = assets
      .filter(a => !allDeletedSet.has(a.id))
      .map(toAssetManifestItem);

    const manifest: AssetsManifestDoc = {
      version: 1,
      updatedAt: new Date().toISOString(),
      total: items.length,
      items,
      deletedIds: allDeletedIds
    };
    await setDoc(doc(db, 'manifests', 'assets'), sanitizeForFirestore(manifest));
    console.log(`[Manifest Engine] Saved manifests/assets with ${items.length} items and ${allDeletedIds.length} tombstones (1 Write)`);
  } catch (err) {
    console.warn('[Manifest Engine] Failed to save manifests/assets:', err);
  }
};

// 2. Surveys Manifest
export const fetchSurveysManifestDoc = async (db: any): Promise<SurveysManifestDoc | null> => {
  try {
    const snap = await getDoc(doc(db, 'manifests', 'surveys'));
    if (snap.exists()) {
      return snap.data() as SurveysManifestDoc;
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch manifests/surveys doc:', err);
    return null;
  }
};

export const saveSurveysManifestDoc = async (db: any, surveys: SurveyRecord[]): Promise<void> => {
  try {
    // 1. Fetch current manifest first so items from other devices are NEVER lost
    const existing = await fetchSurveysManifestDoc(db);
    const existingItems = existing?.items || [];

    const surveyMap = new Map<string, any>();
    // Load existing items from cloud manifest
    existingItems.forEach(item => {
      surveyMap.set(`${item.assetId}__${item.roundId || 'round-default'}`, {
        id: item.id,
        assetId: item.assetId,
        roundId: item.roundId || 'round-default',
        status: item.status,
        operator: item.operator,
        timestamp: item.timestamp,
        imageUrl: item.imageUrl
      });
    });

    // Merge incoming surveys (overwrites older records for same assetId+roundId)
    surveys.forEach(s => {
      surveyMap.set(`${s.assetId}__${s.roundId || 'round-default'}`, s);
    });

    // Guarantee master base surveys are present
    try {
      const { MASTER_BASE_SURVEYS } = await import('../utils/masterSurveysData');
      MASTER_BASE_SURVEYS.forEach(s => {
        const key = `${s.assetId}__${s.roundId || 'round-default'}`;
        if (!surveyMap.has(key)) {
          surveyMap.set(key, s);
        }
      });
    } catch (e) {
      console.warn('Could not import MASTER_BASE_SURVEYS in saveSurveysManifestDoc:', e);
    }

    const allSurveys = Array.from(surveyMap.values());
    const items = allSurveys.map(toSurveyManifestItem);
    const manifest: SurveysManifestDoc = {
      version: 1,
      updatedAt: new Date().toISOString(),
      total: items.length,
      items
    };
    await setDoc(doc(db, 'manifests', 'surveys'), sanitizeForFirestore(manifest));
    console.log(`[Manifest Engine] Saved manifests/surveys with ${items.length} items (1 Write)`);
  } catch (err) {
    console.warn('[Manifest Engine] Failed to save manifests/surveys:', err);
  }
};

// 3. Repairs Manifest
export const fetchRepairsManifestDoc = async (db: any): Promise<RepairsManifestDoc | null> => {
  try {
    const snap = await getDoc(doc(db, 'manifests', 'repairs'));
    if (snap.exists()) {
      return snap.data() as RepairsManifestDoc;
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch manifests/repairs doc:', err);
    return null;
  }
};

export const saveRepairsManifestDoc = async (db: any, repairs: RepairCase[]): Promise<void> => {
  try {
    const items = repairs.map(toRepairManifestItem);
    const manifest: RepairsManifestDoc = {
      version: 1,
      updatedAt: new Date().toISOString(),
      total: items.length,
      items
    };
    await setDoc(doc(db, 'manifests', 'repairs'), sanitizeForFirestore(manifest));
    console.log(`[Manifest Engine] Saved manifests/repairs with ${items.length} items (1 Write)`);
  } catch (err) {
    console.warn('[Manifest Engine] Failed to save manifests/repairs:', err);
  }
};

// 4. PM Manifest (Contracts & Schedules)
export const fetchPMManifestDoc = async (db: any): Promise<PMManifestDoc | null> => {
  try {
    const snap = await getDoc(doc(db, 'manifests', 'pm'));
    if (snap.exists()) {
      return snap.data() as PMManifestDoc;
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch manifests/pm doc:', err);
    return null;
  }
};

export const savePMManifestDoc = async (db: any, contracts: PMContract[], schedules: PMSchedule[]): Promise<void> => {
  try {
    const cleanContracts = contracts.map(c => {
      const { cleanUrl } = stripHeavyPayload(c.attachmentUrl);
      return { ...c, attachmentUrl: cleanUrl };
    });

    const cleanSchedules = schedules.map(s => {
      const { cleanUrl } = stripHeavyPayload(s.proofImageUrl);
      return { ...s, proofImageUrl: cleanUrl };
    });

    const manifest: PMManifestDoc = {
      version: 1,
      updatedAt: new Date().toISOString(),
      contracts: cleanContracts,
      schedules: cleanSchedules
    };
    await setDoc(doc(db, 'manifests', 'pm'), sanitizeForFirestore(manifest));
    console.log(`[Manifest Engine] Saved manifests/pm (1 Write)`);
  } catch (err) {
    console.warn('[Manifest Engine] Failed to save manifests/pm:', err);
  }
};

// 5. Spare Parts Manifest
export const fetchSparePartsManifestDoc = async (db: any): Promise<SparePartsManifestDoc | null> => {
  try {
    const snap = await getDoc(doc(db, 'manifests', 'spare_parts'));
    if (snap.exists()) {
      return snap.data() as SparePartsManifestDoc;
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch manifests/spare_parts doc:', err);
    return null;
  }
};

export const saveSparePartsManifestDoc = async (db: any, parts: SparePart[]): Promise<void> => {
  try {
    const cleanParts = parts.map(p => {
      const { cleanUrl } = stripHeavyPayload(p.imageUrl);
      return { ...p, imageUrl: cleanUrl };
    });

    const manifest: SparePartsManifestDoc = {
      version: 1,
      updatedAt: new Date().toISOString(),
      total: cleanParts.length,
      items: cleanParts
    };
    await setDoc(doc(db, 'manifests', 'spare_parts'), sanitizeForFirestore(manifest));
    console.log(`[Manifest Engine] Saved manifests/spare_parts with ${cleanParts.length} items (1 Write)`);
  } catch (err) {
    console.warn('[Manifest Engine] Failed to save manifests/spare_parts:', err);
  }
};

// --- ON-DEMAND DEEP DETAIL FETCHERS (LAZY LOADING) ---
// Fetches the full individual document (with large Base64 / attachments) when user opens an item's detail view

export const fetchAssetDeepDetail = async (db: any, assetId: string): Promise<Asset | null> => {
  if (!db || !assetId) return null;
  try {
    const snap = await getDoc(doc(db, 'assets', assetId));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Asset;
    }
    return null;
  } catch (err) {
    console.warn(`[LazyLoader] Failed to fetch asset detail for ${assetId}:`, err);
    return null;
  }
};

export const fetchSurveyDeepDetail = async (db: any, surveyId: string): Promise<SurveyRecord | null> => {
  if (!db || !surveyId) return null;
  try {
    const snap = await getDoc(doc(db, 'surveys', surveyId));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as SurveyRecord;
    }
    return null;
  } catch (err) {
    console.warn(`[LazyLoader] Failed to fetch survey detail for ${surveyId}:`, err);
    return null;
  }
};

export const fetchRepairDeepDetail = async (db: any, repairId: string): Promise<RepairCase | null> => {
  if (!db || !repairId) return null;
  try {
    const snap = await getDoc(doc(db, 'repairs', repairId));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as RepairCase;
    }
    return null;
  } catch (err) {
    console.warn(`[LazyLoader] Failed to fetch repair detail for ${repairId}:`, err);
    return null;
  }
};

export const fetchPMScheduleDeepDetail = async (dbOrId: any, maybeId?: string): Promise<PMSchedule | null> => {
  let targetDb = maybeId ? dbOrId : null;
  let scheduleId = maybeId ? maybeId : dbOrId;

  if (!targetDb) {
    targetDb = getFirebaseServices().db;
  }
  if (!targetDb || !scheduleId) return null;

  try {
    const snap = await getDoc(doc(targetDb, 'pm_schedules', scheduleId));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as PMSchedule;
    }
    return null;
  } catch (err) {
    console.warn(`[LazyLoader] Failed to fetch PM schedule detail for ${scheduleId}:`, err);
    return null;
  }
};

export const fetchPMContractDeepDetail = async (dbOrId: any, maybeId?: string): Promise<PMContract | null> => {
  let targetDb = maybeId ? dbOrId : null;
  let contractId = maybeId ? maybeId : dbOrId;

  if (!targetDb) {
    targetDb = getFirebaseServices().db;
  }
  if (!targetDb || !contractId) return null;

  try {
    const snap = await getDoc(doc(targetDb, 'pm_contracts', contractId));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as PMContract;
    }
    return null;
  } catch (err) {
    console.warn(`[LazyLoader] Failed to fetch PM contract detail for ${contractId}:`, err);
    return null;
  }
};
