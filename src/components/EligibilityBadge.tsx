import React from 'react';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { EligibilityStatus } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';

interface EligibilityBadgeProps {
  status: EligibilityStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const EligibilityBadge: React.FC<EligibilityBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true
}) => {
  const { t } = useLanguage();

  if (status === 'eligible') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 ${
          size === 'sm'
            ? 'px-2 py-0.5 text-xs'
            : size === 'lg'
            ? 'px-3.5 py-1 text-base'
            : 'px-2.5 py-0.5 text-sm'
        }`}
      >
        {showIcon && <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />}
        <span>{t('आप पात्र हो सकते हैं', 'You may qualify')}</span>
      </span>
    );
  }

  if (status === 'need_info') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-300 ${
          size === 'sm'
            ? 'px-2 py-0.5 text-xs'
            : size === 'lg'
            ? 'px-3.5 py-1 text-base'
            : 'px-2.5 py-0.5 text-sm'
        }`}
      >
        {showIcon && <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />}
        <span>{t('अधिक जानकारी आवश्यक', 'More information needed')}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-300 ${
        size === 'sm'
          ? 'px-2 py-0.5 text-xs'
          : size === 'lg'
          ? 'px-3.5 py-1 text-base'
          : 'px-2.5 py-0.5 text-sm'
      }`}
    >
      {showIcon && <XCircle className="w-4 h-4 text-gray-500 shrink-0" />}
      <span>{t('पात्रता मानदंड मेल नहीं खाते', 'Doesn’t match published criteria')}</span>
    </span>
  );
};

export default EligibilityBadge;
