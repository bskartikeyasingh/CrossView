import React from 'react';
import { CheckCircle2, AlertTriangle, HelpCircle, FileCheck } from 'lucide-react';

export default function ClaimBadge({ status }) {
  if (!status) return null;

  if (status.includes('Corroborated')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-emerald-800 border border-green-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
        <span>Corroborated</span>
      </span>
    );
  }

  if (status.includes('Disputed')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
        <span>Disputed</span>
      </span>
    );
  }

  if (status.includes('Supported by one')) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
        <FileCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
        <span>Single Source</span>
      </span>
    );
  }

  // Unverified or insufficient evidence
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
      <HelpCircle className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
      <span>Unverified Evidence</span>
    </span>
  );
}
