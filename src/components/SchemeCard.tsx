import React from 'react';
import { ArrowRight, Check, AlertCircle, HelpCircle, Building2 } from 'lucide-react';
import { Scheme } from '../types.ts';
import { EligibilityBadge } from './EligibilityBadge.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

interface SchemeCardProps {
  scheme: Scheme;
  onViewDetails: (schemeId: string) => void;
  onCompleteProfile?: () => void;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({
  scheme,
  onViewDetails,
  onCompleteProfile
}) => {
  const { lang, t } = useLanguage();
  const isEligible = scheme.status === 'eligible';
  const isNeedInfo = scheme.status === 'need_info';
  const isIneligible = scheme.status === 'ineligible';

  // Border accents based on government design
  const cardBorderClass = isEligible
    ? 'border-emerald-300 hover:border-emerald-500 shadow-xs'
    : isNeedInfo
    ? 'border-amber-300 hover:border-amber-500 shadow-xs'
    : 'border-gray-200 hover:border-gray-400 bg-gray-50/70 opacity-90';

  const headerBgClass = isEligible
    ? 'bg-emerald-50/60'
    : isNeedInfo
    ? 'bg-amber-50/60'
    : 'bg-gray-100/70';

  const primaryTitle = lang === 'hi' ? scheme.nameHi : scheme.name;
  const secondaryTitle = lang === 'hi' ? scheme.name : scheme.nameHi;
  const displayedMinistry = lang === 'hi' ? (scheme.ministryHi || scheme.ministry) : scheme.ministry;

  return (
    <div
      className={`rounded-xl border bg-white flex flex-col h-full overflow-hidden transition-all duration-200 hover:shadow-md ${cardBorderClass}`}
    >
      {/* Top Header Strip with Status Indicator */}
      <div className={`p-3.5 border-b border-gray-100 flex items-start justify-between gap-2.5 shrink-0 ${headerBgClass}`}>
        <div className="flex items-start gap-2 min-w-0">
          <span
            className={`w-3.5 h-3.5 rounded-full mt-1 shrink-0 ${
              isEligible
                ? 'bg-emerald-600 ring-4 ring-emerald-100'
                : isNeedInfo
                ? 'bg-amber-500 ring-4 ring-amber-100'
                : 'bg-gray-400 ring-4 ring-gray-200'
            }`}
          />
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 text-base md:text-lg leading-tight tracking-tight">
              {primaryTitle}
            </h3>
            <p className="text-xs text-[#006400] font-semibold mt-0.5 truncate">
              {secondaryTitle}
            </p>
          </div>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white text-gray-700 border border-gray-200 shrink-0">
          {scheme.categoryLabel}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
        <div className="space-y-3">
          {/* Eligibility Badge */}
          <div>
            <EligibilityBadge status={scheme.status} size="sm" />
          </div>

          {/* Ministry */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{displayedMinistry}</span>
          </div>

          {/* Brief */}
          <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">
            {scheme.brief}
          </p>
        </div>

        {/* State 1 / 2 / 3 Box */}
        <div className="pt-1">
          {isEligible && (
            <div className="bg-emerald-50/80 rounded-lg p-3 border border-emerald-200/80 space-y-1.5">
              <p className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                {t('पात्रता के कारण / Why you qualify:', 'Why you qualify / पात्रता के कारण:')}
              </p>
              {scheme.qualifyReasons.slice(0, 3).map((reason, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs font-medium text-emerald-900">
                  <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          )}

          {isNeedInfo && (
            <div className="bg-amber-50/90 rounded-lg p-3 border border-amber-200/80 space-y-1.5">
              <p className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                {t('आवश्यक जानकारी / Missing details:', 'Missing details / आवश्यक जानकारी:')}
              </p>
              {scheme.infoNeeded.slice(0, 2).map((item, idx) => (
                <div key={idx} className="text-xs font-medium text-amber-900 leading-snug pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-amber-600">
                  {item}
                </div>
              ))}
            </div>
          )}

          {isIneligible && (
            <div className="bg-gray-100/90 rounded-lg p-3 border border-gray-200 space-y-1.5">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-gray-500" />
                {t('कारण / Ineligibility criteria:', 'Ineligibility criteria / कारण:')}
              </p>
              {(scheme.ineligibleReasons || [
                'Does not fulfill designated beneficiary category or trade requirements.'
              ]).slice(0, 2).map((reason, idx) => (
                <div key={idx} className="text-xs text-gray-600 leading-snug pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-gray-400">
                  {reason}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Action Bar */}
      <div className="p-4 pt-0 mt-auto shrink-0">
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] text-gray-500">
            {t('सत्यापित: ', 'Verified: ')}{scheme.lastVerified}
          </span>

          {isEligible ? (
            <button
              type="button"
              onClick={() => onViewDetails(scheme.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#006400] text-white text-xs font-bold hover:bg-[#004d00] transition-colors shadow-xs cursor-pointer"
            >
              {t('विवरण देखें →', 'View details →')}
            </button>
          ) : isNeedInfo ? (
            <button
              type="button"
              onClick={() => {
                if (onCompleteProfile) {
                  onCompleteProfile();
                } else {
                  onViewDetails(scheme.id);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#F77F00] text-white text-xs font-bold hover:bg-[#d96e00] transition-colors shadow-xs cursor-pointer"
            >
              {t('प्रोफाइल पूर्ण करें →', 'Complete profile →')}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onViewDetails(scheme.id)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gray-200 text-gray-800 text-xs font-semibold hover:bg-gray-300 transition-colors cursor-pointer"
            >
              {t('कारण / विवरण →', 'Reason / Details →')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchemeCard;
