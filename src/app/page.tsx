import React, { useState } from 'react';
import { 
  Search, 
  Mic, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  TrendingUp, 
  FileText, 
  ExternalLink, 
  ChevronRight, 
  Sparkles,
  Users,
  Award,
  AlertCircle,
  Building2,
  PhoneCall
} from 'lucide-react';
import { POPULAR_SCHEMES } from '../data/schemes.ts';
import { SchemeCard } from '../components/SchemeCard.tsx';
import { PmModiShowcase, AshokaEmblem, AmritMahotsavLogo } from '../components/Emblems.tsx';
import { Scheme } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';

interface HomePageProps {
  onNavigate: (route: string, params?: any) => void;
  onSelectScheme: (schemeId: string) => void;
  lang?: 'hi' | 'en';
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectScheme
}) => {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'popular' | 'about' | 'how'>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredSchemes = POPULAR_SCHEMES.filter(scheme => {
    const matchesSearch = 
      scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.nameHi.includes(searchQuery) ||
      scheme.targetOccupations.some(occ => occ.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || scheme.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', labelHi: 'सभी योजनाएं', labelEn: 'All Schemes' },
    { id: 'livelihood', labelHi: 'रेहड़ी-पटरी विक्रेता', labelEn: 'Street Vendors' },
    { id: 'healthcare', labelHi: 'स्वास्थ्य सेवा', labelEn: 'Healthcare' },
    { id: 'skill_artisan', labelHi: 'कारीगर व शिल्पकार', labelEn: 'Artisans & Crafts' },
    { id: 'housing', labelHi: 'आवास योजनाएं', labelEn: 'Housing' },
    { id: 'women_child', labelHi: 'महिला एवं बाल विकास', labelEn: 'Women & Child' },
    { id: 'agriculture', labelHi: 'कृषि व किसान', labelEn: 'Agriculture & Farmers' }
  ];

  return (
    <div className="bg-[#F8F9FA] min-h-screen text-left w-full max-w-full overflow-x-hidden">
      {/* 1. Official Hero Section Split: Photo showcase on left & Informational block on right */}
      <section className="bg-white border-b border-gray-200 w-full overflow-hidden">
        <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10 min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch min-w-0">
            {/* Left Column (5 Cols): Photo showcase featuring smiling Indian citizen family */}
            <div className="lg:col-span-5 flex flex-col h-full min-w-0">
              <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-orange-300 group w-full h-full min-h-[260px] sm:min-h-[340px] flex flex-col justify-end bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1609137144822-49826d52579b?auto=format&fit=crop&w=900&q=80"
                  alt="Smiling Indian citizen family benefiting from government welfare schemes"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                <div className="relative z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4 sm:p-5 md:p-6 text-white min-w-0">
                  <span className="inline-block px-2.5 py-1 rounded bg-[#F77F00] text-xs font-black uppercase tracking-wider mb-1.5 self-start">
                    {t('अंत्योदय से आत्मनिर्भर', 'Welfare For All — Antyodaya')}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold leading-tight drop-shadow-md">
                    {t(
                      'हर पात्र नागरिक को उसका हक और सरकारी सहायता',
                      'Empowering Every Eligible Citizen with Direct Welfare Benefits'
                    )}
                  </h3>
                  <p className="text-xs text-gray-200 mt-1 drop-shadow-xs leading-relaxed">
                    {t(
                      'रेहड़ी-पटरी विक्रेता, छोटे किसान, कारीगर और महिलाएं — प्रत्यक्ष लाभ हस्तांतरण (DBT) द्वारा सशक्त।',
                      'Street vendors, small farmers, artisans, and women empowered across India through transparent direct benefit transfers.'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column (7 Cols): Informational block with Flagship Ayushman Bharat */}
            <div className="lg:col-span-7 bg-[#F5F5F5] rounded-2xl border-2 border-orange-200 p-4 sm:p-6 md:p-8 flex flex-col justify-between shadow-xs h-full min-w-0">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-orange-100 text-[#F77F00] text-xs font-bold border border-orange-300">
                    {t('प्रमुख केंद्रीय योजना', 'Flagship Central Initiative')}
                  </span>
                  <span className="text-xs font-bold text-[#006400]">
                    {t('27,000+ संबद्ध अस्पताल', '27,000+ Empaneled Hospitals')}
                  </span>
                </div>

                {/* Bold Title */}
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#F77F00] tracking-tight leading-tight">
                  {lang === 'hi' 
                    ? 'आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना' 
                    : 'Ayushman Bharat - PM Jan Arogya Yojana'}
                </h2>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#006400] mt-1">
                  {lang === 'hi'
                    ? 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)'
                    : 'PM-JAY Universal Free Healthcare Coverage'}
                </h3>

                {/* Secondary Description */}
                <p className="text-sm md:text-base text-gray-700 mt-3 leading-relaxed">
                  {t(
                    'विश्व की सबसे बड़ी सरकारी स्वास्थ्य आश्वासन योजना — देश के 55 करोड़ से अधिक नागरिकों और कमजोर परिवारों को प्रतिवर्ष ₹5 लाख तक का पूर्णतः मुफ्त एवं कैशलेस उपचार। अस्पताल में भर्ती होने से लेकर दवाइयों, जांच और प्रमुख सर्जरी तक का संपूर्ण व्यय सरकार द्वारा वहन किया जाता है।',
                    'The world’s largest government health assurance scheme — providing completely free and cashless healthcare coverage up to ₹5 Lakh per family per year to over 55 crore vulnerable citizens. Covers hospitalization, pre-and-post care, surgeries, and diagnostics without any out-of-pocket costs.'
                  )}
                </p>

                {/* Key Metric Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 my-4 sm:my-5">
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs">
                    <span className="text-xs text-gray-500 block">
                      {t('मुफ्त स्वास्थ्य कवर', 'Free Health Cover')}
                    </span>
                    <span className="text-base sm:text-lg font-black text-[#006400]">₹5,00,000</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs">
                    <span className="text-xs text-gray-500 block">
                      {t('वार्षिक लाभार्थी', 'Annual Beneficiaries')}
                    </span>
                    <span className="text-base sm:text-lg font-black text-[#F77F00]">
                      {t('12+ करोड़ परिवार', '12+ Crore Families')}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-2xs col-span-2 sm:col-span-1">
                    <span className="text-xs text-gray-500 block">
                      {t('वरिष्ठ नागरिक (70+)', 'Senior Citizens (70+)')}
                    </span>
                    <span className="text-base sm:text-lg font-black text-blue-700">
                      {t('विशेष सुरक्षा', 'Universal Cover')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Call to Actions: Check Eligibility and Voice Navigation */}
              <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={() => onNavigate('/onboarding')}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg bg-[#006400] text-white text-sm md:text-base font-bold hover:bg-[#004d00] transition-colors shadow-md ring-2 ring-emerald-300/40 cursor-pointer"
                >
                  <span>{t('अपनी पात्रता जांचें →', 'Check Eligibility →')}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('/onboarding', { mode: 'voice' })}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg bg-[#F77F00] text-white text-sm md:text-base font-bold hover:bg-[#d96e00] transition-colors shadow-md cursor-pointer shrink-0"
                >
                  <Mic className="w-5 h-5 animate-pulse" />
                  <span>{t('बोलकर बताएं', 'Speak with Voice')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Hon'ble Prime Minister Showcase Strip */}
      <section className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-4 min-w-0 overflow-hidden">
        <PmModiShowcase />
      </section>

      {/* 3. Main Content Area: Tabs & Schemes Grid across full width (no blank side margins) */}
      <section className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-8 min-w-0 overflow-hidden">
        {/* Tabbed Interactive Section */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs w-full min-w-0">
          {/* Tab Bar */}
          <div className="flex border-b border-gray-200 overflow-x-auto text-xs md:text-sm font-bold bg-[#F5F5F5] w-full min-w-0 no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('popular')}
              className={`px-4 sm:px-6 py-3.5 whitespace-nowrap transition-colors border-b-2 cursor-pointer shrink-0 ${
                activeTab === 'popular'
                  ? 'border-[#F77F00] bg-white text-[#F77F00]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              🌟 {t('लोकप्रिय योजनाएं', 'Popular Schemes')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('about')}
              className={`px-4 sm:px-6 py-3.5 whitespace-nowrap transition-colors border-b-2 cursor-pointer shrink-0 ${
                activeTab === 'about'
                  ? 'border-[#F77F00] bg-white text-[#F77F00]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              🏛️ {t('हमारे बारे में', 'About Sahayak')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('how')}
              className={`px-4 sm:px-6 py-3.5 whitespace-nowrap transition-colors border-b-2 cursor-pointer shrink-0 ${
                activeTab === 'how'
                  ? 'border-[#F77F00] bg-white text-[#F77F00]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 {t('आवेदन कैसे करें', 'How To Apply')}
            </button>
          </div>

          {/* Tab 1: Popular Schemes Content */}
          {activeTab === 'popular' && (
            <div className="p-4 sm:p-6 space-y-6 min-w-0">
              {/* Search and Voice Navigation Feature */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-orange-50/70 p-3 sm:p-4 rounded-xl border border-orange-200 w-full min-w-0">
                <div className="relative flex-1 w-full min-w-0">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t(
                      'योजना का नाम या व्यवसाय खोजें (e.g. Street Vendor, PM SVANidhi, Kisan, Ayushman)...',
                      'Search scheme name or occupation (e.g. Street Vendor, PM SVANidhi, Kisan, Ayushman)...'
                    )}
                    className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm rounded-lg border border-gray-300 bg-white focus:border-[#F77F00] outline-none text-gray-900 placeholder-gray-500 min-w-0"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('/onboarding', { mode: 'voice' })}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#F77F00] text-white text-xs sm:text-sm font-bold hover:bg-[#d96e00] transition-colors shrink-0 shadow-xs cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  <span>{t('आवाज़ से खोजें', 'Voice Search')}</span>
                </button>
              </div>

              {/* Filter chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs w-full min-w-0 no-scrollbar">
                <span className="text-gray-500 font-semibold shrink-0">
                  {t('श्रेणी:', 'Category:')}
                </span>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap border transition-colors cursor-pointer shrink-0 ${
                      selectedCategory === cat.id
                        ? 'bg-[#006400] text-white border-[#006400] shadow-2xs'
                        : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {lang === 'hi' ? cat.labelHi : cat.labelEn}
                  </button>
                ))}
              </div>

              {/* Scheme Cards Grid: 3 COLUMNS across full width (no empty space to the right) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 min-w-0">
                {filteredSchemes.slice(0, 6).map((scheme) => (
                  <SchemeCard
                    key={scheme.id}
                    scheme={scheme}
                    onViewDetails={(id) => onSelectScheme(id)}
                    onCompleteProfile={() => onNavigate('/onboarding')}
                  />
                ))}
              </div>

              {filteredSchemes.length === 0 && (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center space-y-2">
                  <p className="text-base font-bold text-gray-700">
                    {t('कोई योजना नहीं मिली।', 'No schemes match your search criteria.')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t('कृपया अन्य शब्द या "सभी योजनाएं" चुनें।', 'Try searching for general terms or reset your filter.')}
                  </p>
                </div>
              )}

              {/* Full Width Bottom Action */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => onNavigate('/schemes')}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border-2 border-[#006400] text-[#006400] hover:bg-[#006400] hover:text-white text-sm font-bold transition-all shadow-xs cursor-pointer"
                >
                  <span>{t('सभी 200+ सरकारी योजनाएं देखें →', 'View All 200+ Schemes Directory →')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: About Sahayak Portal */}
          {activeTab === 'about' && (
            <div className="p-8 space-y-6 text-sm text-gray-700 leading-relaxed">
              <div>
                <h3 className="text-2xl font-black text-[#F77F00]">
                  {t(
                    'सहायक (Sahayak) — राष्ट्रीय डिजिटल समावेशन एवं नागरिक कल्याण मंच',
                    'Sahayak — National Citizen Welfare Discovery & Empowerment Platform'
                  )}
                </h3>
                <p className="mt-2 text-base text-gray-700">
                  {t(
                    "'सहायक' देश के प्रत्येक नागरिक, विशेषकर रेहड़ी-पटरी विक्रेताओं (Street Vendors), लघु एवं सीमांत किसानों, असंगठित कामगारों, कारीगरों, श्रमिकों एवं आर्थिक रूप से कमजोर परिवारों तक सरकारी कल्याणकारी योजनाओं की सटीक जानकारी, सीधी पात्रता जांच और शिकायत निवारण प्रारूपण में सहायता प्रदान करता है।",
                    "Sahayak is dedicated to ensuring that every citizen across India — especially street vendors, smallholder farmers, unorganized workers, artisans, and women — gets transparent, friction-free access to central and state welfare benefits, direct eligibility guidance, and institutional grievance support."
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 space-y-2">
                  <div className="w-9 h-9 rounded-lg bg-[#F77F00] text-white flex items-center justify-center font-bold">
                    <Mic className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-[#006400] text-base">
                    {t('आवाज़-आधारित पात्रता जांच (Voice AI)', 'Voice-Guided Eligibility')}
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {t(
                      'बिना किसी जटिल फॉर्म के नागरिक अपनी स्थानीय भाषा में बोलकर अपनी जानकारी साझा कर सकते हैं।',
                      'Citizens can speak naturally in their mother tongue without typing complex bureaucratic forms.'
                    )}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="w-9 h-9 rounded-lg bg-[#006400] text-white flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-[#006400] text-base">
                    {t('100% पारदर्शी नियम एवं प्रमाण', 'Transparent Evaluation')}
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {t(
                      'प्रत्येक योजना में स्पष्ट रूप से दिखाया जाता है कि आप क्यों पात्र हैं या कौन सा दस्तावेज आवश्यक है।',
                      'Clear step-by-step reasons why you qualify, what official documents are needed, and exact contact points.'
                    )}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
                  <div className="w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-blue-900 text-base">
                    {t('जन शिकायत सहायता (Grievance Help)', 'Formal Grievance Drafting')}
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {t(
                      'यदि किसी बैंक या विभाग द्वारा आवेदन में अनुचित देरी की जाती है, तो तुरंत औपचारिक प्रतिवेदन तैयार करें।',
                      'Instantly draft formal representations citing relevant government guidelines when benefits are delayed.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: How to Apply */}
          {activeTab === 'how' && (
            <div className="p-8 space-y-6 text-sm text-gray-700">
              <h3 className="text-2xl font-black text-[#006400]">
                {t('सरल 4 चरणों में सरकारी योजना का लाभ प्राप्त करें', 'Get Welfare Scheme Benefits in 4 Simple Steps')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                  <span className="w-8 h-8 rounded-full bg-[#F77F00] text-white flex items-center justify-center font-bold text-sm">1</span>
                  <h4 className="font-bold text-gray-900 text-base">
                    {t('विवरण बताएं', 'Provide Details')}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {t('बोलकर या लिखकर अपना राज्य, व्यवसाय, मासिक आय और श्रेणी बताएं।', 'Tell us about your state, trade, monthly income, and family size.')}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                  <span className="w-8 h-8 rounded-full bg-[#006400] text-white flex items-center justify-center font-bold text-sm">2</span>
                  <h4 className="font-bold text-gray-900 text-base">
                    {t('पात्रता समीक्षा', 'Review Eligibility')}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {t('तुरंत देखें कि आप किन योजनाओं में पात्र हैं और कितना वित्तीय लाभ मिलेगा।', 'Instantly check your eligibility status and approved benefit amounts.')}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                  <span className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-sm">3</span>
                  <h4 className="font-bold text-gray-900 text-base">
                    {t('दस्तावेज तैयार करें', 'Prepare Documents')}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {t('आधार, बैंक खाता और वेंडर प्रमाणपत्र जैसे आवश्यक दस्तावेजों की सूची देखें।', 'Verify required documents like Aadhaar, bank passbook, and trade cards.')}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                  <span className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">4</span>
                  <h4 className="font-bold text-gray-900 text-base">
                    {t('ऑनलाइन / सीएससी आवेदन', 'Submit Application')}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {t('आधिकारिक पोर्टल या नजदीकी जन सेवा केंद्र (CSC) से सीधे आवेदन करें।', 'Apply on the official portal or your local Common Service Centre (CSC).')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Workflow Quick Launcher Banner across full width */}
        <div className="bg-gradient-to-r from-orange-600 via-[#F77F00] to-amber-600 text-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 sm:gap-6 w-full min-w-0 overflow-hidden">
          <div className="space-y-1 min-w-0">
            <span className="inline-block px-3 py-1 rounded bg-white/20 text-xs font-bold uppercase tracking-wider">
              {t('त्वरित नागरिक सेवा', 'Instant Citizen Assistant')}
            </span>
            <h3 className="text-xl md:text-2xl lg:text-3xl font-black mt-2">
              {t('आपको कौन सी सरकारी सहायता मिल सकती है?', 'Which welfare schemes do you qualify for?')}
            </h3>
            <p className="text-xs md:text-sm text-orange-100 max-w-2xl">
              {t(
                'अपना व्यवसाय, राज्य और आय बताएं और तुरंत अपनी पात्रता सूची प्राप्त करें।',
                'Tell us about your trade, state, and family to instantly discover all benefits you qualify for.'
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/onboarding')}
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 rounded-xl bg-white text-[#006400] text-sm md:text-base font-black hover:bg-orange-50 transition-colors shadow-lg shrink-0 whitespace-nowrap cursor-pointer text-center"
          >
            {t('शुरू करें →', 'Start Now →')}
          </button>
        </div>

        {/* Balanced 3-Column Institutional Section: Zero empty space on the right */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-w-0">
          {/* Column 1: Important Government Portals */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs flex flex-col justify-between">
            <div>
              <div className="bg-[#006400] text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-300" />
                  <h4 className="font-bold text-sm uppercase tracking-wider">
                    {t('महत्वपूर्ण सरकारी पोर्टल', 'Key Government Portals')}
                  </h4>
                </div>
              </div>

              <div className="p-3 divide-y divide-gray-100">
                {[
                  { 
                    title: 'PM SVANidhi Portal', 
                    descHi: 'रेहड़ी-पटरी विक्रेताओं के लिए सूक्ष्म ऋण योजना', 
                    descEn: 'Street vendors micro-credit scheme', 
                    url: 'https://pmsvanidhi.mohua.gov.in' 
                  },
                  { 
                    title: 'DBT Bharat Portal', 
                    descHi: 'प्रत्यक्ष लाभ हस्तांतरण राष्ट्रीय मंच', 
                    descEn: 'Direct Benefit Transfer National Portal', 
                    url: 'https://dbtbharat.gov.in' 
                  },
                  { 
                    title: 'DigiLocker India', 
                    descHi: 'सत्यापित सरकारी डिजिटल दस्तावेज भंडार', 
                    descEn: 'Access verified government documents', 
                    url: 'https://www.digilocker.gov.in' 
                  },
                  { 
                    title: 'CPGRAMS Portal', 
                    descHi: 'केंद्रीकृत जन शिकायत निवारण पोर्टल', 
                    descEn: 'Centralized Public Grievance Redressal', 
                    url: 'https://pgportal.gov.in' 
                  },
                  { 
                    title: 'e-Shram Portal', 
                    descHi: 'असंगठित श्रमिकों का राष्ट्रीय डेटाबेस', 
                    descEn: 'National unorganized workers database', 
                    url: 'https://eshram.gov.in' 
                  },
                  { 
                    title: 'MyScheme Portal', 
                    descHi: 'एकल खिड़की राष्ट्रीय योजना खोज मंच', 
                    descEn: 'National scheme discovery platform', 
                    url: 'https://www.myscheme.gov.in' 
                  }
                ].map((item, idx) => (
                  <a
                    key={idx}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 flex items-center justify-between group hover:bg-orange-50/60 rounded-lg transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="text-xs font-bold text-gray-900 group-hover:text-[#F77F00] transition-colors block">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-gray-500 block mt-0.5">
                        {lang === 'hi' ? item.descHi : item.descEn}
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#F77F00] shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Latest News & Gazette Announcements */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs flex flex-col justify-between">
            <div>
              <div className="bg-[#F77F00] text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-200" />
                  <h4 className="font-bold text-sm uppercase tracking-wider">
                    {t('नवीनतम समाचार एवं राजपत्र', 'Latest News & Gazette')}
                  </h4>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-bold">
                  Live Feed
                </span>
              </div>

              <div className="p-4 space-y-3.5">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/70 hover:border-orange-300 transition-colors">
                  <span className="text-[10px] font-bold text-[#006400] block">16 SEP 2026</span>
                  <h5 className="text-xs font-bold text-gray-900 mt-0.5 leading-snug">
                    {t(
                      'शहरी रेहड़ी-पटरी विक्रेताओं के लिए विशेष बायोमेट्रिक सत्यापन शिविर शुरू।',
                      'Special campaign launched for urban street vendor biometric verification.'
                    )}
                  </h5>
                  <p className="text-[11px] text-gray-600 mt-1">
                    {t(
                      'नगर निगमों को एकल खिड़की सत्यापन शिविर आयोजित करने के निर्देश जारी।',
                      'Municipal corporations directed to establish single-window verification camps.'
                    )}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/70 hover:border-orange-300 transition-colors">
                  <span className="text-[10px] font-bold text-[#006400] block">14 SEP 2026</span>
                  <h5 className="text-xs font-bold text-gray-900 mt-0.5 leading-snug">
                    {t(
                      'आयुष्मान भारत योजना का विस्तार: 70 वर्ष से अधिक के सभी वरिष्ठ नागरिक शामिल।',
                      'Ayushman Bharat expansion to cover all senior citizens aged 70 and above.'
                    )}
                  </h5>
                  <p className="text-[11px] text-gray-600 mt-1">
                    {t(
                      'आर्थिक स्थिति की परवाह किए बिना सार्वभौमिक स्वास्थ्य कार्ड पंजीकरण खुला।',
                      'Universal healthcare card enrollment open regardless of economic standing.'
                    )}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/70 hover:border-orange-300 transition-colors">
                  <span className="text-[10px] font-bold text-[#006400] block">11 SEP 2026</span>
                  <h5 className="text-xs font-bold text-gray-900 mt-0.5 leading-snug">
                    {t(
                      'पीएम विश्वकर्मा टूलकिट प्रोत्साहन राशि का सीधा वितरण जारी।',
                      'PM Vishwakarma toolkit subsidy release milestone achieved.'
                    )}
                  </h5>
                  <p className="text-[11px] text-gray-600 mt-1">
                    {t(
                      '₹15,000 डिजिटल ई-वाउचर कारीगरों के सत्यापित खातों में हस्तांतरित।',
                      '₹15,000 digital e-vouchers distributed directly into artisans’ verified accounts.'
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 pt-0">
              <button
                type="button"
                onClick={() => onNavigate('/schemes')}
                className="w-full py-2.5 text-center text-xs font-bold text-[#006400] hover:text-[#F77F00] transition-colors border-t border-gray-100 cursor-pointer"
              >
                {t('सभी राजपत्र अधिसूचनाएं पढ़ें →', 'Read All Gazette Notifications →')}
              </button>
            </div>
          </div>

          {/* Column 3: Citizen Helpline & Grievance Quick Action */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/50 rounded-2xl border border-emerald-300 p-6 flex flex-col justify-between shadow-xs">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-[#006400] text-white flex items-center justify-center font-bold">
                  <AlertCircle className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-base">
                    {t('क्या आपका आवेदन अटका हुआ है?', 'Application Delayed or Rejected?')}
                  </h4>
                  <span className="text-[11px] text-[#006400] font-semibold">
                    {t('नागरिक अधिकार संरक्षण', 'Citizen Rights & Redressal')}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-700 leading-relaxed">
                {t(
                  'यदि किसी बैंक, नगर निगम या सरकारी विभाग में आपकी योजना का आवेदन अस्वीकार हुआ है या अनावश्यक देरी की जा रही है, तो आधिकारिक नियमों का हवाला देते हुए तुरंत औपचारिक जन शिकायत प्रारूप (Representation) तैयार करें।',
                  'If your welfare scheme application was rejected or delayed by any department or bank, generate an official grievance representation citing published central guidelines in minutes.'
                )}
              </p>

              <div className="p-3 bg-white/80 rounded-xl border border-emerald-200 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                  <PhoneCall className="w-4 h-4 text-[#F77F00]" />
                  <span>1800-11-0001 (Toll Free)</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  {t('24x7 जन शिकायत सहायता डेस्क', '24x7 National Citizen Helpline Desk')}
                </p>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => onNavigate('/grievance')}
                className="w-full py-3 px-4 rounded-xl bg-[#006400] hover:bg-[#004d00] text-white text-xs md:text-sm font-bold transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t('जन शिकायत ड्राफ्ट तैयार करें →', 'Generate Grievance Representation →')}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
