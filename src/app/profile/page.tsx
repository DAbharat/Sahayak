import React from 'react';
import { User, MapPin, Briefcase, IndianRupee, Users, ShieldCheck, CheckCircle2, AlertCircle, FileText, ArrowRight, ExternalLink } from 'lucide-react';
import { UserProfile, UserAuth } from '../../types.ts';
import { ProfileCard } from '../../components/ProfileCard.tsx';
import { POPULAR_SCHEMES } from '../../data/schemes.ts';
import { updateProfile, createProfile } from '../../services/profile.service.ts';

interface ProfilePageProps {
  userProfile: UserProfile;
  userAuth: UserAuth;
  onUpdateProfile: (profile: UserProfile) => void;
  onNavigate: (route: string, params?: any) => void;
  onSelectScheme: (schemeId: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  userProfile,
  userAuth,
  onUpdateProfile,
  onNavigate,
  onSelectScheme
}) => {
  const [isSaving, setIsSaving] = React.useState(false);

  const handleProfileConfirm = async (updated: UserProfile) => {
    if (userAuth.isAuthenticated && userAuth.id) {
      setIsSaving(true);
      try {
        const payload = {
          name: updated.name || userProfile.name || userAuth.name || '',
          occupation: updated.occupation || '',
          monthly_income: updated.monthlyIncome || updated.monthly_income || 0,
          income_currency: 'INR',
          family_size: (updated.children || updated.children_count || 0) + 2,
          children_count: updated.children || updated.children_count || 0,
          children_school_going: false,
          age: updated.age || 30,
          gender: updated.gender || 'MALE',
          is_registered_worker: updated.is_registered_worker || false,
          caste_category: updated.caste_category || 'GENERAL',
          has_bank_account: updated.has_bank_account ?? true,
          documents_available: [],
          language: 'hi',
          state: updated.state || '',
          district: updated.district || '',
        };

        if (userProfile.id || updated.id) {
          await updateProfile(userAuth.id, payload);
        } else {
          await createProfile(userAuth.id, payload);
        }
      } catch (err) {
        console.error("Failed to sync profile to backend", err);
      } finally {
        setIsSaving(false);
      }
    }
    onUpdateProfile(updated);
  };

  const displayName = userAuth.isAuthenticated && userAuth.name ? userAuth.name : userProfile.name;
  const initials = displayName 
    ? displayName.split(/[\s_()\-]+/).filter(Boolean).map(n => n[0]).join('').toUpperCase().substring(0, 2) 
    : 'न';

  return (
    <div className="bg-[#F8F9FA] min-h-screen py-8 px-4 text-left">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl border-2 border-orange-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#006400] text-white flex items-center justify-center text-2xl font-black shadow-md">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-gray-900">
                  {displayName}
                </h1>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                  सत्यापित नागरिक / Active Profile
                </span>
              </div>
              {userProfile.occupation && (
                <p className="text-sm font-semibold text-gray-700 mt-1">
                  {userProfile.occupation}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Aadhaar Reference: XXXX-XXXX-4892 • State: {userProfile.state} • Jan Parichay SSO
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/onboarding')}
            className="px-4 py-2 rounded-lg bg-[#F77F00] text-white text-xs md:text-sm font-bold hover:bg-[#d96e00] transition-colors shadow-xs"
          >
            Re-run AI Eligibility Assessment →
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols): Profile Verification Card & DigiLocker Docs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative">
              {isSaving && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 rounded-xl flex items-center justify-center">
                  <div className="flex items-center gap-2 text-[#F77F00] font-bold">
                    <span className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    Saving to Go Backend...
                  </div>
                </div>
              )}
              <ProfileCard
                profile={userProfile}
                onConfirm={handleProfileConfirm}
              />
            </div>

            {/* DigiLocker Digital Document Wallet Integration */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#006400]" />
                  <h3 className="font-bold text-gray-900 text-sm md:text-base">
                    DigiLocker Verified Documents / प्रमाणित दस्तावेज
                  </h3>
                </div>
                <span className="text-[11px] text-[#006400] font-bold bg-green-50 px-2 py-0.5 rounded border border-green-200">
                  Live Linked
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-900">Aadhaar Identity</p>
                    <p className="text-[11px] text-gray-500">UIDAI Verified • **** 4892</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>

                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-900">Bank Account / DBT</p>
                    <p className="text-[11px] text-gray-500">NPCI Aadhaar Seeded</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>

                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-900">Ration Card / Parivar ID</p>
                    <p className="text-[11px] text-gray-500">Haryana PPP Linked</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>

                <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-amber-950">Certificate of Vending (CoV)</p>
                    <p className="text-[11px] text-amber-700">Pending ULB Issuance</p>
                  </div>
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): Top Matched Schemes & Grievance Shortcuts */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider pb-2 border-b border-gray-100">
                Primary Matched Schemes
              </h3>

              <div className="space-y-3">
                <div
                  onClick={() => onSelectScheme('pm-svanidhi')}
                  className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                    <span>PM SVANidhi Loan</span>
                    <span className="text-emerald-700">🟢 May qualify</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-1">
                    Up to ₹50,000 working capital loan with 7% interest subsidy.
                  </p>
                </div>

                <div
                  onClick={() => onSelectScheme('ayushman-bharat')}
                  className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                    <span>Ayushman Bharat (PM-JAY)</span>
                    <span className="text-emerald-700">🟢 May qualify</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-1">
                    ₹5,00,000 cashless medical protection for your 4 family members.
                  </p>
                </div>

                <div
                  onClick={() => onSelectScheme('pm-vishwakarma')}
                  className="p-3 rounded-lg border border-amber-200 bg-amber-50/60 hover:bg-amber-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                    <span>PM Vishwakarma</span>
                    <span className="text-amber-700">🟡 Need Info</span>
                  </div>
                  <p className="text-[11px] text-amber-800 mt-1">
                    Requires verification under 18 traditional craft trades.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('/schemes')}
                className="w-full py-2 text-center text-xs font-bold text-[#006400] hover:underline"
              >
                View Complete Schemes Catalog →
              </button>
            </div>

            {/* Quick Grievance Draft Card */}
            <div className="bg-orange-50 rounded-xl border border-orange-200 p-5 space-y-3">
              <div className="flex items-center gap-2 text-orange-950 font-bold text-sm">
                <FileText className="w-4 h-4 text-[#F77F00]" />
                <span>Grievance Quick Action</span>
              </div>
              <p className="text-xs text-orange-900 leading-relaxed">
                Need to follow up on a pending application or file an inquiry? Generate an official grievance representation letter.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('/grievance')}
                className="w-full py-2.5 rounded-lg bg-[#F77F00] text-white text-xs font-bold hover:bg-[#d96e00] transition-colors shadow-xs"
              >
                Draft Grievance Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
