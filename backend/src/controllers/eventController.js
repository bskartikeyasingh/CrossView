const Event = require('../models/Event');
const Article = require('../models/Article');
const Timeline = require('../models/Timeline');
const ConsolidatedReport = require('../models/ConsolidatedReport');
const { getStatus } = require('../config/db');
const { memoryStore } = require('../services/storeService');
const aiClientService = require('../services/aiClientService');

const getEvents = async (req, res) => {
  try {
    const { category, page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (getStatus()) {
      const filter = {};
      if (category && category !== 'All') filter.category = new RegExp(category, 'i');

      const total = await Event.countDocuments(filter);
      const events = await Event.find(filter)
        .sort({ lastUpdatedAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean();

      return res.json({
        success: true,
        events,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      });
    } else {
      let list = Array.from(memoryStore.events.values());
      if (category && category !== 'All') {
        list = list.filter((e) => e.category?.toLowerCase() === category.toLowerCase());
      }
      list.sort((a, b) => new Date(b.lastUpdatedAt) - new Date(a.lastUpdatedAt));

      const total = list.length;
      const paginated = list.slice((pageNum - 1) * limitNum, pageNum * limitNum);

      return res.json({
        success: true,
        events: paginated,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    let event = null;

    if (getStatus()) {
      event = await Event.findById(id).lean();
    } else {
      event = memoryStore.events.get(id);
    }

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found.' });
    }

    return res.json({ success: true, event });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

const getEventArticles = async (req, res) => {
  try {
    const { id } = req.params;
    let articles = [];

    if (getStatus()) {
      const event = await Event.findById(id).lean();
      if (!event) return res.status(404).json({ success: false, error: 'Event not found.' });

      articles = await Article.find({
        $or: [{ eventId: id }, { _id: { $in: event.articleIds || [] } }],
      })
        .sort({ publishedAt: 1 })
        .lean();
    } else {
      const event = memoryStore.events.get(id);
      if (!event) return res.status(404).json({ success: false, error: 'Event not found.' });

      const artIdSet = new Set((event.articleIds || []).map(String));
      articles = Array.from(memoryStore.articles.values()).filter(
        (a) => a.eventId === id || artIdSet.has(String(a._id))
      );
      articles.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));
    }

    return res.json({ success: true, count: articles.length, articles });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

const getEventTimeline = async (req, res) => {
  try {
    const { id } = req.params;
    let timeline = null;

    if (getStatus()) {
      timeline = await Timeline.findOne({ eventId: id }).lean();
    } else {
      timeline = memoryStore.timelines.get(id);
    }

    if (!timeline) {
      // Build on the fly from articles
      const articlesRes = await getEventArticlesRaw(id);
      if (articlesRes && articlesRes.length > 0) {
        const sorted = [...articlesRes].sort(
          (a, b) => new Date(a.publishedAt) - new Date(b.publishedAt)
        );
        timeline = {
          eventId: id,
          entries: sorted.map((a, idx) => ({
            _id: `tl_${idx}`,
            title: a.title,
            description: a.description || 'Coverage dispatch.',
            timestamp: a.publishedAt,
            eventDate: a.publishedAt,
            sourceName: a.sourceName,
            articleUrl: a.url,
            category: idx === 0 ? 'first_report' : 'development',
          })),
        };
      }
    }

    return res.json({ success: true, timeline: timeline || { eventId: id, entries: [] } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

const getEventComparison = async (req, res) => {
  try {
    const { id } = req.params;
    const articles = await getEventArticlesRaw(id);

    if (!articles || articles.length === 0) {
      return res.status(404).json({ success: false, error: 'No articles found for this event to compare.' });
    }

    const comparison = await aiClientService.comparePerspectives(articles, id);
    return res.json({ success: true, comparison });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

const getEventReport = async (req, res) => {
  try {
    const { id } = req.params;
    let report = null;

    if (getStatus()) {
      report = await ConsolidatedReport.findOne({ eventId: id }).lean();
    } else {
      report = memoryStore.reports.get(id);
    }

    if (!report) {
      // Generate on the fly
      const articles = await getEventArticlesRaw(id);
      if (articles && articles.length > 0) {
        report = await aiClientService.consolidateNews(articles, id);
      }
    }

    return res.json({ success: true, report });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Helper internal function
async function getEventArticlesRaw(eventId) {
  if (getStatus()) {
    const event = await Event.findById(eventId).lean();
    if (!event) return [];
    return Article.find({
      $or: [{ eventId }, { _id: { $in: event.articleIds || [] } }],
    }).lean();
  } else {
    const event = memoryStore.events.get(eventId);
    if (!event) return [];
    const artIdSet = new Set((event.articleIds || []).map(String));
    return Array.from(memoryStore.articles.values()).filter(
      (a) => a.eventId === eventId || artIdSet.has(String(a._id))
    );
  }
}

module.exports = {
  getEvents,
  getEventById,
  getEventArticles,
  getEventTimeline,
  getEventComparison,
  getEventReport,
};

