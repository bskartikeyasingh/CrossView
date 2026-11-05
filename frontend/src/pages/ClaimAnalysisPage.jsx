import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Filter,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileCheck,
  ExternalLink,
  Info,
  Clock,
  Layers,
} from 'lucide-react';
import { apiService } from '../services/api';
import ClaimBadge from '../components/ClaimBadge';

export default function ClaimAnalysisPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    loadClaims();
  }, [statusFilter, typeFilter]);

  const loadClaims = async () => {
    setLoading(true);
    try {
      const res = await apiService.getAllClaims({
        status: statusFilter !== 'All' ? statusFilter : undefined,
        type: typeFilter !== 'All' ? typeFilter : undefined,
        limit: 30,
      });
      if (res.success && res.claims) {
        setClaims(res.claims);
      }
    } catch (err) {
      console.warn('Claims fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    'All',
    'Corroborated by multiple independent sources',
    'Supported by one available source',
    'Disputed by available reports',
    'Unverified or insufficient evidence',
  ];

  const typeOptions = ['All', 'factual', 'statistic', 'policy', 'assertion', 'quote'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-border shadow-card">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-5 h-5 text-navy" />
          <h1 className="font-editorial text-3xl font-bold text-primary">
            Claim & Evidence Analysis
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-secondary max-w-2xl leading-relaxed">
          CrossView's evidence evaluator extracts specific assertions made across articles, cross-referencing supporting and contradicting coverage.
        </p>

        {/* Methodology Notice */}
        <div className="mt-4 p-3 bg-[#F7F7F5] border border-border rounded-md text-xs text-secondary flex items-start gap-2">
          <Info className="w-4 h-4 text-navy flex-shrink-0 mt-0.5" />
          <span>
            <strong>Editorial Standard:</strong> Evidence labels reflect current available publisher coverage and reporting corroboration, not definitive philosophical truth verdicts.
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg border border-border shadow-card">
        {/* Status Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-secondary flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Evidence Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-1.5 bg-[#F7F7F5] border border-border rounded text-xs font-medium focus:outline-none focus:border-navy text-primary"
          >
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-secondary">Claim Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-1.5 bg-[#F7F7F5] border border-border rounded text-xs font-medium focus:outline-none focus:border-navy text-primary uppercase"
          >
            {typeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Claims List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-secondary bg-white rounded-lg border border-border">
          <div className="w-8 h-8 border-3 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span>Evaluating multi-source evidence matrix...</span>
        </div>
      ) : claims.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-lg border border-border p-8 text-xs text-secondary">
          No claims found matching the selected filter parameters.
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div
              key={claim._id}
              className="bg-white p-6 rounded-lg border border-border hover:border-navy/40 transition-all shadow-card space-y-4"
            >
              {/* Claim Header */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <ClaimBadge status={claim.evidenceStatus} />
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-secondary">
                    {claim.claimType}
                  </span>
                </div>
                <div className="text-xs text-secondary font-medium">
                  Confidence Score: {Math.round((claim.confidenceScore || 0.85) * 100)}%
                </div>
              </div>

              {/* Claim Assertion Text */}
              <h3 className="font-editorial text-lg sm:text-xl font-bold text-primary leading-snug">
                "{claim.claimText}"
              </h3>

              {/* Evidence Summary */}
              <p className="text-xs sm:text-sm text-secondary bg-[#F7F7F5] p-3 rounded border border-border leading-relaxed">
                <span className="font-semibold text-primary block mb-0.5">Evidence Assessment:</span>
                {claim.evidenceSummary}
              </p>

              {/* Supporting & Contradicting Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Supporting Sources */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Supporting Evidence ({claim.supportingEvidence?.length || 0})
                  </span>
                  <div className="space-y-1.5">
                    {claim.supportingEvidence && claim.supportingEvidence.length > 0 ? (
                      claim.supportingEvidence.map((s, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded bg-emerald-50/50 border border-emerald-100 text-xs"
                        >
                          <div className="flex items-center justify-between font-semibold text-emerald-950">
                            <span>{s.sourceName || 'Publisher'}</span>
                            {s.url && (
                              <a
                                href={s.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-700 hover:underline inline-flex items-center gap-0.5 text-[10px]"
                              >
                                <span>Source</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                          {s.quote && (
                            <p className="text-secondary italic mt-1 text-[11px]">
                              "{s.quote}"
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-secondary italic">No direct supporting sources recorded.</p>
                    )}
                  </div>
                </div>

                {/* Contradicting Sources */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Contradicting / Divergent ({claim.contradictingEvidence?.length || 0})
                  </span>
                  <div className="space-y-1.5">
                    {claim.contradictingEvidence && claim.contradictingEvidence.length > 0 ? (
                      claim.contradictingEvidence.map((c, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded bg-amber-50/50 border border-amber-100 text-xs"
                        >
                          <div className="flex items-center justify-between font-semibold text-amber-950">
                            <span>{c.sourceName || 'Divergent Source'}</span>
                            {c.url && (
                              <a
                                href={c.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-amber-700 hover:underline inline-flex items-center gap-0.5 text-[10px]"
                              >
                                <span>Source</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                          {c.quote && (
                            <p className="text-secondary italic mt-1 text-[11px]">
                              "{c.quote}"
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-2.5 rounded bg-gray-50 border border-border text-xs text-secondary italic">
                        No contradictions recorded in monitored coverage.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
