const axios = require('axios');
const Parser = require('rss-parser');
const Article = require('../models/Article');
const { getStatus } = require('../config/db');
const { memoryStore } = require('./storeService');

const rssParser = new Parser({
  timeout: 8000,
  headers: { 'User-Agent': 'CrossView-News-Intelligence/1.0' },
});

const DEFAULT_RSS_FEEDS = [
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC News', category: 'World' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'The New York Times', category: 'World' },
  { url: 'https://feeds.npr.org/1001/rss.xml', source: 'NPR News', category: 'General' },
  { url: 'https://feeds.arstechnica.com/arstechnica/index', source: 'Ars Technica', category: 'Technology' },
];

class NewsService {
  constructor() {
    this.gnewsApiKey = process.env.GNEWS_API_KEY || '';
    this.gnewsBaseUrl = 'https://gnews.io/api/v4';
  }

  // Fetch articles from GNews API
  async fetchGNews({ q = '', category = 'general', lang = 'en', country = 'us', max = 10 } = {}) {
    if (!this.gnewsApiKey) {
      console.log('ℹ️  GNEWS_API_KEY not configured. Skipping GNews API fetch.');
      return [];
    }

    try {
      const endpoint = q ? `${this.gnewsBaseUrl}/search` : `${this.gnewsBaseUrl}/top-headlines`;
      const params = {
        token: this.gnewsApiKey,
        lang,
        country,
        max: Math.min(max, 25),
      };

      if (q) params.q = q;
      if (category && !q) params.category = category.toLowerCase();

      const response = await axios.get(endpoint, { params, timeout: 10000 });
      if (response.data && response.data.articles) {
        return response.data.articles.map((item) => this.normalizeGNewsArticle(item, category));
      }
      return [];
    } catch (error) {
      console.warn(`GNews API error (${error.response?.status || error.message}).`);
      return [];
    }
  }

  // Fetch articles from RSS feeds
  async fetchRSSFeeds(customFeeds = null) {
    const feeds = customFeeds || DEFAULT_RSS_FEEDS;
    const allArticles = [];

    for (const feed of feeds) {
      try {
        const parsed = await rssParser.parseURL(feed.url);
        if (parsed.items && parsed.items.length) {
          const normalized = parsed.items.slice(0, 10).map((item) => ({
            title: item.title ? item.title.trim() : 'Untitled Article',
            description: item.contentSnippet || item.summary || item.content || '',
            content: item.content || item.contentSnippet || '',
            sourceName: feed.source,
            sourceDomain: this.extractDomain(feed.url),
            author: item.creator || item.author || feed.source,
            publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(item.pubDate || Date.now()),
            url: item.link || item.guid,
            imageUrl: this.extractRssImage(item),
            category: feed.category || 'General',
            country: 'global',
            language: 'en',
            contentAvailability: item.content ? 'full' : 'snippet',
            fetchedAt: new Date(),
          }));
          allArticles.push(...normalized);
        }
      } catch (err) {
        console.warn(`Could not parse RSS feed ${feed.source}: ${err.message}`);
      }
    }

    return allArticles;
  }

  normalizeGNewsArticle(item, defaultCategory = 'General') {
    return {
      title: item.title ? item.title.trim() : 'Untitled',
      description: item.description || '',
      content: item.content || '',
      sourceName: item.source ? item.source.name : 'Unknown Publisher',
      sourceDomain: item.source && item.source.url ? this.extractDomain(item.source.url) : '',
      author: item.source?.name || '',
      publishedAt: new Date(item.publishedAt || Date.now()),
      url: item.url,
      imageUrl: item.image || '',
      category: defaultCategory,
      country: 'us',
      language: 'en',
      contentAvailability: item.content ? 'full' : 'snippet',
      fetchedAt: new Date(),
    };
  }

  extractDomain(url) {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace('www.', '');
    } catch {
      return '';
    }
  }

  extractRssImage(item) {
    if (item.enclosure && item.enclosure.url && item.enclosure.type?.includes('image')) {
      return item.enclosure.url;
    }
    if (item['media:content'] && item['media:content'].$ && item['media:content'].$.url) {
      return item['media:content'].$.url;
    }
    return '';
  }

  // Deduplicate and save new articles
  async ingestArticles(articles) {
    const saved = [];
    let duplicates = 0;

    for (const art of articles) {
      if (!art.url || !art.title) continue;

      if (getStatus()) {
        try {
          const exists = await Article.findOne({ url: art.url });
          if (!exists) {
            const created = await Article.create(art);
            saved.push(created);
          } else {
            duplicates++;
          }
        } catch (err) {
          if (err.code === 11000) duplicates++;
        }
      } else {
        // Memory store check
        const exists = Array.from(memoryStore.articles.values()).some((a) => a.url === art.url);
        if (!exists) {
          const id = `art_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          const stored = { _id: id, ...art };
          memoryStore.articles.set(id, stored);
          saved.push(stored);
        } else {
          duplicates++;
        }
      }
    }

    return { savedCount: saved.length, duplicatesCount: duplicates, saved };
  }
}

const newsService = new NewsService();

module.exports = newsService;

