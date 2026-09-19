import React from 'react';
import { FileText, Check, AlertCircle } from 'lucide-react';

interface DocumentItem {
  name: string;
  nameHi: string;
  isMandatory: boolean;
  formatNote?: string;
}

interface DocumentListProps {
  documents: DocumentItem[];
  title?: string;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  title = 'Required Documents / आवश्यक दस्तावेज'
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-xs">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
        <FileText className="w-5 h-5 text-[#006400]" />
        <h4 className="font-bold text-[#333333] text-sm md:text-base">{title}</h4>
      </div>
      <ul className="space-y-2.5">
        {documents.map((doc, idx) => (
          <li
            key={idx}
            className="flex items-start justify-between gap-3 p-2.5 rounded bg-gray-50 border border-gray-200/70 hover:bg-orange-50/40 transition-colors"
          >
            <div className="flex items-start gap-2.5">
              <span className="text-base shrink-0 mt-0.5" role="img" aria-label="document">📄</span>
              <div>
                <p className="text-sm font-semibold text-gray-900 leading-snug">
                  {doc.name}
                </p>
                <p className="text-xs text-gray-600 font-normal mt-0.5">
                  {doc.nameHi}
                </p>
                {doc.formatNote && (
                  <p className="text-[11px] text-gray-500 mt-1">
                    ℹ️ {doc.formatNote}
                  </p>
                )}
              </div>
            </div>
            <div className="shrink-0 pt-0.5">
              {doc.isMandatory ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                  <AlertCircle className="w-3 h-3" />
                  अनिवार्य / Required
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                  वैकल्पिक / Optional
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3 pt-2 text-[11px] text-gray-500 flex items-center gap-1 border-t border-gray-100">
        <Check className="w-3.5 h-3.5 text-[#006400]" />
        All documents can also be verified digitally via DigiLocker (डिजिलॉकर) without physical copies.
      </div>
    </div>
  );
};

export default DocumentList;
