import React from 'react';
import { ArrowRight, Check, AlertCircle, HelpCircle } from 'lucide-react';
import { EligibilityBadge } from './EligibilityBadge.jsx';

/**
 * Dumb UI Component: SchemeCard
 * Pure presentation: handles zero API calls. All state & actions passed via props.
 * Minimal, modern card design with high-contrast Day & Night mode visibility.
 */
export const SchemeCard = ({
  scheme = {},
  onViewDetails,
  onCompleteProfile
}) => {
  const isMayQualify = scheme.eligibilityStatus === 'MAY_QUALIFY';
  const isMoreInfo = scheme.eligibilityStatus === 'MORE_INFO_NEEDED';
  const isDoesNotMatch = scheme.eligibilityStatus === 'DOES_NOT_MATCH';

  // Crisp, high-contrast borders and elevated solid card backgrounds
  const containerClasses = isMayQualify
    ? 'border-2 border-emerald-500/85 dark:border-emerald-500/70 bg-white dark:bg-[#131E31] hover:border-emerald-600 dark:hover:border-emerald-400 shadow-[0_4px_24px_rgba(16,185,129,0.12)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.22)]'
    : isMoreInfo
    ? 'border-2 border-amber-400 dark:border-amber-500/80 bg-white dark:bg-[#131E31] hover:border-amber-500 dark:hover:border-amber-400 shadow-[0_4px_24px_rgba(245,158,11,0.12)] hover:shadow-[0_8px_32px_rgba(245,158,11,0.22)]'
    : 'border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131E31] hover:border-slate-400 dark:hover:border-slate-600 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.1)]';

  return (
    <div
      id={`scheme-card-${scheme.id}`}
      className={`rounded-3xl p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between h-full ${containerClasses}`}
    >
      <div>
        {/* Top Header: Badge & Category */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3.5">
          <EligibilityBadge status={scheme.eligibilityStatus} size="sm" />
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-300 dark:border-slate-700">
            {scheme.categoryTag}
          </span>
        </div>

        {/* Title & Hindi Translation */}
        <div className="mb-3.5">
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-950 dark:text-white leading-snug tracking-tight">
            {scheme.name}
          </h3>
          <p className="text-xs sm:text-sm font-bold text-[#1E4E79] dark:text-[#88C2DC] mt-1">
            {scheme.hindiName}
          </p>
        </div>

        {/* Benefit Highlight Box with clear visual contrast */}
        <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50/60 dark:from-emerald-950/60 dark:to-slate-800/80 border border-emerald-300/80 dark:border-emerald-800/80 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="text-lg flex-shrink-0">💵</span>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800 dark:text-emerald-300">
                Financial Benefit • आर्थिक सहायता
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-emerald-950 dark:text-emerald-100 leading-snug">
                {scheme.maxBenefit}
              </div>
            </div>
          </div>
        </div>

        {/* Eligibility Status Headline */}
        <div className="mb-3">
          {isMayQualify && (
            <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 stroke-[2.5]" />
              <span>{scheme.statusHeadline}</span>
            </div>
          )}
          {isMoreInfo && (
            <div className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 stroke-[2.5]" />
              <span>{scheme.statusHeadline}</span>
            </div>
          )}
          {isDoesNotMatch && (
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 stroke-[2.5]" />
              <span>{scheme.statusHeadline}</span>
            </div>
          )}
        </div>

        {/* Criteria & Reasons List */}
        <div className="mb-5">
          {isMayQualify && (
            <div className="space-y-2">
              {(scheme.matchedCriteria || []).map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-slate-900 dark:text-slate-100 text-xs font-semibold leading-relaxed">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/80 flex items-center justify-center flex-shrink-0 text-emerald-700 dark:text-emerald-300 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}

          {isMoreInfo && (
            <div className="space-y-2">
              {(scheme.missingInfo || []).slice(0, 2).map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-amber-950 dark:text-amber-100 text-xs font-semibold leading-relaxed bg-amber-50/90 dark:bg-amber-950/50 p-2.5 rounded-xl border border-amber-300 dark:border-amber-800">
                  <div className="w-4 h-4 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center flex-shrink-0 text-amber-900 dark:text-amber-100 mt-0.5">
                    <HelpCircle className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
              {(scheme.matchedCriteria || []).slice(0, 1).map((item, idx) => (
                <div key={`m-${idx}`} className="flex items-start gap-2.5 text-slate-800 dark:text-slate-200 text-xs font-medium leading-relaxed">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/80 flex items-center justify-center flex-shrink-0 text-emerald-700 dark:text-emerald-300 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}

          {isDoesNotMatch && (
            <div className="space-y-2">
              {(scheme.disqualifyingReasons || []).map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-slate-900 dark:text-slate-100 text-xs font-semibold leading-relaxed bg-slate-100 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700">
                  <div className="w-4 h-4 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center flex-shrink-0 text-rose-600 dark:text-rose-400 mt-0.5">
                    <AlertCircle className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Button at the bottom */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-auto">
        {isMayQualify && (
          <button
            type="button"
            id={`view-details-${scheme.id}`}
            onClick={() => onViewDetails && onViewDetails(scheme.id)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#3368A0] hover:bg-[#285584] text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg hover:shadow-[#3368A0]/25 transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>विवरण देखें (View details)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {isMoreInfo && (
          <button
            type="button"
            id={`complete-profile-${scheme.id}`}
            onClick={() => onCompleteProfile ? onCompleteProfile(scheme.id) : onViewDetails && onViewDetails(scheme.id)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg hover:shadow-amber-600/25 transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>जांच पूरी करें (Complete profile) →</span>
          </button>
        )}

        {isDoesNotMatch && (
          <button
            type="button"
            id={`view-reason-${scheme.id}`}
            onClick={() => onViewDetails && onViewDetails(scheme.id)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs sm:text-sm border border-slate-300 dark:border-slate-600 transition-colors cursor-pointer"
          >
            <span>शर्तें एवं कारण (Full criteria) →</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SchemeCard;


