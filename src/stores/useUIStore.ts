import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeType = 'light' | 'dark';

interface UIState {
  theme: ThemeType;
  browserNotifications: boolean;
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  activeTab: 'chats' | 'updates' | 'communities' | 'settings' | 'profile';
  showAddFriendModal: boolean;
  showAddGroupModal: boolean;
  showAddStatusModal: boolean;
  setBrowserNotifications: (enabled: boolean) => void;
  setTheme: (theme: ThemeType) => void;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setLeftSidebar: (open: boolean) => void;
  setRightSidebar: (open: boolean) => void;
  setActiveTab: (tab: 'chats' | 'updates' | 'communities' | 'settings' | 'profile') => void;
  setShowAddFriendModal: (show: boolean) => void;
  setShowAddGroupModal: (show: boolean) => void;
  setShowAddStatusModal: (show: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      browserNotifications: true,
      leftSidebarOpen: true,
      rightSidebarOpen: true,
      activeTab: 'chats',
      showAddFriendModal: false,
      showAddGroupModal: false,
      showAddStatusModal: false,
      setBrowserNotifications: (enabled) => set({ browserNotifications: enabled }),
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },
      toggleLeftSidebar: () => set((state) => ({ leftSidebarOpen: !state.leftSidebarOpen })),
      toggleRightSidebar: () => set((state) => ({ rightSidebarOpen: !state.rightSidebarOpen })),
      setLeftSidebar: (open) => set({ leftSidebarOpen: open }),
      setRightSidebar: (open) => set({ rightSidebarOpen: open }),
      setActiveTab: (tab) => {
        set({
          activeTab: tab,
          leftSidebarOpen: tab === 'chats' || tab === 'communities'
        });
      },
      setShowAddFriendModal: (show) => set({ showAddFriendModal: show }),
      setShowAddGroupModal: (show) => set({ showAddGroupModal: show }),
      setShowAddStatusModal: (show) => set({ showAddStatusModal: show }),
    }),
    { name: 'bourbon-ui' }
  )
);
