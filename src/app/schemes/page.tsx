import React, { useState } from 'react';
import { Search, Mic, Filter, Building2, ExternalLink, ArrowRight } from 'lucide-react';
import { POPULAR_SCHEMES } from '../../data/schemes.ts';
import { SchemeCard } from '../../components/SchemeCard.tsx';
import { Scheme } from '../../types.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface SchemesPageProps {
  onSelectScheme: (schemeId: string) => void;
  onNavigate: (route: string, params?: any) => void;
  initialQuery?: string;
}

export const SchemesPage: React.FC<SchemesPageProps> = ({
  onSelectScheme,
  onNavigate,
  initialQuery = ''
}) => {
  const { lang, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', labelHi: 'सभी योजनाएं', labelEn: 'All Schemes' },
    { id: 'livelihood', labelHi: 'रेहड़ी-पटरी विक्रेता / आजीविका', labelEn: 'Street Vendors / Livelihood' },
    { id: 'healthcare', labelHi: 'स्वास्थ्य सेवा', labelEn: 'Healthcare' },
    { id: 'skill_artisan', labelHi: 'कारीगर व शिल्पकार', labelEn: 'Artisans & Craftsmen' },
    { id: 'agriculture', labelHi: 'कृषि व किसान', labelEn: 'Agriculture & Farmers' },
    { id: 'housing', labelHi: 'आवास योजनाएं', labelEn: 'Housing' },
    { id: 'women_child', labelHi: 'महिला एवं बाल विकास', labelEn: 'Women & Child' },
    { id: 'social_security', labelHi: 'सामाजिक सुरक्षा', labelEn: 'Social Security' }
  ];

  const filteredSchemes = POPULAR_SCHEMES.filter(scheme => {
    const matchesQuery = 
      scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.nameHi.includes(searchQuery) ||
      scheme.brief.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.targetOccupations.some(occ => occ.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || scheme.category === selectedCategory;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="bg-[#F8F9FA] min-h-screen py-8 px-4 text-left">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Page Banner Header */}
        <div className="bg-white rounded-2xl border-2 border-orange-200 p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#F77F00] block">
              {t('प्रत्यक्ष नागरिक लाभ संदर्शिका', 'Direct Beneficiary Portal')}
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mt-1">
              {t(
                'केंद्रीय एवं राज्य सरकारी योजनाएं',
                'Government Welfare Schemes Directory'
              )}
            </h1>
            <p className="text-xs md:text-sm text-gray-600 mt-1 max-w-3xl">
              {t(
                'अधिसूचित केंद्रीय एवं राज्य कल्याणकारी योजनाओं की आधिकारिक निर्देशिका, पात्रता मानदंड एवं प्रत्यक्ष वित्तीय लाभ।',
                'Search and explore officially notified citizen welfare schemes with verified guidelines and eligibility metrics.'
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/onboarding')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#006400] text-white text-xs md:text-sm font-bold hover:bg-[#004d00] transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <span>{t('AI पात्रता जांचें →', 'Check Eligibility (AI) →')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search input */}
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(
                  'योजना का नाम, मंत्रालय या पेशा खोजें (e.g., Street Vendor, Ayushman, Kisan, Vishwakarma)...',
                  'Search scheme name, ministry, or occupation (e.g., Street Vendor, Ayushman, Kisan)...'
                )}
                className="w-full pl-11 pr-4 py-2.5 text-xs md:text-sm rounded-xl border border-gray-300 focus:border-[#F77F00] outline-none text-gray-900"
              />
            </div>

            {/* Voice search button */}
            <button
              type="button"
              onClick={() => onNavigate('/onboarding', { mode: 'voice' })}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#F77F00] text-white text-xs md:text-sm font-bold hover:bg-[#d96e00] transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>{t('बोलकर खोजें', 'Voice Search')}</span>
            </button>
          </div>

          {/* Category Pills Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-gray-500 font-semibold shrink-0">
              {t('श्रेणी:', 'Filter By:')}
            </span>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap border transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#006400] text-white border-[#006400] shadow-xs'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {lang === 'hi' ? cat.labelHi : cat.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Schemes Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              onViewDetails={(id) => onSelectScheme(id)}
              onCompleteProfile={() => onNavigate('/onboarding')}
            />
          ))}
        </div>

        {filteredSchemes.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
            <p className="text-lg font-bold text-gray-700">
              {t(
                'कोई योजना नहीं मिली।',
                'No schemes match your search criteria.'
              )}
            </p>
            <p className="text-xs text-gray-500">
              {t(
                'कृपया सामान्य शब्द जैसे "Vendor", "Kisan", "Health" खोजें या श्रेणी रीसेट करें।',
                'Try searching for general terms like "Vendor", "Kisan", "Health", or reset your category filter.'
              )}
            </p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="px-5 py-2.5 rounded-lg bg-[#F77F00] text-white text-xs font-bold cursor-pointer hover:bg-[#d96e00]"
            >
              {t('फ़िल्टर रीसेट करें', 'Reset Filters')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchemesPage;
