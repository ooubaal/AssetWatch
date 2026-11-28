import { 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInAnonymously,
  User as FirebaseUser
} from 'firebase/auth';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirebaseServices, getStoredFirebaseConfig } from '../firebase';
import { UserAccount } from '../utils/mockData';

export const usernameToEmail = (username: string): string => {
  const clean = username.trim().toLowerCase();
  if (clean.includes('@')) return clean;
  return `${clean}@assetwatch.local`;
};

/**
 * Standard Firebase Authentication with fallback for offline mode
 */
export const loginWithAuth = async (
  username: string, 
  password: string,
  localUsers: UserAccount[]
): Promise<UserAccount> => {
  const { isConfigured, auth } = getFirebaseServices();
  const email = usernameToEmail(username);

  if (isConfigured && auth) {
    try {
      // 1. Authenticate with Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);
    } catch (authError: any) {
      console.warn('Firebase Auth sign-in failed, checking first-time bootstrap or invalid creds:', authError.code);
      
      // Auto-provision initial/seed users if this is the first time connecting to a fresh Firebase project
      if (
        authError.code === 'auth/user-not-found' || 
        authError.code === 'auth/invalid-credential'
      ) {
        const matchedLocal = localUsers.find(
          u => u.username.toLowerCase() === username.trim().toLowerCase()
        );
        
        // If it's a valid local admin or predefined seed user matching the password, register them in Firebase Auth
        if (matchedLocal && matchedLocal.password === password) {
          try {
            await createUserWithEmailAndPassword(auth, email, password);
          } catch (createErr: any) {
            console.error('Failed to auto-provision seed user:', createErr);
            throw new Error('รหัสผ่านไม่ถูกต้อง หรือชื่อผู้ใช้นี้ยังไม่ได้เปิดใช้งาน');
          }
        } else {
          throw new Error('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
        }
      } else if (authError.code === 'auth/wrong-password') {
        throw new Error('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      } else if (authError.code === 'auth/too-many-requests') {
        throw new Error('มีการพยายามเข้าสู่ระบบผิดหลายครั้ง โปรดรอสักครู่แล้วลองใหม่');
      } else {
        throw new Error(authError.message || 'การเข้าสู่ระบบล้มเหลว');
      }
    }
  }

  // Find user profile from local/cached users
  const user = localUsers.find(
    u => u.username.toLowerCase() === username.trim().toLowerCase()
  );

  if (!user) {
    throw new Error('ไม่พบข้อมูลโปรไฟล์ผู้ใช้งานในระบบ');
  }

  if (user.isBlocked) {
    if (auth) await signOut(auth);
    throw new Error('🚫 บัญชีนี้ถูกระงับการใช้งานชั่วคราว กรุณาติดต่อผู้ดูแลระบบ');
  }

  return user;
};

/**
 * Register a new user in Firebase Auth without logging out the currently logged-in Admin
 * Uses a secondary ephemeral Firebase App instance
 */
export const registerUserInAuth = async (username: string, password: string): Promise<void> => {
  const config = getStoredFirebaseConfig();
  if (!config) return; // In offline mode, skip Firebase Auth creation

  const email = usernameToEmail(username);
  const secondaryAppName = `RegisterUser_${Date.now()}`;
  const secondaryApp = initializeApp(config, secondaryAppName);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    await createUserWithEmailAndPassword(secondaryAuth, email, password);
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') {
      console.log('User already exists in Firebase Auth, profile updated.');
    } else {
      console.error('Error creating user in Firebase Auth:', err);
      throw err;
    }
  } finally {
    try {
      await deleteApp(secondaryApp);
    } catch (e) {
      // Ignored
    }
  }
};

/**
 * Standard Sign Out
 */
export const logoutAuth = async (): Promise<void> => {
  const { auth } = getFirebaseServices();
  if (auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Sign out error:', e);
    }
  }
  localStorage.removeItem('assetwatch_session');
};

/**
 * Observe auth state
 */
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  const { auth } = getFirebaseServices();
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
};

/**
 * Ensures Firebase Auth has an active session for Firestore/Storage security rules.
 * If user session exists but Firebase Auth is not signed in (e.g. page reload or quick login),
 * restores Firebase Auth session using user credentials or auto-provisions if needed so that
 * request.auth != null in security rules.
 */
export const ensureFirebaseAuth = async (currentUser?: UserAccount | null): Promise<void> => {
  const { isConfigured, auth } = getFirebaseServices();
  if (!isConfigured || !auth) return;

  if (auth.currentUser) {
    return; // Already authenticated
  }

  // 1. Try to restore from currentUser or localStorage session
  let user = currentUser;
  if (!user) {
    const saved = localStorage.getItem('assetwatch_session');
    if (saved) {
      try {
        user = JSON.parse(saved);
      } catch (e) {}
    }
  }

  if (user && user.username) {
    const email = usernameToEmail(user.username);
    const password = user.password || '123456';
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('[Auth] Restored Firebase Auth session for:', email);
      return;
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          console.log('[Auth] Created & signed in user in Firebase Auth:', email);
          return;
        } catch (createErr) {
          console.warn('[Auth] Auto-creation failed:', createErr);
        }
      } else {
        console.warn('[Auth] Sign in attempt with saved session failed:', err.code);
      }
    }
  }

  // 2. Fallback to anonymous sign-in if enabled
  try {
    await signInAnonymously(auth);
    console.log('[Auth] Authenticated anonymously with Firebase Auth for security rules');
  } catch (e) {
    console.warn('[Auth] Anonymous authentication attempt failed (enable Anonymous or Email/Password in Firebase Console):', e);
  }
};
