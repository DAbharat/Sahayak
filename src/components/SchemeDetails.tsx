import React from 'react';
import { 
  Building2, 
  ExternalLink, 
  ShieldCheck, 
  Check, 
  AlertTriangle, 
  Calendar, 
  FileQuestion,
  ArrowLeft,
  Share2,
  Printer
} from 'lucide-react';
import { Scheme } from '../types.ts';
import { EligibilityBadge } from './EligibilityBadge.tsx';
import { DocumentList } from './DocumentList.tsx';
import { NextSteps } from './NextSteps.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

interface SchemeDetailsProps {
  scheme: Scheme;
  onBack?: () => void;
  onGenerateGrievance: (scheme: Scheme) => void;
}

export const SchemeDetails: React.FC<SchemeDetailsProps> = ({
  scheme,
  onBack,
  onGenerateGrievance
}) => {
  const { lang, t } = useLanguage();
  const isEligible = scheme.status === 'eligible';
  const isNeedInfo = scheme.status === 'need_info';
  const isIneligible = scheme.status === 'ineligible';

  const handlePrint = () => {
    window.print();
  };

  const primaryTitle = lang === 'hi' ? scheme.nameHi : scheme.name;
  const secondaryTitle = lang === 'hi' ? scheme.name : scheme.nameHi;
  const displayedMinistry = lang === 'hi' ? (scheme.ministryHi || scheme.ministry) : scheme.ministry;

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-12 text-left">
      {/* Top Banner Navigation */}
      <div className="bg-white border-b border-gray-200 z-20 shadow-xs">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs md:text-sm font-bold text-[#006400] hover:text-[#F77F00] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('← योजनाओं की सूची पर लौटें', '← Back to Schemes Directory')}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('योजना का विवरण प्रिंट करें', 'Print Scheme Brief')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Main Scheme Header Box */}
        <div className="bg-white rounded-2xl border-2 border-orange-200 p-6 md:p-8 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-gray-100">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-100 text-[#F77F00] uppercase tracking-wider">
              {scheme.categoryLabel}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{t('सत्यापित: ', 'Last verified: ')}<strong>{scheme.lastVerified}</strong></span>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-tight">
            {primaryTitle}
          </h1>
          <p className="text-base md:text-lg text-[#006400] font-bold mt-1">
            {secondaryTitle}
          </p>

          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 mt-2.5">
            <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="font-medium">{displayedMinistry}</span>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-gray-500 block mb-1 font-semibold">
                {t('आपकी पात्रता स्थिति:', 'Your Eligibility Status:')}
              </span>
              <EligibilityBadge status={scheme.status} size="lg" />
            </div>

            {/* Prominent Action Button: [ Generate help / grievance ] */}
            <button
              type="button"
              onClick={() => onGenerateGrievance(scheme)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F77F00] text-white text-xs md:text-sm font-bold hover:bg-[#d96e00] transition-colors shadow-md ring-2 ring-orange-200 cursor-pointer"
            >
              <FileQuestion className="w-4 h-4" />
              <span>{t('सहायता / जन शिकायत ड्राफ्ट तैयार करें →', 'Generate Help / Grievance →')}</span>
            </button>
          </div>
        </div>

        {/* Two-Column Scheme Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left / Main 8 Columns */}
          <div className="lg:col-span-8 space-y-6">
            {/* Section 1: You may qualify based on */}
            {isEligible && scheme.qualifyReasons.length > 0 && (
              <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-xs">
                <div className="flex items-center gap-2 pb-3 mb-3 border-b border-emerald-100">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-gray-900">
                      {t('आप इन आधारों पर पात्र हैं:', 'You may qualify based on:')}
                    </h3>
                    <p className="text-xs text-emerald-800">
                      {t('आपकी दी गई नागरिक प्रोफ़ाइल से सत्यापित', 'Matched directly with your citizen profile')}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {scheme.qualifyReasons.map((reason, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60"
                    >
                      <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <span className="text-sm font-semibold text-emerald-950">
                        {reason}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ineligible Reasons */}
            {isIneligible && scheme.ineligibleReasons && (
              <div className="bg-white rounded-2xl border border-gray-300 p-6 shadow-xs">
                <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-200">
                  <div className="w-6 h-6 rounded-full bg-gray-500 text-white flex items-center justify-center font-bold text-xs">
                    ✕
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-gray-900">
                      {t('मानदंड मेल नहीं खाते:', "Doesn't match published criteria:")}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {t('योजना की आधिकारिक अधिसूचना के अनुसार', 'Based on official notification requirements')}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {scheme.ineligibleReasons.map((reason, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-gray-100 border border-gray-200 text-sm text-gray-800"
                    >
                      {reason}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 2: Information still needed */}
            {scheme.infoNeeded && scheme.infoNeeded.length > 0 && (
              <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-xs">
                <div className="flex items-center gap-2 pb-3 mb-3 border-b border-amber-100">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-gray-900">
                      {t('अतिरिक्त जानकारी आवश्यक:', 'Information still needed:')}
                    </h3>
                    <p className="text-xs text-amber-800">
                      {t('अंतिम स्वीकृति के लिए अनिवार्य सत्यापन बिंदु', 'Mandatory verification points needed for final sanction')}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {scheme.infoNeeded.map((info, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 text-sm text-amber-950 font-medium"
                    >
                      <span className="text-amber-700 font-bold shrink-0">⚠️</span>
                      <span>{info}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 3: Required documents */}
            <DocumentList
              documents={scheme.requiredDocuments}
              title={t('आवश्यक आधिकारिक दस्तावेज', 'Required Documents')}
            />

            {/* Section 4: What to do next */}
            <NextSteps
              steps={scheme.nextSteps}
              sourceUrl={scheme.sourceUrl}
              onHelpClick={() => onGenerateGrievance(scheme)}
            />
          </div>

          {/* Right Column (4 Cols): Key Benefits & Institutional Sources */}
          <div className="lg:col-span-4 space-y-6">
            {/* Scheme Benefits Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
              <h4 className="font-bold text-[#333333] text-sm uppercase tracking-wider mb-2.5 pb-2 border-b border-gray-100 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#006400]" />
                {t('प्रमुख लाभ एवं वित्तीय सहायता', 'Key Benefits & Assistance')}
              </h4>
              <p className="text-sm text-gray-800 leading-relaxed">
                {scheme.benefits}
              </p>
              {scheme.benefitsHi && (
                <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-200 text-xs text-green-900 font-medium">
                  {scheme.benefitsHi}
                </div>
              )}
            </div>

            {/* Official Source & Verification Panel */}
            <div className="bg-white rounded-2xl border border-orange-200 p-6 shadow-xs space-y-3">
              <h4 className="font-bold text-[#333333] text-sm uppercase tracking-wider pb-2 border-b border-orange-100">
                {t('आधिकारिक योजना स्रोत', 'Official Scheme Source')}
              </h4>
              
              <div className="text-xs space-y-2.5">
                <div>
                  <span className="text-gray-500 block">{t('संबद्ध प्राधिकरण:', 'Publishing Authority:')}</span>
                  <span className="font-bold text-gray-900">{scheme.sourceName}</span>
                </div>

                <div>
                  <span className="text-gray-500 block">{t('आधिकारिक वेब पोर्टल:', 'Official Web Portal:')}</span>
                  <a
                    href={scheme.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#006400] font-semibold hover:underline inline-flex items-center gap-1 break-all cursor-pointer"
                  >
                    {scheme.sourceUrl} <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <span className="text-gray-500 block">{t('अंतिम सत्यापन तिथि:', 'Last Verified Date:')}</span>
                  <span className="font-bold text-gray-900">{scheme.lastVerified}</span>
                </div>
              </div>

              <div className="bg-orange-50 p-3 rounded-xl text-[11px] text-orange-900 border border-orange-200">
                🏛️ {t('सभी योजना आंकड़े सीधे भारत सरकार के आधिकारिक राजपत्रों से सत्यापित हैं।', 'All data is synchronized directly with official Indian Government gazettes.')}
              </div>
            </div>

            {/* Quick Grievance Action Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-orange-300 p-6 text-center space-y-3">
              <h4 className="font-bold text-gray-900 text-base">
                {t('आवेदन में कोई समस्या आ रही है?', 'Trouble with Your Application?')}
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {t(
                  'यदि आपका आवेदन अस्वीकार हुआ है, अनुचित देरी हो रही है, या कोई अधिकारी नियमों से बाहर मांग करता है, तो तुरंत आधिकारिक जन शिकायत प्रारूप तैयार करें।',
                  'If your application was rejected or delayed unreasonably, generate a formal representation citing statutory welfare guidelines.'
                )}
              </p>
              <button
                type="button"
                onClick={() => onGenerateGrievance(scheme)}
                className="w-full py-3 px-4 rounded-xl bg-[#F77F00] hover:bg-[#d96e00] text-white text-xs md:text-sm font-bold transition-colors shadow-sm cursor-pointer"
              >
                {t('सहायता / जन शिकायत प्रारूप तैयार करें →', 'Generate Help / Grievance →')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemeDetails;
