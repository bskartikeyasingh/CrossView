import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Sparkles,
  Layers,
  GitCompare,
  Clock,
  ShieldAlert,
  MessageSquare,
  Bookmark,
  Share2,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ClaimBadge from '../components/ClaimBadge';

export default function EventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [report, setReport] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [claims, setClaims] = useState([]);
  const [articles, setArticles] = useState([]);
  const [activeTab, setActiveTab] = useState('report'); // 'report' | 'compare' | 'timeline' | 'claims' | 'ask'
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [askQuestion, setAskQuestion] = useState('');
  const [askResponse, setAskResponse] = useState(null);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    loadEventData();
  }, [id]);

  const loadEventData = async () => {
    setLoading(true);
    try {
      const [evtRes, repRes, compRes, tlRes, clmRes, artRes] = await Promise.all([
        apiService.getEventById(id),
        apiService.getEventReport(id),
        apiService.getEventComparison(id),
        apiService.getEventTimeline(id),
        apiService.getEventClaims(id),
        apiService.getEventArticles(id),
      ]);

      if (evtRes.success) setEvent(evtRes.event);
      if (repRes.success) setReport(repRes.report);
      if (compRes.success) setComparison(compRes.comparison);
      if (tlRes.success) setTimeline(tlRes.timeline);
      if (clmRes.success) setClaims(clmRes.claims);
      if (artRes.success) setArticles(artRes.articles);
    } catch (err) {
      console.warn('Event file load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      alert('Please log in to bookmark this event.');
      return;
    }
    try {
      await apiService.createBookmark({
        itemType: 'event',
        eventId: id,
        title: event?.title || report?.headline || 'Event File',
        category: event?.category || 'General',
        sourceCount: articles.length || 2,
      });
      setBookmarked(true);
    } catch (err) {
      console.warn('Bookmark error:', err);
    }
  };

  const handleAskSubmit = async (e) => {
    e.preventDefault();
    if (!askQuestion.trim() || asking) return;
    setAsking(true);
    try {
      const res = await apiService.askCrossView(id, askQuestion.trim());
      setAskResponse(res);
    } catch (err) {
      alert('Assistant query error: ' + err.message);
    } finally {
      setAsking(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-secondary">
        <div className="w-8 h-8 border-3 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span>Loading event intelligence dossier...</span>
      </div>
    );
  }

  if (!event && !report) {
    return (
      <div className="py-20 text-center bg-white rounded-lg border border-border p-8">
        <h2 className="font-editorial text-2xl font-bold text-primary">Event Dossier Not Found</h2>
        <p className="text-xs text-secondary mt-2">The requested event cluster does not exist or has been archived.</p>
        <Link to="/dashboard" className="mt-4 inline-block font-semibold text-navy text-xs hover:underline">
          ← Return to Overview
        </Link>
      </div>
    );
  }

  const title = report?.headline || event?.title;
  const sourcesCount = articles.length || event?.sourceCount || 2;

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Intelligence Stream</span>
      </Link>

      {/* Main Dossier Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-border shadow-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider bg-navy text-white">
              {event?.category || report?.category || 'Intelligence File'}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-gray-100 text-primary">
              <Layers className="w-3.5 h-3.5 text-secondary" />
              <span>{sourcesCount} Reporting Publishers</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Consensus Score: {Math.round((event?.confidenceScore || 0.92) * 100)}%</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmark}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                bookmarked
                  ? 'bg-navy/10 text-navy border-navy/30'
                  : 'bg-[#F7F7F5] text-primary border-border hover:bg-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{bookmarked ? 'Bookmarked' : 'Bookmark File'}</span>
            </button>
          </div>
        </div>

        <h1 className="font-editorial text-2xl sm:text-4xl font-bold text-primary leading-tight">
          {title}
        </h1>

        <p className="text-sm sm:text-base text-secondary leading-relaxed max-w-3xl">
          {report?.overview || event?.summary}
        </p>

        {/* Tab Navigation */}
        <div className="pt-4 border-t border-border flex flex-wrap gap-2">
          {[
            { id: 'report', label: 'Consolidated AI Report', icon: Sparkles },
            { id: 'compare', label: 'Perspective Matrix', icon: GitCompare },
            { id: 'timeline', label: 'Chronological Timeline', icon: Clock },
            { id: 'claims', label: `Verified Claims (${claims.length})`, icon: ShieldAlert },
            { id: 'ask', label: 'Ask Assistant', icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-navy text-white shadow-xs'
                    : 'bg-[#F7F7F5] text-secondary hover:text-primary hover:bg-border/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Consolidated AI Report */}
      {activeTab === 'report' && (
        <div className="bg-white p-6 sm:p-8 rounded-lg border border-border shadow-card space-y-6">
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-md text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p>
              {report?.disclaimer ||
                'AI-generated consolidated report based on available source material. This report is a synthesis of published coverage and is not independently verified journalism.'}
            </p>
          </div>

          <div>
            <h3 className="font-editorial text-xl font-bold text-primary mb-2">What Happened</h3>
            <p className="text-sm text-secondary leading-relaxed whitespace-pre-line">
              {report?.whatHappened || 'Detailed progression compiled from monitored newsroom feeds.'}
            </p>
          </div>

          {report?.sharedInformation && report.sharedInformation.length > 0 && (
            <div className="p-5 rounded-lg bg-emerald-50/50 border border-emerald-100 space-y-2">
              <h4 className="font-semibold text-xs text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Information Shared By Multiple Independent Outlets
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-emerald-950">
                {report.sharedInformation.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {report?.differences && report.differences.length > 0 && (
            <div className="p-5 rounded-lg bg-blue-50/50 border border-blue-100 space-y-2">
              <h4 className="font-semibold text-xs text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                Differences in Reporting & Focus
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-blue-950">
                {report.differences.map((diff, idx) => (
                  <li key={idx}>{diff}</li>
                ))}
              </ul>
            </div>
          )}

          {report?.disputedClaims && report.disputedClaims.length > 0 && (
            <div className="p-5 rounded-lg bg-amber-50/50 border border-amber-100 space-y-2">
              <h4 className="font-semibold text-xs text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Disputed Claims & Divergent Details
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-amber-950">
                {report.disputedClaims.map((disp, idx) => (
                  <li key={idx}>{disp}</li>
                ))}
              </ul>
            </div>
          )}

          {report?.missingContext && report.missingContext.length > 0 && (
            <div className="space-y-1 text-xs text-secondary pt-2">
              <span className="font-semibold text-primary block">Missing Context & Pending Inquiries:</span>
              <ul className="list-disc pl-5 space-y-1">
                {report.missingContext.map((mc, idx) => (
                  <li key={idx}>{mc}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Primary Source References */}
          {articles && articles.length > 0 && (
            <div className="pt-6 border-t border-border">
              <h4 className="font-bold text-xs uppercase tracking-wider text-primary mb-3">
                Analyzed Publisher Dispatches ({articles.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {articles.map((a) => (
                  <div key={a._id || a.id} className="p-3 rounded bg-[#F7F7F5] border border-border text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-navy text-[10px] uppercase block">{a.sourceName}</span>
                      <span className="text-primary font-medium line-clamp-1">{a.title}</span>
                    </div>
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-navy hover:underline ml-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Perspective Matrix */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-border shadow-card">
            <h3 className="font-editorial text-2xl font-bold text-primary mb-4">
              Side-by-Side Coverage Analysis
            </h3>
            <p className="text-xs text-secondary leading-relaxed mb-6">
              Compare how independent newsrooms prioritized elements of this developing story.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articles.map((art) => (
                <div key={art._id || art.id} className="p-5 rounded-lg border border-border bg-[#F7F7F5] space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-navy uppercase text-[11px]">{art.sourceName}</span>
                      <span className="text-secondary text-[11px]">
                        {new Date(art.publishedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <h4 className="font-editorial text-base font-bold text-primary leading-snug">
                      "{art.title}"
                    </h4>
                    <p className="text-xs text-secondary mt-2 line-clamp-4 leading-relaxed">
                      {art.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border">
                    <a
                      href={art.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-navy hover:underline inline-flex items-center gap-1"
                    >
                      <span>Read Original Story</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Timeline */}
      {activeTab === 'timeline' && (
        <div className="bg-white p-6 sm:p-8 rounded-lg border border-border shadow-card">
          <h3 className="font-editorial text-2xl font-bold text-primary mb-6">
            Chronological Progression
          </h3>

          <div className="relative border-l-2 border-border ml-4 sm:ml-6 space-y-6 pb-2">
            {(timeline?.entries || []).map((entry, idx) => (
              <div key={idx} className="relative pl-6 group">
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-navy" />
                <div className="bg-[#F7F7F5] p-4 rounded-lg border border-border space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-navy uppercase text-[10px]">{entry.sourceName || 'Publisher'}</span>
                    <span className="text-secondary text-[11px]">
                      {new Date(entry.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="font-editorial text-base font-bold text-primary">{entry.title}</h4>
                  <p className="text-xs text-secondary leading-relaxed">{entry.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Verified Claims */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div key={claim._id} className="bg-white p-5 rounded-lg border border-border shadow-card space-y-3">
              <div className="flex items-center justify-between">
                <ClaimBadge status={claim.evidenceStatus} />
                <span className="text-xs text-secondary">
                  Confidence: {Math.round((claim.confidenceScore || 0.85) * 100)}%
                </span>
              </div>
              <h4 className="font-editorial text-lg font-bold text-primary">"{claim.claimText}"</h4>
              <p className="text-xs text-secondary bg-[#F7F7F5] p-3 rounded border border-border">
                {claim.evidenceSummary}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Ask CrossView */}
      {activeTab === 'ask' && (
        <div className="bg-white p-6 rounded-lg border border-border shadow-card space-y-4">
          <h3 className="font-editorial text-2xl font-bold text-primary">
            Ask Questions About This Story
          </h3>
          <p className="text-xs text-secondary">
            Inquire directly about verified details or specific discrepancies in this event dossier.
          </p>

          <form onSubmit={handleAskSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. What do Reuters and Bloomberg disagree on?"
              value={askQuestion}
              onChange={(e) => setAskQuestion(e.target.value)}
              className="flex-1 p-2.5 text-sm bg-[#F7F7F5] border border-border rounded-md focus:outline-none focus:border-navy text-primary"
            />
            <button
              type="submit"
              disabled={asking || !askQuestion.trim()}
              className="px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-md hover:bg-navy-dark transition-colors disabled:opacity-50"
            >
              {asking ? 'Analyzing...' : 'Ask AI'}
            </button>
          </form>

          {askResponse && (
            <div className="mt-4 p-5 rounded-lg bg-[#F7F7F5] border border-border space-y-3 text-sm">
              <span className="font-bold text-navy block text-xs uppercase tracking-wider">
                Evidence-Grounded Answer:
              </span>
              <p className="leading-relaxed text-primary whitespace-pre-line">{askResponse.answer}</p>

              {askResponse.citations && askResponse.citations.length > 0 && (
                <div className="pt-3 border-t border-border flex flex-wrap gap-2 text-xs">
                  <span className="font-semibold text-secondary">Cited Outlets:</span>
                  {askResponse.citations.map((c, idx) => (
                    <a
                      key={idx}
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 rounded bg-white border border-border text-navy font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <span>{c.source_name}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
