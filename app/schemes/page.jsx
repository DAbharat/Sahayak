import React, { useState } from 'react';
import { Edit2 } from 'lucide-react';
import { SchemeCard } from '../../components/SchemeCard.jsx';

/**
 * Container Page: app/schemes/page.jsx
 * Handles state filtering (May qualify, More info needed, Doesn't match criteria)
 * and passes each scheme's data down to the dumb UI component SchemeCard.
 */
export const SchemesPage = ({
  schemes = [],
  profile = {},
  onViewSchemeDetails,
  onEditProfile
}) => {
  const [activeFilter, setActiveFilter] = useState('ALL');

  const mayQualifyCount = schemes.filter(s => s.eligibilityStatus === 'MAY_QUALIFY').length;
  const moreInfoCount = schemes.filter(s => s.eligibilityStatus === 'MORE_INFO_NEEDED').length;
  const doesNotMatchCount = schemes.filter(s => s.eligibilityStatus === 'DOES_NOT_MATCH').length;

  const filteredSchemes = schemes.filter(s => {
    if (activeFilter === 'ALL') return true;
    return s.eligibilityStatus === activeFilter;
  });

  return (
    <div id="schemes-results-screen" className="w-full max-w-5xl mx-auto py-4 sm:py-8 px-4 space-y-6">
      {/* Profile quick summary bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-[#C8DFDB] dark:border-slate-800 shadow-[0_4px_20px_rgba(51,104,160,0.06)] backdrop-blur-xs">
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
          <span className="font-bold text-[#3368A0] dark:text-[#66A3BF]">आपकी जानकारी (Your profile):</span>
          {profile.state && <span className="bg-[#C8DFDB]/30 dark:bg-slate-800 px-2.5 py-1 rounded-xl font-medium border border-[#66A3BF]/30 dark:border-slate-700 text-slate-800 dark:text-slate-200">📍 {profile.state}</span>}
          {profile.occupation && <span className="bg-[#C8DFDB]/30 dark:bg-slate-800 px-2.5 py-1 rounded-xl font-medium border border-[#66A3BF]/30 dark:border-slate-700 text-slate-800 dark:text-slate-200">👷 {profile.occupation}</span>}
          {profile.monthlyIncome !== null && profile.monthlyIncome !== undefined && (
            <span className="bg-[#C8DFDB]/30 dark:bg-slate-800 px-2.5 py-1 rounded-xl font-medium border border-[#66A3BF]/30 dark:border-slate-700 text-slate-800 dark:text-slate-200">💰 ₹{profile.monthlyIncome.toLocaleString('en-IN')}/mo</span>
          )}
          {profile.children !== null && profile.children !== undefined && (
            <span className="bg-[#C8DFDB]/30 dark:bg-slate-800 px-2.5 py-1 rounded-xl font-medium border border-[#66A3BF]/30 dark:border-slate-700 text-slate-800 dark:text-slate-200">👨‍👩‍👧‍👦 {profile.children} बच्चे</span>
          )}
        </div>

        <button
          type="button"
          id="modify-profile-pill-btn"
          onClick={onEditProfile}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3368A0] dark:text-[#C8DFDB] hover:text-[#1E3557] bg-[#C8DFDB]/45 dark:bg-[#3368A0]/30 hover:bg-[#C8DFDB]/75 dark:hover:bg-[#3368A0]/50 px-3.5 py-1.5 rounded-xl border border-[#66A3BF]/50 dark:border-[#66A3BF]/40 transition-colors cursor-pointer shadow-2xs"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>बदलें (Edit Profile)</span>
        </button>
      </div>

      {/* Main Title */}
      <div className="space-y-1 text-left">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
          योजनाएं जो आपको मिल सकती हैं
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
          Schemes matched against your verified profile. Filter by eligibility below.
        </p>
      </div>

      {/* 3-State Filter Tabs */}
      <div className="flex flex-wrap gap-2 pt-1 border-b border-[#C8DFDB] dark:border-slate-800 pb-3">
        <button
          type="button"
          id="filter-all-btn"
          onClick={() => setActiveFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeFilter === 'ALL'
              ? 'bg-[#3368A0] text-white shadow-sm'
              : 'bg-white dark:bg-[#131E31] text-slate-800 dark:text-slate-200 hover:bg-[#C8DFDB]/30 dark:hover:bg-slate-800 border-2 border-[#C8DFDB] dark:border-slate-700'
          }`}
        >
          All Schemes ({schemes.length})
        </button>

        <button
          type="button"
          id="filter-may-qualify-btn"
          onClick={() => setActiveFilter('MAY_QUALIFY')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeFilter === 'MAY_QUALIFY'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 border-2 border-emerald-300 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-400/40" />
          <span>May qualify ({mayQualifyCount})</span>
        </button>

        <button
          type="button"
          id="filter-more-info-btn"
          onClick={() => setActiveFilter('MORE_INFO_NEEDED')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeFilter === 'MORE_INFO_NEEDED'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border-2 border-amber-300 dark:border-amber-800/80 hover:bg-amber-100 dark:hover:bg-amber-900/50'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-400/40" />
          <span>More info needed ({moreInfoCount})</span>
        </button>

        <button
          type="button"
          id="filter-does-not-match-btn"
          onClick={() => setActiveFilter('DOES_NOT_MATCH')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeFilter === 'DOES_NOT_MATCH'
              ? 'bg-slate-800 dark:bg-slate-600 text-white shadow-sm'
              : 'bg-white dark:bg-[#131E31] text-slate-800 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          <span>Doesn't match criteria ({doesNotMatchCount})</span>
        </button>
      </div>

      {/* Grid of Scheme Cards */}
      {filteredSchemes.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
          <p className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
            No schemes found under this filter
          </p>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            इस श्रेणी में कोई योजना नहीं मिली। सभी योजनाएं देखने के लिए नीचे बटन दबाएं।
          </p>
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Show All Schemes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSchemes.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              onViewDetails={onViewSchemeDetails}
              onCompleteProfile={onViewSchemeDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SchemesPage;
