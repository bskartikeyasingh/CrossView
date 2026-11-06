const aiClientService = require('../services/aiClientService');
const Article = require('../models/Article');
const Event = require('../models/Event');
const Claim = require('../models/Claim');
const ConsolidatedReport = require('../models/ConsolidatedReport');
const Timeline = require('../models/Timeline');
const { getStatus } = require('../config/db');
const { memoryStore } = require('../services/storeService');

async function resolveTargetEvent(eventId, question, history = [], activeEventId = null) {
  let allEvents = [];
  if (getStatus()) {
    allEvents = await Event.find({}).sort({ lastUpdatedAt: -1 }).lean();
  } else {
    allEvents = Array.from(memoryStore.events.values()).sort(
      (a, b) => new Date(b.lastUpdatedAt) - new Date(a.lastUpdatedAt)
    );
  }

  if (!allEvents || allEvents.length === 0) return null;

  // If explicit eventId is passed from route param and is not 'general'
  if (eventId && eventId !== 'general') {
    const directEv = allEvents.find((e) => String(e._id || e.id) === String(eventId));
    return directEv || null;
  }

  const qLower = (question || '').toLowerCase();

  // 1. Check if the question explicitly refers to a new or specific event (score based matching)
  let bestEvent = null;
  let bestScore = 0;
  for (const ev of allEvents) {
    const titleWords = (ev.title || '')
      .toLowerCase()
      .split(/[\s,.-]+/)
      .filter(
        (w) =>
          w.length >= 4 &&
          !['what', 'with', 'about', 'from', 'this', 'that', 'after', 'latest'].includes(w)
      );
    const matchedWords = titleWords.filter((w) => qLower.includes(w));
    const catMatch = ev.category && qLower.includes(ev.category.toLowerCase());
    const score = matchedWords.length * 2 + (catMatch ? 1 : 0);
    if (score > bestScore) {
      bestScore = score;
      bestEvent = ev;
    }
  }

  if (bestScore >= 3) {
    return bestEvent;
  }

  // 2. If activeEventId is provided in body from conversational context
  if (activeEventId && activeEventId !== 'general') {
    const activeEv = allEvents.find((e) => String(e._id || e.id) === String(activeEventId));
    if (activeEv) return activeEv;
  }

  // 3. Check conversation history (from most recent backward) for previously discussed event
  if (Array.isArray(history) && history.length > 0) {
    for (let i = history.length - 1; i >= 0; i--) {
      const msg = history[i];
      if (msg.eventId && msg.eventId !== 'general') {
        const histEv = allEvents.find((e) => String(e._id || e.id) === String(msg.eventId));
        if (histEv) return histEv;
      }
      const msgText = (msg.text || '').toLowerCase();
      for (const ev of allEvents) {
        const titleWords = (ev.title || '')
          .toLowerCase()
          .split(/[\s,.-]+/)
          .filter(
            (w) =>
              w.length >= 4 &&
              !['what', 'with', 'about', 'from', 'this', 'that', 'after', 'latest'].includes(w)
          );
        if (titleWords.filter((w) => msgText.includes(w)).length >= 2) {
          return ev;
        }
      }
    }
  }

  // 4. Default to the latest active developing event
  return allEvents[0];
}

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
    const { question, history = [], activeEventId = null } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, error: 'Question is required.' });
    }

    const targetEvent = await resolveTargetEvent(eventId, question, history, activeEventId);
    const targetEventId = targetEvent ? String(targetEvent._id || targetEvent.id) : null;

    let articles = [];
    let eventTitle = targetEvent ? targetEvent.title : 'Global Intelligence Overview';
    let existingClaims = [];
    let consolidatedReport = null;
    let timeline = null;

    if (targetEventId) {
      articles = await fetchEventArticles(targetEventId);

      if (getStatus()) {
        existingClaims = await Claim.find({ eventId: targetEventId }).lean();
        consolidatedReport = await ConsolidatedReport.findOne({ eventId: targetEventId }).lean();
        timeline = await Timeline.findOne({ eventId: targetEventId }).lean();
      } else {
        existingClaims = Array.from(memoryStore.claims.values()).filter(
          (c) => String(c.eventId) === String(targetEventId)
        );
        consolidatedReport = memoryStore.reports.get(targetEventId);
        timeline = memoryStore.timelines.get(targetEventId);
      }
    }

    // Fallback if articles are empty: only fetch recent articles if event is general and not explicitly nonexistent
    if ((!articles || articles.length === 0) && (!eventId || eventId === 'general')) {
      if (getStatus()) {
        articles = await Article.find({}).sort({ publishedAt: -1 }).limit(6).lean();
      } else {
        articles = Array.from(memoryStore.articles.values()).slice(0, 6);
      }
    }

    const answerResponse = await aiClientService.askCrossView({
      question,
      eventTitle,
      eventId: targetEventId || 'general',
      articles,
      existingClaims,
      consolidatedReport,
      timeline,
      history,
    });

    return res.json({
      success: true,
      answer: answerResponse.answer,
      citations: answerResponse.citations || [],
      confidence_level: answerResponse.confidence_level || 'High',
      unanswered_aspects: answerResponse.unanswered_aspects,
      intent: answerResponse.intent,
      resolvedEvent: targetEvent
        ? {
            id: targetEventId,
            title: targetEvent.title,
            category: targetEvent.category || 'General',
            sourceCount: targetEvent.sourceCount || (articles ? articles.length : 1),
          }
        : null,
    });
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

