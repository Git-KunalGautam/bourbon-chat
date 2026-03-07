import React, { useState, useRef, useMemo } from 'react';
import { Search, Plus, ChevronLeft, Edit, Camera } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { useChatStore, Conversation } from '../stores/useChatStore';
import { useUIStore } from '../stores/useUIStore';
import { ContactItem } from './ContactItem';
import { cn } from '../lib/utils';

const MOCK_CONTACTS: Conversation[] = [
  { id: '1', name: 'Real estate deals', avatar_url: 'https://picsum.photos/seed/real/200', last_message: 'typing...', last_message_time: '11:15', status: 'typing...', isGroup: true },
  { id: '2', name: 'Kate Johnson', avatar_url: 'https://picsum.photos/seed/kate/200', last_message: 'I will send the document s...', last_message_time: '11:15' },
  { id: '3', name: 'Tamara Shevchenko', avatar_url: 'https://picsum.photos/seed/tamara/200', last_message: 'are you going to a busine...', last_message_time: '10:05' },
  { id: '4', name: 'Joshua Clarkson', avatar_url: 'https://picsum.photos/seed/josh/200', last_message: 'I suggest to start, I have n...', last_message_time: '15:09' },
  { id: '5', name: 'Jeroen Zoet', avatar_url: 'https://picsum.photos/seed/jeroen/200', last_message: 'We need to start a new re...', last_message_time: '14:09' },
  { id: '6', name: 'Tech Enthusiasts', avatar_url: 'https://picsum.photos/seed/tech/200', last_message: 'Did you see the new AI?', last_message_time: '09:30', isGroup: true },
];

export const ChatList = () => {
  const { user, updateProfile } = useAuthStore();
  const { activeChat } = useChatStore();
  const { activeTab } = useUIStore();
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredContacts = useMemo(() => {
    let list = MOCK_CONTACTS;
    
    // Filter by tab
    if (activeTab === 'communities') {
      list = list.filter(c => c.isGroup);
    } else if (activeTab === 'chats') {
      // Show all or maybe just non-groups? Usually "Chats" shows everything
      // but "Communities" shows ONLY groups.
    }

    // Filter by search
    if (searchQuery) {
      list = list.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    return list;
  }, [activeTab, searchQuery]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', newUsername);
    formData.append('email', user?.email || '');
    formData.append('avatar_url', user?.avatar_url || '');
    
    if (fileInputRef.current?.files?.[0]) {
      formData.append('avatar', fileInputRef.current.files[0]);
    }

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      updateProfile({
        username: data.username,
        avatar_url: data.avatar_url,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <div className="w-[320px] h-full bg-white border-r border-[var(--border)] flex flex-col shrink-0">
      {/* Header */}
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between mb-6">
          <button className="p-2 hover:bg-slate-50 rounded-xl text-[var(--text-muted)]">
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
              src={user?.avatar_url}
              alt={user?.username}
              className="w-24 h-24 rounded-huge object-cover shadow-xl border-4 border-white"
              referrerPolicy="no-referrer"
            />
            <button 
              onClick={() => setIsEditing(true)}
              className="absolute bottom-0 right-0 p-2 bg-[var(--primary)] text-white rounded-full shadow-lg hover:scale-110 transition-all"
            >
              <Edit size={16} />
            </button>
            <div className="absolute bottom-1 left-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full" />
          </div>
          
          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="w-full flex flex-col gap-2">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-3 py-1 border rounded-lg text-center font-bold"
                autoFocus
              />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
              />
              <div className="flex gap-2 justify-center">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs bg-slate-100 px-2 py-1 rounded-md flex items-center gap-1"
                >
                  <Camera size={12} /> Avatar
                </button>
                <button type="submit" className="text-xs bg-[var(--primary)] text-white px-2 py-1 rounded-md">Save</button>
                <button type="button" onClick={() => setIsEditing(false)} className="text-xs bg-slate-200 px-2 py-1 rounded-md">Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <h3 className="text-lg font-bold text-[var(--text-main)] mb-1">{user?.username}</h3>
              <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                available
              </div>
            </>
          )}
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
              title="Add New Group"
              className="p-1.5 bg-[var(--primary-light)] text-[var(--primary)] rounded-lg hover:scale-110 transition-all"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Chat List */}
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
  );
};
