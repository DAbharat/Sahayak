import React, { useState, useEffect } from 'react';
import { MapPin, Briefcase, IndianRupee, Users, Edit3, X, Save, CheckCircle2 } from 'lucide-react';

/**
 * Dumb UI Component: ProfileCard
 * Pure presentation: handles zero API calls. All state & actions passed via props.
 * Minimal, modern card design with full Day & Night mode.
 */
export const ProfileCard = ({
  profile = {},
  onConfirm,
  onEditToggle,
  onSaveProfile
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...profile });

  // Keep formData in sync when profile updates
  useEffect(() => {
    setFormData({ ...profile });
  }, [profile]);

  const handleStartEdit = () => {
    setFormData({ ...profile });
    setIsEditing(true);
    onEditToggle?.(true);
  };

  const handleCancelEdit = () => {
    setFormData({ ...profile });
    setIsEditing(false);
    onEditToggle?.(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setIsEditing(false);
    onEditToggle?.(false);
    onSaveProfile?.(formData);
  };

  return (
    <div id="profile-card" className="w-full max-w-xl mx-auto">
      <div className="bg-white/95 dark:bg-slate-900/90 border border-[#C8DFDB] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(51,104,160,0.08)] transition-colors backdrop-blur-xs">
        {/* Header section */}
        <div className="text-center pb-5 mb-6 border-b border-[#C8DFDB]/60 dark:border-slate-800">
          <span className="inline-block text-[11px] font-bold tracking-wider text-[#3368A0] dark:text-[#C8DFDB] bg-[#C8DFDB]/50 dark:bg-[#3368A0]/30 px-3 py-1 rounded-full uppercase mb-2 border border-[#66A3BF]/40 dark:border-[#66A3BF]/30">
            Verification Step • जानकारी सत्यापन
          </span>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            We understood your details
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
            हमने यह जानकारी समझी है। कृपया पुष्टि करें या बदलें।
          </p>
        </div>

        {isEditing ? (
          /* Inline Edit Form */
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase mb-1">
                📍 State (राज्य)
              </label>
              <select
                id="edit-state-select"
                value={formData.state || ''}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Haryana">Haryana (हरियाणा)</option>
                <option value="Delhi">Delhi (दिल्ली)</option>
                <option value="Uttar Pradesh">Uttar Pradesh (उत्तर प्रदेश)</option>
                <option value="Rajasthan">Rajasthan (राजस्थान)</option>
                <option value="Punjab">Punjab (पंजाब)</option>
                <option value="Bihar">Bihar (बिहार)</option>
                <option value="Madhya Pradesh">Madhya Pradesh (मध्य प्रदेश)</option>
                <option value="Maharashtra">Maharashtra (महाराष्ट्र)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase mb-1">
                👷 Occupation (व्यवसाय / काम)
              </label>
              <input
                id="edit-occupation-input"
                type="text"
                value={formData.occupation || ''}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                placeholder="e.g. Street Vendor, Farmer, Tailor"
                className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 text-sm focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase mb-1">
                  💰 Monthly Income ₹ (मासिक आय)
                </label>
                <input
                  id="edit-income-input"
                  type="number"
                  min="0"
                  step="500"
                  value={formData.monthlyIncome ?? ''}
                  onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value ? Number(e.target.value) : null })}
                  placeholder="e.g. 15000"
                  className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase mb-1">
                  👨‍👩‍👧‍👦 Children (बच्चे)
                </label>
                <input
                  id="edit-children-input"
                  type="number"
                  min="0"
                  max="12"
                  value={formData.children ?? ''}
                  onChange={(e) => setFormData({ ...formData, children: e.target.value ? Number(e.target.value) : null })}
                  placeholder="e.g. 2"
                  className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                id="cancel-profile-edit-btn"
                onClick={handleCancelEdit}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                id="save-profile-edit-btn"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save changes</span>
              </button>
            </div>
          </form>
        ) : (
          /* Confirmed Display Items */
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* State */}
              <div id="profile-field-state" className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    State (राज्य)
                  </div>
                  <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {profile.state || 'Not specified'}
                  </div>
                </div>
              </div>

              {/* Occupation */}
              <div id="profile-field-occupation" className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Occupation (काम)
                  </div>
                  <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {profile.occupation || 'Not specified'}
                  </div>
                </div>
              </div>

              {/* Monthly Income */}
              <div id="profile-field-income" className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Monthly income (कमाई)
                  </div>
                  <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {profile.monthlyIncome !== null && profile.monthlyIncome !== undefined
                      ? `₹${profile.monthlyIncome.toLocaleString('en-IN')}`
                      : 'Not declared'}
                  </div>
                </div>
              </div>

              {/* Children */}
              <div id="profile-field-children" className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Children (बच्चे)
                  </div>
                  <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {profile.children !== null && profile.children !== undefined ? profile.children : 'None'}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Looks correct ✓ & Edit */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#C8DFDB]/60 dark:border-slate-800">
              <button
                type="button"
                id="edit-profile-btn"
                onClick={handleStartEdit}
                className="order-2 sm:order-1 flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[#C8DFDB] dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-[#C8DFDB]/30 dark:hover:bg-slate-800 font-bold text-xs transition-all active:scale-[0.98] cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#3368A0] dark:text-[#66A3BF]" />
                <span>Edit (बदलें)</span>
              </button>

              <button
                type="button"
                id="confirm-profile-btn"
                onClick={onConfirm}
                className="order-1 sm:order-2 flex-2 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#3368A0] hover:bg-[#285584] text-white font-bold text-sm shadow-xs hover:shadow-md hover:shadow-[#3368A0]/20 transition-all active:scale-[0.98] cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Looks correct (आगे बढ़ें)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;

