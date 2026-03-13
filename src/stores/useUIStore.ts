import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  browserNotifications: boolean;
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  activeTab: 'chats' | 'updates' | 'communities' | 'settings' | 'profile';
  showAddFriendModal: boolean;
  showAddGroupModal: boolean;
  showAddStatusModal: boolean;
  setBrowserNotifications: (enabled: boolean) => void;
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
      browserNotifications: false,
      leftSidebarOpen: true,
      rightSidebarOpen: true,
      activeTab: 'chats',
      showAddFriendModal: false,
      showAddGroupModal: false,
      showAddStatusModal: false,
      setBrowserNotifications: (enabled) => set({ browserNotifications: enabled }),
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
