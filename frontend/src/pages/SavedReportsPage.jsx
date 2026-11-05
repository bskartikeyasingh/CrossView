import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Trash2, ArrowRight, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import { apiService } from '../services/api';

export default function SavedReportsPage() {
  const [savedReports, setSavedReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedReports();
  }, []);

  const loadSavedReports = async () => {
    setLoading(true);
    try {
      const res = await apiService.getSavedReports();
      if (res.success && res.savedReports) {
        setSavedReports(res.savedReports);
      }
    } catch (err) {
      console.warn('Saved reports error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiService.deleteSavedReport(id);
      setSavedReports((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert('Could not delete saved report: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-border shadow-card">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5 text-navy" />
          <h1 className="font-editorial text-3xl font-bold text-primary">
            Saved Intelligence Reports
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-secondary leading-relaxed">
          Permanent archive of AI-consolidated news reports saved to your CrossView analyst account.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-secondary bg-white rounded-lg border border-border">
          <div className="w-8 h-8 border-3 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Retrieving archived intelligence dossiers...</span>
        </div>
      ) : savedReports.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-lg border border-border p-8 text-xs text-secondary space-y-3">
          <FileText className="w-8 h-8 text-secondary/40 mx-auto" />
          <p className="text-sm font-semibold text-primary">No saved intelligence reports yet.</p>
          <p className="text-xs text-secondary">Browse the AI News Feed and click "Save Report" to add reports to your dossier.</p>
          <div>
            <Link
              to="/dashboard/feed"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-navy text-white text-xs font-semibold hover:bg-navy-dark transition-colors"
            >
              <span>Explore AI Feed</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {savedReports.map((sr) => (
            <div
              key={sr._id}
              className="bg-white p-5 rounded-lg border border-border hover:border-navy/40 transition-all shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-navy text-white">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    AI Report
                  </span>
                  <span className="text-secondary font-medium">
                    {sr.category || 'General'} • {sr.sourceCount || 2} Outlets
                  </span>
                </div>

                <h3 className="font-editorial text-xl font-bold text-primary">
                  {sr.headline}
                </h3>

                <p className="text-xs text-secondary">
                  Saved on {new Date(sr.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <Link
                  to={`/events/${sr.eventId}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-navy text-white text-xs font-semibold hover:bg-navy-dark transition-colors"
                >
                  <span>Revisit Full File</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => handleDelete(sr._id)}
                  className="p-2 text-secondary hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

