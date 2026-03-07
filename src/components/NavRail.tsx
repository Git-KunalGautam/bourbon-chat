import React from 'react';
import {
  MessageSquare,
  CircleDashed,
  Users,
  Settings,
  LogOut,
  User
} from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';
import { useAuthStore } from '../stores/useAuthStore';
import { cn } from '../lib/utils';
import { signOut } from 'next-auth/react';

export const NavRail = () => {
  const { activeTab, setActiveTab } = useUIStore();
  const { user, logout } = useAuthStore();

  const navItems = [
    { id: 'chats', icon: <MessageSquare size={24} />, label: 'Chats' },
    { id: 'updates', icon: <CircleDashed size={24} />, label: 'Updates' },
    { id: 'communities', icon: <Users size={24} />, label: 'Communities' },
    { id: 'settings', icon: <Settings size={24} />, label: 'Settings' },
  ];

  return (
    <div className="w-20 h-full bg-white border-r border-[var(--border)] flex flex-col items-center py-6 shrink-0">
      {/* Logo */}
      <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center text-white mb-10 shadow-lg shadow-[var(--primary-light)]">
        <span className="font-bold text-xl">B</span>
      </div>

      {/* Nav Items (Top) */}
      <div className="flex-1 flex flex-col gap-6">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={cn(
              "p-3 rounded-xl transition-all duration-200 relative group",
              activeTab === item.id
                ? "bg-[var(--primary-light)] text-[var(--primary)]"
                : "text-[var(--text-muted)] hover:bg-slate-50"
            )}
            title={item.label}
          >
            <span className="text-2xl">{item.icon}</span>
            {activeTab === item.id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--primary)] rounded-r-full" />
            )}
          </button>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="mt-auto flex flex-col gap-6 items-center">
        <button
          onClick={() => {
            logout();
            signOut();
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
