import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeType = 'classic-mint' | 'ocean-blue' | 'bourbon-amber' | 'amethyst-purple' | 'midnight-dark';

interface ThemeState {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'classic-mint',
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },
    }),
    {
      name: 'bourbon-theme',
    }
  )
);
