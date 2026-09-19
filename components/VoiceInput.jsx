import React from 'react';
import { Mic, MicOff, Volume2, ArrowRight, Sparkles } from 'lucide-react';

/**
 * Dumb UI Component: VoiceInput
 * Pure presentation: handles zero API calls. All state & actions passed via props.
 * Minimal, modern styling with full Day & Night mode support.
 */
export const VoiceInput = ({
  isListening = false,
  transcript = '',
  onStartListening,
  onStopListening,
  onSubmitTranscript,
  onCancel,
  onSelectSample
}) => {
  const sampleHindi = 'मैं हरियाणा में स्ट्रीट वेंडर हूं। मेरी महीने की कमाई करीब 15 हजार है और मेरे दो बच्चे हैं।';
  const sampleEnglish = 'I am a street vendor in Haryana, earning around 15,000 per month with two children.';

  return (
    <div id="voice-input-component" className="w-full max-w-xl mx-auto flex flex-col items-center text-center space-y-6">
      {/* Visual pulse & mic orb */}
      <div className="relative flex items-center justify-center my-3">
        {isListening && (
          <>
            <div className="absolute w-36 h-36 rounded-full bg-rose-500/15 dark:bg-rose-500/25 animate-ping" />
            <div className="absolute w-28 h-28 rounded-full bg-rose-500/20 dark:bg-rose-500/30 animate-pulse" />
          </>
        )}
        <button
          type="button"
          id="toggle-mic-btn"
          onClick={isListening ? onStopListening : onStartListening}
          className={`relative z-10 w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 transform active:scale-95 focus:outline-none focus:ring-4 cursor-pointer ${
            isListening
              ? 'bg-rose-600 hover:bg-rose-700 text-white ring-rose-300 dark:ring-rose-900/50'
              : 'bg-[#3368A0] hover:bg-[#285584] text-white ring-4 ring-[#C8DFDB] dark:ring-[#3368A0]/50 shadow-lg shadow-[#3368A0]/25'
          }`}
          aria-label={isListening ? 'Stop listening' : 'Start speaking'}
        >
          {isListening ? (
            <MicOff className="w-10 h-10 animate-bounce" />
          ) : (
            <Mic className="w-10 h-10" />
          )}
        </button>
      </div>

      {/* State label */}
      <div className="space-y-1.5">
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-50 flex items-center justify-center gap-2">
          {isListening ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span>Listening... (सुन रहे हैं...)</span>
            </>
          ) : (
            <span>माइक दबाएं और बोलें (Tap mic to speak)</span>
          )}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto font-medium">
          {isListening
            ? 'Speak in Hindi, English, or your regional language. Tap again when done.'
            : 'अपना राज्य, काम/व्यवसाय, मासिक आय और बच्चों की जानकारी बताएं।'}
        </p>
      </div>

      {/* Live Transcript Display Box */}
      <div className="w-full text-left bg-white/95 dark:bg-slate-900/90 border border-[#C8DFDB] dark:border-slate-800 rounded-3xl p-5 shadow-[0_4px_20px_rgba(51,104,160,0.06)] transition-colors backdrop-blur-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#C8DFDB]/60 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-[#3368A0] dark:text-[#66A3BF]" />
            आपकी आवाज (Detected Speech)
          </span>
          {isListening && (
            <span className="text-rose-600 dark:text-rose-400 font-bold animate-pulse">● Live</span>
          )}
        </div>

        <div className="min-h-[84px] text-slate-800 dark:text-slate-200 text-base font-medium leading-relaxed">
          {transcript ? (
            <p id="voice-transcript-text" className="text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-[#C8DFDB] dark:border-slate-700/80">
              "{transcript}"
            </p>
          ) : isListening ? (
            <p className="text-slate-400 dark:text-slate-500 italic">
              Listening to your voice... (बोलते रहिए...)
            </p>
          ) : (
            <p className="text-slate-400 dark:text-slate-500 italic">
              "मैं हरियाणा में स्ट्रीट वेंडर हूं, महीने की कमाई करीब 15,000 है..."
            </p>
          )}
        </div>

        {/* Action button inside transcript card when speech captured */}
        {transcript && transcript.trim().length > 0 && (
          <div className="mt-4 pt-3 border-t border-[#C8DFDB]/60 dark:border-slate-800 flex flex-col sm:flex-row gap-2 justify-end">
            <button
              type="button"
              id="submit-voice-transcript-btn"
              onClick={() => onSubmitTranscript && onSubmitTranscript(transcript)}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#3368A0] hover:bg-[#285584] text-white font-bold text-sm shadow-xs hover:shadow-md hover:shadow-[#3368A0]/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>Confirm & Check Schemes (आगे बढ़ें)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Demo sample prompts for instant testing / accessibility fallback */}
      <div className="w-full pt-1">
        <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>या तुरंत एक उदाहरण चुनें (Or try a quick sample):</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
          <button
            type="button"
            id="sample-hindi-voice-btn"
            onClick={() => onSelectSample && onSelectSample(sampleHindi)}
            className="text-left text-xs bg-white dark:bg-slate-900/90 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 hover:border-indigo-400 dark:hover:border-indigo-600/70 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-800 rounded-xl px-4 py-3 shadow-2xs transition-all cursor-pointer"
          >
            🇮🇳 <strong className="text-slate-900 dark:text-slate-100">Hindi:</strong> "मैं हरियाणा में स्ट्रीट वेंडर हूं..."
          </button>
          <button
            type="button"
            id="sample-english-voice-btn"
            onClick={() => onSelectSample && onSelectSample(sampleEnglish)}
            className="text-left text-xs bg-white dark:bg-slate-900/90 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 hover:border-indigo-400 dark:hover:border-indigo-600/70 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-800 rounded-xl px-4 py-3 shadow-2xs transition-all cursor-pointer"
          >
            🌐 <strong className="text-slate-900 dark:text-slate-100">English:</strong> "Street vendor in Haryana, ₹15k..."
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceInput;

