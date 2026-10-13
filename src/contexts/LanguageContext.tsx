import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { DEFAULT_LANG, LANG_STORAGE_KEY } from '../i18n';
import type { Lang } from '../i18n';
import { commonDict } from '../i18n/common';
import { storefrontDict } from '../i18n/storefront';
import { adminDict } from '../i18n/admin';

const merged: Record<Lang, Record<string, string>> = {
  'uz-Cyrl': { ...commonDict['uz-Cyrl'], ...storefrontDict['uz-Cyrl'], ...adminDict['uz-Cyrl'] },
  uz: { ...commonDict['uz'], ...storefrontDict['uz'], ...adminDict['uz'] },
  ru: { ...commonDict['ru'], ...storefrontDict['ru'], ...adminDict['ru'] },
};

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const isLang = (v: string | null): v is Lang =>
  v === 'uz-Cyrl' || v === 'uz' || v === 'ru';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      return isLang(saved) ? saved : DEFAULT_LANG;
    } catch {
      return DEFAULT_LANG;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // private mode — language still works in-memory
    }
    document.documentElement.lang =
      lang === 'ru' ? 'ru' : lang === 'uz' ? 'uz' : 'uz-Cyrl';
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);
  const t = (key: string): string => merged[lang][key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
