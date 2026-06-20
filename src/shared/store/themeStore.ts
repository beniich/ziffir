import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations } from '../data/mockData';
import type { ThemeMode, ColorScheme, StyleMode } from '../../types';

type Language = keyof typeof translations;

interface ThemeState {
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  styleMode: StyleMode;
  language: Language;

  setThemeMode: (mode: ThemeMode) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  setStyleMode: (mode: StyleMode) => void;
  setLanguage: (lang: Language) => void;

  t: (key: keyof typeof translations.FR) => string;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeMode: 'dark',
      colorScheme: 'gold',
      styleMode: 'luxe',
      language: 'FR',

      setThemeMode: (themeMode) => set({ themeMode }),
      setColorScheme: (colorScheme) => set({ colorScheme }),
      setStyleMode: (styleMode) => set({ styleMode }),
      setLanguage: (language) => set({ language }),

      t: (key) => {
        const lang = get().language;
        return translations[lang][key] || translations.FR[key] || key;
      },
    }),
    { name: 'zaphir-theme-storage' }
  )
);
