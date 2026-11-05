import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileText,
  Search,
} from 'lucide-react';
import { apiService } from '../services/api';
import ArticleCard from '../components/ArticleCard';
import ReportCard from '../components/ReportCard';

export default function LandingPage() {
  const [overview, setOverview] = useState(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    apiService
      .getDashboardOverview()
      .then((res) => {
        if (isMounted && res.success) {
          setOverview(res);
        }
      })
      .catch((err) => console.warn('Overview load error:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const featuredStories = overview?.featuredNews && overview.featuredNews.length > 0
    ? overview.featuredNews
    : [
        {
          _id: 'default_hero_1',
          title: 'Global Climate Summit Finalizes Landmark Clean Energy Transition Accord in Geneva',
          description: 'Over 120 nations concluded marathon negotiations in Geneva, signing a binding pact committing to triple renewable capacity while establishing a $100 billion annual infrastructure fund.',
          sourceName: 'Reuters',
          category: 'Climate',
          publishedAt: new Date().toISOString(),
          imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop',
          eventId: overview?.trendingEvents?.[0]?._id || 'evt_default',
        },
        {
          _id: 'default_hero_2',
          title: 'Central Banks Announce Unified Regulatory Framework for Autonomous AI Trading Systems',
          description: 'International financial regulators agreed on strict risk thresholds, mandatory human circuit-breakers, and algorithmic auditing across institutional capital markets.',
          sourceName: 'Bloomberg',
          category: 'Economy',
          publishedAt: new Date().toISOString(),
          imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop',
          eventId: overview?.trendingEvents?.[1]?._id || 'evt_default',
        },
      ];

  const currentHero = featuredStories[featuredIndex % featuredStories.length];

  return (
    <div className="space-y-16 pb-16">
      {/* Editorial Hero Section (Inspired by Reference 2) */}
      <section className="relative bg-primary overflow-hidden">
        {/* Large Photographic Background with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={currentHero.imageUrl || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop'}
            alt={currentHero.title}
            className="w-full h-full object-cover opacity-35 filter brightness-75 scale-105 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#13161B] via-[#13161B]/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-24">
          <div className="max-w-3xl">
            {/* Category Pill & Verification Tag */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-md">
                {currentHero.category || 'Developing Story'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Multi-Source Verified</span>
              </span>
            </div>

            {/* Editorial Headline */}
            <h1 className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.15] mb-5">
              {currentHero.title}
            </h1>

            {/* Summary */}
            <p className="text-base sm:text-lg text-gray-200 line-clamp-3 leading-relaxed mb-8">
              {currentHero.description}
            </p>

            {/* Publisher Info & Date */}
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-300 mb-8 border-l-2 border-mutedBlue pl-3">
              <span className="font-semibold text-white">First reported by {currentHero.sourceName || 'Reuters'}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {new Date(currentHero.publishedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <span>•</span>
              <span className="text-amber-300 font-medium">3 Publisher Perspectives Available</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              {currentHero.eventId ? (
                <Link
                  to={`/events/${currentHero.eventId}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-white text-primary font-semibold text-sm hover:bg-gray-100 transition-all shadow-elevated"
                >
                  <span>Read Consolidated Story</span>
                  <ArrowRight className="w-4 h-4 text-navy" />
                </Link>
              ) : (
                <a
                  href={currentHero.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-white text-primary font-semibold text-sm hover:bg-gray-100 transition-all shadow-elevated"
                >
                  <span>Read Primary Report</span>
                  <ExternalLink className="w-4 h-4 text-navy" />
                </a>
              )}

              <Link
                to={`/compare?eventId=${currentHero.eventId || ''}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md border border-white/20 transition-all"
              >
                <span>Explore Perspectives</span>
              </Link>
            </div>
          </div>

          {/* Hero Story Navigation Bar (Thumbnail Carousel Indicators) */}
          <div className="mt-14 pt-8 border-t border-white/15 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Featured Stories ({featuredIndex + 1}/{featuredStories.length}):
              </span>
              <div className="flex items-center gap-2">
                {featuredStories.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setFeaturedIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      featuredIndex === idx ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                    title={s.title}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFeaturedIndex((prev) => (prev > 0 ? prev - 1 : featuredStories.length - 1))}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Previous story"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setFeaturedIndex((prev) => (prev + 1) % featuredStories.length)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Next story"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stories Carousel / Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              Curated Intelligence
            </span>
            <h2 className="font-editorial text-3xl font-bold text-primary mt-1">
              Top Multi-Publisher Dispatches
            </h2>
          </div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:underline"
          >
            <span>View All News</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(overview?.featuredNews || []).slice(0, 3).map((article) => (
            <ArticleCard key={article._id || article.id} article={article} />
          ))}
        </div>
      </section>

      {/* Core Innovation Showcase: "One Event. Multiple Reports. One Clearer Understanding." */}
      <section className="bg-white border-y border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-navy/10 text-navy mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              The CrossView Advantage
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-primary tracking-tight leading-tight">
              One Event. Multiple Reports. One Clearer Understanding.
            </h2>
            <p className="mt-4 text-base text-secondary leading-relaxed">
              Modern newsrooms emphasize different facets, quote distinct sources, and occasionally report conflicting numbers. CrossView automatically groups coverage of the same event, extracts factual claims, highlights disputes, and creates balanced AI syntheses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-[#F7F7F5] border border-border">
              <div className="w-12 h-12 rounded-lg bg-navy text-white flex items-center justify-center font-bold text-lg mb-4">
                1
              </div>
              <h3 className="font-editorial text-xl font-bold text-primary mb-2">
                Semantic Event Clustering
              </h3>
              <p className="text-sm text-secondary leading-relaxed">
                Using Sentence Transformers (`all-MiniLM-L6-v2`) and cosine similarity, CrossView links articles reporting the same occurrence, distinguishing true event developments from generic topic noise.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-[#F7F7F5] border border-border">
              <div className="w-12 h-12 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h3 className="font-editorial text-xl font-bold text-primary mb-2">
                Corroboration & Disagreements
              </h3>
              <p className="text-sm text-secondary leading-relaxed">
                Claims are systematically analyzed into four explicit categories: corroborated by multiple independent reports, single-source assertions, disputed details, or unverified claims.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-[#F7F7F5] border border-border">
              <div className="w-12 h-12 rounded-lg bg-navy-dark text-white flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h3 className="font-editorial text-xl font-bold text-primary mb-2">
                Evidence-Grounded Reports
              </h3>
              <p className="text-sm text-secondary leading-relaxed">
                CrossView uses Google Gemini with rigorous neutrality guardrails to produce consolidated news reports that attribute all statements to original publishers without inventing facts.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-md bg-navy text-white font-semibold text-sm hover:bg-navy-dark transition-all shadow-card"
            >
              <span>Explore The Intelligence Console</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Events & AI Reports Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left 2 Cols: AI Consolidated Reports */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                  Synthesized Intelligence
                </span>
                <h3 className="font-editorial text-2xl font-bold text-primary mt-1">
                  Latest Consolidated Reports
                </h3>
              </div>
              <Link to="/news-feed" className="text-xs font-semibold text-navy hover:underline">
                View All Reports →
              </Link>
            </div>

            <div className="space-y-6">
              {(overview?.latestReports || []).slice(0, 2).map((report) => (
                <ReportCard key={report._id || report.eventId} report={report} />
              ))}
            </div>
          </div>

          {/* Right Col: Trending Developing Events */}
          <div className="space-y-6">
            <div className="pb-4 border-b border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                Active Clusters
              </span>
              <h3 className="font-editorial text-2xl font-bold text-primary mt-1">
                Trending Events
              </h3>
            </div>

            <div className="space-y-4">
              {(overview?.trendingEvents || []).slice(0, 4).map((evt) => (
                <div
                  key={evt._id}
                  className="bg-white p-4 rounded-lg border border-border hover:border-navy transition-colors shadow-xs"
                >
                  <div className="flex items-center justify-between text-[11px] text-secondary mb-1.5">
                    <span className="font-bold uppercase tracking-wider text-navy">
                      {evt.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {evt.sourceCount} publishers
                    </span>
                  </div>
                  <h4 className="font-editorial text-base font-bold text-primary hover:text-navy transition-colors line-clamp-2">
                    <Link to={`/events/${evt._id}`}>{evt.title}</Link>
                  </h4>
                  <p className="text-xs text-secondary line-clamp-2 mt-1">
                    {evt.summary}
                  </p>
                  <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-xs">
                    <Link
                      to={`/compare?eventId=${evt._id}`}
                      className="text-navy font-semibold hover:underline"
                    >
                      Compare Outlets →
                    </Link>
                    <span className="text-secondary text-[11px]">
                      {new Date(evt.lastUpdatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
