/**
 * Authentication Service
 * 
 * Wraps Firebase Auth operations and user profile management in RTDB.
 * Falls back gracefully when Firebase is not configured.
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
  updateProfile,
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, db, isFirebaseConfigured } from '../firebase/config';
import { UserProfile, Language } from '../types';

/**
 * Sign in with email and password via Firebase Auth.
 */
export async function signIn(email: string, password: string): Promise<User> {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please configure Firebase.');
  }
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch (error: any) {
    const errorCode = error?.code || '';
    switch (errorCode) {
      case 'auth/user-not-found':
        throw new Error('No account found with this email. Please sign up first.');
      case 'auth/wrong-password':
        throw new Error('Incorrect password. Please try again.');
      case 'auth/invalid-email':
        throw new Error('Invalid email format.');
      case 'auth/too-many-requests':
        throw new Error('Too many failed attempts. Please try again later.');
      case 'auth/invalid-credential':
        throw new Error('Invalid email or password. Please check and try again.');
      default:
        throw new Error(error?.message || 'Sign in failed. Please try again.');
    }
  }
}

/**
 * Create a new account with email/password and write the user profile to RTDB.
 */
export async function signUp(
  email: string,
  password: string,
  name: string,
  language: Language = 'en'
): Promise<User> {
  if (!auth || !db) {
    throw new Error('Firebase is not initialized. Please configure Firebase.');
  }
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const user = credential.user;

    // Update the Firebase Auth display name
    await updateProfile(user, { displayName: name });

    // Create user profile in RTDB
    const profile: UserProfile = {
      name,
      email,
      phone: '',
      role: 'consumer',
      meterId: `METER_${user.uid.substring(0, 8).toUpperCase()}`,
      createdAt: Date.now(),
      language,
    };

    await set(ref(db, `users/${user.uid}/profile`), profile);

    return user;
  } catch (error: any) {
    const errorCode = error?.code || '';
    switch (errorCode) {
      case 'auth/email-already-in-use':
        throw new Error('This email is already registered. Please sign in instead.');
      case 'auth/weak-password':
        throw new Error('Password is too weak. Use at least 6 characters.');
      case 'auth/invalid-email':
        throw new Error('Invalid email format.');
      default:
        throw new Error(error?.message || 'Sign up failed. Please try again.');
    }
  }
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  if (!auth) return;
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('[AuthService] Sign out error:', error);
    throw new Error('Failed to sign out. Please try again.');
  }
}

/**
 * Get the currently authenticated user (synchronous snapshot).
 */
export function getCurrentUser(): User | null {
  return auth?.currentUser ?? null;
}

/**
 * Read the user profile from RTDB at /users/{uid}/profile.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) return null;
  try {
    const snapshot = await get(ref(db, `users/${uid}/profile`));
    if (snapshot.exists()) {
      return snapshot.val() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('[AuthService] Failed to fetch user profile:', error);
    return null;
  }
}

/**
 * Update the user profile in RTDB.
 */
export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  if (!db) return;
  try {
    const currentProfile = await getUserProfile(uid);
    if (currentProfile) {
      await set(ref(db, `users/${uid}/profile`), { ...currentProfile, ...updates });
    }
  } catch (error) {
    console.error('[AuthService] Failed to update user profile:', error);
    throw new Error('Failed to update profile.');
  }
}

/**
 * Check if Firebase Auth is available and configured.
 */
export function isAuthAvailable(): boolean {
  return isFirebaseConfigured() && auth !== null;
}
