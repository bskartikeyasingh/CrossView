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

test('Routing parity: direct endpoints (/dashboard/overview, /dashboard/activity, /news/refresh, /auth/me, /api/health) work without /api prefix', async () => {
  // GET /api/health
  const apiHealthRes = await callExpress(app, { url: '/api/health' });
  assert.strictEqual(apiHealthRes.statusCode, 200);
  assert.strictEqual(apiHealthRes.data.status, 'healthy');

  // GET /dashboard/overview (without /api)
  const overviewRes = await callExpress(app, { url: '/dashboard/overview' });
  assert.strictEqual(overviewRes.statusCode, 200);
  assert.strictEqual(overviewRes.data.success, true);
  assert.ok(overviewRes.data.stats.totalArticles >= 0);
  assert.ok(Array.isArray(overviewRes.data.trendingEvents));

  // GET /dashboard/activity?range=7d (without /api)
  const actRes = await callExpress(app, { url: '/dashboard/activity?range=7d' });
  assert.strictEqual(actRes.statusCode, 200);
  assert.strictEqual(actRes.data.success, true);
  assert.ok(Array.isArray(actRes.data.activity));
  assert.ok(actRes.data.activity.length > 0);

  // GET /auth/me unauthenticated (without /api)
  const unauthMe = await callExpress(app, { url: '/auth/me' });
  assert.strictEqual(unauthMe.statusCode, 401);
  assert.strictEqual(unauthMe.data.success, false);

  // GET /auth/me authenticated (without /api)
  const authMe = await callExpress(app, {
    url: '/auth/me',
    headers: { Authorization: 'Bearer mock_demo_token_analyst_123' },
  });
  assert.strictEqual(authMe.statusCode, 200);
  assert.strictEqual(authMe.data.success, true);
  assert.ok(authMe.data.user.email);

  // POST /news/refresh (without /api)
  const refreshRes = await callExpress(app, {
    method: 'POST',
    url: '/news/refresh',
    body: { category: 'Climate' },
  });
  assert.strictEqual(refreshRes.statusCode, 200);
  assert.strictEqual(refreshRes.data.success, true);
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

// ==========================================
// ASK CROSSVIEW AGENT INTELLIGENCE TEST SUITE
// ==========================================

test('Ask CrossView Test 1: Basic News Question returns detailed grounded summary', async () => {
  const eventsRes = await callExpress(app, { url: '/api/events' });
  const climateEvent = eventsRes.data.events.find((e) => e.category === 'Climate') || eventsRes.data.events[0];
  const eventId = climateEvent._id;
  const res = await callExpress(app, {
    method: 'POST',
    url: `/api/ai/ask/${eventId}`,
    body: { question: 'What happened in this news event?' },
  });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(res.data.answer.includes('### Event Intelligence Summary'));
  assert.ok(res.data.citations.length >= 1);
  assert.strictEqual(res.data.confidence_level, 'High');
});

test('Ask CrossView Test 2: Suggested Question "What do different newspapers disagree about?" returns publisher differences', async () => {
  const eventsRes = await callExpress(app, { url: '/api/events' });
  const climateEvent = eventsRes.data.events.find((e) => e.category === 'Climate') || eventsRes.data.events[0];
  const eventId = climateEvent._id;
  const res = await callExpress(app, {
    method: 'POST',
    url: `/api/ai/ask/${eventId}`,
    body: { question: 'What do different newspapers disagree about?' },
  });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(res.data.answer.includes('Publisher Disagreements') || res.data.answer.includes('Divergent'));
  assert.ok(res.data.citations.length >= 2);
  assert.strictEqual(res.data.intent, 'disagreements');
});

test('Ask CrossView Test 3: Suggested Question "Which details are corroborated?" returns verified facts', async () => {
  const eventsRes = await callExpress(app, { url: '/api/events' });
  const climateEvent = eventsRes.data.events.find((e) => e.category === 'Climate') || eventsRes.data.events[0];
  const eventId = climateEvent._id;
  const res = await callExpress(app, {
    method: 'POST',
    url: `/api/ai/ask/${eventId}`,
    body: { question: 'Which details are corroborated?' },
  });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(res.data.answer.includes('Corroborated Facts') || res.data.answer.includes('CORROBORATED'));
  assert.strictEqual(res.data.intent, 'corroborated');
});

test('Ask CrossView Test 4: Suggested Question "What information is still missing?" returns gaps and unverified items', async () => {
  const eventsRes = await callExpress(app, { url: '/api/events' });
  const climateEvent = eventsRes.data.events.find((e) => e.category === 'Climate') || eventsRes.data.events[0];
  const eventId = climateEvent._id;
  const res = await callExpress(app, {
    method: 'POST',
    url: `/api/ai/ask/${eventId}`,
    body: { question: 'What information is still missing?' },
  });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(res.data.answer.includes('Missing Context') || res.data.answer.includes('PENDING'));
  assert.strictEqual(res.data.intent, 'missing_context');
});

test('Ask CrossView Test 5: Suggested Question "Which publishers reported this event?" returns publisher list with headlines', async () => {
  const eventsRes = await callExpress(app, { url: '/api/events' });
  const climateEvent = eventsRes.data.events.find((e) => e.category === 'Climate') || eventsRes.data.events[0];
  const eventId = climateEvent._id;
  const res = await callExpress(app, {
    method: 'POST',
    url: `/api/ai/ask/${eventId}`,
    body: { question: 'Which publishers reported this event?' },
  });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(res.data.answer.includes('Reporting Publishers Covering'));
  assert.strictEqual(res.data.intent, 'publishers');
  assert.ok(res.data.citations.length >= 2);
});

test('Ask CrossView Test 6: Conversation Context remembers active event across follow-up queries', async () => {
  const eventsRes = await callExpress(app, { url: '/api/events' });
  const climateEvent = eventsRes.data.events.find((e) => e.category === 'Climate');
  assert.ok(climateEvent);

  // Turn 1: Discuss climate summit
  const turn1 = await callExpress(app, {
    method: 'POST',
    url: '/api/ai/ask/general',
    body: { question: 'Explain the Geneva climate summit' },
  });
  assert.strictEqual(turn1.statusCode, 200);
  assert.strictEqual(turn1.data.resolvedEvent.id, climateEvent._id);

  // Turn 2: Follow-up without mentioning event name
  const turn2 = await callExpress(app, {
    method: 'POST',
    url: '/api/ai/ask/general',
    body: {
      question: 'What is the current death toll?',
      history: [
        { sender: 'user', text: 'Explain the Geneva climate summit', eventId: climateEvent._id },
        { sender: 'assistant', text: turn1.data.answer, eventId: climateEvent._id },
      ],
      activeEventId: climateEvent._id,
    },
  });
  assert.strictEqual(turn2.statusCode, 200);
  assert.strictEqual(turn2.data.resolvedEvent.id, climateEvent._id);
  assert.ok(turn2.data.answer.includes('no casualties') || turn2.data.answer.includes('NOT APPLICABLE'));
});

test('Ask CrossView Test 7: Latest Developments returns newest dispatch with timestamp comparison', async () => {
  const eventsRes = await callExpress(app, { url: '/api/events' });
  const climateEvent = eventsRes.data.events.find((e) => e.category === 'Climate') || eventsRes.data.events[0];
  const eventId = climateEvent._id;
  const res = await callExpress(app, {
    method: 'POST',
    url: `/api/ai/ask/${eventId}`,
    body: { question: 'What is the latest update?' },
  });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(res.data.answer.includes('Latest Developments'));
  assert.strictEqual(res.data.intent, 'latest_updates');
});

test('Ask CrossView Test 8: Insufficient Evidence explicitly communicates lack of records rather than inventing info', async () => {
  const res = await callExpress(app, {
    method: 'POST',
    url: '/api/ai/ask/nonexistent_event_id_xyz',
    body: { question: 'What happened with the mythical subterranean crystal facility?' },
  });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(res.data.answer.includes('Insufficient Evidence') || res.data.answer.includes('insufficient'));
  assert.strictEqual(res.data.confidence_level, 'Low');
});

test('Ask CrossView Test 9: Event Switching switches context cleanly to newly requested event', async () => {
  const eventsRes = await callExpress(app, { url: '/api/events' });
  const climateEvent = eventsRes.data.events.find((e) => e.category === 'Climate');
  const quantumEvent = eventsRes.data.events.find((e) => e.title.includes('Quantum'));
  assert.ok(climateEvent);
  assert.ok(quantumEvent);

  // User was talking about climate event, then explicitly switches to quantum hardware error threshold
  const switchRes = await callExpress(app, {
    method: 'POST',
    url: '/api/ai/ask/general',
    body: {
      question: 'What about the quantum hardware error threshold cleared in the major lab milestone?',
      history: [
        { sender: 'user', text: 'Explain the Geneva climate summit', eventId: climateEvent._id },
        { sender: 'assistant', text: 'The Geneva summit concluded...', eventId: climateEvent._id },
      ],
      activeEventId: climateEvent._id,
    },
  });
  assert.strictEqual(switchRes.statusCode, 200);
  assert.strictEqual(switchRes.data.resolvedEvent.id, quantumEvent._id);
  assert.ok(switchRes.data.answer.includes('Quantum') || switchRes.data.answer.includes('qubit'));
});

test('Ask CrossView Test 10: Regression Test verifies all existing modules remain functional', async () => {
  // 1. Dashboard Overview
  const ovRes = await callExpress(app, { url: '/api/dashboard/overview' });
  assert.strictEqual(ovRes.statusCode, 200);
  assert.strictEqual(ovRes.data.success, true);
  assert.ok(ovRes.data.latestReports.length >= 3);

  // 2. Events & Timelines
  const evRes = await callExpress(app, { url: '/api/events' });
  assert.strictEqual(evRes.statusCode, 200);
  const evId = evRes.data.events[0]._id;
  const tlRes = await callExpress(app, { url: `/api/events/${evId}/timeline` });
  assert.strictEqual(tlRes.statusCode, 200);
  assert.ok(Array.isArray(tlRes.data.timeline.entries));

  // 3. Claims analysis
  const clRes = await callExpress(app, { url: '/api/claims' });
  assert.strictEqual(clRes.statusCode, 200);
  assert.ok(Array.isArray(clRes.data.claims));
});
