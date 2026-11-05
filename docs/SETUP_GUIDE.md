# CrossView Local Setup & Development Guide

Follow this guide to run the CrossView platform locally on your development machine.

---

## 1. Prerequisites

- **Node.js**: v18.0.0 or higher (Tested on Node v24.14.0)
- **npm**: v9.0.0 or higher
- **Python**: v3.10 or higher (Tested on Python 3.12.7)
- **MongoDB Atlas** or local MongoDB instance (Optional during initial dev; memory fallback included)

---

## 2. Repository Structure

```
crossview/
├── frontend/     # React 18 + Vite + Tailwind CSS SPA
├── backend/      # Express.js REST API + Firebase Admin + Mongoose
├── ai-service/   # FastAPI Python Microservice (Sentence-Transformers + Gemini)
└── docs/         # Full engineering documentation
```

---

## 3. Environment Configuration

### Frontend Setup (`frontend/.env`)
Create `frontend/.env` based on `frontend/.env.example`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```
*(If Firebase keys are blank during development, the frontend automatically provides instant local development sessions).*

### Backend Setup (`backend/.env`)
Create `backend/.env` based on `backend/.env.example`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/crossview
FRONTEND_URL=http://localhost:5173
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
GNEWS_API_KEY=
AI_SERVICE_URL=http://localhost:8000
```
*(If MongoDB or GNews keys are left unconfigured, the backend automatically runs in resilient in-memory mode with pre-seeded data).*

### AI Service Setup (`ai-service/.env`)
Create `ai-service/.env` based on `ai-service/.env.example`:
```env
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
ALLOWED_BACKEND_ORIGIN=http://localhost:5000
PORT=8000
```

---

## 4. Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

### AI Service
```bash
cd ai-service
pip install -r requirements.txt
```

---

## 5. Running the Application Locally

Run each service in a separate terminal:

### Terminal 1: AI Microservice (Port 8000)
```bash
cd ai-service
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Swagger API docs available at: `http://localhost:8000/docs`

### Terminal 2: Express Backend (Port 5000)
```bash
cd backend
npm run dev
# or npm start
```
Backend health check at: `http://localhost:5000/health`

### Terminal 3: React Frontend (Port 5173)
```bash
cd frontend
npm run dev
```
Open browser at: `http://localhost:5173`

---

## 6. Running Automated Tests

### Run Backend Unit Tests (13/13 Pass):
```bash
cd backend
npm test
```

### Run Frontend Production Build & Asset Tests:
```bash
cd frontend
npm run build
npm test
```

### Run AI Microservice Unit Tests:
```bash
cd ai-service
python tests/test_ai_service.py
```
