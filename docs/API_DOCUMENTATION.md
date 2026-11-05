# CrossView API Documentation

All Express backend endpoints are mounted under `/api` and run by default at `http://localhost:5000`.
The FastAPI microservice runs by default at `http://localhost:8000`.

---

## 1. Authentication Endpoints

### `GET /api/auth/me`
Retrieves the authenticated user profile.
- **Headers**: `Authorization: Bearer <FIREBASE_ID_TOKEN>`
- **Response `200`**:
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "firebaseUid": "...",
    "name": "Elena Rostova",
    "email": "analyst@crossview.news",
    "role": "USER",
    "preferences": {
      "categories": ["Climate", "Economy", "Technology"],
      "defaultPerspectiveView": "consolidated"
    }
  }
}
```

### `POST /api/auth/logout`
Terminates session.
- **Headers**: `Authorization: Bearer <FIREBASE_ID_TOKEN>`

---

## 2. Dashboard Endpoints

### `GET /api/dashboard/overview`
Retrieves consolidated intelligence metrics, trending clusters, featured articles, and disputed claims.
- **Response `200`**:
```json
{
  "success": true,
  "stats": {
    "totalArticles": 28,
    "totalEvents": 6,
    "totalConsolidatedReports": 4,
    "totalClaimsAnalyzed": 14,
    "publishersCount": 8
  },
  "featuredNews": [...],
  "trendingEvents": [...],
  "latestReports": [...],
  "disputedClaims": [...]
}
```

### `GET /api/dashboard/activity?range=24h|7d|30d`
Retrieves publication density and distinct publisher velocity buckets for Recharts timeline.
- **Query Params**: `range` (default `7d`)
- **Response `200`**:
```json
{
  "success": true,
  "range": "7d",
  "activity": [
    { "time": "Mon, 11/03", "articlesCount": 12, "sourcesCount": 5 }
  ]
}
```

---

## 3. News Endpoints

### `GET /api/news`
List normalized articles with pagination and filters.
- **Query Params**: `category`, `publisher`, `country`, `page`, `limit`

### `GET /api/news/search?q=:query`
Keyword full-text search across article headlines and descriptions.

### `GET /api/news/:id`
Fetch single normalized article by ID.

### `POST /api/news/refresh`
Trigger the automated news ingestion, deduplication, and semantic clustering pipeline.

---

## 4. Events & Perspectives Endpoints

### `GET /api/events`
List grouped event clusters with source counts and dates.

### `GET /api/events/:id`
Retrieve event cluster metadata.

### `GET /api/events/:id/articles`
Retrieve all articles grouped into this event cluster.

### `GET /api/events/:id/timeline`
Retrieve chronological timeline entries with milestone categories.

### `GET /api/events/:id/comparison`
Retrieve side-by-side perspective matrix:
- `shared_information`: Corroborated consensus points.
- `different_reporting`: Nuanced framing and editorial emphasis.
- `conflicting_claims`: Explicit contradictions and diverging figures.

### `GET /api/events/:id/report`
Retrieve the latest AI consolidated news report.

---

## 5. AI Intelligence Endpoints

### `POST /api/ai/consolidate/:eventId`
Triggers Gemini consolidation synthesis for an event.

### `POST /api/ai/compare/:eventId`
Generates comparative perspective breakdown.

### `POST /api/ai/analyze-claims/:eventId`
Extracts and categorizes claims into evidence statuses.

### `POST /api/ai/ask/:eventId`
Evidence-grounded conversational Q&A.
- **Body**: `{ "question": "What do outlets disagree about?" }`
- **Response `200`**:
```json
{
  "success": true,
  "answer": "...",
  "citations": [
    { "source_name": "Reuters", "url": "https://...", "context": "..." }
  ],
  "confidence_level": "High"
}
```

---

## 6. Claims, Bookmarks & Saved Reports

- `GET /api/claims` & `GET /api/claims/:id`: Claims registry.
- `GET /api/bookmarks` & `POST /api/bookmarks` & `DELETE /api/bookmarks/:id`: User bookmarks (Requires Bearer Token).
- `GET /api/saved-reports` & `POST /api/saved-reports` & `DELETE /api/saved-reports/:id`: Saved dossiers (Requires Bearer Token).
- `GET /api/users/profile` & `PUT /api/users/profile` & `PUT /api/users/preferences`: Profile management.

---

## 7. FastAPI AI Microservice Endpoints (`:8000`)

- `GET /health`: Service health and model status.
- `POST /api/embeddings`: Batch text embedding (`all-MiniLM-L6-v2`).
- `POST /api/clustering`: Multi-article semantic cosine similarity clustering.
- `POST /api/analysis/consolidate`: Multi-publisher report consolidation.
- `POST /api/analysis/compare`: Perspective comparison.
- `POST /api/analysis/claims`: Claim extraction & evidence assignment.
- `POST /api/analysis/ask`: Evidence-grounded conversational query answering.
