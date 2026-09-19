import React, { createContext, useContext, useState } from 'react';

export type Language = 'hi' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (hiText: string, enText: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'hi',
  setLang: () => {},
  toggleLang: () => {},
  t: (hi, _en) => hi,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('sahayak_lang');
      if (saved === 'en' || saved === 'hi') return saved;
    } catch (e) {
      // ignore
    }
    return 'hi';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('sahayak_lang', newLang);
    } catch (e) {
      // ignore
    }
  };

  const toggleLang = () => {
    setLang(lang === 'hi' ? 'en' : 'hi');
  };

  const t = (hiText: string, enText: string): string => {
    return lang === 'hi' ? hiText : enText;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
