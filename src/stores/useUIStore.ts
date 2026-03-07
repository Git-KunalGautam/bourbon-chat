import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeType = 'light' | 'dark';

interface UIState {
  theme: ThemeType;
  sidebarOpen: boolean;
  activeTab: 'chats' | 'updates' | 'communities' | 'settings' | 'profile';
  setTheme: (theme: ThemeType) => void;
  toggleSidebar: () => void;
  setActiveTab: (tab: 'chats' | 'updates' | 'communities' | 'settings' | 'profile') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarOpen: true,
      activeTab: 'chats',
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    { name: 'bourbon-ui' }
  )
);
