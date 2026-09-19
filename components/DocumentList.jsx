import React from 'react';
import { FileText, CheckCircle } from 'lucide-react';

/**
 * Dumb UI Component: DocumentList
 * Pure presentation: handles zero API calls.
 * Modern card design with rich Day & Night mode and high contrast.
 */
export const DocumentList = ({ documents = [] }) => {
  if (!documents || documents.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
        No specific documents published. Valid government photo ID usually applies.
      </div>
    );
  }

  return (
    <div id="document-list" className="space-y-3.5">
      <div className="flex items-center justify-between">
        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-lg bg-[#C8DFDB]/60 dark:bg-[#3368A0]/30 text-[#3368A0] dark:text-[#66A3BF]">
            <FileText className="w-3.5 h-3.5" />
          </span>
          <span>Required documents (ज़रूरी दस्तावेज़):</span>
        </h4>
        <span className="text-[11px] text-[#3368A0] dark:text-[#C8DFDB] font-bold bg-[#C8DFDB]/40 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-[#66A3BF]/30 dark:border-slate-700">
          {documents.length} items
        </span>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-1">
        {documents.map((doc, idx) => (
          <div
            key={idx}
            id={`doc-item-${idx}`}
            className="flex items-start gap-3.5 p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-[#C8DFDB] dark:border-slate-800 shadow-2xs hover:border-[#3368A0] dark:hover:border-[#66A3BF] transition-all duration-150"
          >
            <div className="mt-0.5 p-2 rounded-xl bg-[#C8DFDB]/40 dark:bg-[#3368A0]/30 text-[#3368A0] dark:text-[#66A3BF] flex-shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                  {doc.name}
                </span>
                {doc.mandatory ? (
                  <span className="text-[10px] font-bold tracking-wider text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/80 border border-rose-200/80 dark:rose-900 px-2 py-0.5 rounded-full uppercase">
                    Mandatory (ज़रूरी)
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    Optional
                  </span>
                )}
              </div>
              {doc.hindiName && (
                <p className="text-xs text-[#3368A0] dark:text-[#66A3BF] font-semibold mt-0.5">
                  {doc.hindiName}
                </p>
              )}
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {doc.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentList;


