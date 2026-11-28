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
 * Normalizes password to satisfy Firebase Authentication minimum 6-character requirement.
 * If user enters legacy short passwords like "admin" (5 chars) or "123" (3 chars),
 * it safely deterministic pads with "_amis" (e.g. "admin_amis", "123_amis").
 */
export const normalizeAuthPassword = (pwd: string): string => {
  const trimmed = pwd.trim();
  if (!trimmed) return '';
  if (trimmed.length < 6) {
    return `${trimmed}_amis`;
  }
  return trimmed;
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
  const cleanUsername = username.trim().toLowerCase();

  if (isConfigured && auth) {
    const authPassword = normalizeAuthPassword(password);
    let signedIn = false;

    try {
      // 1. Authenticate with Firebase Auth using normalized password
      await signInWithEmailAndPassword(auth, email, authPassword);
      signedIn = true;
    } catch (authError: any) {
      console.warn('Firebase Auth sign-in failed:', authError.code);
      
      // If normalized failed and password was >=6, try raw password
      if (authPassword !== password && password.length >= 6) {
        try {
          await signInWithEmailAndPassword(auth, email, password);
          signedIn = true;
        } catch (rawErr) {
          // Ignore, continue to auto-provision check
        }
      }

      if (!signedIn) {
        // Auto-provision initial/seed users if this is the first time connecting to a fresh Firebase project
        if (
          authError.code === 'auth/user-not-found' || 
          authError.code === 'auth/invalid-credential'
        ) {
          const matchedLocal = localUsers.find(
            u => u.username.toLowerCase() === cleanUsername
          );
          
          // Allow match against local record or default seed admin/manager passwords
          const isPasswordMatch = Boolean(
            matchedLocal && (
              matchedLocal.password === password ||
              (cleanUsername === 'admin' && (password === 'admin' || password === '123456' || password === 'admin123')) ||
              (!matchedLocal.password && (password === 'admin' || password === '123456' || password === '123'))
            )
          );

          if (isPasswordMatch) {
            try {
              await createUserWithEmailAndPassword(auth, email, authPassword);
              signedIn = true;
            } catch (createErr: any) {
              console.error('Failed to auto-provision seed user:', createErr);
              if (createErr.code === 'auth/email-already-in-use') {
                // User was already created; try raw password sign-in
                try {
                  await signInWithEmailAndPassword(auth, email, password);
                  signedIn = true;
                } catch (signErr) {
                  throw new Error('รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านของคุณ');
                }
              } else {
                throw new Error(`การลงทะเบียนผู้ใช้ล้มเหลว: ${createErr.message || createErr.code}`);
              }
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
  }

  // Find user profile from local/cached users
  const user = localUsers.find(
    u => u.username.toLowerCase() === cleanUsername
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
  const authPassword = normalizeAuthPassword(password);
  const secondaryAppName = `RegisterUser_${Date.now()}`;
  const secondaryApp = initializeApp(config, secondaryAppName);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    await createUserWithEmailAndPassword(secondaryAuth, email, authPassword);
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
    const rawPassword = user.password || 'admin';
    const password = normalizeAuthPassword(rawPassword);
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
