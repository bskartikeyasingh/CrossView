import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Filter, Layers, Compass, ExternalLink, Bookmark } from 'lucide-react';
import { apiService } from '../services/api';
import ArticleCard from '../components/ArticleCard';

export default function ExploreNewsPage() {
  const location = useLocation();
  const initialQuery = new URLSearchParams(location.search).get('q') || '';

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState('All');
  const [publisher, setPublisher] = useState('All');
  const [publishersList, setPublishersList] = useState([]);

  useEffect(() => {
    fetchNews();
  }, [category, publisher]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      if (query.trim()) {
        const res = await apiService.searchNews(query.trim(), category !== 'All' ? category : undefined);
        if (res.success && res.articles) {
          setArticles(res.articles);
        }
      } else {
        const res = await apiService.getNews({
          category: category !== 'All' ? category : undefined,
          publisher: publisher !== 'All' ? publisher : undefined,
          limit: 30,
        });
        if (res.success && res.articles) {
          setArticles(res.articles);
          const pubs = Array.from(new Set(res.articles.map((a) => a.sourceName).filter(Boolean)));
          setPublishersList(['All', ...pubs]);
        }
      }
    } catch (err) {
      console.warn('News search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNews();
  };

  const categories = ['All', 'Climate', 'Economy', 'Technology', 'World', 'Politics', 'General'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-border shadow-card">
        <div className="flex items-center gap-2 mb-2">
          <Compass className="w-5 h-5 text-navy" />
          <h1 className="font-editorial text-3xl font-bold text-primary">
            Explore Monitored News Dispatches
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-secondary max-w-2xl leading-relaxed">
          Search across all normalized publisher feeds collected via GNews API and RSS channels. Filter by outlet, category, or search keywords to inspect primary sources.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-5 flex items-center gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by keywords, event names, or geopolitical developments..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-[#F7F7F5] border border-border rounded-md focus:outline-none focus:border-navy text-primary placeholder-secondary"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-navy hover:bg-navy-dark rounded-md transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg border border-border shadow-card">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-secondary mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                category === cat
                  ? 'bg-navy text-white font-semibold'
                  : 'bg-[#F7F7F5] text-secondary hover:text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Publisher Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-secondary font-semibold">Publisher:</span>
          <select
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            className="p-1.5 bg-[#F7F7F5] border border-border rounded text-xs font-medium focus:outline-none focus:border-navy text-primary"
          >
            {publishersList.map((pub) => (
              <option key={pub} value={pub}>
                {pub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-secondary">
          <div className="w-8 h-8 border-3 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Loading monitored dispatches...</span>
        </div>
      ) : articles.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-lg border border-border p-8">
          <p className="text-sm font-semibold text-primary">No articles found matching this query.</p>
          <p className="text-xs text-secondary mt-1">Try clearing your filters or refreshing the news stream.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article._id || article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

