import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Bookmark,
  Share2,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ReportCard({ report, onSaveReport }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const sourcesCount = report.sourceReferences?.length || report.sourcesCount || 2;
  const formattedDate = report.generatedAt
    ? new Date(report.generatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recent Analysis';

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to save consolidated intelligence reports.');
      return;
    }

    try {
      if (!saved) {
        await apiService.createSavedReport({
          reportId: report._id || report.id,
          eventId: report.eventId,
          headline: report.headline,
          category: report.category || 'General',
          sourceCount: sourcesCount,
        });
        setSaved(true);
      }
      if (onSaveReport) onSaveReport(report);
    } catch (err) {
      console.warn('Save report error:', err.message);
    }
  };

  return (
    <article className="bg-white rounded-lg border border-border hover:border-navy/40 transition-all duration-200 overflow-hidden shadow-card p-6 flex flex-col justify-between">
      <div>
        {/* Top Intelligence Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider bg-navy text-white">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Consolidated Report</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-primary">
              <Layers className="w-3 h-3 text-secondary" />
              <span>{sourcesCount} Independent Sources</span>
            </span>
            {report.category && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-navy/10 text-navy border border-navy/20">
                {report.category}
              </span>
            )}
          </div>

          <div className="text-xs text-secondary font-medium">
            Updated: {formattedDate}
          </div>
        </div>

        {/* Headline */}
        <h2 className="font-editorial text-xl sm:text-2xl font-bold text-primary hover:text-navy transition-colors mb-3 leading-snug">
          <Link to={`/events/${report.eventId || report._id}`}>
            {report.headline}
          </Link>
        </h2>

        {/* Executive Overview */}
        <p className="text-sm text-secondary leading-relaxed mb-4">
          {report.overview}
        </p>

        {/* Expandable Key Highlights */}
        {expanded && (
          <div className="my-4 pt-4 border-t border-border space-y-4 text-xs">
            {report.sharedInformation && report.sharedInformation.length > 0 && (
              <div>
                <h4 className="font-semibold text-emerald-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Corroborated Shared Points
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-secondary">
                  {report.sharedInformation.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {report.disputedClaims && report.disputedClaims.length > 0 && (
              <div>
                <h4 className="font-semibold text-amber-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  Identified Disputed Details
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-secondary">
                  {report.disputedClaims.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Source Citations */}
            {report.sourceReferences && report.sourceReferences.length > 0 && (
              <div className="pt-2 border-t border-border">
                <h5 className="font-semibold text-primary mb-2">Original Monitored Outlets:</h5>
                <div className="flex flex-wrap gap-2">
                  {report.sourceReferences.map((ref, idx) => (
                    <a
                      key={idx}
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#F7F7F5] border border-border text-navy hover:underline text-[11px]"
                    >
                      <span>{ref.sourceName || 'Outlet'}</span>
                      <span className="text-secondary text-[10px]">({ref.title?.substring(0, 25)}...)</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Actions & Disclaimer */}
      <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
        <div className="flex items-center gap-2">
          <Link
            to={`/events/${report.eventId || report._id}`}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-navy text-white text-xs font-semibold hover:bg-navy-dark transition-colors shadow-xs"
          >
            <span>Full Intelligence File</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to={`/dashboard/compare?eventId=${report.eventId || report._id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-[#F7F7F5] text-primary text-xs font-semibold hover:bg-white transition-colors"
          >
            <span>Compare Outlets</span>
          </Link>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded text-secondary hover:text-primary hover:bg-[#F7F7F5] transition-colors"
            title={expanded ? 'Collapse preview' : 'Quick preview'}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold transition-colors ${
              saved
                ? 'bg-navy/10 text-navy'
                : 'text-secondary hover:text-primary hover:bg-[#F7F7F5] border border-border'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{saved ? 'Saved' : 'Save Report'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

