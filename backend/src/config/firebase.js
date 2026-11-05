const admin = require('firebase-admin');

let firebaseInitialized = false;

const initFirebase = () => {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    // Replace escaped newlines if passed in string form
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  if (projectId && clientEmail && privateKey) {
    try {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
        firebaseInitialized = true;
        console.log('✅ Firebase Admin SDK initialized successfully.');
      }
    } catch (err) {
      console.warn('\x1b[33m%s\x1b[0m', `⚠️  Firebase Admin initialization failed: ${err.message}. Authentication running in mock/demo fallback.`);
      firebaseInitialized = false;
    }
  } else {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️  Firebase Admin credentials missing in backend/.env. Running with development auth verification fallback.');
    firebaseInitialized = false;
  }
};

const verifyIdToken = async (idToken) => {
  if (firebaseInitialized) {
    try {
      return await admin.auth().verifyIdToken(idToken);
    } catch (err) {
      throw new Error(`Invalid token: ${err.message}`);
    }
  }

  // Resilient fallback for testing and development prior to live Firebase credentials
  if (!idToken) {
    throw new Error('No authentication token provided');
  }

  // Support demo / development tokens
  if (idToken.startsWith('mock_') || idToken.startsWith('demo_') || idToken.includes('.')) {
    // Decode base64 payload if it's a JWT-like string or construct demo profile
    try {
      const parts = idToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
        return {
          uid: payload.user_id || payload.sub || payload.uid || 'demo-user-123',
          email: payload.email || 'journalist@crossview.news',
          name: payload.name || 'Editorial Analyst',
          picture: payload.picture || null
        };
      }
    } catch (_) {}

    return {
      uid: 'demo_user_crossview_123',
      email: 'analyst@crossview.news',
      name: 'CrossView Analyst',
      picture: null
    };
  }

  throw new Error('Firebase Admin unconfigured and invalid development token provided');
};

module.exports = { initFirebase, verifyIdToken, admin, isFirebaseInitialized: () => firebaseInitialized };

