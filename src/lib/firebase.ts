import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

// Check if all essential config values are present
const isConfigValid = 
  !!(firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.appId);

let app;
let db: any = null;
let isFirebaseEnabled = false;

if (isConfigValid) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    isFirebaseEnabled = true;
    console.log('✅ Firebase initialized successfully.');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error);
  }
} else {
  console.log('ℹ️ Firebase credentials missing. Running in local persistence sandbox mode.');
}

export { db, isFirebaseEnabled };

export const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 4000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Firebase operation timed out')), timeoutMs)
    )
  ]);
};
