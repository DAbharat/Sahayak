/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Home, 
  ShieldCheck, 
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { UserProfile, Scheme, AppRoute } from './types';
import { evaluateSchemes } from './data/schemesData';
import { extractProfileFromText } from './services/aiService';

// Container Pages matching Next.js App Router specification
import { WelcomePage } from '../app/page.jsx';
import { OnboardingPage } from '../app/onboarding/page.jsx';
import { ProfilePage } from '../app/profile/page.jsx';
import { SchemesPage } from '../app/schemes/page.jsx';
import { SchemeDetailPage } from '../app/schemes/[id]/page.jsx';
import { GrievancePage } from '../app/grievance/page.jsx';

const DEFAULT_PROFILE: UserProfile = {
  rawInput: 'मैं हरियाणा में स्ट्रीट वेंडर हूं। मेरी महीने की कमाई करीब 15 हजार है और मेरे दो बच्चे हैं।',
  state: 'Haryana',
  occupation: 'Street Vendor',
  monthlyIncome: 15000,
  children: 2,
  age: 34,
  urbanRural: 'Urban'
};

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('/');
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('pm-svanidhi');
  const [schemes, setSchemes] = useState<Scheme[]>(() => evaluateSchemes(DEFAULT_PROFILE));
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sahayak_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply dark mode class to root
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('sahayak_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('sahayak_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Sync route with browser history
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname as AppRoute;
      if (path.startsWith('/schemes/')) {
        const id = path.replace('/schemes/', '');
        if (id) {
          setSelectedSchemeId(id);
        }
        setCurrentRoute(path);
      } else if (path === '/' || path === '/onboarding' || path === '/profile' || path === '/schemes' || path === '/grievance') {
        setCurrentRoute(path);
      }
    };

    // Handle initial deep link if valid
    const initialPath = window.location.pathname as AppRoute;
    if (initialPath && initialPath !== '/') {
      handlePopState();
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (newRoute: AppRoute) => {
    setCurrentRoute(newRoute);
    try {
      window.history.pushState(null, '', newRoute);
    } catch {
      // In sandboxed iframe pushState might be constrained
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Welcome -> Choose mode
  const handleSelectMode = (mode: 'voice' | 'text') => {
    setInputMode(mode);
    navigate('/onboarding');
  };

  // 2. Input submitted -> Extract profile -> Show profile confirmation
  const handleInputSubmitted = (inputText: string) => {
    const extracted = extractProfileFromText(inputText);
    setProfile(extracted);
    navigate('/profile');
  };

  // 3. Profile confirmed -> Evaluate schemes -> Show results
  const handleProfileConfirmed = (confirmedProfile: UserProfile) => {
    setProfile(confirmedProfile);
    const updatedSchemes = evaluateSchemes(confirmedProfile);
    setSchemes(updatedSchemes);
    navigate('/schemes');
  };

  // 4. View Scheme Details
  const handleViewSchemeDetails = (schemeId: string) => {
    setSelectedSchemeId(schemeId);
    navigate(`/schemes/${schemeId}` as AppRoute);
  };

  // 5. Generate grievance from scheme
  const handleGenerateGrievance = (scheme: Scheme) => {
    setSelectedSchemeId(scheme.id);
    navigate('/grievance');
  };

  const currentScheme = schemes.find(s => s.id === selectedSchemeId) || schemes[0];

  return (
    <div className="min-h-screen bg-[#F2EFE7] dark:bg-[#0B111E] text-slate-800 dark:text-slate-100 font-sans flex flex-col selection:bg-[#C8DFDB] selection:text-[#3368A0] transition-colors duration-300 relative">
      {/* Decorative civic accent top-edge stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-[#3368A0] via-[#66A3BF] to-[#C8DFDB] relative z-50" />

      {/* Atmospheric Day & Night Background: eliminates flat/plain white background with civic geometry & ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
        {/* Subtle civic dot-matrix architectural grid */}
        <div className="absolute inset-0 bg-citizen-pattern opacity-30 dark:opacity-15" />

        {/* Ambient colored light orbs using the requested palette */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[44rem] h-[28rem] bg-gradient-to-tr from-[#3368A0]/15 via-[#66A3BF]/20 to-[#C8DFDB]/35 dark:from-[#3368A0]/25 dark:via-[#66A3BF]/15 dark:to-[#C8DFDB]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-88 h-88 bg-[#C8DFDB]/50 dark:bg-[#66A3BF]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 -right-32 w-96 h-96 bg-[#66A3BF]/20 dark:bg-[#3368A0]/20 rounded-full blur-3xl" />
      </div>

      {/* Top Accessible Citizen Header */}
      <header className="sticky top-0 z-40 bg-[#F2EFE7]/90 dark:bg-[#0E1726]/90 backdrop-blur-md border-b border-[#C8DFDB] dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(51,104,160,0.06)]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between relative z-10">
          {/* Logo / Home trigger */}
          <button
            type="button"
            id="brand-home-btn"
            onClick={() => navigate('/')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#3368A0] to-[#66A3BF] text-white flex items-center justify-center shadow-md shadow-[#3368A0]/20 group-hover:scale-105 transition-all duration-200 ring-2 ring-[#C8DFDB] dark:ring-[#66A3BF]/40">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900 dark:text-slate-50 group-hover:text-[#3368A0] dark:group-hover:text-[#66A3BF] transition-colors leading-tight tracking-tight">
                सहायक <span className="text-xs font-semibold text-[#3368A0] dark:text-[#66A3BF]">| Sahayak</span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                Citizen Schemes & Grievance Assistant
              </div>
            </div>
          </button>

          {/* Right utility navigation: Theme Toggle, Start New, Demo Pill */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Day & Night Mode Toggle */}
            <button
              type="button"
              id="theme-toggle-btn"
              onClick={toggleDarkMode}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#C8DFDB] dark:border-slate-800 bg-white/80 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:bg-[#C8DFDB]/40 dark:hover:bg-slate-800 shadow-2xs transition-all cursor-pointer text-xs font-medium"
              title={isDarkMode ? 'Switch to Day mode (दिन मोड)' : 'Switch to Night mode (रात मोड)'}
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-300" />
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-[#3368A0] animate-in spin-in-90 duration-300" />
                </>
              )}
            </button>

            {currentRoute !== '/' && (
              <button
                type="button"
                id="header-home-btn"
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#C8DFDB] dark:border-slate-800 bg-white/80 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 hover:bg-[#C8DFDB]/40 dark:hover:bg-slate-800 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-[#3368A0] dark:text-[#66A3BF]" />
                <span className="hidden sm:inline">Start New (शुरू से)</span>
              </button>
            )}

            {/* Quick Demo Fill Pill */}
            <button
              type="button"
              id="demo-vendor-profile-btn"
              onClick={() => {
                setProfile(DEFAULT_PROFILE);
                setSchemes(evaluateSchemes(DEFAULT_PROFILE));
                setSelectedSchemeId('pm-svanidhi');
                navigate('/schemes');
              }}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#C8DFDB]/60 to-[#66A3BF]/20 dark:from-indigo-950/70 dark:to-slate-900 hover:from-[#C8DFDB]/90 hover:to-[#66A3BF]/35 dark:hover:from-indigo-900/70 text-[#3368A0] dark:text-[#C8DFDB] text-xs font-bold border border-[#66A3BF]/40 dark:border-indigo-800/80 shadow-2xs transition-all cursor-pointer"
              title="Load prompt sample: Haryana Street Vendor, ₹15,000, 2 children"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#3368A0] dark:text-[#66A3BF]" />
              <span>Demo Profile</span>
            </button>
          </div>
        </div>

        {/* Minimal Route Progress Breadcrumb Bar */}
        <div className="bg-[#F2EFE7]/95 dark:bg-[#0A101D]/90 border-t border-[#C8DFDB] dark:border-slate-800/70 py-1.5 px-4 text-xs text-slate-600 dark:text-slate-400 overflow-x-auto">
          <div className="max-w-6xl mx-auto flex items-center gap-2 whitespace-nowrap text-[11px] sm:text-xs">
            <button
              type="button"
              onClick={() => navigate('/')}
              className={`hover:underline cursor-pointer ${currentRoute === '/' ? 'text-[#3368A0] dark:text-[#66A3BF] font-bold' : ''}`}
            >
              1. Welcome
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={() => navigate('/onboarding')}
              className={`hover:underline cursor-pointer ${currentRoute === '/onboarding' ? 'text-[#3368A0] dark:text-[#66A3BF] font-bold' : ''}`}
            >
              2. Input
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className={`hover:underline cursor-pointer ${currentRoute === '/profile' ? 'text-[#3368A0] dark:text-[#66A3BF] font-bold' : ''}`}
            >
              3. Verification
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={() => navigate('/schemes')}
              className={`hover:underline cursor-pointer ${currentRoute.startsWith('/schemes') ? 'text-[#3368A0] dark:text-[#66A3BF] font-bold' : ''}`}
            >
              4. Schemes
            </button>
            {currentRoute === '/grievance' && (
              <>
                <span>/</span>
                <span className="text-[#3368A0] dark:text-[#66A3BF] font-bold">5. Grievance Draft</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Dynamic View Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        {currentRoute === '/' && (
          <WelcomePage
            onSelectMode={handleSelectMode}
            onQuickPrompt={handleInputSubmitted}
          />
        )}

        {currentRoute === '/onboarding' && (
          <OnboardingPage
            initialMode={inputMode}
            onSubmitInput={handleInputSubmitted}
            onBack={() => navigate('/')}
          />
        )}

        {currentRoute === '/profile' && (
          <ProfilePage
            profile={profile}
            onConfirmProfile={handleProfileConfirmed}
            onBackToInput={() => navigate('/onboarding')}
          />
        )}

        {currentRoute === '/schemes' && (
          <SchemesPage
            schemes={schemes}
            profile={profile}
            onViewSchemeDetails={handleViewSchemeDetails}
            onEditProfile={() => navigate('/profile')}
          />
        )}

        {currentRoute.startsWith('/schemes/') && (
          <SchemeDetailPage
            scheme={currentScheme}
            onBack={() => navigate('/schemes')}
            onGenerateGrievance={handleGenerateGrievance}
          />
        )}

        {currentRoute === '/grievance' && (
          <GrievancePage
            selectedScheme={currentScheme}
            userProfile={profile}
            onBack={() => navigate(`/schemes/${currentScheme.id}` as AppRoute)}
          />
        )}
      </main>

      {/* Non-intimidating Citizen Footer */}
      <footer className="border-t border-[#C8DFDB] dark:border-slate-800 bg-white/75 dark:bg-[#0B111E]/85 backdrop-blur-xs py-6 px-4 text-center text-xs text-slate-600 dark:text-slate-400 space-y-2 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#3368A0] dark:text-[#66A3BF]" />
            Official Government Scheme Data Sources
          </span>
          <span>•</span>
          <span className="font-medium">Bilingual Citizen Assistance (हिंदी + English)</span>
        </div>
        <p className="text-slate-500 dark:text-slate-500 text-[11px]">
          Designed with simplicity and accessibility for people, informal workers, and low-income households to find best schemes.
        </p>
      </footer>
    </div>
  );
}

