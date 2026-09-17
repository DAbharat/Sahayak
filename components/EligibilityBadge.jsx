import React from 'react';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

/**
 * Dumb UI Component: EligibilityBadge
 * Pure presentation: handles zero API calls.
 * Minimal, modern badge with Day & Night mode.
 */
export const EligibilityBadge = ({
  status,
  size = 'md',
  showHindi = true
}) => {
  if (status === 'MAY_QUALIFY') {
    return (
      <span
        id="badge-may-qualify"
        className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/90 text-emerald-950 dark:text-emerald-200 border-2 border-emerald-400/80 dark:border-emerald-600/80 shadow-xs ${
          size === 'sm' ? 'px-2.5 py-1 text-xs' : size === 'lg' ? 'px-3.5 py-1.5 text-sm' : 'px-3 py-1 text-xs'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse flex-shrink-0" />
        <CheckCircle2 className={size === 'sm' ? 'w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300 flex-shrink-0' : 'w-4 h-4 text-emerald-700 dark:text-emerald-300 flex-shrink-0'} />
        <span>May qualify</span>
        {showHindi && <span className="text-emerald-800 dark:text-emerald-300/90 text-[11px] font-semibold">(पात्र हो सकते हैं)</span>}
      </span>
    );
  }

  if (status === 'MORE_INFO_NEEDED') {
    return (
      <span
        id="badge-more-info"
        className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-amber-100 dark:bg-amber-950/90 text-amber-950 dark:text-amber-200 border-2 border-amber-400/80 dark:border-amber-600/80 shadow-xs ${
          size === 'sm' ? 'px-2.5 py-1 text-xs' : size === 'lg' ? 'px-3.5 py-1.5 text-sm' : 'px-3 py-1 text-xs'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400 flex-shrink-0" />
        <HelpCircle className={size === 'sm' ? 'w-3.5 h-3.5 text-amber-700 dark:text-amber-300 flex-shrink-0' : 'w-4 h-4 text-amber-700 dark:text-amber-300 flex-shrink-0'} />
        <span>More info needed</span>
        {showHindi && <span className="text-amber-800 dark:text-amber-300/90 text-[11px] font-semibold">(जानकारी आवश्यक)</span>}
      </span>
    );
  }

  return (
    <span
      id="badge-does-not-match"
      className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-2 border-slate-300 dark:border-slate-600 shadow-xs ${
        size === 'sm' ? 'px-2.5 py-1 text-xs' : size === 'lg' ? 'px-3.5 py-1.5 text-sm' : 'px-3 py-1 text-xs'
      }`}
    >
      <span className="w-2 h-2 rounded-full bg-slate-500 dark:bg-slate-400 flex-shrink-0" />
      <AlertCircle className={size === 'sm' ? 'w-3.5 h-3.5 text-slate-600 dark:text-slate-400 flex-shrink-0' : 'w-4 h-4 text-slate-600 dark:text-slate-400 flex-shrink-0'} />
      <span>Doesn't match criteria</span>
      {showHindi && <span className="text-slate-700 dark:text-slate-300 text-[11px] font-semibold">(शर्तें भिन्न)</span>}
    </span>
  );
};

export default EligibilityBadge;

