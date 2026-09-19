import React, { useState } from 'react';
import { ArrowRight, Sparkles, Edit3 } from 'lucide-react';

interface TextInputProps {
  onSubmit: (text: string) => void;
  onCancel?: () => void;
  initialValue?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  onSubmit,
  onCancel,
  initialValue = 'मैं हरियाणा में स्ट्रीट वेंडर हूं। मेरी महीने की कमाई करीब 15 हजार है और मेरे दो बच्चे हैं।'
}) => {
  const [inputText, setInputText] = useState(initialValue);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSubmit(inputText.trim());
  };

  const samplePrompts = [
    'मैं हरियाणा में स्ट्रीट वेंडर हूं। मेरी महीने की कमाई करीब 15 हजार है और मेरे दो बच्चे हैं।',
    'मैं उत्तर प्रदेश के गांव में छोटा किसान हूं, मासिक आय ₹12,000 है और 2 एकड़ जमीन है।',
    'I am a daily wage construction laborer in Delhi with 3 dependent family members earning ₹14,000.',
    'मैं राजस्थान में हस्तशिल्प और सिलाई का काम करने वाली महिला कारीगर हूं।'
  ];

  return (
    <div className="bg-white rounded-xl border-2 border-[#F77F00] p-6 shadow-lg max-w-xl mx-auto text-left space-y-4">
      <div className="pb-2 border-b border-orange-100 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#F77F00] block">
            Step 2: Tell us about yourself
          </span>
          <h3 className="text-xl font-bold text-gray-900 leading-tight">
            अपने बारे में बताएं / Tell us about yourself
          </h3>
        </div>
        <Edit3 className="w-6 h-6 text-[#F77F00]" />
      </div>

      <p className="text-xs text-gray-600 leading-relaxed">
        आप अपने राज्य, व्यवसाय, मासिक आय एवं परिवार के बारे में किसी भी भाषा में लिख सकते हैं।
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="उदाहरण: मैं हरियाणा में स्ट्रीट वेंडर हूं। मेरी महीने की कमाई करीब 15 हजार है और मेरे दो बच्चे हैं।"
            className="w-full p-3.5 rounded-lg border-2 border-gray-300 focus:border-[#F77F00] focus:ring-2 focus:ring-orange-200 outline-none text-base text-gray-900 leading-relaxed resize-none"
          />
          <div className="text-[11px] text-gray-400 text-right mt-1">
            {inputText.length} वर्ण / characters
          </div>
        </div>

        {/* Quick sample chips */}
        <div className="space-y-1.5 pt-1">
          <p className="text-xs font-bold text-gray-700 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#F77F00]" />
            त्वरित उदाहरण (Tap to populate sample):
          </p>
          <div className="space-y-1.5">
            {samplePrompts.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputText(sample)}
                className="w-full text-left text-xs p-2 rounded bg-gray-50 hover:bg-orange-50/80 border border-gray-200 text-gray-800 transition-colors line-clamp-1"
              >
                📝 {sample}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-lg border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              Back / वापस
            </button>
          )}
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#006400] text-white text-sm font-bold hover:bg-[#004d00] disabled:opacity-50 transition-colors shadow-md"
          >
            <span>Send → / आगे बढ़ें</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default TextInput;
