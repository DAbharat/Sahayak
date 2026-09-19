import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mic, Keyboard } from 'lucide-react';
import { VoiceInput } from '../../components/VoiceInput.jsx';
import { TextInput } from '../../components/TextInput.jsx';

/**
 * Container Page: app/onboarding/page.jsx
 * Handles input capture (Voice SpeechRecognition & Text input),
 * then passes plain props down to dumb UI components VoiceInput and TextInput.
 */
export const OnboardingPage = ({
  initialMode = 'voice',
  onSubmitInput,
  onBack
}) => {
  const [mode, setMode] = useState(initialMode);
  const [textValue, setTextValue] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const simulatedIntervalRef = useRef(null);

  // Setup Web Speech API if supported
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'hi-IN'; // Hindi (India) with English fallback detection

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event) => {
          let fullTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript + ' ';
          }
          setVoiceTranscript(fullTranscript.trim());
        };

        recognition.onerror = (event) => {
          console.warn('Speech recognition error/warning:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Speech recognition not initialized:', err);
      }
    }

    return () => {
      if (simulatedIntervalRef.current) {
        clearInterval(simulatedIntervalRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleStartListening = () => {
    if (simulatedIntervalRef.current) {
      clearInterval(simulatedIntervalRef.current);
      simulatedIntervalRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        // If already active or permission denied
        setIsListening(true);
      }
    } else {
      // Fallback simulated listening for environments without mic access
      setIsListening(true);
      const sample = 'मैं हरियाणा में स्ट्रीट वेंडर हूं। मेरी महीने की कमाई करीब 15 हजार है और मेरे दो बच्चे हैं।';
      let charIndex = 0;
      setVoiceTranscript('');
      simulatedIntervalRef.current = setInterval(() => {
        charIndex += 4;
        setVoiceTranscript(sample.slice(0, charIndex));
        if (charIndex >= sample.length) {
          if (simulatedIntervalRef.current) {
            clearInterval(simulatedIntervalRef.current);
            simulatedIntervalRef.current = null;
          }
          setIsListening(false);
        }
      }, 100);
    }
  };

  const handleStopListening = () => {
    setIsListening(false);
    if (simulatedIntervalRef.current) {
      clearInterval(simulatedIntervalRef.current);
      simulatedIntervalRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
  };

  const handleVoiceSubmit = (transcriptText) => {
    if (transcriptText && transcriptText.trim()) {
      onSubmitInput && onSubmitInput(transcriptText.trim());
    }
  };

  const handleTextSubmit = () => {
    if (textValue && textValue.trim()) {
      onSubmitInput && onSubmitInput(textValue.trim());
    }
  };

  return (
    <div id="onboarding-screen" className="w-full max-w-2xl mx-auto py-4 sm:py-8 px-4 space-y-6">
      {/* Top Header & Mode Switcher */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          id="onboarding-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>पीछे जाएं (Back)</span>
        </button>

        <div className="inline-flex p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl border border-neutral-200/80 dark:border-neutral-700/80 text-xs font-semibold">
          <button
            type="button"
            id="switch-to-voice-tab"
            onClick={() => setMode('voice')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              mode === 'voice'
                ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice (बोलकर)</span>
          </button>
          <button
            type="button"
            id="switch-to-text-tab"
            onClick={() => setMode('text')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              mode === 'text'
                ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Type (लिखकर)</span>
          </button>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="pt-2">
        {mode === 'voice' ? (
          <VoiceInput
            isListening={isListening}
            transcript={voiceTranscript}
            onStartListening={handleStartListening}
            onStopListening={handleStopListening}
            onSubmitTranscript={handleVoiceSubmit}
            onSelectSample={(sample) => {
              setVoiceTranscript(sample);
            }}
          />
        ) : (
          <TextInput
            value={textValue}
            onChange={setTextValue}
            onSubmit={handleTextSubmit}
            onSelectSample={(sample) => {
              setTextValue(sample);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
