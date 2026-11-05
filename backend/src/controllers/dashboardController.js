const Event = require('../models/Event');
const Article = require('../models/Article');
const ConsolidatedReport = require('../models/ConsolidatedReport');
const Claim = require('../models/Claim');
const { getStatus } = require('../config/db');
const { memoryStore } = require('../services/storeService');

const getOverview = async (req, res) => {
  try {
    let events = [];
    let articles = [];
    let reports = [];
    let claims = [];

    if (getStatus()) {
      [events, articles, reports, claims] = await Promise.all([
        Event.find({}).sort({ lastUpdatedAt: -1 }).limit(10).lean(),
        Article.find({}).sort({ publishedAt: -1 }).limit(12).lean(),
        ConsolidatedReport.find({}).sort({ generatedAt: -1 }).limit(6).lean(),
        Claim.find({}).sort({ createdAt: -1 }).limit(10).lean(),
      ]);
    } else {
      events = Array.from(memoryStore.events.values())
        .sort((a, b) => new Date(b.lastUpdatedAt) - new Date(a.lastUpdatedAt))
        .slice(0, 10);
      articles = Array.from(memoryStore.articles.values())
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
        .slice(0, 12);
      reports = Array.from(memoryStore.reports.values())
        .sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt))
        .slice(0, 6);
      claims = Array.from(memoryStore.claims.values())
        .sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()))
        .slice(0, 10);
    }

    const publishers = Array.from(new Set(articles.map((a) => a.sourceName).filter(Boolean)));
    const categories = Array.from(new Set(events.map((e) => e.category).filter(Boolean)));

    return res.json({
      success: true,
      stats: {
        totalArticles: articles.length,
        totalEvents: events.length,
        totalConsolidatedReports: reports.length,
        totalClaimsAnalyzed: claims.length,
        publishersCount: publishers.length,
      },
      featuredNews: articles.slice(0, 4),
      trendingEvents: events.slice(0, 5),
      latestReports: reports,
      disputedClaims: claims.filter((c) => c.evidenceStatus === 'Disputed by available reports'),
      publishers,
      categories,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

const getTrending = async (req, res) => {
  try {
    let trendingEvents = [];
    if (getStatus()) {
      trendingEvents = await Event.find({}).sort({ sourceCount: -1, lastUpdatedAt: -1 }).limit(8).lean();
    } else {
      trendingEvents = Array.from(memoryStore.events.values())
        .sort((a, b) => b.sourceCount - a.sourceCount || new Date(b.lastUpdatedAt) - new Date(a.lastUpdatedAt))
        .slice(0, 8);
    }

    return res.json({ success: true, events: trendingEvents });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

const getActivity = async (req, res) => {
  try {
    const timeRange = req.query.range || '7d'; // '24h', '7d', '30d'
    let articles = [];

    if (getStatus()) {
      articles = await Article.find({}, 'publishedAt sourceName category').lean();
    } else {
      articles = Array.from(memoryStore.articles.values());
    }

    // Build timeline buckets
    const now = Date.now();
    let bucketCount = 7;
    let stepMs = 24 * 3600000;
    let formatLabel = (date) => date.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });

    if (timeRange === '24h') {
      bucketCount = 12;
      stepMs = 2 * 3600000;
      formatLabel = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (timeRange === '30d') {
      bucketCount = 15;
      stepMs = 2 * 24 * 3600000;
      formatLabel = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    const activityData = [];
    for (let i = bucketCount - 1; i >= 0; i--) {
      const bucketStart = now - (i + 1) * stepMs;
      const bucketEnd = now - i * stepMs;
      const bucketDate = new Date(bucketEnd);

      const matching = articles.filter((a) => {
        const t = new Date(a.publishedAt).getTime();
        return t >= bucketStart && t < bucketEnd;
      });

      activityData.push({
        time: formatLabel(bucketDate),
        timestamp: bucketEnd,
        articlesCount: matching.length,
        sourcesCount: new Set(matching.map((a) => a.sourceName)).size,
      });
    }

    return res.json({ success: true, range: timeRange, activity: activityData });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getOverview, getTrending, getActivity };
