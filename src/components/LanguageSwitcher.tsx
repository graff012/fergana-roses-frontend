import { useEffect, useRef, useState } from 'react';
import { FaGlobe } from 'react-icons/fa';
import { LANGS } from '../i18n';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher = ({ dark = false }: { dark?: boolean }) => {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Tilni tanlash / Тилни танлаш / Выбрать язык"
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-semibold transition-colors whitespace-nowrap ${
          dark
            ? 'border-gray-300 text-gray-700 hover:bg-gray-100'
            : 'border-white/40 text-white hover:bg-white/10'
        }`}
      >
        <FaGlobe />
        {current.short}
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-1.5 z-50"
        >
          {LANGS.map((l) => (
            <button
              key={l.code}
              role="option"
              aria-selected={l.code === lang}
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                l.code === lang
                  ? 'bg-[#004F44]/10 text-[#004F44] font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
