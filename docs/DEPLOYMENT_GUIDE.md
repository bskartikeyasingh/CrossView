# CrossView Production Deployment Guide

This guide describes how to deploy the CrossView platform across **Render**, **Vercel**, and **GitHub**.

---

## 1. Architecture Deployment Topology

- **Frontend**: Render Static Site or Vercel (SPA routing rewrite to `/index.html`)
- **Backend API**: Render Web Service (Node.js runtime)
- **AI Microservice**: Render Web Service (Python runtime)
- **Database**: MongoDB Atlas (Cloud Cluster M0 Free or M10 Dedicated)
- **Authentication**: Firebase Authentication (Google Identity Cloud)

---

## 2. GitHub Push Instructions

Initialize the repository and push to GitHub:
```bash
git init
git add .
git commit -m "feat: complete CrossView AI news intelligence platform"
git branch -M main
git remote add origin https://github.com/<your-username>/crossview.git
git push -u origin main
```

---

## 3. Deploying the AI Microservice to Render

1. Log into [Render](https://render.com/).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. Set the following parameters:
   - **Name**: `crossview-ai-service`
   - **Root Directory**: `ai-service`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Configure Environment Variables:
   - `GEMINI_API_KEY`: `<Your-Google-Gemini-API-Key>`
   - `GEMINI_MODEL`: `gemini-1.5-flash`
   - `EMBEDDING_MODEL`: `sentence-transformers/all-MiniLM-L6-v2`
   - `ALLOWED_BACKEND_ORIGIN`: `https://crossview-backend.onrender.com`
6. Click **Create Web Service**. Note the public URL (e.g., `https://crossview-ai-service.onrender.com`).

---

## 4. Deploying the Express Backend to Render

1. On Render, click **New +** → **Web Service**.
2. Connect the same repository.
3. Set the following parameters:
   - **Name**: `crossview-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Configure Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: `<Your-MongoDB-Atlas-Connection-String>`
   - `FRONTEND_URL`: `https://crossview-frontend.onrender.com`
   - `AI_SERVICE_URL`: `https://crossview-ai-service.onrender.com`
   - `GNEWS_API_KEY`: `<Your-GNews-API-Key>`
   - `FIREBASE_PROJECT_ID`: `<Your-Firebase-Project-ID>`
   - `FIREBASE_CLIENT_EMAIL`: `<Your-Firebase-Service-Account-Email>`
   - `FIREBASE_PRIVATE_KEY`: `<Your-Firebase-Service-Account-Private-Key>`
5. Click **Create Web Service**. Note the public URL (e.g., `https://crossview-backend.onrender.com`).

---

## 5. Deploying the React Frontend to Render

1. Click **New +** → **Static Site**.
2. Set the following parameters:
   - **Name**: `crossview-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
3. Configure Environment Variables:
   - `VITE_API_BASE_URL`: `https://crossview-backend.onrender.com/api`
   - `VITE_FIREBASE_API_KEY`: `<Your-Firebase-Web-API-Key>`
   - `VITE_FIREBASE_AUTH_DOMAIN`: `<Your-Firebase-Auth-Domain>`
   - `VITE_FIREBASE_PROJECT_ID`: `<Your-Firebase-Project-ID>`
   - `VITE_FIREBASE_STORAGE_BUCKET`: `<Your-Firebase-Storage-Bucket>`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`: `<Your-Sender-ID>`
   - `VITE_FIREBASE_APP_ID`: `<Your-App-ID>`
4. Add **Rewrite Rule** for Single Page Application (SPA):
   - Under **Redirects/Rewrites**:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`

---

## 6. Vercel Alternative for Frontend

1. Install Vercel CLI or import repository in [Vercel Dashboard](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Framework Preset: `Vite`.
4. Add all `VITE_...` environment variables.
5. Create `frontend/vercel.json` for SPA rewrites:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
6. Deploy!

