import React from 'react';
import { AshokaEmblem, AmritMahotsavLogo, DigitalIndiaLogo } from './Emblems.tsx';
import { Phone, Mail, ExternalLink, ShieldCheck, HelpCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';

interface GovFooterProps {
  onNavigate: (route: string) => void;
}

export const GovFooter: React.FC<GovFooterProps> = ({ onNavigate }) => {
  const { lang, t } = useLanguage();

  return (
    <footer className="bg-[#212529] text-gray-300 text-xs border-t-4 border-[#F77F00]">
      {/* Upper Footer Links */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: Institutional Identity */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <AshokaEmblem size={44} className="brightness-200" />
            <div>
              <span className="text-xl font-black text-[#F77F00] block">सहायक</span>
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Sahayak Portal
              </span>
            </div>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">
            {t(
              'नागरिक कल्याण योजना एवं जन शिकायत सहायता मंच — विभिन्न केंद्रीय एवं राज्य कल्याणकारी योजनाओं की जानकारी, पात्रता मार्गदर्शन एवं शिकायत प्रारूपण में नागरिकों की सहायता हेतु एक मंच।',
              'Citizen Welfare Schemes Discovery & Public Grievance Support Platform — Transparent guidance for central and state welfare initiatives, direct benefits, and grievance drafting.'
            )}
          </p>
          <div className="pt-2 flex items-center gap-3">
            <AmritMahotsavLogo />
            <DigitalIndiaLogo />
          </div>
        </div>

        {/* Col 2: Important Government Portals */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-gray-700 pb-1.5">
            {t('महत्वपूर्ण सरकारी पोर्टल', 'Key Government Portals')}
          </h4>
          <ul className="space-y-2 text-gray-400">
            <li>
              <a href="https://www.india.gov.in" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">
                National Portal of India (india.gov.in) <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              <a href="https://pmsvanidhi.mohua.gov.in" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">
                PM SVANidhi Portal <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              <a href="https://pmkisan.gov.in" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">
                PM-KISAN Samman Nidhi <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              <a href="https://pgportal.gov.in" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">
                CPGRAMS Grievance Portal <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              <a href="https://www.digilocker.gov.in" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">
                DigiLocker India <ExternalLink className="w-3 h-3" />
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3: Citizen Services */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-gray-700 pb-1.5">
            {t('नागरिक सेवाएं', 'Citizen Services')}
          </h4>
          <ul className="space-y-2 text-gray-400">
            <li>
              <button type="button" onClick={() => onNavigate('/onboarding')} className="hover:text-white text-left cursor-pointer">
                {t('बोलकर या लिखकर पात्रता जांचें (Voice AI)', 'Check Eligibility with Voice AI')}
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate('/schemes')} className="hover:text-white text-left cursor-pointer">
                {t('सभी केंद्रीय व राज्य योजनाएं देखें', 'Browse All Central & State Schemes')}
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate('/grievance')} className="hover:text-white text-left cursor-pointer">
                {t('औपचारिक जन शिकायत ड्राफ्ट तैयार करें', 'Draft Official Citizen Grievance')}
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate('/profile')} className="hover:text-white text-left cursor-pointer">
                {t('मेरी नागरिक प्रोफ़ाइल व लाभ स्थिति', 'My Citizen Profile & Benefit Status')}
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4: National Helpline & Support */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-gray-700 pb-1.5">
            {t('सहायता केंद्र एवं हेल्पलाइन', 'Citizen Helpline & Support')}
          </h4>
          <div className="space-y-2 text-gray-300">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#F77F00]" />
              <div>
                <p className="font-bold text-white text-sm">1800-11-0001</p>
                <p className="text-[11px] text-gray-400">
                  {t('टोल फ्री (24x7 द्विभाषी नागरिक सहायता)', 'Toll Free (24x7 Bilingual Citizen Support)')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#F77F00]" />
              <div>
                <p className="text-xs">support@sahayak.in</p>
                <p className="text-[11px] text-gray-400">
                  {t('नागरिक सहायता डेस्क', 'Citizen Community Helpdesk')}
                </p>
              </div>
            </div>
          </div>
          <div className="pt-2 text-[11px] text-gray-500">
            {t(
              'भारतीय सरकारी डिजिटल सेवा मानकों के अनुरूप निर्मित।',
              'Built conforming to Indian government portal accessibility guidelines.'
            )}
          </div>
        </div>
      </div>

      {/* Bottom Sub-Footer with Transparency Disclaimer */}
      <div className="bg-[#181a1d] py-4 px-4 border-t border-gray-800 text-[11px] text-gray-400">
        <div className="w-full max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div>
            सहायक (Sahayak) — Citizen Welfare Information Platform.
          </div>
          <div className="text-amber-400/90 text-[11px] font-medium">
            {t(
              '⚠️ अस्वीकरण: यह वेबसाइट एक स्वतंत्र नागरिक सूचना एवं सहायता मंच है। यह भारत सरकार (Government of India) या किसी सरकारी विभाग द्वारा पंजीकृत या संचालित नहीं है।',
              '⚠️ Disclaimer: This portal is an independent citizen assistance & welfare information platform. It is not affiliated with or operated by any government department.'
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GovFooter;
