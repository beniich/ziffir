import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'es', label: 'Español',  flag: '🇪🇸' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'de', label: 'Deutsch',  flag: '🇩🇪' },
];

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);
  
  const current = LANGUAGES.find(l => l.code === i18n.language) ?? LANGUAGES[0];
  
  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    document.documentElement.lang = code;
    setOpen(false);
  };
  
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700/50 text-slate-300 hover:text-white transition text-sm"
        aria-label="Changer la langue"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span aria-hidden="true">{current.flag}</span>
        {!compact && <span>{current.code.toUpperCase()}</span>}
        <span aria-hidden="true" className={`text-xs transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      
      {open && (
        <ul
          role="listbox"
          aria-label="Langues disponibles"
          className="absolute right-0 mt-2 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50"
        >
          {LANGUAGES.map(lang => (
            <li key={lang.code} role="option" aria-selected={lang.code === i18n.language}>
              <button
                type="button"
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition ${
                  lang.code === i18n.language
                    ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span aria-hidden="true" className="text-base">{lang.flag}</span>
                <span className="flex-1 text-left">{lang.label}</span>
                {lang.code === i18n.language && (
                  <span aria-hidden="true" className="text-xs">✓</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
