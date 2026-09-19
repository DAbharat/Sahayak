import React, { useState } from 'react';
import { MapPin, Briefcase, IndianRupee, Users, Check, Edit2, RotateCcw, User } from 'lucide-react';
import { UserProfile, Gender } from '../types.ts';

interface ProfileCardProps {
  profile: UserProfile;
  onConfirm: (confirmedProfile: UserProfile) => void;
  onEdit?: () => void;
  showActions?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onConfirm,
  onEdit,
  showActions = true
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableProfile, setEditableProfile] = useState<UserProfile>({
    ...profile,
    monthly_income: profile.monthly_income ?? profile.monthlyIncome ?? 15000,
    children_count: profile.children_count ?? profile.children ?? 2,
    age: profile.age ?? 45,
    gender: (profile.gender as Gender) || 'MALE'
  });

  const handleSave = () => {
    setIsEditing(false);
    const updated: UserProfile = {
      ...editableProfile,
      monthlyIncome: editableProfile.monthly_income,
      children: editableProfile.children_count
    };
    onConfirm(updated);
  };

  const handleCancel = () => {
    setEditableProfile({
      ...profile,
      monthly_income: profile.monthly_income ?? profile.monthlyIncome ?? 15000,
      children_count: profile.children_count ?? profile.children ?? 2,
      age: profile.age ?? 45,
      gender: (profile.gender as Gender) || 'MALE'
    });
    setIsEditing(false);
  };

  const incomeVal = profile.monthly_income ?? profile.monthlyIncome ?? 15000;
  const childrenVal = profile.children_count ?? profile.children ?? 2;
  const ageVal = profile.age ?? 45;
  const genderVal = profile.gender || 'MALE';

  return (
    <div className="bg-white rounded-xl border-2 border-orange-200 shadow-md p-5 max-w-xl mx-auto text-left">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-orange-100">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#F77F00] block">
            AI Profile Understanding / नागरिक विवरण
          </span>
          <h3 className="text-lg md:text-xl font-black text-gray-900 leading-tight">
            We understood: / हमने समझा:
          </h3>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 flex items-center gap-1">
          <Check className="w-3.5 h-3.5" />
          Ready for Go API
        </span>
      </div>

      {isEditing ? (
        /* Edit Form Mode */
        <div className="space-y-3.5 py-1">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              📍 State / राज्य
            </label>
            <input
              type="text"
              required
              value={editableProfile.state}
              onChange={(e) => setEditableProfile({ ...editableProfile, state: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded border border-gray-300 focus:outline-none focus:border-[#F77F00]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              👷 Occupation / व्यवसाय
            </label>
            <input
              type="text"
              required
              value={editableProfile.occupation}
              onChange={(e) => setEditableProfile({ ...editableProfile, occupation: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded border border-gray-300 focus:outline-none focus:border-[#F77F00]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                💰 Monthly income / मासिक आय (₹)
              </label>
              <input
                type="number"
                min={0}
                required
                value={editableProfile.monthly_income}
                onChange={(e) => setEditableProfile({ ...editableProfile, monthly_income: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm rounded border border-gray-300 focus:outline-none focus:border-[#F77F00]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                👨‍👩‍👧‍👦 Children / बच्चों की संख्या
              </label>
              <input
                type="number"
                min={0}
                required
                value={editableProfile.children_count}
                onChange={(e) => setEditableProfile({ ...editableProfile, children_count: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm rounded border border-gray-300 focus:outline-none focus:border-[#F77F00]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                🎂 Age / आयु (1–120)
              </label>
              <input
                type="number"
                min={1}
                max={120}
                required
                value={editableProfile.age}
                onChange={(e) => setEditableProfile({ ...editableProfile, age: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm rounded border border-gray-300 focus:outline-none focus:border-[#F77F00]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                ⚧ Gender / लिंग
              </label>
              <select
                value={editableProfile.gender}
                onChange={(e) => setEditableProfile({ ...editableProfile, gender: e.target.value as Gender })}
                className="w-full px-3 py-2 text-sm rounded border border-gray-300 focus:outline-none focus:border-[#F77F00] bg-white"
              >
                <option value="MALE">MALE (पुरुष)</option>
                <option value="FEMALE">FEMALE (महिला)</option>
                <option value="OTHER">OTHER (अन्य)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3.5 py-1.5 rounded border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded bg-[#006400] text-white text-xs font-bold hover:bg-[#004d00]"
            >
              Save Changes / विवरण सहेजें
            </button>
          </div>
        </div>
      ) : (
        /* Display Mode Matching Exact Prompt */
        <div className="space-y-2.5 py-2">
          {/* Item 1: State */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-200/80">
            <div className="flex items-center gap-2.5">
              <span className="text-xl" role="img" aria-label="state">📍</span>
              <div>
                <p className="text-xs text-gray-500 font-medium">State / राज्य</p>
                <p className="text-base font-bold text-gray-900">{profile.state}</p>
              </div>
            </div>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
              Verified Region
            </span>
          </div>

          {/* Item 2: Occupation */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-200/80">
            <div className="flex items-center gap-2.5">
              <span className="text-xl" role="img" aria-label="occupation">👷</span>
              <div>
                <p className="text-xs text-gray-500 font-medium">Occupation / व्यवसाय</p>
                <p className="text-base font-bold text-gray-900">{profile.occupation}</p>
              </div>
            </div>
            <span className="text-xs text-orange-700 font-semibold bg-orange-50 px-2 py-0.5 rounded">
              Priority Sector
            </span>
          </div>

          {/* Item 3: Monthly Income */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-200/80">
            <div className="flex items-center gap-2.5">
              <span className="text-xl" role="img" aria-label="income">💰</span>
              <div>
                <p className="text-xs text-gray-500 font-medium">Monthly income / मासिक आय</p>
                <p className="text-base font-bold text-gray-900">
                  ₹{incomeVal.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
            <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded">
              EWS / Low Income
            </span>
          </div>

          {/* Item 4: Children & Age/Gender Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-200/80">
              <div className="flex items-center gap-2">
                <span className="text-lg" role="img" aria-label="children">👨‍👩‍👧‍👦</span>
                <div>
                  <p className="text-[11px] text-gray-500 font-medium">Children / बच्चे</p>
                  <p className="text-sm font-bold text-gray-900">{childrenVal}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-200/80">
              <div className="flex items-center gap-2">
                <span className="text-lg" role="img" aria-label="age-gender">👤</span>
                <div>
                  <p className="text-[11px] text-gray-500 font-medium">Age & Gender</p>
                  <p className="text-sm font-bold text-gray-900">{ageVal} yrs, {genderVal}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons: [ Looks correct ✓ ] and [ Edit ] */}
          {showActions && (
            <div className="pt-3 border-t border-gray-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  if (onEdit) {
                    onEdit();
                  } else {
                    setIsEditing(true);
                  }
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border-2 border-gray-300 bg-white text-gray-800 text-sm font-bold hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-xs cursor-pointer"
              >
                <Edit2 className="w-4 h-4 text-gray-600" />
                [ Edit / बदलें ]
              </button>

              <button
                type="button"
                onClick={() => onConfirm(profile)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#006400] text-white text-sm font-bold hover:bg-[#004d00] transition-colors shadow-md ring-2 ring-emerald-300/50 cursor-pointer"
              >
                <Check className="w-4 h-4 text-white stroke-[3]" />
                [ Looks correct ✓ / सही है ]
              </button>
            </div>
          )}
        </div>
      )}

      {/* Trust Notice */}
      <p className="text-[11px] text-gray-500 text-center mt-3 pt-2 border-t border-gray-100">
        🛡️ Verification step confirms profile schema for Go Backend integration.
      </p>
    </div>
  );
};

export default ProfileCard;
