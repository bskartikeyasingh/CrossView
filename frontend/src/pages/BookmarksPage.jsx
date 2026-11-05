import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, ExternalLink, ArrowRight, Layers } from 'lucide-react';
import { apiService } from '../services/api';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const res = await apiService.getBookmarks();
      if (res.success && res.bookmarks) {
        setBookmarks(res.bookmarks);
      }
    } catch (err) {
      console.warn('Bookmarks load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiService.deleteBookmark(id);
      setBookmarks((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      alert('Could not remove bookmark: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-border shadow-card">
        <div className="flex items-center gap-2 mb-2">
          <Bookmark className="w-5 h-5 text-navy" />
          <h1 className="font-editorial text-3xl font-bold text-primary">
            Saved Bookmarks & Stories
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-secondary leading-relaxed">
          Manage saved articles, events, and intelligence reports linked to your authenticated CrossView analyst profile.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-secondary bg-white rounded-lg border border-border">
          <div className="w-8 h-8 border-3 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Loading saved bookmarks...</span>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-lg border border-border p-8 text-xs text-secondary space-y-3">
          <Bookmark className="w-8 h-8 text-secondary/40 mx-auto" />
          <p className="text-sm font-semibold text-primary">No saved bookmarks yet.</p>
          <p className="text-xs text-secondary">Browse the explore feed or event dossiers and click the bookmark icon to save.</p>
          <div>
            <Link
              to="/dashboard/explore"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-navy text-white text-xs font-semibold hover:bg-navy-dark transition-colors"
            >
              <span>Explore Dispatches</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookmarks.map((b) => (
            <div
              key={b._id}
              className="bg-white p-5 rounded-lg border border-border hover:border-navy/40 transition-all shadow-card flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-secondary mb-2">
                  <span className="font-bold uppercase tracking-wider text-navy text-[10px]">
                    {b.category || 'General'} • {b.itemType}
                  </span>
                  <button
                    onClick={() => handleDelete(b._id)}
                    className="text-secondary hover:text-red-600 transition-colors p-1"
                    title="Remove bookmark"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="font-editorial text-lg font-bold text-primary mb-2 line-clamp-2">
                  {b.title}
                </h3>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs mt-3">
                <span className="text-[11px] text-secondary">
                  Saved: {new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>

                {b.eventId ? (
                  <Link
                    to={`/events/${b.eventId}`}
                    className="text-navy font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <span>View Event</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <Link
                    to="/dashboard/explore"
                    className="text-navy font-semibold hover:underline"
                  >
                    View in Feed
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
