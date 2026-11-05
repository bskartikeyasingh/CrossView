# Firebase Authentication Setup Guide for CrossView

CrossView uses **Firebase Authentication** for user identity (Email/Password & Google OAuth) and **Firebase Admin SDK** in the Express backend for cryptographic ID token verification.

---

## Step 1: Create a Firebase Project
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project**, name it `crossview-news`, and complete the wizard.

---

## Step 2: Enable Authentication Providers
1. In the Firebase console left sidebar, navigate to **Build** → **Authentication**.
2. Click **Get Started**.
3. In the **Sign-in method** tab:
   - **Email/Password**: Click Email/Password, toggle **Enable**, and click Save.
   - **Google**: Click Google, toggle **Enable**, configure your project support email, and click Save.

---

## Step 3: Configure Authorized Domains
1. Under **Authentication** → **Settings** → **Authorized domains**:
   - Ensure `localhost` is listed.
   - For production, add your deployment domain (e.g., `crossview.onrender.com` or `crossview.vercel.app`).

---

## Step 4: Register Web Client App
1. Navigate to **Project Overview** (gear icon) → **Project settings**.
2. Under **Your apps**, click the Web icon (`</>`).
3. App nickname: `crossview-web`. Click **Register app**.
4. Copy the `firebaseConfig` credentials into `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=crossview-news.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=crossview-news
VITE_FIREBASE_STORAGE_BUCKET=crossview-news.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef...
```

---

## Step 5: Generate Firebase Admin Service Account (Backend)
1. In **Project settings**, select the **Service accounts** tab.
2. Select **Node.js** and click **Generate new private key**.
3. A JSON file will download. Open the JSON file to extract:
   - `project_id`
   - `client_email`
   - `private_key`
4. Add these into `backend/.env`:
```env
FIREBASE_PROJECT_ID=crossview-news
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@crossview-news.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

> [!IMPORTANT]
> - Never commit `serviceAccountKey.json` or `.env` files to git. Both are included in `.gitignore`.
> - Handle multiline private keys by wrapping the string in double quotes and preserving `\n` characters. The backend automatically parses escaped newlines.

