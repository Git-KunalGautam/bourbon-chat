import React from 'react';
import {
  MessageSquare,
  CircleDashed,
  Users,
  Settings,
  LogOut,
  User,
  Menu
} from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';
import { useAuthStore } from '../stores/useAuthStore';
import { cn } from '../lib/utils';
import { signOut } from 'next-auth/react';
import { motion } from 'motion/react';

export const NavRail = () => {
  const { activeTab, setActiveTab, toggleLeftSidebar, leftSidebarOpen } = useUIStore();
  const { user, logout } = useAuthStore();

  const navItems = [
    { id: 'chats', icon: <MessageSquare size={24} />, label: 'Chats' },
    { id: 'updates', icon: <CircleDashed size={24} />, label: 'Updates' },
    { id: 'communities', icon: <Users size={24} />, label: 'Communities' },
    { id: 'settings', icon: <Settings size={24} />, label: 'Settings' },
  ];

  return (
    <div className="w-20 h-full bg-white border-r border-[var(--border)] flex flex-col items-center py-3 md:py-6 shrink-0 z-50">
      {/* Menu Toggle */}
      <button
        onClick={toggleLeftSidebar}
        className={cn(
          "p-3 rounded-xl mb-3 md:mb-6 transition-all duration-200",
          leftSidebarOpen ? "bg-[var(--primary-light)] text-[var(--primary)]" : "text-[var(--text-muted)] hover:bg-slate-50"
        )}
        title="Toggle Sidebar"
      >
        <Menu size={24} />
      </button>

      {/* Logo */}
      <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center text-white mb-4 md:mb-10 shadow-lg shadow-[var(--primary-light)]">
        <span className="font-bold text-xl">B</span>
      </div>

      {/* Nav Items (Top) */}
      <div className="flex-1 flex flex-col gap-6">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={cn(
              "p-3 rounded-xl transition-all duration-300 relative group",
              activeTab === item.id
                ? "bg-[var(--primary-light)] text-[var(--primary)] scale-110 shadow-sm"
                : "text-[var(--text-muted)] hover:bg-slate-50 hover:scale-110"
            )}
            title={item.label}
          >
            <span className="text-2xl transition-transform block group-hover:scale-110">{item.icon}</span>
            {activeTab === item.id && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[var(--primary)] rounded-r-full"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="mt-auto flex flex-col gap-6 items-center">
        <button
          onClick={async () => {
            // Clear browser cache explicitly
            if ('caches' in window) {
              const cacheNames = await caches.keys();
              await Promise.all(cacheNames.map(name => caches.delete(name)));
            }
            
            fetch('/api/session/active', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isActive: 0 })
            }).finally(() => {
              sessionStorage.clear();
              localStorage.clear();
              logout();
              signOut();
            });
          }}
          className="p-3 rounded-xl text-[var(--text-muted)] hover:bg-red-50 hover:text-red-500 transition-all group"
          title="Logout"
        >
          <LogOut size={24} />
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={cn(
            "p-1 rounded-xl transition-all duration-200 relative group border-2",
            activeTab === 'profile'
              ? "border-[var(--primary)]"
              : "border-transparent"
          )}
          title="Profile"
        >
          <img
            src={user?.avatar_url}
            alt="Profile"
            className="w-10 h-10 rounded-lg object-cover"
            referrerPolicy="no-referrer"
          />
        </button>
      </div>
    </div>
  );
};
