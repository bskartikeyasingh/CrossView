# CrossView Database Schema Specification

CrossView uses **MongoDB Atlas** via **Mongoose** for data modeling, alongside a resilient in-memory development store for unconfigured or offline environments.

---

## 1. Entity Relationship Diagram

```
                 +-------------------+
                 |       User        |
                 | (firebaseUid PK)  |
                 +---------+---------+
                           |
        +------------------+------------------+
        | 1:N                                 | 1:N
        v                                     v
+---------------+                     +---------------+
|   Bookmark    |                     |  SavedReport  |
+---------------+                     +---------------+
        |                                     |
        +------------------+------------------+
                           |
                           v
                     +-----------+
                     |   Event   |
                     +-----+-----+
                           |
       +-------------------+-------------------+-------------------+
       | 1:N               | 1:1               | 1:1               | 1:N
       v                   v                   v                   v
+-------------+   +------------------+   +-----------+   +-----------+
|   Article   |   |ConsolidatedReport|   | Timeline  |   |   Claim   |
+-------------+   +------------------+   +-----------+   +-----------+
```

---

## 2. Collection Definitions

### `users`
Tracks analyst profiles synchronized with Firebase Authentication.
- `firebaseUid` (String, required, unique, indexed): Primary user identity key from Firebase.
- `name` (String, required): User display name.
- `email` (String, required, unique, indexed): User email.
- `profileImage` (String): Avatar URL.
- `role` (String, enum: `['USER', 'ADMIN']`, default: `'USER'`).
- `preferences` (Object):
  - `categories` (Array of Strings): Subscribed topic domains.
  - `emailNotifications` (Boolean): Digest toggle.
  - `defaultPerspectiveView` (String: `'consolidated' | 'side-by-side' | 'timeline'`).
- `createdAt`, `updatedAt` (Date).

### `articles`
Normalized individual publisher reports collected via GNews API and RSS feeds.
- `title` (String, required, text indexed): Article headline.
- `description` (String, text indexed): Editorial synopsis or excerpt.
- `content` (String): Full or partial body text.
- `sourceName` (String, required, indexed): Name of publishing outlet (e.g., "Reuters", "BBC").
- `sourceDomain` (String): Domain (e.g., "reuters.com").
- `author` (String): Journalist attribution.
- `publishedAt` (Date, required, indexed): Original publication timestamp.
- `url` (String, required, unique, indexed): Canonical article web link.
- `imageUrl` (String): Hero image URL.
- `category` (String, indexed): Primary news category.
- `country`, `language` (String): Geographic and linguistic metadata.
- `contentAvailability` (String: `'full' | 'snippet' | 'headline_only'`).
- `embedding` (Array of Numbers): 384-dimensional dense semantic embedding.
- `eventId` (ObjectId, ref: `'Event'`, indexed): Associated event cluster.
- `fetchedAt` (Date).

### `events`
Event clusters formed by grouping related articles through semantic similarity.
- `title` (String, required, text indexed): Representative event title.
- `summary` (String, text indexed): Cluster executive summary.
- `category` (String, indexed): Dominant topic category.
- `articleIds` (Array of ObjectIds, ref: `'Article'`): Monitored dispatches.
- `sourceCount` (Number, default: 1): Number of distinct reporting publishers.
- `firstReportedAt` (Date, indexed): Earliest published article timestamp.
- `lastUpdatedAt` (Date, indexed): Most recent coverage update.
- `status` (String, enum: `['active', 'developing', 'resolved', 'archived']`).
- `confidenceScore` (Number): Cluster cohesion score (0.0 to 1.0).

### `claims`
Extracted factual assertions evaluated across reporting.
- `eventId` (ObjectId, ref: `'Event'`, indexed): Related event.
- `claimText` (String, required): Specific assertion statement.
- `claimType` (String: `'factual' | 'statistic' | 'quote' | 'policy' | 'assertion'`).
- `supportingEvidence` (Array of Objects): Outlets confirming the claim with quotes.
- `contradictingEvidence` (Array of Objects): Outlets reporting differing numbers/statements.
- `evidenceStatus` (String, indexed):
  - `'Corroborated by multiple independent sources'`
  - `'Supported by one available source'`
  - `'Disputed by available reports'`
  - `'Unverified or insufficient evidence'`
- `confidenceScore` (Number): Assessment confidence.

### `consolidatedreports`
AI-synthesized multi-source intelligence reports generated via Google Gemini.
- `eventId` (ObjectId, ref: `'Event'`, required, unique, indexed).
- `headline` (String, required): Original neutral headline.
- `overview` (String, required): Concise executive summary.
- `whatHappened` (String, required): Detailed factual synthesis.
- `sharedInformation` (Array of Strings): Corroborated consensus points.
- `differences` (Array of Strings): Distinct publisher emphases.
- `disputedClaims` (Array of Strings): Unresolved disagreements or divergent data.
- `missingContext` (Array of Strings): Information not yet verified.
- `eventContext` (String): Relevant background history.
- `sourceReferences` (Array of Objects): Monitored outlets, titles, and links.
- `generatedAt` (Date).
- `model` (String): Model used (e.g., `'gemini-1.5-flash'`).
- `reportVersion` (String): Report schema version.

### `timelines`
Chronological milestone reconstruction.
- `eventId` (ObjectId, ref: `'Event'`, required, unique, indexed).
- `entries` (Array of Objects):
  - `title` (String)
  - `description` (String)
  - `timestamp` (Date): Publication dispatch date.
  - `eventDate` (Date): Actual incident occurrence date.
  - `sourceName` (String)
  - `articleUrl` (String)
  - `category` (String: `'first_report' | 'official_statement' | 'development' | 'update'`).

### `bookmarks` & `savedreports`
Associates saved intelligence files to authenticated users via `firebaseUid` (indexed).

