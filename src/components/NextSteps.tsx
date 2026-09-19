import React from 'react';
import { ArrowRight, CheckCircle, ExternalLink } from 'lucide-react';

interface StepItem {
  stepNumber: number;
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
}

interface NextStepsProps {
  steps: StepItem[];
  sourceUrl?: string;
  onHelpClick?: () => void;
}

export const NextSteps: React.FC<NextStepsProps> = ({
  steps,
  sourceUrl,
  onHelpClick
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
        <div>
          <h4 className="font-bold text-[#333333] text-base">
            What to do next / आगे क्या करें
          </h4>
          <p className="text-xs text-gray-500">
            Follow these verified official steps to avail your scheme benefit
          </p>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-100 text-[#F77F00] border border-orange-200">
          Official Process
        </span>
      </div>

      <div className="space-y-3 relative">
        {steps.map((step) => (
          <div
            key={step.stepNumber}
            className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-gradient-to-r from-gray-50 to-white hover:border-[#F77F00]/40 transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-[#006400] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              {step.stepNumber}
            </div>
            <div className="flex-1">
              <h5 className="text-sm font-bold text-gray-900 leading-snug">
                {step.title}
              </h5>
              <p className="text-xs font-semibold text-[#006400] mt-0.5">
                {step.titleHi}
              </p>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                {step.description}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 font-normal">
                {step.descriptionHi}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006400] hover:text-[#F77F00] transition-colors"
          >
            Visit Official Portal / आधिकारिक पोर्टल <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
        {onHelpClick && (
          <button
            type="button"
            onClick={onHelpClick}
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-[#F77F00] underline decoration-dashed"
          >
            Facing problems with this step? Generate Grievance →
          </button>
        )}
      </div>
    </div>
  );
};

export default NextSteps;
