const test = require('node:test');
const assert = require('node:assert');

process.env.NODE_ENV = 'test';

const app = require('../src/server');
const { callExpress } = require('./inMemoryCaller');
const { stopCronJobs } = require('../src/jobs/newsCron');

test.after(() => {
  stopCronJobs();
});

test('GET /health returns healthy status', async () => {
  const res = await callExpress(app, { url: '/health' });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.status, 'healthy');
  assert.ok(res.data.uptime !== undefined);
});

test('GET /api/dashboard/overview returns dashboard statistics and data', async () => {
  const res = await callExpress(app, { url: '/api/dashboard/overview' });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(res.data.stats.totalArticles >= 0);
  assert.ok(Array.isArray(res.data.trendingEvents));
  assert.ok(Array.isArray(res.data.latestReports));
});

test('GET /api/dashboard/activity returns timeline activity buckets', async () => {
  const res = await callExpress(app, { url: '/api/dashboard/activity?range=7d' });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(Array.isArray(res.data.activity));
  assert.ok(res.data.activity.length > 0);
});

test('GET /api/news returns normalized articles with pagination', async () => {
  const res = await callExpress(app, { url: '/api/news?limit=5' });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(Array.isArray(res.data.articles));
  assert.ok(res.data.articles.length > 0);
  assert.ok(res.data.pagination.totalPages >= 1);
});

test('GET /api/news/search searches by keyword', async () => {
  const res = await callExpress(app, { url: '/api/news/search?q=Climate' });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(Array.isArray(res.data.articles));
});

test('GET /api/events returns event clusters', async () => {
  const res = await callExpress(app, { url: '/api/events' });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(Array.isArray(res.data.events));
  assert.ok(res.data.events.length > 0);
});

test('GET /api/events/:id/comparison returns perspective comparison', async () => {
  const eventsRes = await callExpress(app, { url: '/api/events' });
  const eventId = eventsRes.data.events[0]._id;
  const res = await callExpress(app, { url: `/api/events/${eventId}/comparison` });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(res.data.comparison.shared_information);
  assert.ok(res.data.comparison.different_reporting);
});

test('GET /api/events/:id/report returns consolidated AI report', async () => {
  const eventsRes = await callExpress(app, { url: '/api/events' });
  const eventId = eventsRes.data.events[0]._id;
  const res = await callExpress(app, { url: `/api/events/${eventId}/report` });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(res.data.report.headline);
  assert.ok(res.data.report.sharedInformation || res.data.report.shared_information);
});

test('GET /api/events/:id/timeline returns chronological timeline entries', async () => {
  const eventsRes = await callExpress(app, { url: '/api/events' });
  const eventId = eventsRes.data.events[0]._id;
  const res = await callExpress(app, { url: `/api/events/${eventId}/timeline` });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(Array.isArray(res.data.timeline.entries));
});

test('POST /api/ai/ask/:eventId returns evidence-grounded answer with citations', async () => {
  const eventsRes = await callExpress(app, { url: '/api/events' });
  const eventId = eventsRes.data.events[0]._id;
  const res = await callExpress(app, {
    method: 'POST',
    url: `/api/ai/ask/${eventId}`,
    body: { question: 'What was agreed in Geneva?' },
  });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(res.data.answer);
  assert.ok(Array.isArray(res.data.citations));
});

test('GET /api/claims returns analyzed claims with evidence status', async () => {
  const res = await callExpress(app, { url: '/api/claims' });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(Array.isArray(res.data.claims));
});

test('Protected routes reject unauthenticated requests', async () => {
  const res = await callExpress(app, { url: '/api/bookmarks' });
  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(res.data.success, false);
});

test('Protected routes accept valid token and manage user profile and bookmarks', async () => {
  const mockToken = 'mock_demo_token_analyst_123';
  const authHeaders = { Authorization: `Bearer ${mockToken}` };

  // Check auth/me
  const meRes = await callExpress(app, { url: '/api/auth/me', headers: authHeaders });
  assert.strictEqual(meRes.statusCode, 200);
  assert.strictEqual(meRes.data.success, true);
  assert.ok(meRes.data.user.email);

  // Create bookmark
  const createRes = await callExpress(app, {
    method: 'POST',
    url: '/api/bookmarks',
    headers: authHeaders,
    body: {
      itemType: 'event',
      title: 'Geneva Climate Summit Adopts Global Energy Transition Treaty',
      category: 'Climate',
    },
  });
  assert.strictEqual(createRes.statusCode, 201);
  assert.strictEqual(createRes.data.success, true);
  const bookmarkId = createRes.data.bookmark._id;

  // List bookmarks
  const listRes = await callExpress(app, { url: '/api/bookmarks', headers: authHeaders });
  assert.strictEqual(listRes.statusCode, 200);
  assert.ok(listRes.data.bookmarks.length > 0);

  // Delete bookmark
  const delRes = await callExpress(app, {
    method: 'DELETE',
    url: `/api/bookmarks/${bookmarkId}`,
    headers: authHeaders,
  });
  assert.strictEqual(delRes.statusCode, 200);
});

test('Issue 1: GET /api/dashboard/overview reports contain populated category fields for all domains', async () => {
  const res = await callExpress(app, { url: '/api/dashboard/overview' });
  assert.strictEqual(res.statusCode, 200);
  assert.ok(res.data.latestReports.length >= 3);
  // Verify reports have valid category property
  res.data.latestReports.forEach((report) => {
    assert.ok(report.category, 'Report must have a category property');
  });
  const categories = res.data.latestReports.map((r) => r.category);
  assert.ok(categories.includes('Climate'), 'Reports must include Climate');
  assert.ok(categories.includes('Economy'), 'Reports must include Economy');
  assert.ok(categories.includes('Technology'), 'Reports must include Technology');
});

test('Issue 2: POST /api/news/upload indexes news and updates available developing events', async () => {
  const uploadRes = await callExpress(app, {
    method: 'POST',
    url: '/api/news/upload',
    body: {
      title: 'Global Autonomous Drone Air-Traffic Management Protocol Ratified',
      description: 'Aviation authorities establish unified algorithmic routing corridors for cargo drones.',
      content: 'Civil aviation directors from 45 nations finalized the automated flight-level safety framework.',
      sourceName: 'Aviation Week',
      category: 'Technology',
    },
  });
  assert.strictEqual(uploadRes.statusCode, 201);
  assert.strictEqual(uploadRes.data.success, true);
  assert.ok(uploadRes.data.eventId, 'Upload should return associated cluster eventId');

  // Verify that GET /api/events now includes this developing story
  const eventsRes = await callExpress(app, { url: '/api/events?limit=50' });
  assert.strictEqual(eventsRes.statusCode, 200);
  const matchedEvent = eventsRes.data.events.find((e) =>
    e.title.includes('Global Autonomous Drone')
  );
  assert.ok(matchedEvent, 'Uploaded article must dynamically form/update a developing story event');
});
