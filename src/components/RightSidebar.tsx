import React from 'react';
import { useUIStore } from '../stores/useUIStore';
import { useChatStore } from '../stores/useChatStore';
import {
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  UserPlus,
  Bell,
  User
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { NotificationsPanel } from './Modals';

export const RightSidebar = () => {
  const { rightSidebarOpen, toggleRightSidebar } = useUIStore();
  const { activeChat } = useChatStore();

  return (
    <motion.div
      initial={false}
      animate={{
        width: rightSidebarOpen ? 320 : 0,
        opacity: rightSidebarOpen ? 1 : 0
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        "h-full bg-[var(--bg-sidebar)] border-l border-[var(--border)] flex flex-col relative overflow-hidden shrink-0",
        "max-lg:absolute max-lg:right-0 max-lg:bottom-0 max-lg:z-40 max-lg:shadow-[-4px_0_24px_rgba(0,0,0,0.1)]",
        !rightSidebarOpen && "border-none"
      )}
    >
      <div className="w-[320px] h-full flex flex-col">
        {/* Header */}
        <div className="h-20 px-6 flex items-center gap-4 border-b border-[var(--border)] shrink-0">
          <button
            onClick={toggleRightSidebar}
            className="p-2 hover:bg-[var(--accent-bg)] hover:scale-110 rounded-xl text-[var(--text-muted)] transition-all"
          >
            {rightSidebarOpen ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </button>
          <h3 className="text-lg font-black text-[var(--text-main)] uppercase tracking-tight whitespace-nowrap">Details</h3>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {activeChat ? (
            <>
              {/* Chat Info */}
              <div className="flex flex-col items-center mb-8">
                <img
                  src={activeChat.avatar_url}
                  className="w-24 h-24 rounded-huge object-cover shadow-xl mb-4 border-4 border-[var(--bg-card)]"
                  referrerPolicy="no-referrer"
                  alt=""
                />
                <h4 className="text-xl font-black text-[var(--text-main)] mb-1 text-center">{activeChat.name}</h4>
                <p className="text-xs text-[var(--text-muted)] font-black uppercase tracking-widest">
                  {activeChat.isGroup ? 'Group Chat' : 'Direct Message'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mb-8">
                {activeChat.isGroup && (
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--primary-light)] text-[var(--primary)] rounded-2xl font-black text-xs hover:scale-[1.02] transition-all">
                    <UserPlus size={16} /> Add Member
                  </button>
                )}
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--accent-bg)] text-[var(--text-main)] rounded-2xl font-black text-xs hover:scale-[1.02] transition-all">
                    <Bell size={16} /> Mute
                  </button>
              </div>
            </>
          ) : (
            /* No Chat Selected View */
            <div className="flex flex-col items-center justify-center py-10 opacity-30 text-[var(--text-muted)]">
              <div className="w-16 h-16 bg-[var(--accent-bg)] rounded-full flex items-center justify-center mb-4">
                <User size={32} />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-center">Select a chat to<br />see details</p>
            </div>
          )}

          {/* Notifications (Always Visible) */}
          <div className="mb-8 mt-4 border-t border-[var(--border)] pt-8">
            <NotificationsPanel />
          </div>

          {activeChat && (
            <>
              {/* Group Members */}
              {activeChat.isGroup && (
                <div className="mb-8 mt-8 border-t border-[var(--border)] pt-8">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">Members</p>
                    <span className="text-xs font-black text-[var(--primary)]">{activeChat.members?.length || 0} members</span>
                  </div>
                  <div className="space-y-3">
                    {activeChat.members && activeChat.members.length > 0 ? (
                      activeChat.members.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-[var(--accent-bg)] rounded-2xl transition-all cursor-pointer group">
                          <img src={member.image || activeChat.avatar_url} className="w-10 h-10 rounded-xl object-cover" alt={member.name} referrerPolicy="no-referrer" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[var(--text-main)] truncate">{member.name}</p>
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">@{member.username || member.id}</p>
                          </div>
                          <ChevronRight size={16} className="text-slate-300 group-hover:text-[var(--primary)] transition-colors flex-shrink-0" />
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[var(--text-muted)] text-center py-4">No members available</p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};
