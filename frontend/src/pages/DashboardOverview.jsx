import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Layers,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Radio,
  FileText,
} from 'lucide-react';
import { apiService } from '../services/api';
import NewsActivityChart from '../components/NewsActivityChart';
import ClaimBadge from '../components/ClaimBadge';
import ArticleCard from '../components/ArticleCard';
import ReportCard from '../components/ReportCard';

export default function DashboardOverview() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPublisher, setSelectedPublisher] = useState('All');
  const [filterDevelopingOnly, setFilterDevelopingOnly] = useState(false);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = () => {
    setLoading(true);
    apiService
      .getDashboardOverview()
      .then((res) => {
        if (res.success) {
          setOverview(res);
        }
      })
      .catch((err) => console.warn('Overview fetch error:', err))
      .finally(() => setLoading(false));
  };

  const categories = ['All', 'Climate', 'Economy', 'Technology', 'World', 'Politics'];
  const publishers = ['All', ...(overview?.publishers || ['Reuters', 'Associated Press', 'Financial Times', 'Bloomberg', 'MIT Technology Review'])];

  // Filter trending events by category & flags
  let filteredEvents = overview?.trendingEvents || [];
  if (selectedCategory !== 'All') {
    filteredEvents = filteredEvents.filter(
      (e) => e.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }
  if (filterDevelopingOnly) {
    filteredEvents = filteredEvents.filter((e) => e.status === 'active' || e.status === 'developing');
  }

  return (
    <div className="space-y-6">
      {/* Top News Activity Chart (Reference 1 Inspiration) */}
      <NewsActivityChart />

      {/* Main 3-Column / Analytical Grid (Reference 1 Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Contextual Filters (3 cols on lg) */}
        <div className="lg:col-span-3 space-y-5 bg-white p-4 rounded-lg border border-border shadow-card">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Filter className="w-4 h-4 text-navy" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
              Intelligence Filters
            </h3>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
              Topic Domain
            </label>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors ${
                    selectedCategory === cat
                      ? 'bg-navy text-white font-semibold'
                      : 'text-primary hover:bg-[#F7F7F5]'
                  }`}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Publisher Filter */}
          <div className="pt-3 border-t border-border">
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
              Reporting Publisher
            </label>
            <select
              value={selectedPublisher}
              onChange={(e) => setSelectedPublisher(e.target.value)}
              className="w-full text-xs p-2 bg-[#F7F7F5] border border-border rounded focus:outline-none focus:border-navy text-primary"
            >
              {publishers.map((pub) => (
                <option key={pub} value={pub}>
                  {pub}
                </option>
              ))}
            </select>
          </div>

          {/* Developing Story Toggle */}
          <div className="pt-3 border-t border-border">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filterDevelopingOnly}
                onChange={(e) => setFilterDevelopingOnly(e.target.checked)}
                className="h-3.5 w-3.5 text-navy rounded border-border focus:ring-navy"
              />
              <span className="text-xs font-medium text-primary">
                Developing Stories Only
              </span>
            </label>
          </div>

          {/* Quick Metrics Widget */}
          <div className="pt-4 border-t border-border bg-[#F7F7F5] p-3 rounded-md space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-secondary">Tracked Outlets:</span>
              <span className="font-bold text-primary">{overview?.stats?.publishersCount || 12}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-secondary">Active Clusters:</span>
              <span className="font-bold text-primary">{overview?.stats?.totalEvents || 8}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-secondary">Synthesized Reports:</span>
              <span className="font-bold text-navy">{overview?.stats?.totalConsolidatedReports || 6}</span>
            </div>
          </div>
        </div>

        {/* Central Section: Trending Events & Consolidated Reports (6 cols on lg) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Section Header */}
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div>
              <h2 className="font-editorial text-2xl font-bold text-primary">
                Event Intelligence Stream
              </h2>
              <p className="text-xs text-secondary">
                Consolidated reports synthesized across independent dispatches
              </p>
            </div>
            <Link
              to="/dashboard/feed"
              className="text-xs font-semibold text-navy hover:underline flex items-center gap-1"
            >
              <span>AI Feed</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* AI Consolidated Reports */}
          <div className="space-y-6">
            {(overview?.latestReports || []).map((report) => (
              <ReportCard key={report._id || report.eventId} report={report} />
            ))}
          </div>

          {/* Central Featured Articles Grid */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-editorial text-xl font-bold text-primary">
                Latest Publisher Dispatches
              </h3>
              <Link to="/dashboard/explore" className="text-xs text-navy font-semibold hover:underline">
                Explore All News →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(overview?.featuredNews || []).slice(0, 4).map((article) => (
                <ArticleCard key={article._id || article.id} article={article} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Insights Panel: Disputed Claims & Critical Developments (3 cols on lg) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Disputed Claims Panel */}
          <div className="bg-white p-4 rounded-lg border border-border shadow-card space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                Disputed Claims
              </h3>
            </div>
            <p className="text-xs text-secondary leading-relaxed">
              Information where monitored outlets published diverging numbers or conflicting statements.
            </p>

            <div className="space-y-3">
              {(overview?.disputedClaims || []).slice(0, 3).map((claim) => (
                <div
                  key={claim._id}
                  className="p-2.5 rounded bg-amber-50/60 border border-amber-200 text-xs space-y-1.5"
                >
                  <p className="font-semibold text-primary line-clamp-2">
                    {claim.claimText}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-amber-900">
                    <ClaimBadge status={claim.evidenceStatus} />
                    <span className="font-medium">
                      {Math.round((claim.confidenceScore || 0.85) * 100)}% conf
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-right">
              <Link
                to="/dashboard/claims"
                className="text-xs font-semibold text-navy hover:underline"
              >
                Open Claim Monitor →
              </Link>
            </div>
          </div>

          {/* Perspective Comparison Quick Launch */}
          <div className="bg-white p-4 rounded-lg border border-border shadow-card space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <ShieldCheck className="w-4 h-4 text-navy" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                Multi-Source Compare
              </h3>
            </div>
            <p className="text-xs text-secondary leading-relaxed">
              Examine shared facts, distinct narrative emphasis, and contradictions side by side.
            </p>

            <div className="space-y-2">
              {filteredEvents.slice(0, 3).map((evt) => (
                <Link
                  key={evt._id}
                  to={`/dashboard/compare?eventId=${evt._id}`}
                  className="block p-2 rounded hover:bg-[#F7F7F5] border border-border transition-colors text-xs"
                >
                  <span className="font-bold text-navy block text-[10px] uppercase">
                    {evt.category} • {evt.sourceCount} sources
                  </span>
                  <span className="font-semibold text-primary line-clamp-1">
                    {evt.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Ask CrossView Assistant Promo */}
          <div className="bg-navy text-white p-4 rounded-lg shadow-card space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Ask CrossView
              </h4>
            </div>
            <p className="text-xs text-gray-200 leading-relaxed">
              Have questions about developing events? Ask our grounded conversational assistant. Every claim is attributed to original publisher citations.
            </p>
            <Link
              to="/dashboard/ask"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white text-navy font-semibold text-xs hover:bg-gray-100 transition-colors w-full justify-center"
            >
              <span>Ask a Question</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
