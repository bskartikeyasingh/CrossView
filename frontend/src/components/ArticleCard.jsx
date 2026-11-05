import React, { useState } from 'react';
import { ExternalLink, Bookmark, Clock, Share2, Check } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ArticleCard({ article, onBookmarkToggled }) {
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  const handleBookmark = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to save articles to your bookmarks.');
      return;
    }

    try {
      if (!bookmarked) {
        await apiService.createBookmark({
          itemType: 'article',
          articleId: article._id || article.id,
          title: article.title,
          category: article.category,
        });
        setBookmarked(true);
      }
      if (onBookmarkToggled) onBookmarkToggled(article);
    } catch (err) {
      console.warn('Bookmark error:', err.message);
    }
  };

  const handleShare = (e) => {
    e.preventDefault();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(article.url || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-border hover:border-mutedBlue/50 transition-all duration-200 overflow-hidden shadow-card flex flex-col group">
      {/* Image if available */}
      {article.imageUrl ? (
        <div className="relative h-44 overflow-hidden bg-gray-100">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="absolute top-2.5 left-2.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-sm text-navy shadow-xs">
              {article.category || 'General'}
            </span>
          </div>
        </div>
      ) : (
        <div className="pt-3 px-4">
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-navy/10 text-navy">
            {article.category || 'General'}
          </span>
        </div>
      )}

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Publisher & Meta */}
          <div className="flex items-center justify-between text-xs text-secondary mb-2">
            <span className="font-semibold text-primary">{article.sourceName || 'Publisher'}</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Headline */}
          <h3 className="font-editorial text-lg font-bold text-primary group-hover:text-navy leading-snug line-clamp-2 mb-2 transition-colors">
            {article.title}
          </h3>

          {/* Snippet */}
          {article.description && (
            <p className="text-xs text-secondary line-clamp-3 leading-relaxed mb-4">
              {article.description}
            </p>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="pt-3 border-t border-border flex items-center justify-between mt-auto">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy hover:text-navy-dark hover:underline"
          >
            <span>Original Article</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className="p-1.5 text-secondary hover:text-primary rounded hover:bg-background transition-colors"
              title={copied ? 'Link copied!' : 'Share article'}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-corroborated" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleBookmark}
              className={`p-1.5 rounded transition-colors ${
                bookmarked
                  ? 'text-navy bg-navy/10'
                  : 'text-secondary hover:text-primary hover:bg-background'
              }`}
              title="Bookmark article"
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

