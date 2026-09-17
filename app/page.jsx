import React, { useState, useEffect, useMemo } from 'react';
import { Mic, Keyboard, Sparkles, ShieldCheck, HeartHandshake, ArrowRight } from 'lucide-react';

/**
 * Container Page: app/page.jsx (Welcome Screen)
 * Minimal, modern, warm citizen-first UX with Day & Night mode
 * Features dynamic multilingual writing effect (Hindi -> Hinglish -> English)
 */
export const WelcomePage = ({ onSelectMode, onQuickPrompt = null }) => {
  const quickSamples = [
    { label: 'स्ट्रीट वेंडर (वेंडिंग लोन)', text: 'मैं हरियाणा में स्ट्रीट वेंडर हूं। मेरी कमाई करीब 15 हजार है और दो बच्चे हैं।' },
    { label: 'छोटा किसान (खाद व सम्मान निधि)', text: 'मैं उत्तर प्रदेश में छोटा किसान हूं, 2 एकड़ जमीन है और आय 10,000 है।' },
    { label: 'कॉलेज छात्र (स्कॉलरशिप)', text: 'मैं 20 साल का छात्र हूं, कॉलेज में पढ़ाई कर रहा हूं और परिवार की आय कम है।' }
  ];

  // Multilingual headlines for the typewriter effect
  const headlines = useMemo(() => [
    {
      text: 'आपको कौन सी सरकारी सहायता मिल सकती है?',
      lang: 'हिंदी',
      badgeColor: 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200/80 dark:border-orange-800/60'
    },
    {
      text: 'Aapko kaun si sarkari sahayata mil sakti hai?',
      lang: 'Hinglish',
      badgeColor: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60'
    },
    {
      text: 'Which government benefits can you receive?',
      lang: 'English',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60'
    }
  ], []);

  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Splitting strings with grapheme awareness for Hindi matras
  const graphemes = useMemo(() => {
    const target = headlines[headlineIndex].text;
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter('hi', { granularity: 'grapheme' });
      return Array.from(segmenter.segment(target), s => s.segment);
    }
    return Array.from(target);
  }, [headlineIndex, headlines]);

  useEffect(() => {
    let timeoutId;
    const fullLength = graphemes.length;
    const currentLength = Array.from(displayText).length;

    if (!isDeleting && displayText === headlines[headlineIndex].text) {
      // Pause at full sentence before deleting
      timeoutId = setTimeout(() => {
        setIsDeleting(true);
      }, 2400);
    } else if (isDeleting && displayText === '') {
      // Pause briefly before switching to the next language
      timeoutId = setTimeout(() => {
        setIsDeleting(false);
        setHeadlineIndex((prev) => (prev + 1) % headlines.length);
      }, 350);
    } else {
      // Typing or deleting character by character
      const speed = isDeleting ? 25 : 65;
      timeoutId = setTimeout(() => {
        if (isDeleting) {
          // Remove one character
          setDisplayText((prev) => {
            const currentGraphemes = typeof Intl !== 'undefined' && Intl.Segmenter
              ? Array.from(new Intl.Segmenter('hi', { granularity: 'grapheme' }).segment(prev), s => s.segment)
              : Array.from(prev);
            return currentGraphemes.slice(0, currentGraphemes.length - 1).join('');
          });
        } else {
          // Append one character from target graphemes
          setDisplayText((prev) => {
            const currentCount = typeof Intl !== 'undefined' && Intl.Segmenter
              ? Array.from(new Intl.Segmenter('hi', { granularity: 'grapheme' }).segment(prev), s => s.segment).length
              : Array.from(prev).length;
            return graphemes.slice(0, currentCount + 1).join('');
          });
        }
      }, speed);
    }

    return () => clearTimeout(timeoutId);
  }, [displayText, isDeleting, headlineIndex, graphemes, headlines]);

  return (
    <div id="welcome-screen" className="w-full max-w-2xl mx-auto text-center py-6 sm:py-10 px-4 space-y-8 sm:space-y-10">
      {/* Friendly Citizen Badge with custom palette */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C8DFDB]/60 dark:bg-[#3368A0]/20 border border-[#66A3BF]/40 dark:border-[#66A3BF]/50 text-[#3368A0] dark:text-[#C8DFDB] text-xs font-bold tracking-wide shadow-xs">
        <HeartHandshake className="w-4 h-4 text-[#3368A0] dark:text-[#66A3BF]" />
        <span>सहायक • Sahayak • सरल एवं पारदर्शी नागरिक सेवा</span>
      </div>

      {/* Main Headline with Writing Effect */}
      <div className="space-y-3 sm:space-y-4">
        {/* Active Language Chip */}
        <div className="flex items-center justify-center gap-1.5 min-h-[24px]">
          <span
            id="typewriter-language-badge"
            className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border shadow-2xs transition-all duration-300 ${headlines[headlineIndex].badgeColor}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
            <span>{headlines[headlineIndex].lang}</span>
          </span>
        </div>

        {/* Dynamic Typewriter Heading with fixed min-height to prevent layout jump */}
        <div className="min-h-[5.5rem] sm:min-h-[6.5rem] lg:min-h-[7.5rem] flex items-center justify-center px-2">
          <h1
            id="typewriter-main-heading"
            aria-live="polite"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight inline-block"
          >
            <span>{displayText}</span>
            {/* Blinking Typewriter Cursor in #3368A0 */}
            <span
              id="typewriter-cursor"
              className="inline-block w-[3px] sm:w-[4px] h-7 sm:h-9 lg:h-11 bg-[#3368A0] dark:bg-[#66A3BF] ml-1.5 align-middle rounded-full animate-pulse shadow-xs"
              aria-hidden="true"
            />
          </h1>
        </div>

        <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 font-medium max-w-xl mx-auto leading-relaxed">
          अपने बारे में साधारण शब्दों में बताएं और हम आपके योग्य सरकारी योजनाएं खोजेंगे।
        </p>
      </div>

      {/* Two Action Cards with rich day mode styling and subtle gradient depth */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 max-w-xl mx-auto">
        {/* Action 1: Speak */}
        <button
          type="button"
          id="action-speak-btn"
          onClick={() => onSelectMode && onSelectMode('voice')}
          className="group relative flex flex-col items-center justify-center p-7 sm:p-8 rounded-3xl bg-gradient-to-b from-white via-[#F2EFE7]/80 to-[#C8DFDB]/45 dark:from-[#0E1726] dark:via-[#0E1726] dark:to-[#3368A0]/25 border-2 border-[#C8DFDB] dark:border-slate-800 hover:border-[#3368A0] dark:hover:border-[#66A3BF] shadow-[0_8px_25px_-4px_rgba(51,104,160,0.12)] hover:shadow-[0_14px_35px_-4px_rgba(51,104,160,0.22)] transition-all duration-300 active:scale-[0.98] cursor-pointer text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#3368A0] to-[#66A3BF] text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-200 shadow-md shadow-[#3368A0]/25 ring-4 ring-[#C8DFDB] dark:ring-[#66A3BF]/30">
            <Mic className="w-8 h-8" />
          </div>
          <span className="text-xl font-extrabold text-slate-900 dark:text-slate-50 mb-1">
            बोलकर बताएं
          </span>
          <span className="text-xs font-bold text-[#3368A0] dark:text-[#66A3BF]">
            Speak with voice
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">
            माइक दबाएं और अपनी भाषा में बोलें
          </span>
        </button>

        {/* Action 2: Type */}
        <button
          type="button"
          id="action-type-btn"
          onClick={() => onSelectMode && onSelectMode('text')}
          className="group relative flex flex-col items-center justify-center p-7 sm:p-8 rounded-3xl bg-gradient-to-b from-white via-[#F2EFE7]/80 to-[#66A3BF]/20 dark:from-[#0E1726] dark:via-[#0E1726] dark:to-[#66A3BF]/15 border-2 border-[#C8DFDB] dark:border-slate-800 hover:border-[#3368A0] dark:hover:border-[#66A3BF] shadow-[0_8px_25px_-4px_rgba(51,104,160,0.12)] hover:shadow-[0_14px_35px_-4px_rgba(51,104,160,0.22)] transition-all duration-300 active:scale-[0.98] cursor-pointer text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 text-[#3368A0] dark:text-[#C8DFDB] border-2 border-[#66A3BF] flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#3368A0] group-hover:text-white dark:group-hover:bg-[#66A3BF] dark:group-hover:text-white transition-all duration-200 shadow-sm ring-4 ring-[#C8DFDB]/60">
            <Keyboard className="w-8 h-8" />
          </div>
          <span className="text-xl font-extrabold text-slate-900 dark:text-slate-50 mb-1">
            लिखकर बताएं
          </span>
          <span className="text-xs font-bold text-[#3368A0] dark:text-[#66A3BF]">
            Type your details
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">
            साधारण वाक्य में टाइप करें
          </span>
        </button>
      </div>

      {/* Quick 1-tap presets for extra ease-of-use */}
      <div className="space-y-2.5 pt-2 max-w-xl mx-auto text-left">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#3368A0] dark:text-[#66A3BF]" />
          या तुरंत एक उदाहरण चुनकर देखें (Or try a sample profile):
        </span>
        <div className="flex flex-col gap-2.5">
          {quickSamples.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              id={`quick-preset-${idx}`}
              onClick={() => {
                if (onQuickPrompt) {
                  onQuickPrompt(sample.text);
                } else if (onSelectMode) {
                  onSelectMode('text', sample.text);
                }
              }}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-[#C8DFDB] dark:border-slate-800 hover:border-[#3368A0] dark:hover:border-[#66A3BF] hover:bg-[#C8DFDB]/30 dark:hover:bg-[#3368A0]/15 text-xs text-slate-800 dark:text-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-[#3368A0] dark:text-[#66A3BF] bg-[#C8DFDB]/40 dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-[#66A3BF]/30">{sample.label}</span>
                <span className="hidden sm:inline text-slate-600 dark:text-slate-400">• {sample.text.slice(0, 48)}...</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#3368A0] dark:text-[#66A3BF] group-hover:translate-x-1 transition-all flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Friendly trust / reassurance footer */}
      <div className="pt-6 border-t border-[#C8DFDB] dark:border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-400 font-semibold">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#3368A0] dark:text-[#66A3BF]" />
          <span>कोई पासवर्ड या जटिल फॉर्म नहीं (No complex forms)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#3368A0] dark:text-[#66A3BF]" />
          <span>हिंदी एवं हिंग्लिश दोनों समझता है (Speaks your language)</span>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;

