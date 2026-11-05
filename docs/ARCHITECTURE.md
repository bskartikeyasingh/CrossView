# CrossView Architecture Documentation
**Tagline: See Every Side. Understand Every Story.**

---

## 1. System Overview

CrossView is an enterprise-grade AI news intelligence platform engineered to ingest reporting across diverse international news publishers, identify disparate articles reporting on the same underlying real-world event, extract and cross-reference factual assertions, identify conflicting coverage, and consolidate balanced, attributed intelligence dossiers.

```
                           +--------------------------+
                           |  External News Sources   |
                           |  GNews API & RSS Feeds   |
                           +------------+-------------+
                                        |
                                        v
+-----------------------+     +---------+----------+     +------------------------+
|   React 18 Frontend   | <-> |  Express Backend   | <-> |  FastAPI AI Service    |
|   (Vite + Tailwind    |     |  (Node.js + Mongo) |     |  (Gemini + Sentence-   |
|    + Recharts)        |     |  Auth Middleware   |     |   Transformers)        |
+-----------------------+     +---------+----------+     +------------------------+
                                        |
                           +------------+-------------+
                           |    Storage & Identity    |
                           |   MongoDB Atlas &        |
                           |   Firebase Admin Auth    |
                           +--------------------------+
```

---

## 2. Core Service Components

### A. Frontend Presentation Layer (`frontend/`)
- **Technology**: React 18, Vite, Tailwind CSS, React Router, Recharts, Lucide Icons, Framer Motion.
- **Design System**: Harmonizes two visual traditions:
  - **Reference 2 (Editorial Website)**: Clean white navigation, large photographic hero with dark overlay, editorial typography (`Newsreader`), curated dispatches carousel, and magazine styling.
  - **Reference 1 (Intelligence Dashboard)**: Recharts News Activity velocity timeline (24h/7d/30d), left contextual domain filters, central intelligence stream, right-side insights monitor (disputed claims, perspective comparisons, Ask AI).
- **Session Management**: Persistent Firebase client authentication supporting Email/Password and Google OAuth with automatic ID token injection into backend requests.

### B. Core Application & API Gateway (`backend/`)
- **Technology**: Node.js, Express.js, MongoDB Atlas (Mongoose), Firebase Admin SDK, node-cron.
- **Responsibilities**:
  - Ingestion orchestration (GNews API v4 and RSS feed parser).
  - Normalization & strict URL/content deduplication.
  - Authentication token verification using Firebase Admin SDK.
  - Data persistence across Users, Articles, Events, Claims, ConsolidatedReports, Timelines, Bookmarks, and SavedReports.
  - In-memory development store fallback guaranteeing zero crash startup in offline environments.

### C. AI Intelligence Microservice (`ai-service/`)
- **Technology**: Python 3.12, FastAPI, Uvicorn, Sentence Transformers, PyTorch, NumPy, Google Gemini API, Pydantic.
- **Key Algorithms**:
  - **Semantic Embeddings**: `sentence-transformers/all-MiniLM-L6-v2` generating 384-dimensional dense semantic vectors.
  - **Hybrid Event Clustering**: Pairwise cosine similarity matrix $\frac{u \cdot v}{\|u\| \|v\|}$ augmented by title keyword overlap (Jaccard similarity) and publication date proximity penalty windows (48-72h).
  - **Neutral Consolidation Engine**: Google Gemini API running under structured system prompts requiring strict JSON schemas, publisher attribution, and uncertainty preservation.

---

## 3. Data Collection & Processing Pipeline

```
[ GNews API ] + [ RSS Feeds ]
             │
             ▼
   [ Normalization & Cleaning ]
             │
             ▼
      [ URL Deduplication ]
             │
             ▼
   [ Embedding Generation (384-d) ]
             │
             ▼
[ Semantic Graph Clustering (Cosine > 0.68) ]
             │
             ├── If Single Article ─────────► [ Stored in News Feed ]
             │
             └── If 2+ Publisher Articles ──► [ Event Cluster Formed ]
                                                       │
                                 ┌─────────────────────┼─────────────────────┐
                                 ▼                     ▼                     ▼
                     [ AI Consolidated Report ] [ Claim Extraction ] [ Event Timeline ]
```

---

## 4. Security & Safety Architecture

1. **Untrusted Input Isolation**: All external news texts ingested from feeds are strictly treated as untrusted data. AI prompts use clear boundary delimiters and system instructions forbidding article content from executing prompt injections.
2. **Credential Separation**: Public Firebase client config remains on the client; private Firebase Admin credentials, Gemini keys, and MongoDB URIs reside exclusively in backend and microservice environment variables.
3. **Evidence Status Grounding**: Claims are categorized into 4 evidence states:
   - *Corroborated by multiple independent sources*
   - *Supported by one available source*
   - *Disputed by available reports*
   - *Unverified or insufficient evidence*
