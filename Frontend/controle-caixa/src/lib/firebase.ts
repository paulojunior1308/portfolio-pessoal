import { initializeApp, FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

if (
  !import.meta.env.VITE_FIREBASE_API_KEY ||
  !import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
  !import.meta.env.VITE_FIREBASE_PROJECT_ID ||
  !import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
  !import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
  !import.meta.env.VITE_FIREBASE_APP_ID
) {
  throw new Error('Missing Firebase configuration environment variables');
}

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);