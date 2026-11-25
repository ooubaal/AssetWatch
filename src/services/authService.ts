import { 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword,
  onAuthStateChanged,
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
