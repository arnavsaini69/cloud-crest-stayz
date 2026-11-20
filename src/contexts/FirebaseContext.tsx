import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';

interface FirebaseContextValue {
  user: User | null;
  authLoading: boolean;
  profileReady: boolean;
  signingIn: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  clearAuthError: () => void;
}

const FirebaseContext = createContext<FirebaseContextValue | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [profileReady, setProfileReady] = useState<boolean>(false);
  const [signingIn, setSigningIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;

      if (!firebaseUser) {
        setUser(null);
        setProfileReady(false);
        setAuthLoading(false);
        return;
      }

      setUser(firebaseUser);
      setProfileReady(false);

      const userPath = `users/${firebaseUser.uid}`;
      const userRef = doc(db, 'users', firebaseUser.uid);

      try {
        const snap = await getDoc(userRef);
        const safeDisplayName =
          (firebaseUser.displayName || 'CloudCrest Member').trim().slice(0, 100) ||
          'CloudCrest Member';
        const safeEmail = (firebaseUser.email || '').trim().slice(0, 254);
        const safePhotoUrl = firebaseUser.photoURL
          ? firebaseUser.photoURL.trim().slice(0, 500)
          : '';

        if (!snap.exists()) {
          try {
            await setDoc(userRef, {
              uid: firebaseUser.uid,
              displayName: safeDisplayName,
              email: safeEmail,
              ...(safePhotoUrl ? { photoURL: safePhotoUrl } : {}),
              role: 'member',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } catch (writeErr) {
            handleFirestoreError(writeErr, OperationType.CREATE, userPath);
          }
        } else {
          try {
            await updateDoc(userRef, {
              displayName: safeDisplayName,
              email: safeEmail,
              ...(safePhotoUrl ? { photoURL: safePhotoUrl } : {}),
              updatedAt: serverTimestamp(),
            });
          } catch (updateErr) {
            handleFirestoreError(updateErr, OperationType.UPDATE, userPath);
          }
        }

        if (isMounted) {
          setProfileReady(true);
        }
      } catch (err) {
        if (err instanceof Error && err.message.startsWith('{')) {
          setAuthError(
            'Unable to verify your member profile with Firestore security rules.'
          );
        } else {
          handleFirestoreError(err, OperationType.GET, userPath);
        }
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    setSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: unknown) {
      const code =
        typeof error === 'object' && error !== null && 'code' in error
          ? String((error as { code: unknown }).code)
          : '';

      if (code === 'auth/popup-closed-by-user') {
        setAuthError(
          'Sign-in window was closed before completing Google registration.'
        );
      } else if (code === 'auth/popup-blocked') {
        setAuthError(
          'Browser blocked the Google sign-in popup. Allow popups for this site and try again.'
        );
      } else if (code === 'auth/unauthorized-domain') {
        const currentHost =
          typeof window !== 'undefined' ? window.location.hostname : 'this domain';
        setAuthError(
          `Domain "${currentHost}" is not authorized for Firebase Sign-In yet. Add "${currentHost}" under Firebase Console → Authentication → Settings → Authorized domains.`
        );
      } else if (code === 'auth/cancelled-popup-request') {
        setAuthError(null);
      } else {
        setAuthError(
          error instanceof Error
            ? error.message
            : 'Unable to complete Google Sign-In. Please try again.'
        );
      }
    } finally {
      setSigningIn(false);
    }
  }, []);

  const signOutUser = useCallback(async () => {
    setAuthError(null);
    await signOut(auth);
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  return (
    <FirebaseContext.Provider
      value={{
        user,
        authLoading,
        profileReady,
        signingIn,
        authError,
        signInWithGoogle,
        signOutUser,
        clearAuthError,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export function useFirebase(): FirebaseContextValue {
  const ctx = useContext(FirebaseContext);
  if (!ctx) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return ctx;
}
