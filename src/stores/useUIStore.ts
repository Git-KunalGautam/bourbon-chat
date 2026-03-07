import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeType = 'light' | 'dark';

interface UIState {
  theme: ThemeType;
  sidebarOpen: boolean;
  activeTab: 'chats' | 'updates' | 'communities' | 'settings' | 'profile';
  showAddFriendModal: boolean;
  showAddGroupModal: boolean;
  showAddStatusModal: boolean;
  setTheme: (theme: ThemeType) => void;
  toggleSidebar: () => void;
  setActiveTab: (tab: 'chats' | 'updates' | 'communities' | 'settings' | 'profile') => void;
  setShowAddFriendModal: (show: boolean) => void;
  setShowAddGroupModal: (show: boolean) => void;
  setShowAddStatusModal: (show: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarOpen: true,
      activeTab: 'chats',
      showAddFriendModal: false,
      showAddGroupModal: false,
      showAddStatusModal: false,
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setShowAddFriendModal: (show) => set({ showAddFriendModal: show }),
      setShowAddGroupModal: (show) => set({ showAddGroupModal: show }),
      setShowAddStatusModal: (show) => set({ showAddStatusModal: show }),
    }),
    { name: 'bourbon-ui' }
  )
);
