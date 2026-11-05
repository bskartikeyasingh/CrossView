const newsService = require('./newsService');
const aiClientService = require('./aiClientService');
const Article = require('../models/Article');
const Event = require('../models/Event');
const ConsolidatedReport = require('../models/ConsolidatedReport');
const Claim = require('../models/Claim');
const Timeline = require('../models/Timeline');
const { getStatus } = require('../config/db');
const { memoryStore } = require('./storeService');

class ClusteringPipeline {
  constructor() {
    this.isProcessing = false;
  }

  async runPipeline({ forceRefresh = false, category = 'General', query = '' } = {}) {
    if (this.isProcessing) {
      console.log('Pipeline is already running. Skipping concurrent execution.');
      return { status: 'already_running' };
    }

    this.isProcessing = true;
    console.log(`🚀 Starting CrossView News & Clustering Pipeline [Category: ${category}, Query: ${query}]...`);

    try {
      // Step 1: Collect news from GNews and RSS
      const [gnewsArticles, rssArticles] = await Promise.all([
        newsService.fetchGNews({ q: query, category, max: 10 }),
        newsService.fetchRSSFeeds(),
      ]);

      const allFetched = [...gnewsArticles, ...rssArticles];
      console.log(`📥 Fetched ${allFetched.length} raw articles (${gnewsArticles.length} GNews, ${rssArticles.length} RSS).`);

      // Step 2 & 3: Normalize and Deduplicate
      const ingestResult = await newsService.ingestArticles(allFetched);
      console.log(`💾 Ingested: ${ingestResult.savedCount} new articles, ${ingestResult.duplicatesCount} duplicates filtered.`);

      // Step 4 & 5: Fetch unassigned articles for clustering
      let candidateArticles = [];
      if (getStatus()) {
        candidateArticles = await Article.find({}).sort({ publishedAt: -1 }).limit(30).lean();
      } else {
        candidateArticles = Array.from(memoryStore.articles.values())
          .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
          .slice(0, 30);
      }

      if (candidateArticles.length < 2) {
        console.log('ℹ️ Insufficient articles for clustering.');
        this.isProcessing = false;
        return { status: 'insufficient_articles', count: candidateArticles.length };
      }

      // Format articles for AI service
      const articlesInput = candidateArticles.map((a) => ({
        id: (a._id || a.id).toString(),
        title: a.title,
        description: a.description || '',
        content: a.content || '',
        sourceName: a.sourceName || '',
        sourceDomain: a.sourceDomain || '',
        author: a.author || '',
        publishedAt: a.publishedAt ? new Date(a.publishedAt).toISOString() : new Date().toISOString(),
        url: a.url || '',
        category: a.category || 'General',
        embedding: a.embedding || null,
      }));

      // Call AI Clustering
      const clusteringResult = await aiClientService.clusterArticles(articlesInput);
      console.log(`🧩 AI Clustering created ${clusteringResult.clusters?.length || 0} event clusters.`);

      // Step 6, 7 & 8: Update Events, Consolidated Reports, Claims, and Timelines
      const processedEvents = [];
      if (clusteringResult.clusters && clusteringResult.clusters.length > 0) {
        for (const cluster of clusteringResult.clusters) {
          const clusterArticles = candidateArticles.filter((a) =>
            cluster.article_ids.includes((a._id || a.id).toString())
          );

          if (clusterArticles.length === 0) continue;

          const eventRecord = await this._saveOrUpdateEvent(cluster, clusterArticles);
          processedEvents.push(eventRecord);

          // Generate / Refresh AI Consolidated Report if 2+ sources
          if (clusterArticles.length >= 2) {
            await this._generateEventIntelligence(eventRecord, clusterArticles);
          }
        }
      }

      this.isProcessing = false;
      return {
        status: 'completed',
        newArticles: ingestResult.savedCount,
        clustersFormed: processedEvents.length,
        events: processedEvents,
      };
    } catch (err) {
      this.isProcessing = false;
      console.error('Pipeline execution error:', err);
      return { status: 'error', error: err.message };
    }
  }

  async _saveOrUpdateEvent(cluster, articles) {
    const title = cluster.suggested_title || articles[0].title;
    const summary = articles[0].description || `Multi-publisher event covered by ${cluster.source_count} sources.`;
    const category = cluster.category || articles[0].category || 'General';
    const firstReported = new Date(cluster.first_reported_at || articles[0].publishedAt);
    const lastUpdated = new Date(cluster.last_updated_at || articles[articles.length - 1].publishedAt);
    const articleIds = articles.map((a) => a._id || a.id);

    if (getStatus()) {
      let event = await Event.findOne({ title });
      if (!event) {
        event = await Event.create({
          title,
          summary,
          category,
          country: 'global',
          articleIds,
          sourceCount: cluster.source_count || articles.length,
          firstReportedAt: firstReported,
          lastUpdatedAt: lastUpdated,
          status: 'active',
          confidenceScore: cluster.confidence_score || 0.9,
        });
      } else {
        event.articleIds = Array.from(new Set([...event.articleIds.map(String), ...articleIds.map(String)]));
        event.sourceCount = Math.max(event.sourceCount, cluster.source_count || articles.length);
        event.lastUpdatedAt = lastUpdated;
        await event.save();
      }

      // Link eventId to articles
      await Article.updateMany(
        { _id: { $in: articleIds } },
        { $set: { eventId: event._id } }
      );

      return event;
    } else {
      // Memory store
      let event = Array.from(memoryStore.events.values()).find((e) => e.title === title);
      if (!event) {
        const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        event = {
          _id: eventId,
          title,
          summary,
          category,
          country: 'global',
          articleIds,
          sourceCount: cluster.source_count || articles.length,
          firstReportedAt: firstReported,
          lastUpdatedAt: lastUpdated,
          status: 'active',
          confidenceScore: cluster.confidence_score || 0.9,
          createdAt: new Date(),
        };
        memoryStore.events.set(eventId, event);
      } else {
        event.articleIds = Array.from(new Set([...event.articleIds, ...articleIds]));
        event.sourceCount = Math.max(event.sourceCount, cluster.source_count || articles.length);
        event.lastUpdatedAt = lastUpdated;
      }

      // Link articles in memory store
      articleIds.forEach((id) => {
        const art = memoryStore.articles.get(id);
        if (art) art.eventId = event._id;
      });

      return event;
    }
  }

