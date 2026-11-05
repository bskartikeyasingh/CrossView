import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, ArrowRight, ShieldCheck, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center text-white font-bold text-xl shadow-sm transition-transform group-hover:scale-105">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-editorial text-2xl font-bold tracking-tight text-primary block leading-none">
                  CrossView
                </span>
                <span className="text-[10px] uppercase tracking-wider text-secondary font-medium">
                  News Intelligence
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Editorial Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-primary hover:text-navy transition-colors">
              Home
            </Link>
            <Link to="/news-feed" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
              Latest News
            </Link>
            <Link to="/explore" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
              Explore
            </Link>
            <Link to="/compare" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
              Perspectives
            </Link>
            <Link to="/claims" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
              Claim Monitor
            </Link>
          </nav>

          {/* Right: Search, Auth actions */}
          <div className="hidden md:flex items-center gap-4">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search multi-publisher news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-64 pl-3 pr-8 py-1.5 text-sm border border-border rounded-full focus:outline-none focus:border-navy bg-[#F7F7F5]"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-2 text-secondary hover:text-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-secondary hover:text-primary rounded-full hover:bg-background transition-colors"
                title="Search news"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-navy hover:bg-navy-dark rounded-md transition-all shadow-sm"
              >
                Intelligence Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-primary hover:text-navy transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-navy hover:bg-navy-dark rounded-md transition-all shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-primary rounded-md focus:outline-none hover:bg-background"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 pt-4 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-primary hover:text-navy"
          >
            Home
          </Link>
          <Link
            to="/news-feed"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-secondary hover:text-primary"
          >
            Latest News
          </Link>
          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-secondary hover:text-primary"
          >
            Explore
          </Link>
          <Link
            to="/compare"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-secondary hover:text-primary"
          >
            Perspectives
          </Link>
          <Link
            to="/claims"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-secondary hover:text-primary"
          >
            Claim Monitor
          </Link>
          <div className="pt-4 border-t border-border flex flex-col gap-2">
            {user ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 px-4 text-sm font-semibold text-white bg-navy rounded-md"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 px-4 text-sm font-medium text-primary border border-border rounded-md"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 text-sm font-semibold text-white bg-navy rounded-md"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

