import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, db } from '../firebase/config';

export const useAuth = () => {
  const [user, setUser] = useState<{ email: string, role: string, uid: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let role = 'consumer';
        // Check profile for role
        try {
          const profileSnap = await get(ref(db, `users/${firebaseUser.uid}/profile`));
          if (profileSnap.exists()) {
            role = profileSnap.val().role || 'consumer';
          }
        } catch (e) {
          console.error('Error fetching role:', e);
        }
        setUser({ email: firebaseUser.email || '', role, uid: firebaseUser.uid });
        localStorage.setItem('role', role);
        localStorage.setItem('user', JSON.stringify({ email: firebaseUser.email, role, uid: firebaseUser.uid }));
      } else {
        setUser(null);
        localStorage.removeItem('role');
        localStorage.removeItem('user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
};