  async _generateEventIntelligence(event, articles) {
    const eventIdStr = (event._id || event.id).toString();
    const formattedArticles = articles.map((a) => ({
      id: (a._id || a.id).toString(),
      title: a.title,
      description: a.description || '',
      content: a.content || '',
      sourceName: a.sourceName || '',
      sourceDomain: a.sourceDomain || '',
      publishedAt: a.publishedAt ? new Date(a.publishedAt).toISOString() : new Date().toISOString(),
      url: a.url || '',
      category: a.category || 'General',
    }));

    // 1. Consolidated Report
    try {
      const reportData = await aiClientService.consolidateNews(formattedArticles, eventIdStr);
      if (getStatus()) {
        await ConsolidatedReport.findOneAndUpdate(
          { eventId: event._id },
          {
            category: event.category || 'General',
            headline: reportData.headline,
            overview: reportData.overview,
            whatHappened: reportData.what_happened,
            sharedInformation: reportData.shared_information,
            differences: reportData.differences,
            disputedClaims: reportData.disputed_claims,
            missingContext: reportData.missing_context,
            eventContext: reportData.event_context,
            sourceReferences: reportData.source_references,
            model: reportData.model,
            generatedAt: new Date(),
          },
          { upsert: true, new: true }
        );
      } else {
        memoryStore.reports.set(eventIdStr, {
          _id: `rep_${eventIdStr}`,
          eventId: eventIdStr,
          category: event.category || 'General',
          headline: reportData.headline,
          overview: reportData.overview,
          whatHappened: reportData.what_happened,
          sharedInformation: reportData.shared_information,
          differences: reportData.differences,
          disputedClaims: reportData.disputed_claims,
          missingContext: reportData.missing_context,
          eventContext: reportData.event_context,
          sourceReferences: reportData.source_references,
          generatedAt: new Date(),
          model: reportData.model,
          reportVersion: '1.0',
          disclaimer: reportData.disclaimer,
        });
      }
    } catch (e) {
      console.warn('Report generation error:', e.message);
    }

    // 2. Claims Extraction
    try {
      const claimsData = await aiClientService.extractClaims(formattedArticles, eventIdStr);
      if (claimsData.claims && claimsData.claims.length > 0) {
        for (const c of claimsData.claims) {
          if (getStatus()) {
            await Claim.create({
              eventId: event._id,
              claimText: c.claim_text,
              claimType: c.claim_type || 'factual',
              supportingEvidence: c.supporting_sources || [],
              contradictingEvidence: c.contradicting_sources || [],
              evidenceStatus: c.evidence_status,
              confidenceScore: c.confidence_score || 0.8,
            });
          } else {
            const claimId = `clm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            memoryStore.claims.set(claimId, {
              _id: claimId,
              eventId: eventIdStr,
              claimText: c.claim_text,
              claimType: c.claim_type || 'factual',
              supportingEvidence: c.supporting_sources || [],
              contradictingEvidence: c.contradicting_sources || [],
              evidenceStatus: c.evidence_status,
              confidenceScore: c.confidence_score || 0.8,
              firstReportedDate: new Date(),
              lastUpdatedDate: new Date(),
            });
          }
        }
      }
    } catch (e) {
      console.warn('Claim extraction error:', e.message);
    }

    // 3. Timeline Construction
    try {
      const sortedArticles = [...articles].sort(
        (a, b) => new Date(a.publishedAt) - new Date(b.publishedAt)
      );

      const timelineEntries = sortedArticles.map((a, idx) => ({
        _id: `tl_entry_${idx}`,
        title: a.title,
        description: a.description || 'Published update regarding event progression.',
        timestamp: new Date(a.publishedAt || Date.now()),
        eventDate: new Date(a.publishedAt || Date.now()),
        sourceName: a.sourceName || 'Publisher',
        articleUrl: a.url || '',
        articleId: a._id || a.id,
        category: idx === 0 ? 'first_report' : idx === sortedArticles.length - 1 ? 'update' : 'development',
      }));

      if (getStatus()) {
        await Timeline.findOneAndUpdate(
          { eventId: event._id },
          { entries: timelineEntries },
          { upsert: true, new: true }
        );
      } else {
        memoryStore.timelines.set(eventIdStr, {
          _id: `tl_${eventIdStr}`,
          eventId: eventIdStr,
          entries: timelineEntries,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } catch (e) {
      console.warn('Timeline construction error:', e.message);
    }
  }
}

const clusteringPipeline = new ClusteringPipeline();

module.exports = clusteringPipeline;

