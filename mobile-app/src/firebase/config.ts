/**
 * Firebase Configuration
 * 
 * Replace the placeholder values below with your actual Firebase project credentials.
 * You can find these in your Firebase Console > Project Settings > General > Your apps > Firebase SDK snippet.
 * 
 * IMPORTANT: For production, move these to environment variables (.env file):
 *   VITE_FIREBASE_API_KEY=your-api-key
 *   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
 *   etc.
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'YOUR_PROJECT.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://YOUR_PROJECT-default-rtdb.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'YOUR_PROJECT.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'YOUR_APP_ID',
};

/**
 * Check if Firebase is properly configured (not using placeholder values).
 * When not configured, the app falls back to local simulation mode.
 */
export function isFirebaseConfigured(): boolean {
  return (
    firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
    firebaseConfig.projectId !== 'YOUR_PROJECT_ID' &&
    firebaseConfig.apiKey !== '' &&
    firebaseConfig.projectId !== ''
  );
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Database | null = null;

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getDatabase(app);
    console.log('[ElectroBook] Firebase initialized successfully');
  } catch (error) {
    console.warn('[ElectroBook] Firebase initialization failed, falling back to simulation mode:', error);
    app = null;
    auth = null;
    db = null;
  }
} else {
  console.info('[ElectroBook] Firebase not configured — running in local simulation mode. Update firebase/config.ts with your credentials.');
}

export { app, auth, db };
export default app;
