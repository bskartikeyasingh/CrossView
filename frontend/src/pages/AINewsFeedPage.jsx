import React, { useState, useEffect } from 'react';
import { Sparkles, Filter, Layers, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';
import ReportCard from '../components/ReportCard';

export default function AINewsFeedPage() {
  const [reports, setReports] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('latest'); // 'latest' | 'sources'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [overviewRes, eventsRes] = await Promise.all([
        apiService.getDashboardOverview(),
        apiService.getEvents({ limit: 15 }),
      ]);

      if (overviewRes.success && overviewRes.latestReports) {
        setReports(overviewRes.latestReports);
      }
      if (eventsRes.success && eventsRes.events) {
        setEvents(eventsRes.events);
      }
    } catch (err) {
      console.warn('AI News Feed error:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Climate', 'Economy', 'Technology', 'World', 'Politics'];

  let displayedReports = [...reports];
  if (selectedCategory !== 'All') {
    displayedReports = displayedReports.filter(
      (r) => r.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }

  if (sortBy === 'sources') {
    displayedReports.sort(
      (a, b) =>
        (b.sourceReferences?.length || 2) - (a.sourceReferences?.length || 2)
    );
  } else {
    displayedReports.sort(
      (a, b) => new Date(b.generatedAt) - new Date(a.generatedAt)
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-lg border border-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1 rounded bg-navy/10 text-navy">
              <Sparkles className="w-4 h-4 text-navy" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              CrossView Intelligence Stream
            </span>
          </div>
          <h1 className="font-editorial text-3xl font-bold text-primary">
            AI Consolidated News Feed
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1 max-w-2xl leading-relaxed">
            Every report below is an automated, evidence-grounded synthesis generated from multiple independent news sources covering the same real-world event.
          </p>
        </div>

        {/* AI Disclaimer Pill */}
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-md text-xs text-amber-900 max-w-xs">
          <div className="flex items-center gap-1.5 font-bold mb-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Transparency</span>
          </div>
          <p className="text-[11px] leading-snug">
            Synthesized strictly from available publisher material. Always verified against direct source dispatches.
          </p>
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg border border-border shadow-card">
        {/* Categories */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-secondary mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-navy text-white font-semibold'
                  : 'bg-[#F7F7F5] text-secondary hover:text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-secondary font-semibold">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-1.5 bg-[#F7F7F5] border border-border rounded text-xs font-medium focus:outline-none focus:border-navy text-primary"
          >
            <option value="latest">Latest Analysis</option>
            <option value="sources">Most Corroborated Sources</option>
          </select>
        </div>
      </div>

      {/* Reports Feed */}
      {loading ? (
        <div className="py-20 text-center text-xs text-secondary">
          <div className="w-8 h-8 border-3 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Synthesizing multi-publisher news intelligence...</span>
        </div>
      ) : displayedReports.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-lg border border-border p-8">
          <p className="text-sm font-semibold text-primary">No consolidated reports matching this filter.</p>
          <p className="text-xs text-secondary mt-1">Select a different category or click "Sync Intelligence" above.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {displayedReports.map((report) => (
            <ReportCard key={report._id || report.eventId} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}

