const Article = require('../models/Article');
const { getStatus } = require('../config/db');
const { memoryStore } = require('../services/storeService');
const clusteringPipeline = require('../services/clusteringPipeline');

const getNews = async (req, res) => {
  try {
    const { category, publisher, country, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (getStatus()) {
      const filter = {};
      if (category && category !== 'All') filter.category = new RegExp(category, 'i');
      if (publisher && publisher !== 'All') filter.sourceName = new RegExp(publisher, 'i');
      if (country && country !== 'all') filter.country = country;

      const total = await Article.countDocuments(filter);
      const articles = await Article.find(filter)
        .sort({ publishedAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean();

      return res.json({
        success: true,
        articles,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      });
    } else {
      let list = Array.from(memoryStore.articles.values());
      if (category && category !== 'All') {
        list = list.filter((a) => a.category?.toLowerCase() === category.toLowerCase());
      }
      if (publisher && publisher !== 'All') {
        list = list.filter((a) => a.sourceName?.toLowerCase().includes(publisher.toLowerCase()));
      }

      list.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
      const total = list.length;
      const paginated = list.slice((pageNum - 1) * limitNum, pageNum * limitNum);

      return res.json({
        success: true,
        articles: paginated,
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

const searchNews = async (req, res) => {
  try {
    const { q, category } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, error: 'Search query required.' });
    }

    if (getStatus()) {
      const filter = {
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { sourceName: { $regex: q, $options: 'i' } },
        ],
      };
      if (category && category !== 'All') filter.category = new RegExp(category, 'i');

      const articles = await Article.find(filter).sort({ publishedAt: -1 }).limit(30).lean();
      return res.json({ success: true, count: articles.length, articles });
    } else {
      const qLower = q.toLowerCase();
      let list = Array.from(memoryStore.articles.values()).filter(
        (a) =>
          a.title?.toLowerCase().includes(qLower) ||
          a.description?.toLowerCase().includes(qLower) ||
          a.sourceName?.toLowerCase().includes(qLower)
      );

      if (category && category !== 'All') {
        list = list.filter((a) => a.category?.toLowerCase() === category.toLowerCase());
      }

      list.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
      return res.json({ success: true, count: list.length, articles: list });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    let article = null;

    if (getStatus()) {
      article = await Article.findById(id).lean();
    } else {
      article = memoryStore.articles.get(id);
    }

    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found.' });
    }

    return res.json({ success: true, article });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

const refreshNews = async (req, res) => {
  try {
    const { category, q } = req.body || {};
    // Trigger the automated ingestion & clustering pipeline
    const result = await clusteringPipeline.runPipeline({ category, query: q, forceRefresh: true });
    return res.json({
      success: true,
      message: 'News collection and multi-publisher clustering pipeline executed.',
      result,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getNews, searchNews, getArticleById, refreshNews };
