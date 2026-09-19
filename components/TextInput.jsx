import React from 'react';
import { Send, Sparkles, MessageSquare } from 'lucide-react';

/**
 * Dumb UI Component: TextInput
 * Pure presentation: handles zero API calls. All state & actions passed via props.
 * Minimal, clean design with Day & Night mode.
 */
export const TextInput = ({
  value = '',
  onChange,
  onSubmit,
  isLoading = false,
  onSelectSample
}) => {
  const sample1 = 'मैं हरियाणा में स्ट्रीट वेंडर हूं। मेरी महीने की कमाई करीब 15 हजार है और मेरे दो बच्चे हैं।';
  const sample2 = 'I am a street vendor in Haryana. My monthly income is around 15,000 and I have two children.';
  const sample3 = 'मैं उत्तर प्रदेश में छोटा किसान हूं, 2 एकड़ जमीन है और आय 10,000 है।';

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (value.trim()) onSubmit();
    }
  };

  return (
    <div id="text-input-component" className="w-full max-w-xl mx-auto space-y-4">
      <div className="space-y-1 text-left">
        <label
          htmlFor="citizen-bio-textarea"
          className="block text-base font-bold text-slate-900 dark:text-slate-50"
        >
          अपने बारे में बताएं (Tell us about yourself)
        </label>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
          राज्य, काम (रोजगार), मासिक आय और परिवार के बारे में सरल शब्दों में लिखें।
        </p>
      </div>

      <div className="relative">
        <textarea
          id="citizen-bio-textarea"
          rows={4}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="उदाहरण: मैं हरियाणा में स्ट्रीट वेंडर हूं। मेरी महीने की कमाई करीब 15 हजार है और मेरे दो बच्चे हैं..."
          className="w-full p-4 rounded-2xl border-2 border-[#C8DFDB] dark:border-slate-800 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#3368A0] focus:ring-2 focus:ring-[#3368A0]/20 text-base leading-relaxed resize-none shadow-[0_2px_12px_rgba(51,104,160,0.06)] transition-all bg-white dark:bg-slate-900"
        />
        <div className="absolute bottom-3 right-3 text-xs text-slate-400 dark:text-slate-500 font-mono">
          {value.length} chars
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="w-full sm:w-auto text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-[#66A3BF]" />
          <span>हिंदी, हिंग्लिश या अंग्रेजी में लिखें</span>
        </div>

        <button
          type="button"
          id="send-text-btn"
          disabled={!value.trim() || isLoading}
          onClick={onSubmit}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#3368A0] hover:bg-[#285584] disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white font-bold text-sm shadow-xs hover:shadow-md hover:shadow-[#3368A0]/20 transition-all active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed"
        >
          <span>{isLoading ? 'जांच जारी है...' : 'Search Schemes (आगे बढ़ें)'}</span>
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Preset / quick prompt chips */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>त्वरित उदाहरण (Quick prompt samples):</span>
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            id="sample-query-btn-1"
            onClick={() => onSelectSample && onSelectSample(sample1)}
            className="text-left text-xs bg-white dark:bg-slate-900/90 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600/70 text-slate-800 dark:text-slate-200 p-3 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            🇮🇳 <strong className="text-slate-900 dark:text-slate-100">Haryana Street Vendor:</strong> "{sample1}"
          </button>
          <button
            type="button"
            id="sample-query-btn-2"
            onClick={() => onSelectSample && onSelectSample(sample3)}
            className="text-left text-xs bg-white dark:bg-slate-900/90 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600/70 text-slate-800 dark:text-slate-200 p-3 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            🌾 <strong className="text-slate-900 dark:text-slate-100">UP Small Farmer:</strong> "{sample3}"
          </button>
          <button
            type="button"
            id="sample-query-btn-3"
            onClick={() => onSelectSample && onSelectSample(sample2)}
            className="text-left text-xs bg-white dark:bg-slate-900/90 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600/70 text-slate-800 dark:text-slate-200 p-3 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            🌐 <strong className="text-slate-900 dark:text-slate-100">English:</strong> "{sample2}"
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextInput;

