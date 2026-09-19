import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

/**
 * Dumb UI Component: NextSteps
 * Pure presentation: handles zero API calls.
 * Highly visible, modern step list with high contrast in Day & Night mode.
 */
export const NextSteps = ({ steps = [] }) => {
  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <div id="next-steps-container" className="space-y-3.5">
      <div className="flex items-center justify-between">
        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-lg bg-[#C8DFDB]/60 dark:bg-[#3368A0]/30 text-[#3368A0] dark:text-[#66A3BF]">
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
          <span>What to do next (आगे क्या करना है):</span>
        </h4>
        <span className="text-[11px] font-bold text-[#3368A0] dark:text-[#C8DFDB] bg-[#C8DFDB]/50 dark:bg-[#3368A0]/30 px-2.5 py-0.5 rounded-full border border-[#66A3BF]/40 dark:border-[#66A3BF]/30">
          {steps.length} Steps
        </span>
      </div>

      <ol className="space-y-2.5">
        {steps.map((step, idx) => (
          <li
            key={idx}
            id={`step-${idx + 1}`}
            className="group flex items-start gap-3.5 p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-[#C8DFDB] dark:border-slate-800 shadow-xs hover:border-[#3368A0] dark:hover:border-[#66A3BF] transition-all duration-150"
          >
            {/* Step number badge with glowing contrast */}
            <div className="flex items-center justify-center w-6 h-6 rounded-xl bg-[#3368A0] dark:bg-[#66A3BF] text-white text-xs font-bold flex-shrink-0 mt-0.5 shadow-xs">
              {idx + 1}
            </div>

            {/* Clear high-contrast text description */}
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-semibold leading-relaxed">
                {step}
              </p>
            </div>

            <CheckCircle2 className="w-4 h-4 text-[#66A3BF]/60 dark:text-slate-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors flex-shrink-0 mt-0.5" />
          </li>
        ))}
      </ol>
    </div>
  );
};

export default NextSteps;


