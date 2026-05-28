import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

// Get config from localStorage
export const getStoredFirebaseConfig = (): FirebaseConfig | null => {
  const stored = localStorage.getItem('assetwatch_firebase_config');
  if (!stored) return null;
  try {
    const config = JSON.parse(stored);
    if (config && config.apiKey && config.projectId) {
      return config;
    }
  } catch (e) {
    console.error('Error parsing stored Firebase config:', e);
  }
  return null;
};

// Save config to localStorage
export const saveFirebaseConfig = (config: FirebaseConfig): boolean => {
  try {
    localStorage.setItem('assetwatch_firebase_config', JSON.stringify(config));
    // Test if we can initialize
    return initializeFirebase(config);
  } catch (e) {
    console.error('Error saving Firebase config:', e);
    return false;
  }
};

// Clear config from localStorage
export const clearFirebaseConfig = () => {
  localStorage.removeItem('assetwatch_firebase_config');
  app = null;
  db = null;
  storage = null;
};

// Initialize Firebase dynamically
export const initializeFirebase = (config: FirebaseConfig): boolean => {
  try {
    if (getApps().length > 0) {
      // If already initialized, we might need to recreate it if config changed
      // But typically we'll reload the app. For now, let's reuse or reinit
      app = getApp();
    }
    
    app = initializeApp(config, 'AssetWatchApp');
    db = getFirestore(app);
    storage = getStorage(app);
    return true;
  } catch (e) {
    console.error('Firebase initialization failed:', e);
    return false;
  }
};

// Auto initialize on load if config exists
const initialConfig = getStoredFirebaseConfig();
if (initialConfig) {
  initializeFirebase(initialConfig);
}

export const getFirebaseServices = () => {
  return {
    isConfigured: !!db,
    db,
    storage,
    app
  };
};
