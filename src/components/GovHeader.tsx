import React, { useState } from 'react';
import { 
  Search, 
  Mic, 
  User, 
  Menu, 
  X, 
  Globe, 
  Eye, 
  PhoneCall, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { AshokaEmblem, AmritMahotsavLogo, DigitalIndiaLogo } from './Emblems.tsx';
import { UserAuth } from '../types.ts';

interface GovHeaderProps {
  currentRoute: string;
  onNavigate: (route: string, params?: any) => void;
  userAuth: UserAuth;
  onOpenAuth: () => void;
  onLogout: () => void;
  lang: 'hi' | 'en';
  onToggleLang: () => void;
  textSize: 'sm' | 'md' | 'lg';
  onChangeTextSize: (size: 'sm' | 'md' | 'lg') => void;
}

export const GovHeader: React.FC<GovHeaderProps> = ({
  currentRoute,
  onNavigate,
  userAuth,
  onOpenAuth,
  onLogout,
  lang,
  onToggleLang,
  textSize,
  onChangeTextSize
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearchQuery.trim()) {
      onNavigate('/schemes', { query: quickSearchQuery.trim() });
    }
  };

  const navLinks = [
    { path: '/', labelEn: 'Home', labelHi: 'मुख्य पृष्ठ' },
    { path: '/onboarding', labelEn: 'Check Eligibility', labelHi: 'पात्रता जांचें (AI)' },
    { path: '/schemes', labelEn: 'Schemes Directory', labelHi: 'सरकारी योजनाएं' },
    { path: '/grievance', labelEn: 'Citizen Grievance', labelHi: 'जन शिकायत' },
    { path: '/profile', labelEn: 'My Profile', labelHi: 'नागरिक प्रोफ़ाइल' }
  ];

  return (
    <header className="w-full bg-white border-b border-gray-200 z-30 shadow-xs">
      {/* 1. Indian National Tricolor Strip */}
      <div className="w-full h-1.5 flex">
        <div className="w-1/3 bg-[#FF9933]"></div>
        <div className="w-1/3 bg-white border-y border-gray-200"></div>
        <div className="w-1/3 bg-[#138808]"></div>
      </div>

      {/* 2. Top Accessibility & Utilities Bar */}
      <div className="bg-[#F5F5F5] border-b border-gray-200 text-xs text-gray-700 py-1 px-3 sm:px-4 w-full overflow-hidden">
        <div className="w-full max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-2 min-w-0">
          {/* Left: Platform label */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="font-bold text-[#333333]">
              सहायक | Sahayak
            </span>
            <span className="hidden md:inline text-gray-400">|</span>
            <span className="hidden md:inline text-gray-600">
              {lang === 'hi' ? 'नागरिक कल्याण एवं जन सहायता मंच' : 'Citizen Welfare & Public Assistance Portal'}
            </span>
          </div>

          {/* Right: Accessibility controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Screen Reader Access */}
            <a
              href="#main-content"
              className="hover:underline text-gray-600 hidden sm:inline"
            >
              {lang === 'hi' ? 'मुख्य सामग्री पर जाएं' : 'Skip to Main Content'}
            </a>

            {/* Font sizing A- A A+ */}
            <div className="flex items-center border border-gray-300 rounded bg-white overflow-hidden text-[11px] font-bold">
              <button
                type="button"
                onClick={() => onChangeTextSize('sm')}
                className={`px-1.5 py-0.5 hover:bg-gray-100 ${textSize === 'sm' ? 'bg-orange-100 text-[#F77F00]' : ''}`}
                title="Decrease text size"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => onChangeTextSize('md')}
                className={`px-1.5 py-0.5 border-x border-gray-300 hover:bg-gray-100 ${textSize === 'md' ? 'bg-orange-100 text-[#F77F00]' : ''}`}
                title="Default text size"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => onChangeTextSize('lg')}
                className={`px-1.5 py-0.5 hover:bg-gray-100 ${textSize === 'lg' ? 'bg-orange-100 text-[#F77F00]' : ''}`}
                title="Increase text size"
              >
                A+
              </button>
            </div>

            {/* Hindi / English Language Switcher */}
            <button
              type="button"
              onClick={onToggleLang}
              className="flex items-center gap-1.5 font-bold text-xs px-2.5 py-0.5 rounded border border-gray-300 bg-white hover:bg-orange-50 text-[#333333] transition-colors shadow-2xs cursor-pointer"
              title={lang === 'hi' ? 'Switch website language to English' : 'वेबसाइट की भाषा हिंदी में बदलें'}
            >
              <Globe className="w-3.5 h-3.5 text-[#F77F00]" />
              <span className="font-extrabold">{lang === 'hi' ? 'English' : 'हिंदी'}</span>
              <span className="text-[10px] text-gray-500 font-normal">
                {lang === 'hi' ? '(Switch)' : '(बदलें)'}
              </span>
            </button>

            {/* Helpline Badge */}
            <div className="hidden lg:flex items-center gap-1 text-[11px] font-semibold text-[#006400]">
              <PhoneCall className="w-3 h-3" />
              <span>{lang === 'hi' ? 'टोल फ्री: 1800-11-0001' : 'Toll Free: 1800-11-0001'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Multi-Part Institutional Header with Emblems */}
      <div className="bg-white py-2.5 sm:py-3 px-3 sm:px-4 border-b border-gray-200 w-full overflow-hidden">
        <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between gap-2 sm:gap-4 min-w-0">
          {/* Left: State Emblem of India + Portal Title */}
          <div 
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0 flex-1"
          >
            <AshokaEmblem size={44} className="shrink-0 group-hover:scale-105 transition-transform sm:w-[52px] sm:h-[52px]" />
            <div className="leading-tight min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xl sm:text-2xl md:text-3xl font-black text-[#F77F00] tracking-tight">
                  सहायक
                </span>
                <span className="text-xs sm:text-sm md:text-base font-extrabold text-[#006400] uppercase tracking-wider">
                  Sahayak
                </span>
              </div>
              <p className="text-[11px] sm:text-xs md:text-sm font-bold text-gray-800 line-clamp-1">
                {lang === 'hi' 
                  ? 'नागरिक कल्याण योजना एवं जन शिकायत सहायता मंच' 
                  : 'Citizen Welfare Schemes Discovery & Grievance Support Platform'}
              </p>
              <p className="text-[10px] sm:text-[11px] text-gray-500 hidden sm:block truncate">
                {lang === 'hi'
                  ? 'अन्त्योदय से आत्मनिर्भर भारत — कल्याणकारी योजनाओं का पारदर्शी मार्गदर्शन'
                  : 'Empowering Citizens through Direct Benefit Transfers & Welfare Access'}
              </p>
            </div>
          </div>

          {/* Right: National Emblems & User Login */}
          <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4 shrink-0">
            <AmritMahotsavLogo className="hidden md:flex" />
            <DigitalIndiaLogo className="hidden lg:flex" />

            {/* User Auth Action */}
            {userAuth.isAuthenticated ? (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-emerald-50 border border-emerald-300 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shrink-0">
                <div 
                  onClick={() => onNavigate('/profile')}
                  className="flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  title={lang === 'hi' ? 'प्रोफ़ाइल देखें' : 'View Profile'}
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#006400] text-white flex items-center justify-center font-bold text-[11px] sm:text-xs shrink-0">
                    {userAuth.name ? userAuth.name.charAt(0) : 'न'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="text-xs font-bold text-gray-900 block leading-tight truncate max-w-[100px]">
                      {userAuth.name || (lang === 'hi' ? 'नागरिक' : 'Citizen')}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold block leading-none">
                      {lang === 'hi' ? `सत्यापित नागरिक (${userAuth.state})` : `Verified Citizen (${userAuth.state})`}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-[11px] text-red-600 font-semibold hover:underline ml-1 cursor-pointer shrink-0 border-l border-emerald-200 pl-2"
                >
                  {lang === 'hi' ? 'लॉगआउट' : 'Logout'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-[#006400] text-white text-xs md:text-sm font-bold hover:bg-[#004d00] transition-colors shadow-xs cursor-pointer shrink-0"
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{lang === 'hi' ? 'लॉग इन' : 'Sign In'}</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded text-gray-700 hover:bg-gray-100 cursor-pointer shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Prominent Saffron Orange Header Navigation Bar (#F77F00) */}
      <nav className="bg-[#F77F00] text-white shadow-md">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Nav Items */}
          <div className="hidden lg:flex items-center">
            {navLinks.map((link) => {
              const isActive = currentRoute === link.path;
              return (
                <button
                  key={link.path}
                  type="button"
                  onClick={() => onNavigate(link.path)}
                  className={`px-4 py-2.5 text-sm font-bold transition-colors border-b-4 cursor-pointer ${
                    isActive
                      ? 'border-white bg-[#d96e00] text-white'
                      : 'border-transparent text-white/95 hover:bg-[#e67300]'
                  }`}
                >
                  {lang === 'hi' ? link.labelHi : link.labelEn}
                </button>
              );
            })}
          </div>

          {/* Quick Voice & Search Bar in Navigation */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden sm:flex items-center bg-white/95 text-gray-800 rounded-md px-2.5 py-1 my-1.5 border border-orange-300 w-72 lg:w-80 shadow-inner"
          >
            <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              value={quickSearchQuery}
              onChange={(e) => setQuickSearchQuery(e.target.value)}
              placeholder={lang === 'hi' ? 'योजना या व्यवसाय खोजें...' : 'Search scheme or occupation...'}
              className="w-full text-xs text-gray-900 bg-transparent outline-none placeholder-gray-500"
            />
            <button
              type="button"
              onClick={() => onNavigate('/onboarding', { mode: 'voice' })}
              className="p-1 text-[#F77F00] hover:text-[#006400] transition-colors cursor-pointer"
              title={lang === 'hi' ? 'बोलकर खोजें' : 'Voice Search'}
            >
              <Mic className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#d96e00] border-t border-orange-400 px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.path}
                type="button"
                onClick={() => {
                  onNavigate(link.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded text-sm font-bold flex items-center justify-between cursor-pointer ${
                  currentRoute === link.path ? 'bg-white text-[#F77F00]' : 'text-white hover:bg-orange-600'
                }`}
              >
                <span>{lang === 'hi' ? link.labelHi : link.labelEn}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ))}

            <div className="pt-2 border-t border-orange-400">
              <form onSubmit={handleSearchSubmit} className="flex items-center bg-white rounded p-1.5 text-xs text-gray-800">
                <Search className="w-4 h-4 text-gray-400 mr-2" />
                <input
                  type="text"
                  value={quickSearchQuery}
                  onChange={(e) => setQuickSearchQuery(e.target.value)}
                  placeholder={lang === 'hi' ? 'योजनाएं खोजें...' : 'Search schemes...'}
                  className="w-full outline-none text-xs"
                />
              </form>
            </div>
          </div>
        )}
      </nav>

      {/* 5. Official Notice Ticker */}
      <div className="bg-amber-50 border-b border-amber-200 py-1.5 px-3 sm:px-4 text-xs flex items-center overflow-hidden w-full">
        <div className="w-full max-w-[1600px] mx-auto flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="bg-[#006400] text-white px-2 py-0.5 rounded text-[10px] font-black uppercase shrink-0 shadow-xs">
            {lang === 'hi' ? 'नवीनतम सूचना' : 'Latest Alert'}
          </span>
          <div className="truncate min-w-0 flex-1 text-gray-800 font-medium animate-pulse text-[11px] sm:text-xs">
            {lang === 'hi' 
              ? '📢 पीएम स्वनिधि योजना के अंतर्गत तीसरी किस्त का वितरण जारी • आयुष्मान भारत 70+ वरिष्ठ नागरिक स्वास्थ्य सुरक्षा पंजीकरण शुरू • पीएम विश्वकर्मा टूलकिट सहायता उपलब्ध • जन शिकायत निवारण पोर्टल 48 घंटे में प्रतिक्रिया प्रदान करता है।'
              : '📢 PM SVANidhi 3rd tranche disbursed to eligible urban street vendors • Ayushman Bharat 70+ Senior Citizen Health Cover open for enrollment • PM Vishwakarma toolkit subsidy active • Grievance desk responds within 48 hours.'
            }
          </div>
        </div>
      </div>
    </header>
  );
};

export default GovHeader;
