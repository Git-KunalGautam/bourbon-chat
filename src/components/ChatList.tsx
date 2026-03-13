import React, { useState, useMemo } from 'react';
import { Search, Plus, ChevronLeft, UserPlus } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useChatStore } from '../stores/useChatStore';
import { useUIStore } from '../stores/useUIStore';
import { ContactItem } from './ContactItem';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export const ChatList = () => {
  const { user } = useAuthStore();
  const { activeChat, conversations, fetchConversations } = useChatStore();
  const { activeTab, setShowAddGroupModal, setShowAddFriendModal, leftSidebarOpen, toggleLeftSidebar } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    fetchConversations();
  }, []);

  const filteredContacts = useMemo(() => {
    let list = Array.isArray(conversations) ? conversations : [];

    // Filter by tab
    if (activeTab === 'communities') {
      list = list.filter(c => c.isGroup);
    }

    // Filter by search
    if (searchQuery) {
      list = list.filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    return list;
  }, [activeTab, searchQuery, conversations]);

  return (
    <motion.div
      initial={false}
      animate={{
        width: leftSidebarOpen ? 320 : 0,
        opacity: leftSidebarOpen ? 1 : 0
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        "h-full bg-white border-r border-[var(--border)] flex flex-col shrink-0 relative overflow-hidden",
        "max-lg:absolute max-lg:left-20 max-lg:bottom-0 max-lg:z-40 max-lg:shadow-[4px_0_24px_rgba(0,0,0,0.1)]",
        !leftSidebarOpen && "border-none"
      )}
    >
      <div className="w-[320px] h-full flex flex-col">
        {/* Header */}
        <div className="p-6 pb-2">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={toggleLeftSidebar}
              className="p-2 hover:bg-slate-50 hover:scale-110 rounded-xl text-[var(--text-muted)] transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-xl font-bold text-[var(--text-main)]">
              {activeTab === 'communities' ? 'Communities' : 'Chat'}
            </h2>
            <div className="w-10" /> {/* Spacer */}
          </div>

          {/* Profile Card */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4 group">
              <img
                src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.username}&background=random`}
                alt={user?.username}
                className="w-24 h-24 rounded-huge object-cover shadow-xl border-4 border-white"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-1 left-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full" />
            </div>

            <h3 className="text-lg font-bold text-[var(--text-main)] mb-1">{user?.username}</h3>
            <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer ${user?.bio
              ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600 hover:bg-amber-100"
              }`}>
              {user?.bio ? user.bio : "Update Bio"}
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--accent-bg)] border-none rounded-2xl py-3 pl-12 pr-10 text-sm outline-none focus:ring-2 ring-[var(--primary-light)] transition-all"
            />
          </div>

          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider">
              {activeTab === 'communities' ? 'Groups' : 'Last chats'}
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddFriendModal(true)}
                title="Add New Friend"
                className="p-1.5 bg-[var(--primary-light)] text-[var(--primary)] rounded-lg hover:scale-110 transition-all"
              >
                <UserPlus size={20} />
              </button>
              <button
                onClick={() => setShowAddGroupModal(true)}
                title="Add New Group"
                className="p-1.5 bg-[var(--primary-light)] text-[var(--primary)] rounded-lg hover:scale-110 transition-all"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Chat List Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <ContactItem key={contact.id} conversation={contact} />
            ))
          ) : (
            <div className="p-8 text-center text-[var(--text-muted)] text-sm font-medium">
              No chats found
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
