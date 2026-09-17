import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Send, 
  Copy, 
  Check, 
  Edit3, 
  Save, 
  ArrowLeft, 
  Sparkles, 
  AlertCircle,
  ShieldAlert
} from 'lucide-react';

/**
 * Dumb UI Component: GrievanceEditor
 * Pure presentation: handles zero API calls.
 * The page/container handles the AI generation API calls and passes down `draft`, `isGenerating`, and `onGenerate`.
 */
export const GrievanceEditor = ({
  schemeName = '',
  userProblem = '',
  draft = null,
  isGenerating = false,
  onProblemChange,
  onGenerate,
  onUpdateDraftText,
  onBack
}) => {
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [editableBody, setEditableBody] = useState(draft ? draft.body : '');
  const [copied, setCopied] = useState(false);

  // Sync draft updates from props
  useEffect(() => {
    if (draft) {
      setEditableBody(draft.body);
    }
  }, [draft]);

  const sampleProblem1 = 'I applied for the scheme two months ago but haven\'t received any update.';
  const sampleProblem2 = 'मैंने दो महीने पहले आवेदन किया था लेकिन अभी तक वेंडिंग लोन या सत्यापन का कोई अपडेट नहीं मिला है।';

  const copyTextToClipboard = async (text) => {
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fall back to execCommand
      }
    }
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      const success = document.execCommand('copy');
      document.body.removeChild(el);
      return success;
    } catch {
      return false;
    }
  };

  const handleCopy = async () => {
    if (!draft) return;
    const textToCopy = isEditingDraft ? editableBody : draft.body;
    const ok = await copyTextToClipboard(textToCopy);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSaveEdit = () => {
    if (onUpdateDraftText) {
      onUpdateDraftText(editableBody);
    }
    setIsEditingDraft(false);
  };

  return (
    <div id="grievance-screen" className="w-full max-w-3xl mx-auto space-y-6">
      {/* Back navigation */}
      <button
        type="button"
        id="back-from-grievance-btn"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#3368A0] dark:text-[#C8DFDB] hover:text-[#1E3557] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to scheme (योजना पर वापस)</span>
      </button>

      {/* Main card */}
      <div className="bg-white/95 dark:bg-slate-900 border border-[#C8DFDB] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(51,104,160,0.08)] space-y-6">
        {/* Header */}
        <div className="border-b border-[#C8DFDB]/60 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full w-fit mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Official Redressal Assistance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            Grievance / Problem Draft (शिकायत प्रारूप)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Regarding: <strong className="text-slate-900 dark:text-slate-100">{schemeName}</strong>
          </p>
        </div>

        {/* 1. Problem Input */}
        <div className="space-y-3">
          <label
            htmlFor="grievance-problem-input"
            className="block text-sm font-bold text-slate-900 dark:text-slate-100"
          >
            What problem are you facing? (आपको क्या परेशानी आ रही है?)
          </label>
          <textarea
            id="grievance-problem-input"
            rows={3}
            value={userProblem}
            onChange={(e) => onProblemChange && onProblemChange(e.target.value)}
            placeholder="I applied for the scheme two months ago but haven't received any update."
            className="w-full p-3.5 rounded-2xl border-2 border-[#C8DFDB] dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#3368A0] focus:ring-2 focus:ring-[#3368A0]/20 text-sm leading-relaxed resize-none transition-all"
          />

          {/* Quick presets */}
          <div className="flex flex-wrap gap-2 pt-1 items-center">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#3368A0] dark:text-[#66A3BF]" />
              Examples:
            </span>
            <button
              type="button"
              id="preset-problem-1"
              onClick={() => onProblemChange && onProblemChange(sampleProblem1)}
              className="text-xs text-slate-600 dark:text-slate-300 bg-[#C8DFDB]/30 dark:bg-slate-800 hover:bg-[#C8DFDB]/60 dark:hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-colors text-left cursor-pointer border border-[#66A3BF]/30"
            >
              "Applied 2 months ago, no update"
            </button>
            <button
              type="button"
              id="preset-problem-2"
              onClick={() => onProblemChange && onProblemChange(sampleProblem2)}
              className="text-xs text-slate-600 dark:text-slate-300 bg-[#C8DFDB]/30 dark:bg-slate-800 hover:bg-[#C8DFDB]/60 dark:hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-colors text-left cursor-pointer border border-[#66A3BF]/30"
            >
              "दो महीने से कोई अपडेट नहीं"
            </button>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              id="generate-grievance-btn"
              disabled={!userProblem.trim() || isGenerating}
              onClick={onGenerate}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#3368A0] hover:bg-[#285584] disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-bold text-xs shadow-xs hover:shadow-md hover:shadow-[#3368A0]/20 transition-all active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Generating formal draft...' : 'पत्र तैयार करें (Generate grievance)'}</span>
            </button>
          </div>
        </div>

        {/* 2. Draft Result Section */}
        {draft && (
          <div id="grievance-draft-container" className="pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
                  Your grievance draft (शिकायत पत्र)
                </h3>
              </div>

              {/* Action Buttons: Edit & Copy */}
              <div className="flex items-center gap-2">
                {isEditingDraft ? (
                  <button
                    type="button"
                    id="save-draft-btn"
                    onClick={handleSaveEdit}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save edit</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    id="edit-draft-btn"
                    onClick={() => setIsEditingDraft(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Edit (बदलें)</span>
                  </button>
                )}

                <button
                  type="button"
                  id="copy-draft-btn"
                  onClick={handleCopy}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all shadow-xs cursor-pointer ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-900'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied! (कॉपी हो गया)</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy (कॉपी करें)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Letter Preview Box */}
            <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm leading-relaxed shadow-xs">
              {isEditingDraft ? (
                <textarea
                  id="edit-draft-textarea"
                  rows={12}
                  value={editableBody}
                  onChange={(e) => setEditableBody(e.target.value)}
                  className="w-full p-3 font-mono text-xs sm:text-sm bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-y"
                />
              ) : (
                <pre
                  id="rendered-grievance-text"
                  className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-relaxed font-medium"
                >
                  {draft.body}
                </pre>
              )}
            </div>

            {/* Guidance banner */}
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Review & Copy (कॉपी करके भेजें):</p>
                <p className="mt-0.5 text-amber-800 dark:text-amber-400/90 leading-relaxed">
                  आप इस पत्र की प्रतिलिपि (Copy) लेकर CPGRAMS, राज्य सीएम विंडो या संबंधित ब्लॉक/नगरपालिका कार्यालय में प्रस्तुत कर सकते हैं।
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrievanceEditor;
