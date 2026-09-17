import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ProfileCard } from '../../components/ProfileCard.jsx';

/**
 * Container Page: app/profile/page.jsx
 * Handles confirmation workflow, eligibility evaluation trigger & checklist animation,
 * passing data down to the dumb UI component ProfileCard.
 */
export const ProfilePage = ({
  profile,
  onConfirmProfile,
  onBackToInput,
  isLoadingCheck = false
}) => {
  const [currentProfile, setCurrentProfile] = useState(profile);
  const [checkingStep, setCheckingStep] = useState(0);
  const [isCheckingAnimation, setIsCheckingAnimation] = useState(false);
  const timersRef = useRef([]);

  // Sync with incoming profile prop
  useEffect(() => {
    setCurrentProfile(profile);
  }, [profile]);

  // Clean up any running timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const handleConfirm = () => {
    setIsCheckingAnimation(true);
    setCheckingStep(1);

    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    const t1 = setTimeout(() => {
      setCheckingStep(2);
    }, 700);

    const t2 = setTimeout(() => {
      setCheckingStep(3);
    }, 1400);

    const t3 = setTimeout(() => {
      onConfirmProfile && onConfirmProfile(currentProfile);
    }, 2000);

    timersRef.current.push(t1, t2, t3);
  };

  const handleSaveProfile = (updated) => {
    setCurrentProfile(updated);
  };

  if (isCheckingAnimation || isLoadingCheck) {
    return (
      <div id="loading-checking-screen" className="w-full max-w-md mx-auto py-16 px-4 text-center space-y-8">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center shadow-xs">
            <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
          </div>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Finding schemes for you...
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            आपके लिए सरकारी योजनाओं की जांच की जा रही है...
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-5 text-left space-y-3.5 shadow-xs max-w-sm mx-auto">
          <div className="flex items-center gap-3">
            {checkingStep >= 1 ? (
              <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                ✓
              </span>
            ) : (
              <span className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center flex-shrink-0 text-xs">
                •
              </span>
            )}
            <span className={`text-xs sm:text-sm ${checkingStep >= 1 ? 'text-neutral-900 dark:text-neutral-100 font-semibold' : 'text-neutral-400 dark:text-neutral-500'}`}>
              Understanding your profile details
            </span>
          </div>

          <div className="flex items-center gap-3">
            {checkingStep >= 2 ? (
              <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                ✓
              </span>
            ) : checkingStep === 1 ? (
              <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 text-xs font-bold animate-pulse">
                •
              </span>
            ) : (
              <span className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center flex-shrink-0 text-xs">
                •
              </span>
            )}
            <span className={`text-xs sm:text-sm ${checkingStep >= 2 ? 'text-neutral-900 dark:text-neutral-100 font-semibold' : 'text-neutral-400 dark:text-neutral-500'}`}>
              Checking eligibility criteria & rules
            </span>
          </div>

          <div className="flex items-center gap-3">
            {checkingStep >= 3 ? (
              <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                ✓
              </span>
            ) : checkingStep === 2 ? (
              <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 text-xs font-bold animate-pulse">
                •
              </span>
            ) : (
              <span className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center flex-shrink-0 text-xs">
                •
              </span>
            )}
            <span className={`text-xs sm:text-sm ${checkingStep >= 3 ? 'text-neutral-900 dark:text-neutral-100 font-semibold' : 'text-neutral-400 dark:text-neutral-500'}`}>
              Preparing your personal recommendations
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="profile-confirmation-screen" className="w-full max-w-2xl mx-auto py-4 sm:py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          id="profile-back-btn"
          onClick={onBackToInput}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Change input (दोबारा बोलें / लिखें)</span>
        </button>

        <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">
          Step 2 of 3
        </span>
      </div>

      <ProfileCard
        profile={currentProfile}
        onConfirm={handleConfirm}
        onSaveProfile={handleSaveProfile}
      />
    </div>
  );
};

export default ProfilePage;
