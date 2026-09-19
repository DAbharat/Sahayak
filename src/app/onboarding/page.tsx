import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  Keyboard, 
  Check, 
  Sparkles, 
  RotateCcw, 
  ArrowRight, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Search,
  ShieldCheck,
  Building,
  HelpCircle
} from 'lucide-react';
import { VoiceInput } from '../../components/VoiceInput.tsx';
import { TextInput } from '../../components/TextInput.tsx';
import { ProfileCard } from '../../components/ProfileCard.tsx';
import { SchemeCard } from '../../components/SchemeCard.tsx';
import { extractProfileFromText, evaluateSchemesForProfile, POPULAR_SCHEMES } from '../../data/schemes.ts';
import { UserProfile, Scheme } from '../../types.ts';

interface OnboardingPageProps {
  onSelectScheme: (schemeId: string) => void;
  onNavigate: (route: string, params?: any) => void;
  initialMode?: 'voice' | 'text' | null;
  currentUserProfile?: UserProfile | null;
  onUpdateUserProfile?: (profile: UserProfile) => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({
  onSelectScheme,
  onNavigate,
  initialMode = null,
  currentUserProfile,
  onUpdateUserProfile
}) => {
  // Steps:
  // 1: Welcome Screen (Speak / Type)
  // 2: User Input Screen (Voice listening or Text typing)
  // 3: Profile Confirmation ("We understood: State, Occupation, Income, Children")
  // 4: Loading / Checking ("Finding schemes for you... ✓ Understanding... ✓ Checking... * Preparing...")
  // 5: Results Screen ("Schemes you may qualify for")
  const [step, setStep] = useState<number>(initialMode ? 2 : 1);
  const [inputMode, setInputMode] = useState<'voice' | 'text'>(initialMode || 'voice');
  const [rawText, setRawText] = useState<string>('');
  
  // Profile state initialized with default Haryana Street Vendor
  const [profile, setProfile] = useState<UserProfile>(
    currentUserProfile || {
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
    }
  );

  // Loading animation state for step 4
  const [loadingProgress, setLoadingProgress] = useState<{
    step1Done: boolean;
    step2Done: boolean;
    step3Active: boolean;
  }>({
    step1Done: false,
    step2Done: false,
    step3Active: false
  });

  // Schemes evaluated based on confirmed profile
  const [evaluatedSchemes, setEvaluatedSchemes] = useState<Scheme[]>(POPULAR_SCHEMES);
  const [statusFilter, setStatusFilter] = useState<'all' | 'eligible' | 'need_info' | 'ineligible'>('all');

  // Handle mode selection from Step 1
  const handleSelectMode = (mode: 'voice' | 'text') => {
    setInputMode(mode);
    setStep(2);
  };

  // Handle raw text/voice received from Step 2
  const handleInputComplete = (text: string) => {
    setRawText(text);
    const parsed = extractProfileFromText(text, inputMode);
    setProfile(parsed);
    if (onUpdateUserProfile) {
      onUpdateUserProfile(parsed);
    }
    setStep(3); // Go to Profile Confirmation
  };

  // Step 3: Handle Confirmation
  const handleProfileConfirm = (confirmedProfile: UserProfile) => {
    setProfile(confirmedProfile);
    if (onUpdateUserProfile) {
      onUpdateUserProfile(confirmedProfile);
    }
    setStep(4); // Go to Loading/Checking animation
  };

  // Step 4: Loading sequence execution
  useEffect(() => {
    if (step === 4) {
      setLoadingProgress({ step1Done: false, step2Done: false, step3Active: false });
      
      const timer1 = setTimeout(() => {
        setLoadingProgress(prev => ({ ...prev, step1Done: true }));
      }, 700);

      const timer2 = setTimeout(() => {
        setLoadingProgress(prev => ({ ...prev, step2Done: true, step3Active: true }));
      }, 1400);

      const timer3 = setTimeout(() => {
        const schemes = evaluateSchemesForProfile(profile);
        setEvaluatedSchemes(schemes);
        setStep(5); // Transition to Results Screen
      }, 2200);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [step, profile]);

  const filteredResults = evaluatedSchemes.filter(s => {
    if (statusFilter === 'all') return true;
    return s.status === statusFilter;
  });

  const eligibleCount = evaluatedSchemes.filter(s => s.status === 'eligible').length;
  const needInfoCount = evaluatedSchemes.filter(s => s.status === 'need_info').length;
  const ineligibleCount = evaluatedSchemes.filter(s => s.status === 'ineligible').length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8 px-4 text-left">
      <div className="max-w-4xl mx-auto">
        {/* Step Progress Tracker */}
        <div className="mb-6 max-w-xl mx-auto">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-2">
            <span className={step >= 1 ? 'text-[#F77F00]' : ''}>1. Start</span>
            <span className={step >= 2 ? 'text-[#F77F00]' : ''}>2. Input</span>
            <span className={step >= 3 ? 'text-[#F77F00]' : ''}>3. Confirm Profile</span>
            <span className={step >= 4 ? 'text-[#F77F00]' : ''}>4. Verify</span>
            <span className={step === 5 ? 'text-[#006400]' : ''}>5. Results</span>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#F77F00] h-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 1. WELCOME SCREEN                                             */}
        {/* ------------------------------------------------------------- */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border-2 border-orange-200 p-8 md:p-12 text-center shadow-lg max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Title & Subtitle matching prompt */}
            <div className="space-y-3">
              <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-[#F77F00] text-xs font-black uppercase tracking-wider">
                राष्ट्रीय नागरिक पात्रता सहायक / National Scheme Assistant
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
                आपको कौन सी सरकारी सहायता मिल सकती है?
              </h1>
              <p className="text-base md:text-lg text-gray-700 font-medium leading-relaxed max-w-xl mx-auto">
                Tell us a little about yourself and we'll help you find relevant government welfare schemes.
              </p>
              <p className="text-xs text-gray-500">
                (अपने राज्य, काम, मासिक आय व परिवार के बारे में जानकारी दें)
              </p>
            </div>

            {/* Two Large Actions: Speak & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              {/* Action 1: Speak */}
              <button
                type="button"
                onClick={() => handleSelectMode('voice')}
                className="group p-6 rounded-2xl border-2 border-[#F77F00] bg-orange-50/50 hover:bg-[#F77F00] text-left transition-all duration-200 hover:shadow-xl hover:scale-102 flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-[#F77F00] group-hover:bg-white text-white group-hover:text-[#F77F00] flex items-center justify-center text-2xl mb-4 transition-colors shadow-md">
                    🎤
                  </div>
                  <h3 className="text-xl font-black text-gray-900 group-hover:text-white transition-colors">
                    बोलकर बताएं
                  </h3>
                  <p className="text-sm font-bold text-[#006400] group-hover:text-orange-100 transition-colors mt-0.5">
                    Speak
                  </p>
                </div>
                <p className="text-xs text-gray-600 group-hover:text-white/90 mt-4 leading-relaxed transition-colors">
                  अपनी स्थानीय भाषा में माइक्रोफ़ोन पर बोलें। AI आपकी आवाज़ स्वतः समझ लेगा।
                </p>
              </button>

              {/* Action 2: Type */}
              <button
                type="button"
                onClick={() => handleSelectMode('text')}
                className="group p-6 rounded-2xl border-2 border-[#006400] bg-green-50/50 hover:bg-[#006400] text-left transition-all duration-200 hover:shadow-xl hover:scale-102 flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-[#006400] group-hover:bg-white text-white group-hover:text-[#006400] flex items-center justify-center text-2xl mb-4 transition-colors shadow-md">
                    ⌨️
                  </div>
                  <h3 className="text-xl font-black text-gray-900 group-hover:text-white transition-colors">
                    लिखकर बताएं
                  </h3>
                  <p className="text-sm font-bold text-[#006400] group-hover:text-green-100 transition-colors mt-0.5">
                    Type
                  </p>
                </div>
                <p className="text-xs text-gray-600 group-hover:text-white/90 mt-4 leading-relaxed transition-colors">
                  सरल शब्दों में अपना विवरण टाइप करें। किसी विशेष तकनीकी प्रारूप की आवश्यकता नहीं।
                </p>
              </button>
            </div>

            {/* Quick Demo Preload */}
            <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">
              ⚡ Example citizen: <em>"मैं हरियाणा में स्ट्रीट वेंडर हूं। मेरी महीने की कमाई करीब 15 हजार है और मेरे दो बच्चे हैं।"</em>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 2. USER INPUT SCREEN (Voice or Text)                          */}
        {/* ------------------------------------------------------------- */}
        {step === 2 && (
          <div className="animate-in fade-in duration-300">
            {inputMode === 'voice' ? (
              <VoiceInput
                onTranscriptComplete={handleInputComplete}
                onCancel={() => setStep(1)}
              />
            ) : (
              <TextInput
                onSubmit={handleInputComplete}
                onCancel={() => setStep(1)}
              />
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 3. PROFILE CONFIRMATION                                       */}
        {/* ------------------------------------------------------------- */}
        {step === 3 && (
          <div className="animate-in fade-in duration-300 space-y-4">
            <ProfileCard
              profile={profile}
              onConfirm={handleProfileConfirm}
              onEdit={() => setStep(2)}
            />
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 4. LOADING / CHECKING SCREEN                                  */}
        {/* ------------------------------------------------------------- */}
        {step === 4 && (
          <div className="bg-white rounded-2xl border-2 border-orange-200 p-8 md:p-12 text-center shadow-lg max-w-lg mx-auto space-y-6 animate-in fade-in duration-300">
            <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-[#F77F00] animate-spin" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-gray-900">
                Finding schemes for you...
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                आपके लिए सरकारी कल्याणकारी योजनाओं की पात्रता जांची जा रही है...
              </p>
            </div>

            {/* 3-Step Simple Progress Checklist as requested */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 text-left space-y-3 font-medium text-sm">
              {/* Step 1 */}
              <div className="flex items-center gap-2.5">
                {loadingProgress.step1Done ? (
                  <CheckCircle2 className="w-5 h-5 text-[#006400] shrink-0 stroke-[2.5]" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-orange-400 border-t-transparent animate-spin shrink-0" />
                )}
                <span className={loadingProgress.step1Done ? 'text-gray-900 font-bold' : 'text-gray-600'}>
                  ✓ Understanding your information
                </span>
              </div>

              {/* Step 2 */}
              <div className="flex items-center gap-2.5">
                {loadingProgress.step2Done ? (
                  <CheckCircle2 className="w-5 h-5 text-[#006400] shrink-0 stroke-[2.5]" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
                )}
                <span className={loadingProgress.step2Done ? 'text-gray-900 font-bold' : 'text-gray-400'}>
                  ✓ Checking eligibility
                </span>
              </div>

              {/* Step 3 */}
              <div className="flex items-center gap-2.5">
                {loadingProgress.step3Active ? (
                  <span className="text-[#F77F00] font-black text-lg shrink-0 leading-none">
                    *
                  </span>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
                )}
                <span className={loadingProgress.step3Active ? 'text-[#F77F00] font-bold' : 'text-gray-400'}>
                  * Preparing your results
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500 italic">
              Matching across Central Government & {profile.state} State Databases...
            </p>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 5. RESULTS SCREEN                                             */}
        {/* ------------------------------------------------------------- */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Results Header Bar */}
            <div className="bg-white rounded-xl border-2 border-orange-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#006400] bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                    Verification Complete
                  </span>
                  <span className="text-xs text-gray-500">
                    Profile: {profile.occupation} ({profile.state})
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 mt-1">
                  Schemes you may qualify for
                </h1>
                <p className="text-xs md:text-sm text-gray-600">
                  आपके दर्ज विवरण के अनुसार पहचानी गई सरकारी कल्याणकारी योजनाएं:
                </p>
              </div>

              {/* Re-check or Edit Profile Button */}
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-xs font-bold text-gray-700 transition-colors shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#F77F00]" />
                <span>Review / Edit My Profile</span>
              </button>
            </div>

            {/* Three State Filter Tabs matching exact spec */}
            <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-gray-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All Schemes ({evaluatedSchemes.length})
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('eligible')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  statusFilter === 'eligible'
                    ? 'bg-[#006400] text-white shadow-xs'
                    : 'text-[#006400] bg-green-50 hover:bg-green-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>🟢 May qualify ({eligibleCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('need_info')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  statusFilter === 'need_info'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>🟡 More information needed ({needInfoCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter('ineligible')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  statusFilter === 'ineligible'
                    ? 'bg-gray-700 text-white shadow-xs'
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                <span>⚪ Doesn't match published criteria ({ineligibleCount})</span>
              </button>
            </div>

            {/* Scheme Cards Layout matching exact prompt layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredResults.map((scheme) => (
                <SchemeCard
                  key={scheme.id}
                  scheme={scheme}
                  onViewDetails={(id) => onSelectScheme(id)}
                  onCompleteProfile={() => setStep(3)}
                />
              ))}
            </div>

            {/* Bottom Actions & Helpdesk */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-gray-900 text-sm md:text-base">
                  Facing any difficulties with scheme applications?
                </h4>
                <p className="text-xs text-gray-600 mt-0.5">
                  Our automated Grievance drafter helps you prepare formal complaints to CPGRAMS in seconds.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/grievance')}
                className="px-5 py-2.5 rounded-lg bg-[#F77F00] text-white text-xs md:text-sm font-bold hover:bg-[#d96e00] transition-colors shadow-xs shrink-0"
              >
                [ Generate help / grievance ]
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
