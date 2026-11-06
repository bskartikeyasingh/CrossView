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

    // When an actual Firebase user is authenticated, guarantee genuine profile properties
    if (firebaseUser) {
      const realProfile = {
        firebaseUid: firebaseUser.uid,
        name: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Analyst'),
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || '',
        role: 'USER',
        isFirebaseUser: true,
      };

      try {
        const res = await apiService.getMe();
        if (res.success && res.user) {
          setUser({
            ...realProfile,
            ...res.user,
            name: res.user.name || realProfile.name,
            email: res.user.email || realProfile.email,
            photoURL: res.user.profileImage || realProfile.photoURL,
          });
        } else {
          setUser(realProfile);
        }
      } catch (_) {
        // Even if backend /auth/me call is pending or offline, preserve real Firebase identity
        setUser(realProfile);
      }
      return;
    }

    // Explicit demo user branch ONLY
    try {
      const res = await apiService.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        setUser({
          firebaseUid: 'demo_analyst_uid',
          name: 'Editorial Analyst (Demo)',
          email: 'editorial.analyst@crossview.news',
          role: 'USER',
          isDemo: true,
        });
      }
    } catch (_) {
      setUser({
        firebaseUid: 'demo_analyst_uid',
        name: 'Editorial Analyst (Demo)',
        email: 'editorial.analyst@crossview.news',
        role: 'USER',
        isDemo: true,
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
            setUser(null);
            setToken(null);
            localStorage.removeItem('crossview_auth_token');
          }
        } else {
          // If no active Firebase session, only restore if an explicit demo session was clicked
          const storedToken = localStorage.getItem('crossview_auth_token');
          if (storedToken && storedToken.startsWith('mock_demo_session_')) {
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
      // Firebase not configured — only allow explicitly initiated demo session
      const storedToken = localStorage.getItem('crossview_auth_token');
      if (storedToken && storedToken.startsWith('mock_demo_session_')) {
        syncBackendUser(storedToken).finally(() => setLoading(false));
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('crossview_auth_token');
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
      setLoading(false);
      const msg = 'Firebase email authentication is not configured in this environment.';
      setError(msg);
      throw new Error(msg);
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
      setLoading(false);
      const msg = 'Firebase email registration is not configured in this environment.';
      setError(msg);
      throw new Error(msg);
    }
  };

  // Genuine Firebase Google Login — strictly prohibited from demo fallback
  const loginWithGoogle = async () => {
    setError(null);
    setLoading(true);

    if (!isFirebaseConfigured || !auth || !googleProvider) {
      setLoading(false);
      const errMsg =
        'Firebase configuration is missing or incomplete. Please verify your Firebase project credentials.';
      setError(errMsg);
      throw new Error(errMsg);
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (!result || !result.user) {
        throw new Error('Google authentication returned no user session.');
      }

      const firebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken(true);

      // Guarantee real Google profile properties are updated into authenticated state
      await syncBackendUser(idToken, firebaseUser);
      setLoading(false);
      return { success: true, user: firebaseUser };
    } catch (err) {
      setLoading(false);
      const friendlyMessage =
        getFirebaseErrorMessage(err.code) || err.message || 'Google authentication failed.';
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    }
  };

  // Explicit, isolated Demo login option
  const loginWithDemo = async () => {
    setError(null);
    setLoading(true);
    const demoToken = `mock_demo_session_${Date.now()}`;
    const demoUser = {
      firebaseUid: 'demo_analyst_uid',
      name: 'Editorial Analyst (Demo)',
      email: 'editorial.analyst@crossview.news',
      role: 'USER',
      isDemo: true,
    };
    localStorage.setItem('crossview_auth_token', demoToken);
    setToken(demoToken);
    setUser(demoUser);
    setLoading(false);
    return { success: true, user: demoUser };
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
      throw new Error('Firebase password reset is not configured.');
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
        loginWithDemo,
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
      return 'Google sign-in popup was closed before completing authentication.';
    case 'auth/popup-blocked':
      return 'Google sign-in popup was blocked by your browser. Please allow popups for this site and try again.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase Console. Please add your Render domain to Firebase Authentication > Settings > Authorized Domains.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled in Firebase Console. Please enable Google under Authentication > Sign-in method.';
    case 'auth/cancelled-popup-request':
      return 'Only one sign-in popup request is allowed at a time.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connection and try again.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email address using a different sign-in method.';
    default:
      return null;
  }
}
