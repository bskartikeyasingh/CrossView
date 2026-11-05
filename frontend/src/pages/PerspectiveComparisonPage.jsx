import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  GitCompare,
  ShieldCheck,
  AlertTriangle,
  Layers,
  ExternalLink,
  ChevronRight,
  Info,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { apiService } from '../services/api';

export default function PerspectiveComparisonPage() {
  const location = useLocation();
  const initialEventId = new URLSearchParams(location.search).get('eventId') || '';

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(initialEventId);
  const [comparison, setComparison] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    // Load events list for the selector
    apiService
      .getEvents({ limit: 10 })
      .then((res) => {
        if (res.success && res.events) {
          setEvents(res.events);
          if (!selectedEventId && res.events.length > 0) {
            setSelectedEventId(res.events[0]._id);
          }
        }
      })
      .catch((err) => console.warn('Events load error:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadComparisonData(selectedEventId);
    }
  }, [selectedEventId]);

  const loadComparisonData = async (eventId) => {
    setComparing(true);
    try {
      const [compRes, artsRes] = await Promise.all([
        apiService.getEventComparison(eventId),
        apiService.getEventArticles(eventId),
      ]);

      if (compRes.success && compRes.comparison) {
        setComparison(compRes.comparison);
      }
      if (artsRes.success && artsRes.articles) {
        setArticles(artsRes.articles);
      }
    } catch (err) {
      console.warn('Comparison load error:', err);
    } finally {
      setComparing(false);
    }
  };

  const selectedEvent = events.find((e) => e._id === selectedEventId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1 rounded bg-navy/10 text-navy">
              <GitCompare className="w-5 h-5 text-navy" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              Analytical Matrix
            </span>
          </div>
          <h1 className="font-editorial text-3xl font-bold text-primary">
            Perspective & Coverage Comparison
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1 max-w-2xl leading-relaxed">
            Side-by-side evaluation of how multiple publishing organizations report on the same event. Categorized into corroborated shared facts, nuanced reporting emphases, and conflicting statements.
          </p>
        </div>

        {/* Event Selector Dropdown */}
        <div className="w-full md:w-72">
          <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
            Select Event Cluster
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full p-2 bg-[#F7F7F5] border border-border rounded text-xs font-medium text-primary focus:outline-none focus:border-navy"
          >
            {events.map((evt) => (
              <option key={evt._id} value={evt._id}>
                {evt.title.substring(0, 50)}... ({evt.sourceCount} sources)
              </option>
            ))}
          </select>
        </div>
      </div>

      {comparing ? (
        <div className="py-20 text-center text-xs text-secondary bg-white rounded-lg border border-border">
          <div className="w-8 h-8 border-3 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Cross-referencing publisher dispatches and extracting claims...</span>
        </div>
      ) : !comparison ? (
        <div className="py-16 text-center bg-white rounded-lg border border-border p-8 text-xs text-secondary">
          No comparison matrix available for this event yet.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Overview */}
          <div className="bg-white p-5 rounded-lg border border-border shadow-card">
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-1">
              Comparative Synthesis
            </h3>
            <p className="text-sm font-medium text-primary leading-relaxed">
              {comparison.summary}
            </p>
          </div>

          {/* Section 1: Shared Information (Green / Corroborated) */}
          <div className="bg-white rounded-lg border border-border shadow-card overflow-hidden">
            <div className="bg-emerald-50/70 border-b border-emerald-100 p-4 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wide">
                  Shared Information (Corroborated)
                </h3>
                <p className="text-xs text-emerald-800">
                  Key details and statements confirmed across multiple independent reports
                </p>
              </div>
            </div>

            <div className="p-5 divide-y divide-border space-y-4">
              {comparison.shared_information && comparison.shared_information.length > 0 ? (
                comparison.shared_information.map((item, idx) => (
                  <div key={idx} className={idx > 0 ? 'pt-4' : ''}>
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <h4 className="font-semibold text-sm text-primary">
                        {item.topic || 'Corroborated Fact'}
                      </h4>
                    </div>
                    <p className="text-xs sm:text-sm text-secondary pl-5 leading-relaxed">
                      {item.description}
                    </p>
                    {item.sources && item.sources.length > 0 && (
                      <div className="mt-2 pl-5 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[11px] font-semibold text-secondary">Reported by:</span>
                        {item.sources.map((src, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100/70 text-emerald-900 border border-emerald-200"
                          >
                            {src}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-secondary">No shared consensus items identified.</p>
              )}
            </div>
          </div>

          {/* Section 2: Different Reporting (Nuance & Framing) */}
          <div className="bg-white rounded-lg border border-border shadow-card overflow-hidden">
            <div className="bg-blue-50/70 border-b border-blue-100 p-4 flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-blue-700 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wide">
                  Different Reporting (Framing & Emphasis)
                </h3>
                <p className="text-xs text-blue-800">
                  Variations in narrative focus, unique quotes, and contextual angles
                </p>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {comparison.different_reporting && comparison.different_reporting.length > 0 ? (
                comparison.different_reporting.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-md bg-[#F7F7F5] border border-border space-y-3">
                    <h4 className="font-bold text-sm text-navy uppercase tracking-wider">
                      {item.aspect || `Perspective Angle ${idx + 1}`}
                    </h4>
                    <p className="text-xs text-secondary leading-relaxed">
                      {item.analysis}
                    </p>

                    {item.perspectives && item.perspectives.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {item.perspectives.map((p, pIdx) => (
                          <div
                            key={pIdx}
                            className="p-3 bg-white rounded border border-border text-xs"
                          >
                            <span className="font-bold text-primary block mb-1">
                              {p.source || 'Publisher'}:
                            </span>
                            <span className="text-secondary italic">
                              "{p.framing}"
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-secondary">No distinct editorial framing variations identified.</p>
              )}
            </div>
          </div>

          {/* Section 3: Conflicting Claims (Amber / Disputed) */}
          <div className="bg-white rounded-lg border border-border shadow-card overflow-hidden">
            <div className="bg-amber-50/70 border-b border-amber-100 p-4 flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                  Conflicting Claims & Diverging Data
                </h3>
                <p className="text-xs text-amber-800">
                  Points where monitored reports explicitly disagree on numbers, statements, or timelines
                </p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {comparison.conflicting_claims && comparison.conflicting_claims.length > 0 ? (
                comparison.conflicting_claims.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-md bg-amber-50/40 border border-amber-200 text-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-amber-950">
                        {item.topic || 'Disputed Parameter'}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900">
                        Divergent Reporting
                      </span>
                    </div>

                    <p className="text-secondary leading-relaxed">
                      {item.dispute_nature}
                    </p>

                    {item.conflicting_points && item.conflicting_points.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {item.conflicting_points.map((pt, ptIdx) => (
                          <div
                            key={ptIdx}
                            className="p-3 bg-white rounded border border-amber-200 text-xs"
                          >
                            <span className="font-bold text-amber-900 block mb-1">
                              {pt.source || 'Outlet'}:
                            </span>
                            <span className="text-primary font-medium">
                              "{pt.stated}"
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-secondary">
                  No active conflicting claims detected across monitored coverage.
                </p>
              )}
            </div>
          </div>

          {/* Original Source Articles Bar */}
          <div className="bg-white p-5 rounded-lg border border-border shadow-card">
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-3">
              Analyzed Primary Source Material ({articles.length} dispatches)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {articles.map((art) => (
                <div
                  key={art._id || art.id}
                  className="p-3 bg-[#F7F7F5] rounded border border-border flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase text-navy block">
                      {art.sourceName}
                    </span>
                    <h5 className="font-editorial text-sm font-bold text-primary line-clamp-2 mt-0.5">
                      {art.title}
                    </h5>
                  </div>
                  <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-[11px]">
                    <span className="text-secondary">
                      {new Date(art.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <a
                      href={art.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-navy font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <span>Read</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
