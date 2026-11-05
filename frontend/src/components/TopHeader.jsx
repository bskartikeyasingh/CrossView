import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RefreshCw, Menu, Bell, ShieldCheck, User as UserIcon } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TopHeader({ setMobileOpen, onRefreshComplete }) {
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/dashboard/explore?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSyncNews = async () => {
    setRefreshing(true);
    setStatusMessage('Syncing news & clustering...');
    try {
      const res = await apiService.refreshNews();
      setStatusMessage('Sync completed');
      if (onRefreshComplete) onRefreshComplete(res);
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      setStatusMessage('Sync failed: ' + err.message);
      setTimeout(() => setStatusMessage(''), 4000);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-border sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-subtle">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 text-secondary hover:text-primary rounded-md"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearch} className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Global intelligence search (events, claims, publishers)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-[#F7F7F5] border border-border rounded-md focus:outline-none focus:border-navy text-primary placeholder-secondary"
          />
        </form>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {statusMessage && (
          <span className="hidden sm:inline-block text-xs text-navy font-medium bg-navy/10 px-2.5 py-1 rounded-full animate-pulse">
            {statusMessage}
          </span>
        )}

        <button
          onClick={handleSyncNews}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-primary bg-[#F7F7F5] hover:bg-border rounded-md border border-border transition-colors disabled:opacity-50"
          title="Trigger news ingestion & semantic clustering"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-navy' : ''}`} />
          <span className="hidden sm:inline">Sync Intelligence</span>
        </button>

        <div className="h-6 w-px bg-border mx-1" />

        {/* User Identity Pill */}
        <div className="flex items-center gap-2 text-xs font-medium text-secondary">
          <div className="w-7 h-7 rounded-full bg-navy text-white flex items-center justify-center font-bold text-xs uppercase">
            {user?.name ? user.name[0] : 'A'}
          </div>
          <span className="hidden md:inline text-primary font-semibold">{user?.name || 'Analyst'}</span>
        </div>
      </div>
    </header>
  );
}
