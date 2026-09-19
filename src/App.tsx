import React, { useState, useEffect } from 'react';
import { GovHeader } from './components/GovHeader.tsx';
import { GovFooter } from './components/GovFooter.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { HomePage } from './app/page.tsx';
import { OnboardingPage } from './app/onboarding/page.tsx';
import { SchemesPage } from './app/schemes/page.tsx';
import { SchemeDetailPage } from './app/schemes/[id]/page.tsx';
import { GrievancePage } from './app/grievance/page.tsx';
import { ProfilePage } from './app/profile/page.tsx';
import { POPULAR_SCHEMES } from './data/schemes.ts';
import { UserProfile, UserAuth, Scheme } from './types.ts';
import { LanguageProvider, useLanguage } from './context/LanguageContext.tsx';
import { localApi } from './services/localData.ts';

function MainApp() {
  // Navigation State
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [routeParams, setRouteParams] = useState<any>({});
  
  // App-level state from LanguageContext
  const { lang, toggleLang } = useLanguage();
  const [textSize, setTextSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  
  const [userAuth, setUserAuth] = useState<UserAuth>({
    isAuthenticated: false,
    name: 'नागरिक / Citizen',
    phone: '',
    state: 'Haryana'
  });

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'नागरिक / Citizen',
    state: 'Haryana',
    occupation: 'Street Vendor',
    monthly_income: 15000,
    monthlyIncome: 15000,
    children_count: 2,
    children: 2,
    age: 34,
    gender: 'MALE',
    rawInput: 'मैं हरियाणा में स्ट्रीट वेंडर हूं। मेरी महीने की कमाई करीब 15 हजार है और मेरे दो बच्चे हैं।',
    inputMode: 'voice'
  });

  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('pm-svanidhi');
  const [grievanceTargetScheme, setGrievanceTargetScheme] = useState<Scheme | null>(null);

  // Sync hash routing with browser URL
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || '/';
      if (hash.startsWith('/schemes/')) {
        const id = hash.replace('/schemes/', '');
        setSelectedSchemeId(id);
        setCurrentRoute('/schemes/[id]');
      } else {
        setCurrentRoute(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (route: string, params: any = {}) => {
    setRouteParams(params);
    if (route === '/schemes/[id]') {
      window.location.hash = `/schemes/${selectedSchemeId}`;
    } else {
      window.location.hash = route;
    }
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectScheme = (schemeId: string) => {
    setSelectedSchemeId(schemeId);
    window.location.hash = `/schemes/${schemeId}`;
    setCurrentRoute('/schemes/[id]');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerateGrievanceForScheme = (scheme: Scheme) => {
    setGrievanceTargetScheme(scheme);
    navigate('/grievance');
  };

  const handleChangeTextSize = (size: 'sm' | 'md' | 'lg') => {
    setTextSize(size);
    document.documentElement.classList.remove('text-size-sm', 'text-size-md', 'text-size-lg');
    document.documentElement.classList.add(`text-size-${size}`);
  };

  const handleLoginSuccess = (authData: UserAuth) => {
    setUserAuth(authData);
    setUserProfile(prev => ({
      ...prev,
      name: authData.name,
      state: authData.state || prev.state
    }));
  };

  const handleLogout = () => {
    setUserAuth({
      isAuthenticated: false,
      name: 'नागरिक / Citizen',
      phone: '',
      state: 'Haryana'
    });
  };

  const authenticate = async (
    mode: 'login' | 'signup',
    credentials: { email: string; password: string }
  ): Promise<UserAuth> => {
    if (mode === 'signup') {
      await localApi.register(credentials);
    }

    const loginResponse = await localApi.login(credentials);
    const profile = await localApi.getProfile(loginResponse.id);

    return {
      isAuthenticated: true,
      id: loginResponse.id,
      email: loginResponse.email,
      access_token: loginResponse.access_token,
      refresh_token: loginResponse.refresh_token,
      name: profile ? `${profile.occupation} (${profile.state})` : loginResponse.email.split('@')[0],
      state: profile?.state || 'Maharashtra'
    };
  };

  const quickLogin = async (role: 'farmer' | 'vendor' | 'artisan'): Promise<UserAuth> => {
    const emailByRole = {
      farmer: 'farmer@sahayak.gov.in',
      vendor: 'vendor@sahayak.gov.in',
      artisan: 'artisan@sahayak.gov.in'
    } as const;
    const loginResponse = await localApi.login({
      email: emailByRole[role],
      password: 'password123'
    });
    const profile = await localApi.getProfile(loginResponse.id);

    return {
      isAuthenticated: true,
      id: loginResponse.id,
      email: loginResponse.email,
      access_token: loginResponse.access_token,
      refresh_token: loginResponse.refresh_token,
      name: profile ? `${profile.occupation} (${profile.state})` : emailByRole[role].split('@')[0],
      state: profile?.state || (role === 'vendor' ? 'Haryana' : role === 'farmer' ? 'Maharashtra' : 'Rajasthan')
    };
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#333333] w-full max-w-full overflow-x-hidden">
      {/* Official Government Header (scrolling normally with the page) */}
      <GovHeader
        currentRoute={currentRoute}
        onNavigate={navigate}
        userAuth={userAuth}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        lang={lang}
        onToggleLang={toggleLang}
        textSize={textSize}
        onChangeTextSize={handleChangeTextSize}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 w-full max-w-full overflow-x-hidden">
        {currentRoute === '/' && (
          <HomePage
            onNavigate={navigate}
            onSelectScheme={handleSelectScheme}
            lang={lang}
          />
        )}

        {currentRoute === '/onboarding' && (
          <OnboardingPage
            onSelectScheme={handleSelectScheme}
            onNavigate={navigate}
            initialMode={routeParams.mode || null}
            currentUserProfile={userProfile}
            onUpdateUserProfile={setUserProfile}
          />
        )}

        {currentRoute === '/schemes' && (
          <SchemesPage
            onSelectScheme={handleSelectScheme}
            onNavigate={navigate}
            initialQuery={routeParams.query || ''}
          />
        )}

        {currentRoute === '/schemes/[id]' && (
          <SchemeDetailPage
            schemeId={selectedSchemeId}
            onBack={() => navigate('/schemes')}
            onGenerateGrievance={handleGenerateGrievanceForScheme}
          />
        )}

        {currentRoute === '/grievance' && (
          <GrievancePage
            scheme={grievanceTargetScheme}
            userProfile={userProfile}
            onNavigate={navigate}
          />
        )}

        {currentRoute === '/profile' && (
          <ProfilePage
            userProfile={userProfile}
            userAuth={userAuth}
            onUpdateProfile={setUserProfile}
            onNavigate={navigate}
            onSelectScheme={handleSelectScheme}
          />
        )}
      </main>

      {/* Official Government Footer */}
      <GovFooter onNavigate={navigate} />

      {/* Citizen Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onAuthenticate={authenticate}
        onQuickLogin={quickLogin}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
