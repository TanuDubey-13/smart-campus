import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration object from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if all essential keys are provided
const isFirebaseConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'your_api_key_here' &&
  firebaseConfig.projectId;

let app;
let auth;
let db;
let storage;
let useMock = true;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    useMock = false;
    console.log('🔥 Firebase Initialized successfully in Production Mode.');
  } catch (error) {
    console.error('⚠️ Firebase failed to initialize. Falling back to Local Mock Mode.', error);
    useMock = true;
  }
} else {
  console.warn(
    'ℹ️ Firebase environment variables are missing or default. Running application in Local Mock Mode (using localStorage persistence).'
  );
  useMock = true;
}

export { auth, db, storage, useMock };
