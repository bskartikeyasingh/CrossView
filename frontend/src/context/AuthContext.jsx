import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  googleProvider,
  isFirebaseConfigured,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from '../firebase/config';
import { apiService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('crossview_auth_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync token with backend user profile
  const syncBackendUser = async (authToken, firebaseUser = null) => {
    localStorage.setItem('crossview_auth_token', authToken);
    setToken(authToken);

    try {
      const res = await apiService.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        setUser({
          firebaseUid: firebaseUser?.uid || 'demo-user-123',
          name: firebaseUser?.displayName || firebaseUser?.email?.split('@')[0] || 'CrossView User',
          email: firebaseUser?.email || 'analyst@crossview.news',
          role: 'USER',
        });
      }
    } catch (err) {
      // In development fallback, create a local user profile
      setUser({
        firebaseUid: firebaseUser?.uid || 'demo-user-123',
        name: firebaseUser?.displayName || firebaseUser?.email?.split('@')[0] || 'CrossView User',
        email: firebaseUser?.email || 'analyst@crossview.news',
        role: 'USER',
      });
    }
  };

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const idToken = await firebaseUser.getIdToken();
            await syncBackendUser(idToken, firebaseUser);
          } catch (err) {
            console.error('Error fetching Firebase ID token:', err);
          }
        } else {
          // If no Firebase session and no stored demo token
          const storedToken = localStorage.getItem('crossview_auth_token');
          if (storedToken && storedToken.startsWith('mock_')) {
            await syncBackendUser(storedToken);
          } else {
            setUser(null);
            setToken(null);
            localStorage.removeItem('crossview_auth_token');
          }
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Firebase not configured yet — check if demo session exists
      const storedToken = localStorage.getItem('crossview_auth_token');
      if (storedToken) {
        syncBackendUser(storedToken).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }
  }, []);

  // Email & Password Login
  const loginWithEmail = async (email, password) => {
    setError(null);
    setLoading(true);

    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();
        await syncBackendUser(idToken, userCredential.user);
        setLoading(false);
        return { success: true, user: userCredential.user };
      } catch (err) {
        setLoading(false);
        const friendlyMessage = getFirebaseErrorMessage(err.code) || err.message;
        setError(friendlyMessage);
        throw new Error(friendlyMessage);
      }
    } else {
      // Demo authentication mode
      const demoToken = `mock_token_${Date.now()}`;
      await syncBackendUser(demoToken, {
        uid: 'demo_uid_' + Math.random().toString(36).substring(2, 8),
        email,
        displayName: email.split('@')[0],
      });
      setLoading(false);
      return { success: true };
    }
  };

  // Email & Password Registration
  const registerWithEmail = async (email, password, fullName) => {
    setError(null);
    setLoading(true);

    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();
        await syncBackendUser(idToken, { ...userCredential.user, displayName: fullName });
        setLoading(false);
        return { success: true, user: userCredential.user };
      } catch (err) {
        setLoading(false);
        const friendlyMessage = getFirebaseErrorMessage(err.code) || err.message;
        setError(friendlyMessage);
        throw new Error(friendlyMessage);
      }
    } else {
      // Demo registration
      const demoToken = `mock_token_${Date.now()}`;
      await syncBackendUser(demoToken, {
        uid: 'demo_uid_' + Math.random().toString(36).substring(2, 8),
        email,
        displayName: fullName || email.split('@')[0],
      });
      setLoading(false);
      return { success: true };
    }
  };

  // Google Login
  const loginWithGoogle = async () => {
    setError(null);
    setLoading(true);

    if (isFirebaseConfigured && auth && googleProvider) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const idToken = await result.user.getIdToken();
        await syncBackendUser(idToken, result.user);
        setLoading(false);
        return { success: true, user: result.user };
      } catch (err) {
        setLoading(false);
        const friendlyMessage = getFirebaseErrorMessage(err.code) || err.message;
        setError(friendlyMessage);
        throw new Error(friendlyMessage);
      }
    } else {
      // Demo Google login
      const demoToken = `mock_google_token_${Date.now()}`;
      await syncBackendUser(demoToken, {
        uid: 'demo_google_uid_101',
        email: 'google.analyst@crossview.news',
        displayName: 'Google News Analyst',
      });
      setLoading(false);
      return { success: true };
    }
  };

  // Password Reset
  const resetPassword = async (email) => {
    setError(null);
    if (isFirebaseConfigured && auth) {
      try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
      } catch (err) {
        const msg = getFirebaseErrorMessage(err.code) || err.message;
        setError(msg);
        throw new Error(msg);
      }
    } else {
      return { success: true, demo: true };
    }
  };

  // Logout
  const logoutUser = async () => {
    try {
      if (isFirebaseConfigured && auth) {
        await signOut(auth);
      }
      await apiService.logout().catch(() => {});
    } finally {
      localStorage.removeItem('crossview_auth_token');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isFirebaseConfigured,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        resetPassword,
        logoutUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function getFirebaseErrorMessage(code) {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was cancelled.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connection.';
    default:
      return null;
  }
}
