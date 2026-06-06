/**
 * useAuth Hook
 * 
 * Custom React hook that manages Firebase authentication state.
 * Wraps onAuthStateChanged and auto-fetches user profile from RTDB.
 * Falls back to local simulation mode when Firebase is not configured.
 */

import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config';
import {
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  getUserProfile,
  isAuthAvailable,
} from '../services/authService';
import { UserProfile, Language } from '../types';

interface UseAuthReturn {
  /** Firebase Auth user object (null in local mode or if signed out) */
  user: User | null;
  /** User profile from RTDB */
  userProfile: UserProfile | null;
  /** True while auth state is being determined */
  loading: boolean;
  /** Error message from the last auth operation */
  error: string | null;
  /** Whether the user is authenticated (works in both Firebase and local mode) */
  isAuthenticated: boolean;
  /** The meter ID associated with this user */
  meterId: string | null;
  /** Whether we're running in Firebase mode vs local simulation */
  isFirebaseMode: boolean;
  /** Sign in with email and password */
  signIn: (email: string, password: string) => Promise<boolean>;
  /** Create new account */
  signUp: (email: string, password: string, name: string, language?: Language) => Promise<boolean>;
  /** Sign out */
  signOut: () => Promise<void>;
  /** Clear any current error */
  clearError: () => void;
}

// localStorage key for local simulation mode
const LOCAL_STORAGE_PREFIX = 'electro_book_';

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [localAuth, setLocalAuth] = useState<boolean>(false);

  const firebaseMode = isFirebaseConfigured() && isAuthAvailable();

  // Firebase Auth state listener
  useEffect(() => {
    if (firebaseMode && auth) {
      const unsubscribe = onAuthStateChanged(
        auth,
        async (firebaseUser) => {
          setUser(firebaseUser);
          if (firebaseUser) {
            // Auto-fetch profile from RTDB
            try {
              const profile = await getUserProfile(firebaseUser.uid);
              setUserProfile(profile);
            } catch (err) {
              console.error('[useAuth] Failed to fetch user profile:', err);
              setUserProfile(null);
            }
          } else {
            setUserProfile(null);
          }
          setLoading(false);
        },
        (err) => {
          console.error('[useAuth] Auth state change error:', err);
          setError('Authentication error occurred.');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      // Local mode: check localStorage for saved login state
      const savedLogin = localStorage.getItem(LOCAL_STORAGE_PREFIX + 'isLoggedIn');
      setLocalAuth(savedLogin === 'true');
      setLoading(false);
    }
  }, [firebaseMode]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setError(null);
      setLoading(true);

      if (firebaseMode) {
        try {
          await authSignIn(email, password);
          // onAuthStateChanged will update state
          setLoading(false);
          return true;
        } catch (err: any) {
          setError(err.message || 'Sign in failed.');
          setLoading(false);
          return false;
        }
      } else {
        // Local fallback: hardcoded credentials
        if (
          email.trim().toLowerCase() === 'electrobook' &&
          password === '1234'
        ) {
          setLocalAuth(true);
          localStorage.setItem(LOCAL_STORAGE_PREFIX + 'isLoggedIn', 'true');
          setLoading(false);
          return true;
        } else {
          setError(
            'වැරදි පරිශීලක නාමයක් හෝ මුරපදයක්! (Try: username: electrobook, password: 1234)'
          );
          setLoading(false);
          return false;
        }
      }
    },
    [firebaseMode]
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      name: string,
      language: Language = 'en'
    ): Promise<boolean> => {
      setError(null);
      setLoading(true);

      if (firebaseMode) {
        try {
          await authSignUp(email, password, name, language);
          setLoading(false);
          return true;
        } catch (err: any) {
          setError(err.message || 'Sign up failed.');
          setLoading(false);
          return false;
        }
      } else {
        // In local mode, just "sign in"
        setLocalAuth(true);
        localStorage.setItem(LOCAL_STORAGE_PREFIX + 'isLoggedIn', 'true');
        setLoading(false);
        return true;
      }
    },
    [firebaseMode]
  );

  const signOut = useCallback(async (): Promise<void> => {
    setError(null);

    if (firebaseMode) {
      try {
        await authSignOut();
      } catch (err: any) {
        setError(err.message || 'Sign out failed.');
      }
    } else {
      setLocalAuth(false);
      localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'isLoggedIn');
    }

    setUser(null);
    setUserProfile(null);
  }, [firebaseMode]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const isAuthenticated = firebaseMode ? user !== null : localAuth;
  const meterId = userProfile?.meterId || (localAuth ? 'DEMO_METER_001' : null);

  return {
    user,
    userProfile,
    loading,
    error,
    isAuthenticated,
    meterId,
    isFirebaseMode: firebaseMode,
    signIn,
    signUp,
    signOut,
    clearError,
  };
}
