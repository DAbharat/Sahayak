import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, AlertCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';

interface VoiceInputProps {
  onTranscriptComplete: (text: string) => void;
  onCancel?: () => void;
  defaultPrompt?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscriptComplete,
  onCancel,
  defaultPrompt
}) => {
  const { lang, t } = useLanguage();
  const effectiveDefaultPrompt = defaultPrompt || (lang === 'hi' 
    ? 'मैं हरियाणा में स्ट्रीट वेंडर हूं। मेरी महीने की कमाई करीब 15 हजार है और मेरे दो बच्चे हैं।'
    : 'I am a street vendor in Haryana. My monthly income is around 15,000 and I have two children.');

  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState<number>(1);
  const [hasSupport, setHasSupport] = useState<boolean>(true);
  const [speechError, setSpeechError] = useState<string | null>(null);
  
  // SpeechRecognition instance ref
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check speech recognition support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setHasSupport(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'hi-IN'; // Default Hindi (India)

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript.trim()) {
          setTranscript(currentTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setSpeechError('Microphone permission not granted. You can use sample speech presets or type below.');
        } else if (event.error !== 'no-speech') {
          setSpeechError(`Voice input notification: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Speech recognition initialization error:', err);
      setHasSupport(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  // Pulsing simulation effect when listening
  useEffect(() => {
    let interval: any;
    if (isListening) {
      interval = setInterval(() => {
        setAudioLevel(Math.floor(Math.random() * 5) + 1);
      }, 180);
    } else {
      setAudioLevel(1);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  const toggleListening = () => {
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (_) {}
      setIsListening(false);
    } else {
      setSpeechError(null);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          // If already started or failed
          try {
            recognitionRef.current.stop();
          } catch (_) {}
          setIsListening(false);
        }
      } else {
        // Simulated voice capture
        simulateVoiceListening(effectiveDefaultPrompt);
      }
    }
  };

  const simulateVoiceListening = (sample: string) => {
    setIsListening(true);
    setTranscript('');
    setSpeechError(null);
    const words = sample.split(' ');
    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < words.length) {
        setTranscript((prev) => (prev ? prev + ' ' + words[currentIdx] : words[currentIdx]));
        currentIdx++;
      } else {
        clearInterval(interval);
        setIsListening(false);
      }
    }, 280);
  };

  const handleSend = () => {
    const finalVal = transcript.trim() || effectiveDefaultPrompt;
    onTranscriptComplete(finalVal);
  };

  const handleClear = () => {
    setTranscript('');
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (_) {}
      setIsListening(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border-2 border-[#F77F00] p-6 shadow-lg max-w-xl mx-auto text-center space-y-5">
      {/* Listening State Indicator */}
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="relative">
          {/* Animated ripple circles */}
          {isListening && (
            <>
              <div className="absolute inset-0 rounded-full bg-orange-400 opacity-20 animate-ping" />
              <div className="absolute -inset-3 rounded-full bg-orange-200 opacity-40 animate-pulse" />
            </>
          )}

          <button
            type="button"
            onClick={toggleListening}
            className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-lg ${
              isListening
                ? 'bg-red-600 text-white hover:bg-red-700 scale-105 ring-4 ring-red-200'
                : 'bg-[#F77F00] text-white hover:bg-[#d96e00] hover:scale-102 ring-4 ring-orange-100'
            }`}
          >
            {isListening ? (
              <>
                <Mic className="w-10 h-10 animate-bounce" />
                <span className="text-[11px] font-bold mt-1 tracking-wider uppercase">
                  {t('सुन रहे हैं...', 'Listening...')}
                </span>
              </>
            ) : (
              <>
                <Mic className="w-10 h-10" />
                <span className="text-[11px] font-bold mt-1 tracking-wider uppercase">
                  {t('बोलने के लिए दबाएं', 'Tap to Speak')}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Status text */}
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {isListening 
              ? t('बोलिए, हम सुन रहे हैं...', 'Speak now, we are listening...') 
              : t('माइक्रोफ़ोन पर टैप करें और बोलें', 'Tap microphone to speak')}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {t(
              'अपनी भाषा में बताएं: आपका राज्य, काम, मासिक आय व परिवार विवरण',
              'Speak in your words: Your state, profession, monthly income and family details'
            )}
          </p>
        </div>

        {/* Audio Visualizer Bars */}
        {isListening && (
          <div className="flex items-center justify-center gap-1 h-8 pt-2">
            {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((bar, i) => (
              <div
                key={i}
                className="w-1.5 bg-[#F77F00] rounded-full transition-all duration-150"
                style={{
                  height: `${Math.max(6, Math.min(32, bar * audioLevel * 2.2))}px`
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Live Transcript Display Box */}
      <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-200 text-left min-h-[90px] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-orange-800 tracking-wider mb-1">
            <span>{t('आवाज़ से प्राप्त विवरण:', 'Transcribed Speech Details:')}</span>
            {transcript && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-500 hover:text-red-600 flex items-center gap-1 font-semibold normal-case cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> {t('साफ़ करें', 'Clear')}
              </button>
            )}
          </div>
          <p className="text-base text-gray-900 font-medium italic leading-relaxed">
            {transcript ? `"${transcript}"` : `"${effectiveDefaultPrompt}"`}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 mt-2 border-t border-orange-200/60 text-xs text-gray-500">
          <span>{lang === 'hi' ? 'भाषा: हिंदी (India)' : 'Language: English (India)'}</span>
          {isListening && <span className="text-red-600 font-bold flex items-center gap-1">● {t('रिकॉर्डिंग जारी', 'Recording')}</span>}
        </div>
      </div>

      {/* Preset Voice simulation chips for quick testing */}
      <div className="text-left space-y-1.5 pt-1">
        <p className="text-xs font-bold text-gray-700 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#F77F00]" />
          {t('परीक्षण हेतु आवाज़ नमूने (क्लिक करें):', 'Quick voice simulation presets (Click to test):')}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => simulateVoiceListening(lang === 'hi' 
              ? 'मैं हरियाणा में स्ट्रीट वेंडर हूं। मेरी महीने की कमाई करीब 15 हजार है और मेरे दो बच्चे हैं।'
              : 'I am a street vendor in Haryana. My monthly income is 15000 and I have two children.'
            )}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-orange-100 text-gray-800 font-medium border border-gray-200 transition-colors text-left cursor-pointer"
          >
            🗣️ {t('"मैं हरियाणा में स्ट्रीट वेंडर हूं..." (वेंडर - ₹15k)', '"I am a street vendor in Haryana..." (Vendor - 15k)')}
          </button>
          <button
            type="button"
            onClick={() => simulateVoiceListening(lang === 'hi'
              ? 'मैं उत्तर प्रदेश से किसान हूं। मेरी मासिक आय 12000 है और मेरी दो एकड़ ज़मीन है।'
              : 'I am a small farmer from Uttar Pradesh. My monthly income is 12000.'
            )}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-orange-100 text-gray-800 font-medium border border-gray-200 transition-colors text-left cursor-pointer"
          >
            🗣️ {t('"मैं यूपी में किसान हूं..." (किसान - ₹12k)', '"I am a farmer in UP..." (Farmer - 12k)')}
          </button>
          <button
            type="button"
            onClick={() => simulateVoiceListening(lang === 'hi'
              ? 'मैं राजस्थान में पारंपरिक दर्जी और हस्तशिल्पी कारीगर हूं।'
              : 'I am a traditional artisan and tailor in Rajasthan with 2 children.'
            )}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-orange-100 text-gray-800 font-medium border border-gray-200 transition-colors text-left cursor-pointer"
          >
            🗣️ {t('"पारंपरिक दर्जी/कारीगर..." (कारीगर)', '"Artisan tailor in Rajasthan..." (Artisan)')}
          </button>
        </div>
      </div>

      {speechError && (
        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2 text-left">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{speechError}</span>
        </div>
      )}

      {/* Bottom Action Controls */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-lg border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            {t('वापस', 'Back')}
          </button>
        )}
        <button
          type="button"
          onClick={handleSend}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#006400] text-white text-sm font-bold hover:bg-[#004d00] transition-colors shadow-md cursor-pointer"
        >
          <span>{t('आगे बढ़ें →', 'Continue →')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default VoiceInput;
