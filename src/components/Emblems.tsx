import React from 'react';

// Official State Emblem of India (Lion Capital of Ashoka at Sarnath)
export const AshokaEmblem: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 48 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
      aria-label="State Emblem of India - Lion Capital of Ashoka"
    >
      {/* Golden / Deep Ochre Lion Capital Vector */}
      <g fill="#996515">
        {/* Crown of Lions */}
        <circle cx="50" cy="22" r="10" />
        <circle cx="34" cy="24" r="8" />
        <circle cx="66" cy="24" r="8" />
        {/* Lion Manes & Cheeks */}
        <path d="M30 28 C25 36, 25 50, 36 54 C42 56, 58 56, 64 54 C75 50, 75 36, 70 28 C64 34, 58 35, 50 35 C42 35, 36 34, 30 28 Z" />
        {/* Central Lion Chest & Paws */}
        <path d="M42 54 L40 76 L46 78 L47 56 Z" />
        <path d="M58 54 L60 76 L54 78 L53 56 Z" />
        <path d="M47 56 L53 56 L52 78 L48 78 Z" />
        {/* Left and Right Standing Lions */}
        <path d="M34 52 L26 74 L31 76 L38 55 Z" />
        <path d="M66 52 L74 74 L69 76 L62 55 Z" />
      </g>
      {/* Abacus with Ashoka Chakra and Animals */}
      <rect x="18" y="78" width="64" height="12" rx="2" fill="#7A4F0E" />
      {/* Ashoka Chakra in Center */}
      <circle cx="50" cy="84" r="5" stroke="#FFFFFF" strokeWidth="1.2" fill="#13294B" />
      <circle cx="50" cy="84" r="1.5" fill="#FFFFFF" />
      {/* Galloping Horse and Bull silhouette dots */}
      <circle cx="28" cy="84" r="2.5" fill="#E5C158" />
      <circle cx="72" cy="84" r="2.5" fill="#E5C158" />
      {/* Inverted Lotus Bell Base */}
      <path
        d="M26 90 C34 94, 66 94, 74 90 C70 98, 62 101, 50 101 C38 101, 30 98, 26 90 Z"
        fill="#996515"
      />
      {/* Base Plinth */}
      <rect x="22" y="101" width="56" height="5" rx="1" fill="#6B420C" />
      {/* Motto: Satyameva Jayate (सत्यमेव जयते) */}
      <text
        x="50"
        y="114"
        textAnchor="middle"
        fontSize="7"
        fontWeight="800"
        fill="#5A370A"
        fontFamily="sans-serif"
      >
        सत्यमेव जयते
      </text>
    </svg>
  );
};

// Azadi Ka Amrit Mahotsav (75 Years of Independence) Emblem
export const AmritMahotsavLogo: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center space-x-1.5 px-2.5 py-1 bg-white border border-amber-200 rounded shadow-xs text-xs font-semibold ${className}`}>
      <div className="flex flex-col items-center justify-center leading-none">
        <span className="text-[13px] font-black tracking-tight text-[#FF9933]">75</span>
        <span className="text-[7px] tracking-widest uppercase font-bold text-[#138808]">आज़ादी</span>
      </div>
      <div className="h-6 w-px bg-gray-300 mx-0.5"></div>
      <div className="leading-tight text-left">
        <div className="text-[9px] font-bold text-[#FF9933] uppercase">Azadi Ka</div>
        <div className="text-[10px] font-extrabold text-[#0B4A99] tracking-tight">Amrit Mahotsav</div>
      </div>
    </div>
  );
};

// Digital India Logo
export const DigitalIndiaLogo: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center space-x-1.5 px-2 py-1 bg-white border border-blue-200 rounded text-xs font-semibold ${className}`}>
      <div className="w-5 h-5 rounded-full bg-[#0072CE] text-white flex items-center justify-center font-bold text-[10px]">
        DI
      </div>
      <div className="leading-none text-left">
        <span className="text-[9px] font-bold text-gray-800 block">Digital India</span>
        <span className="text-[8px] text-[#0072CE] font-semibold block">Power To Empower</span>
      </div>
    </div>
  );
};

// PM Narendra Modi Official Showcase Image & Citation
import { useLanguage } from '../context/LanguageContext.tsx';

export const PmModiShowcase: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { lang, t } = useLanguage();

  return (
    <div className={`bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-3 flex items-center gap-3 w-full min-w-0 overflow-hidden ${className}`}>
      <div className="relative shrink-0">
        <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-2 border-[#F77F00] overflow-hidden shadow-md bg-white">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Prime_Minister_Narendra_Modi_in_2023.jpg/480px-Prime_Minister_Narendra_Modi_in_2023.jpg"
            alt="Shri Narendra Modi, Hon'ble Prime Minister of India"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-[#006400] text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold shadow-xs">
          PM
        </div>
      </div>
      <div className="text-left min-w-0 flex-1">
        <p className="text-xs font-bold text-[#333333]">
          {lang === 'hi' ? 'श्री नरेन्द्र मोदी' : 'Shri Narendra Modi'}
          <span className="text-gray-500 font-normal ml-1 hidden sm:inline">
            {lang === 'hi' ? '(Shri Narendra Modi)' : '(श्री नरेन्द्र मोदी)'}
          </span>
        </p>
        <p className="text-[10px] sm:text-[11px] font-semibold text-[#006400] truncate">
          {t('माननीय प्रधानमंत्री, भारत सरकार', "Hon'ble Prime Minister of India")}
        </p>
        <p className="text-[10px] sm:text-[11px] text-gray-600 italic mt-0.5 leading-snug line-clamp-2">
          {t(
            '"अंत्योदय से सर्वोदय — सरकार की हर योजना का लाभ अंतिम पंक्ति में खड़े व्यक्ति तक पहुंचे।"',
            '"From Antyodaya to Sarvodaya — Ensuring every welfare scheme reaches the citizen in the last mile."'
          )}
        </p>
      </div>
    </div>
  );
};
