# CrossView — AI-Powered Multi-Source News Intelligence Platform

> **Tagline: See Every Side. Understand Every Story.**

CrossView is a full-stack, production-ready AI news intelligence platform that collects news from multiple publishers, clusters articles covering the same real-world event using semantic embeddings, compares information across sources, extracts and verifies claims, creates chronological event timelines, and consolidates balanced, neutral intelligence reports with Google Gemini AI.

---

## 🌟 Key Capabilities

1. **Multi-Source News Collection Engine**:
   - Ingestion from **GNews API v4** and diverse **RSS Feeds** (Reuters, BBC, NYT, NPR, Ars Technica).
   - Strict normalization, URL deduplication, and rate-limit backoff.
2. **Semantic Event Clustering**:
   - Dense 384-dimensional semantic embeddings using `sentence-transformers/all-MiniLM-L6-v2`.
   - Pairwise cosine similarity matrix with title keyword Jaccard overlap and publication date penalty windows.
3. **Consolidated AI News Reports**:
   - Original neutral headline, executive overview, corroborated facts, differences in editorial emphasis, and missing context synthesized by **Google Gemini API**.
   - Zero-hallucination guardrails: every statement is attributed to verified publisher citations.
4. **Side-by-Side Perspective Comparison**:
   - Structured three-part matrix: **Shared Information** (corroborated), **Different Reporting** (framing & nuance), and **Conflicting Claims** (explicit disagreements or diverging figures).
5. **Claim & Evidence Analysis**:
   - Assertion extraction categorized into 4 evidence statuses: *Corroborated by multiple independent sources*, *Supported by one available source*, *Disputed by available reports*, *Unverified or insufficient evidence*.
6. **Chronological Event Timelines**:
   - Distinguishes initial breaking dispatch from actual incident occurrence timestamps.
7. **Ask CrossView**:
   - Evidence-grounded conversational assistant that answers questions about developing events with clickable source citations.
8. **Dual UI/UX Design System**:
   - **Editorial Magazine Showcase** (Reference 2): Large photographic hero section with dark overlay, curated dispatches carousel, and publication metadata.
   - **Analytical Intelligence Console** (Reference 1): Recharts news activity velocity chart (24h/7d/30d), contextual domain filters, central intelligence stream, right-side insights monitor.
9. **Firebase & MongoDB Atlas Integration**:
   - Firebase Authentication (Email/Password & Google OAuth) verified on backend via Firebase Admin SDK.
   - Resilient development store fallback guaranteeing zero crash startup in offline environments.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router, Axios, Lucide React, Recharts, Framer Motion |
| **Backend** | Node.js, Express.js, MongoDB Atlas, Mongoose, Firebase Admin SDK, node-cron, Helmet, Rate Limiter |
| **AI Microservice** | Python 3.12, FastAPI, Google Gemini API, Sentence Transformers (`all-MiniLM-L6-v2`), PyTorch, NumPy |
| **Identity** | Firebase Authentication (Email/Password & Google OAuth) |
| **Deployment** | Render, Vercel, GitHub |

---

## 📁 Monorepo Structure

```
crossview/
├── frontend/                     # React 18 SPA (Vite + Tailwind CSS + Recharts)
│   ├── src/
│   │   ├── components/           # Navbar, Footer, Sidebar, TopHeader, Cards, Badges, Charts
│   │   ├── context/              # AuthContext (Firebase auth + dev fallback)
│   │   ├── firebase/             # Client Firebase Web SDK configuration
│   │   ├── layouts/              # PublicLayout, DashboardLayout
│   │   ├── pages/                # Landing, Auth, Dashboard, Feed, Explore, Compare, Timelines, Claims, Ask, Dossiers
│   │   ├── services/             # Axios API client
│   │   ├── styles/               # Tailwind CSS & editorial fonts
│   │   ├── App.jsx               # Route definitions
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
├── backend/                      # Express REST API & Ingestion Pipeline
│   ├── src/
│   │   ├── config/               # MongoDB Atlas & Firebase Admin configuration
│   │   ├── controllers/          # Auth, News, Events, AI, Claims, Bookmarks, Reports, Profile
│   │   ├── jobs/                 # News collection cron job (node-cron)
│   │   ├── middleware/           # Firebase token verification, Rate limiter, Error handler
│   │   ├── models/               # Mongoose Schemas (User, Article, Event, Claim, Report, Timeline, etc.)
│   │   ├── routes/               # Modular Express routers
│   │   ├── services/             # GNews/RSS Service, AI Client, Clustering Pipeline, Store
│   │   └── server.js             # Server entry point
│   ├── tests/                    # In-memory integration test suite (13 passing tests)
│   ├── package.json
│   └── .env.example
│
├── ai-service/                   # FastAPI Python Microservice
│   ├── app/
│   │   ├── config.py             # App settings (Pydantic)
│   │   ├── routers/              # Health, Embeddings, Clustering, Analysis
│   │   ├── schemas/              # Pydantic Request/Response models
│   │   ├── services/             # SentenceTransformer embedding & Gemini consolidation services
│   │   └── main.py               # FastAPI entry point
│   ├── tests/                    # Pytest & direct test suite
│   ├── requirements.txt
│   └── .env.example
│
├── docs/                         # Architecture, Database, Firebase, Setup & Deployment Guides
│   ├── ARCHITECTURE.md
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_SCHEMA.md
│   ├── FIREBASE_SETUP.md
│   ├── SETUP_GUIDE.md
│   └── DEPLOYMENT_GUIDE.md
│
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Quick Start (Local Setup)

### 1. Configure Environment Files
Copy `.env.example` to `.env` in all three services:
```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
cp ai-service/.env.example ai-service/.env
```
*(All services operate out-of-the-box with built-in development fallbacks until your live credentials are inserted).*

### 2. Start AI Microservice (Port 8000)
```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Start Express Backend (Port 5000)
```bash
cd backend
npm install
npm run dev
```

### 4. Start React Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🧪 Testing Suites

Run tests across each service:

```bash
# Express Backend Unit & Integration Tests (13/13 Pass):
cd backend && npm test

# Frontend Production Build & Asset Tests (Pass):
cd frontend && npm run build && npm test

# AI Microservice Unit Tests (Pass):
cd ai-service && python tests/test_ai_service.py
```

---

## 🔒 Security & Editorial Transparency

- **Prompt Injection Defense**: All external article texts ingested into prompts are sanitized and isolated behind strict structural delimiters.
- **Zero Hallucination Attribution**: All claims, dates, and numbers generated in consolidated reports are attributed to specific publishing outlets.
- **Credential Segregation**: Firebase Admin private keys, Gemini keys, and MongoDB connection strings remain securely isolated in the backend and microservice runtimes and are never exposed to the client.

---

## 📄 License

MIT License. All original news rights reserved to their respective publishing newsrooms.
