import React, { useState } from 'react';
import { MapPin, Briefcase, IndianRupee, Users, Check, Edit2, RotateCcw, User, MoreVertical } from 'lucide-react';
import { UserProfile, Gender } from '../types.ts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog.tsx';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu.tsx';

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
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [editableProfile, setEditableProfile] = useState<UserProfile>({
    ...profile,
    monthly_income: profile.monthly_income ?? profile.monthlyIncome ?? 15000,
    children_count: profile.children_count ?? profile.children ?? 2,
    age: profile.age ?? 45,
    gender: (profile.gender as Gender) || 'MALE',
    name: profile.name || '',
    district: profile.district || '',
    caste_category: profile.caste_category || 'GENERAL',
    is_registered_worker: profile.is_registered_worker || false,
    has_bank_account: profile.has_bank_account ?? true,
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
      gender: (profile.gender as Gender) || 'MALE',
      name: profile.name || '',
      district: profile.district || '',
      caste_category: profile.caste_category || 'GENERAL',
      is_registered_worker: profile.is_registered_worker || false,
      has_bank_account: profile.has_bank_account ?? true,
    });
    setIsEditing(false);
  };

  const incomeVal = profile.monthly_income ?? profile.monthlyIncome ?? 15000;
  const childrenVal = profile.children_count ?? profile.children ?? 2;
  const ageVal = profile.age ?? 45;
  const genderVal = profile.gender || 'MALE';

  return (
    <div className="bg-white rounded-xl border-2 border-[#006400] shadow-md p-5 w-full text-left">
      {/* Header */}
      <div className="flex items-start justify-between pb-3.5 mb-4 border-b border-orange-100">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#F77F00] block">
            AI Profile Understanding / नागरिक विवरण
          </span>
          <h3 className="text-lg md:text-xl font-black text-gray-900 leading-tight">
            We understood: / हमने समझा:
          </h3>
        </div>
        {hasConfirmed && (
          <DropdownMenu>
            <DropdownMenuTrigger className="p-2 -mr-2 -mt-2 text-gray-500 hover:bg-gray-100 rounded-full outline-none focus:outline-none cursor-pointer">
              <MoreVertical className="w-5 h-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="p-0 w-32 border-2 border-[#006400] rounded-lg shadow-md overflow-hidden">
              <DropdownMenuItem
                onClick={() => setIsEditing(true)}
                className="cursor-pointer font-bold text-[#006400] px-4 py-2 hover:bg-green-50 flex items-center justify-center w-full rounded-none outline-none focus:bg-green-50 focus:text-[#006400]"
              >
                <Edit2 className="w-4 h-4 mr-2 text-[#006400] stroke-[2.5]" />
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="space-y-2.5 py-2">
        {/* Top row: 3 boxes */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Item 1: State */}
          <div className="flex flex-col justify-between p-3 rounded-lg bg-gray-50 border border-gray-200/80 h-full">
            <div className="flex items-center gap-2">
              <span className="text-xl" role="img" aria-label="state">📍</span>
              <div>
                <p className="text-xs text-gray-500 font-medium">State / राज्य</p>
                <p className="text-sm font-bold text-gray-900">{profile.state}</p>
              </div>
            </div>
            <span className="mt-2 self-start text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
              Verified Region
            </span>
          </div>

          {/* Item 2: Occupation */}
          <div className="flex flex-col justify-between p-3 rounded-lg bg-gray-50 border border-gray-200/80 h-full">
            <div className="flex items-center gap-2">
              <span className="text-xl" role="img" aria-label="occupation">👷</span>
              <div>
                <p className="text-xs text-gray-500 font-medium">Occupation / व्यवसाय</p>
                <p className="text-sm font-bold text-gray-900">{profile.occupation}</p>
              </div>
            </div>
            <span className="mt-2 self-start text-[10px] text-orange-700 font-semibold bg-orange-50 px-2 py-0.5 rounded">
              Priority Sector
            </span>
          </div>

          {/* Item 3: Monthly Income */}
          <div className="flex flex-col justify-between p-3 rounded-lg bg-gray-50 border border-gray-200/80 h-full">
            <div className="flex items-center gap-2">
              <span className="text-xl" role="img" aria-label="income">💰</span>
              <div>
                <p className="text-xs text-gray-500 font-medium">Monthly income / मासिक आय</p>
                <p className="text-sm font-bold text-gray-900">₹{incomeVal.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <span className="mt-2 self-start text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded">
              EWS / Low Income
            </span>
          </div>
        </div>

        {/* Bottom row: 2 boxes */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Item 4: Children */}
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-gray-50 border border-gray-200/80">
            <span className="text-xl" role="img" aria-label="children">👨‍👩‍👧‍👦</span>
            <div>
              <p className="text-xs text-gray-500 font-medium">Children / बच्चे</p>
              <p className="text-sm font-bold text-gray-900">{childrenVal}</p>
            </div>
          </div>

          {/* Item 5: Age & Gender */}
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-gray-50 border border-gray-200/80">
            <span className="text-xl" role="img" aria-label="age-gender">👤</span>
            <div>
              <p className="text-xs text-gray-500 font-medium">Age & Gender</p>
              <p className="text-sm font-bold text-gray-900">{ageVal} yrs, {genderVal}</p>
            </div>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditing} onOpenChange={(open) => {
          if (!open) handleCancel();
          else setIsEditing(true);
        }}>
          <DialogContent className="w-[90vw] max-w-4xl sm:max-w-3xl max-h-[90vh] overflow-y-auto border-2 border-[#006400]">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-gray-900">Edit Profile / प्रोफ़ाइल संपादित करें</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Name / नाम</label>
                  <input
                    type="text"
                    value={editableProfile.name}
                    onChange={(e) => setEditableProfile({ ...editableProfile, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-[#F77F00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Occupation / व्यवसाय</label>
                  <input
                    type="text"
                    value={editableProfile.occupation}
                    onChange={(e) => setEditableProfile({ ...editableProfile, occupation: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-[#F77F00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">State / राज्य</label>
                  <input
                    type="text"
                    value={editableProfile.state}
                    onChange={(e) => setEditableProfile({ ...editableProfile, state: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-[#F77F00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">District / जिला</label>
                  <input
                    type="text"
                    value={editableProfile.district}
                    onChange={(e) => setEditableProfile({ ...editableProfile, district: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-[#F77F00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Monthly income / मासिक आय (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={editableProfile.monthly_income}
                    onChange={(e) => setEditableProfile({ ...editableProfile, monthly_income: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-[#F77F00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Children / बच्चों की संख्या</label>
                  <input
                    type="number"
                    min={0}
                    value={editableProfile.children_count}
                    onChange={(e) => setEditableProfile({ ...editableProfile, children_count: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-[#F77F00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Age / आयु (1–120)</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={editableProfile.age}
                    onChange={(e) => setEditableProfile({ ...editableProfile, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-[#F77F00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Gender / लिंग</label>
                  <select
                    value={editableProfile.gender}
                    onChange={(e) => setEditableProfile({ ...editableProfile, gender: e.target.value as Gender })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-[#F77F00] bg-white"
                  >
                    <option value="MALE">MALE (पुरुष)</option>
                    <option value="FEMALE">FEMALE (महिला)</option>
                    <option value="OTHER">OTHER (अन्य)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Caste Category / जाति</label>
                  <select
                    value={editableProfile.caste_category}
                    onChange={(e) => setEditableProfile({ ...editableProfile, caste_category: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-[#F77F00] bg-white"
                  >
                    <option value="GENERAL">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editableProfile.is_registered_worker}
                    onChange={(e) => setEditableProfile({ ...editableProfile, is_registered_worker: e.target.checked })}
                    className="w-4 h-4 text-[#F77F00] rounded focus:ring-[#F77F00]"
                  />
                  <span className="text-sm font-medium text-gray-700">Registered Worker / पंजीकृत कार्यकर्ता</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editableProfile.has_bank_account}
                    onChange={(e) => setEditableProfile({ ...editableProfile, has_bank_account: e.target.checked })}
                    className="w-4 h-4 text-[#F77F00] rounded focus:ring-[#F77F00]"
                  />
                  <span className="text-sm font-medium text-gray-700">Has Bank Account / बैंक खाता है</span>
                </label>
              </div>
            </div>
            <DialogFooter className="w-full sm:justify-between gap-2 sm:gap-0 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg border-2 border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel / रद्द करें
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2 rounded-lg bg-[#F77F00] text-white text-sm font-bold hover:bg-[#d96e00] transition-colors shadow-xs"
              >
                Save Changes / बदलाव सहेजें
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Action Buttons */}
        {showActions && !hasConfirmed && (
          <div className="pt-3 border-t border-gray-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border-2 border-gray-300 bg-white text-gray-800 text-sm font-bold hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-xs cursor-pointer"
            >
              <Edit2 className="w-4 h-4 text-gray-600" />
              [ Edit / बदलें ]
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm(profile);
                setHasConfirmed(true);
              }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#006400] text-white text-sm font-bold hover:bg-[#004d00] transition-colors shadow-md ring-2 ring-emerald-300/50 cursor-pointer"
            >
              <Check className="w-4 h-4 text-white stroke-[3]" />
              [ Looks correct ✓ / सही है ]
            </button>
          </div>
        )}

        {/* Confirmed State text */}
        {showActions && hasConfirmed && (
          <div className="pt-3 border-t border-gray-200 flex items-center justify-center">
            <span className="text-sm font-bold text-gray-600">Your info / आपकी जानकारी</span>
          </div>
        )}
      </div>

      {/* Trust Notice
      <p className="text-[11px] text-gray-500 text-center mt-3 pt-2 border-t border-gray-100">
        🛡️ Verification step confirms profile schema for Go Backend integration.
      </p> */}
    </div>
  );
};

export default ProfileCard;
