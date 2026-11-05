const aiClientService = require('../services/aiClientService');
const Article = require('../models/Article');
const Event = require('../models/Event');
const Claim = require('../models/Claim');
const ConsolidatedReport = require('../models/ConsolidatedReport');
const { getStatus } = require('../config/db');
const { memoryStore } = require('../services/storeService');

async function fetchEventArticles(eventId) {
  if (getStatus()) {
    const event = await Event.findById(eventId).lean();
    if (!event) return [];
    return Article.find({
      $or: [{ eventId }, { _id: { $in: event.articleIds || [] } }],
    }).lean();
  } else {
    const event = memoryStore.events.get(eventId);
    if (!event) return [];
    const idSet = new Set((event.articleIds || []).map(String));
    return Array.from(memoryStore.articles.values()).filter(
      (a) => a.eventId === eventId || idSet.has(String(a._id))
    );
  }
}

const consolidateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const articles = await fetchEventArticles(eventId);

    if (!articles || articles.length === 0) {
      return res.status(404).json({ success: false, error: 'No articles found for this event to consolidate.' });
    }

    const reportData = await aiClientService.consolidateNews(articles, eventId);

    // Save report
    if (getStatus()) {
      await ConsolidatedReport.findOneAndUpdate(
        { eventId },
        {
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
      memoryStore.reports.set(eventId, {
        _id: `rep_${eventId}`,
        eventId,
        ...reportData,
        generatedAt: new Date(),
      });
    }

    return res.json({ success: true, report: reportData });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

const compareEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const articles = await fetchEventArticles(eventId);

    if (!articles || articles.length === 0) {
      return res.status(404).json({ success: false, error: 'No articles found for this event.' });
    }

    const comparison = await aiClientService.comparePerspectives(articles, eventId);
    return res.json({ success: true, comparison });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

const analyzeClaimsEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const articles = await fetchEventArticles(eventId);

    if (!articles || articles.length === 0) {
      return res.status(404).json({ success: false, error: 'No articles found for this event.' });
    }

    const analysis = await aiClientService.extractClaims(articles, eventId);

    // Store claims in database
    if (analysis.claims && analysis.claims.length > 0) {
      for (const c of analysis.claims) {
        if (getStatus()) {
          await Claim.create({
            eventId,
            claimText: c.claim_text,
            claimType: c.claim_type,
            supportingEvidence: c.supporting_sources,
            contradictingEvidence: c.contradicting_sources,
            evidenceStatus: c.evidence_status,
            confidenceScore: c.confidence_score,
          });
        } else {
          const claimId = `clm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          memoryStore.claims.set(claimId, {
            _id: claimId,
            eventId,
            claimText: c.claim_text,
            claimType: c.claim_type,
            supportingEvidence: c.supporting_sources,
            contradictingEvidence: c.contradicting_sources,
            evidenceStatus: c.evidence_status,
            confidenceScore: c.confidence_score,
            createdAt: new Date(),
          });
        }
      }
    }

    return res.json({ success: true, analysis });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

const askCrossView = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, error: 'Question is required.' });
    }

    let articles = [];
    let eventTitle = '';
    let existingClaims = [];
    let consolidatedReport = null;

    if (eventId && eventId !== 'general') {
      articles = await fetchEventArticles(eventId);
      if (getStatus()) {
        const ev = await Event.findById(eventId).lean();
        if (ev) eventTitle = ev.title;
        existingClaims = await Claim.find({ eventId }).limit(6).lean();
        consolidatedReport = await ConsolidatedReport.findOne({ eventId }).lean();
      } else {
        const ev = memoryStore.events.get(eventId);
        if (ev) eventTitle = ev.title;
        existingClaims = Array.from(memoryStore.claims.values()).filter((c) => c.eventId === eventId);
        consolidatedReport = memoryStore.reports.get(eventId);
      }
    } else {
      // General question: take top recent articles
      if (getStatus()) {
        articles = await Article.find({}).sort({ publishedAt: -1 }).limit(6).lean();
      } else {
        articles = Array.from(memoryStore.articles.values()).slice(0, 6);
      }
      eventTitle = 'Global Intelligence Overview';
    }

    const answerResponse = await aiClientService.askCrossView({
      question,
      eventTitle,
      eventId,
      articles,
      existingClaims,
      consolidatedReport,
    });

    return res.json({ success: true, ...answerResponse });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  consolidateEvent,
  compareEvent,
  analyzeClaimsEvent,
  askCrossView,
};
