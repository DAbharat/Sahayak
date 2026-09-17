import React from 'react';
import { 
  Check, 
  AlertTriangle, 
  ExternalLink, 
  ShieldCheck, 
  Calendar, 
  LifeBuoy, 
  ArrowLeft,
  Building2,
  HelpCircle
} from 'lucide-react';
import { EligibilityBadge } from './EligibilityBadge.jsx';
import { DocumentList } from './DocumentList.jsx';
import { NextSteps } from './NextSteps.jsx';

/**
 * Dumb UI Component: SchemeDetails
 * Pure presentation: handles zero API calls. All state & actions passed via props.
 * Minimal, modern details view with full Day & Night mode.
 */
export const SchemeDetails = ({
  scheme = {},
  onBack,
  onGenerateGrievance
}) => {
  return (
    <div id="scheme-details-component" className="w-full max-w-3xl mx-auto space-y-6">
      {/* Top back navigation */}
      <button
        type="button"
        id="back-to-schemes-btn"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#3368A0] dark:text-[#C8DFDB] hover:text-[#1E3557] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to all schemes (सभी योजनाएं)</span>
      </button>

      {/* Main scheme card header */}
      <div className="bg-white/95 dark:bg-slate-900 border border-[#C8DFDB] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(51,104,160,0.08)] space-y-6">
        {/* Title and ministry */}
        <div className="border-b border-[#C8DFDB]/60 dark:border-slate-800 pb-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <EligibilityBadge status={scheme.eligibilityStatus} size="md" />
            <span className="text-xs font-bold text-[#3368A0] dark:text-[#C8DFDB] bg-[#C8DFDB]/45 dark:bg-[#3368A0]/30 px-3 py-1 rounded-full border border-[#66A3BF]/40 dark:border-[#66A3BF]/30">
              {scheme.categoryTag}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            {scheme.name}
          </h2>
          <p className="text-sm font-bold text-[#3368A0] dark:text-[#66A3BF] mt-1">
            {scheme.hindiName}
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2.5 font-medium">
            <Building2 className="w-3.5 h-3.5 text-[#66A3BF]" />
            <span>{scheme.ministry}</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-3 leading-relaxed">
            {scheme.shortDescription}
          </p>

          <div className="mt-3 p-3.5 bg-[#C8DFDB]/40 dark:bg-[#3368A0]/25 rounded-2xl border border-[#66A3BF]/40 dark:border-[#3368A0]/50 text-xs sm:text-sm font-bold text-[#1E3557] dark:text-[#C8DFDB]">
            💵 Financial Support / Assistance: {scheme.maxBenefit}
          </div>
        </div>

        {/* 1. You may qualify based on */}
        {scheme.matchedCriteria && scheme.matchedCriteria.length > 0 && (
          <div id="qualify-reasons-section" className="space-y-2">
            <h4 className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <Check className="w-3 h-3" />
              </span>
              <span>You may qualify based on (इस आधार पर पात्र हो सकते हैं):</span>
            </h4>
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100/90 dark:border-emerald-800/40 space-y-2">
              {scheme.matchedCriteria.map((criterion, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-emerald-900 dark:text-emerald-300">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>{criterion}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Information still needed */}
        {scheme.missingInfo && scheme.missingInfo.length > 0 && (
          <div id="missing-info-section" className="space-y-2">
            <h4 className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Information still needed (अतिरिक्त जानकारी चाहिए):</span>
            </h4>
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100/90 dark:border-amber-800/40 space-y-2">
              {scheme.missingInfo.map((info, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-amber-900 dark:text-amber-300">
                  <span className="text-amber-500 font-bold">⚠</span>
                  <span>{info}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disqualifying reasons if any */}
        {scheme.disqualifyingReasons && scheme.disqualifyingReasons.length > 0 && (
          <div id="disqualifying-reasons-section" className="space-y-2">
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Criteria considerations (मुख्य शर्तें):</span>
            </h4>
            <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-2">
              {scheme.disqualifyingReasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Required Documents */}
        <div className="pt-2">
          <DocumentList documents={scheme.requiredDocuments || []} />
        </div>

        {/* 4. What to do next */}
        <div className="pt-2">
          <NextSteps steps={scheme.nextSteps || []} />
        </div>

        {/* 5. Grievance / Assistance CTA */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-white via-[#F2EFE7]/80 to-[#C8DFDB]/40 dark:from-slate-900 dark:via-slate-900 dark:to-[#3368A0]/20 border border-[#C8DFDB] dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center sm:justify-start gap-2">
              <div className="p-1.5 rounded-lg bg-[#C8DFDB]/60 dark:bg-[#3368A0]/30 text-[#3368A0] dark:text-[#66A3BF]">
                <LifeBuoy className="w-4 h-4" />
              </div>
              <span>Facing issues or delay with this scheme?</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Draft an official grievance letter in seconds (शिकायत पत्र तैयार करें).
            </p>
          </div>
          <button
            type="button"
            id="generate-help-grievance-btn"
            onClick={() => onGenerateGrievance && onGenerateGrievance(scheme)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#3368A0] hover:bg-[#285584] text-white font-bold text-xs shadow-xs hover:shadow-md hover:shadow-[#3368A0]/20 transition-all active:scale-[0.98] flex-shrink-0 cursor-pointer"
          >
            <span>शिकायत पत्र बनाएं (Draft grievance)</span>
          </button>
        </div>

        {/* 6. Official Source & Last Verified Metadata */}
        <div className="pt-4 border-t border-[#C8DFDB]/60 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Source: </span>
              <a
                href={scheme.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="text-[#3368A0] dark:text-[#66A3BF] hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <span>{scheme.sourceName}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Last verified: <strong>{scheme.lastVerified}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemeDetails;

