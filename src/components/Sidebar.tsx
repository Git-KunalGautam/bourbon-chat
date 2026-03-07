import React from 'react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { ContactItem } from './ContactItem';
import { MdSearch, MdMoreVert, MdChat } from 'react-icons/md';
import { Conversation } from '../stores/useChatStore';

const MOCK_CONTACTS: Conversation[] = [
  { id: '1', name: 'John Doe', avatar_url: 'https://picsum.photos/seed/john/200', last_message: 'Hey, how are you?', last_message_time: new Date().toISOString() },
  { id: '2', name: 'Alice Smith', avatar_url: 'https://picsum.photos/seed/alice/200', last_message: 'See you tomorrow!', last_message_time: new Date().toISOString() },
  { id: '3', name: 'Bourbon Enthusiasts', avatar_url: 'https://picsum.photos/seed/bourbon/200', last_message: 'That 12-year is amazing.', last_message_time: new Date().toISOString() },
];

export const Sidebar = () => {
  return (
    <div className="flex flex-col h-full bg-[var(--bg-sidebar)] border-r border-[var(--border)]">
      {/* Header */}
      <div className="h-16 bg-[var(--bg-header)] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <img
            src="https://picsum.photos/seed/me/200"
            alt="Me"
            className="w-10 h-10 rounded-full"
            referrerPolicy="no-referrer"
          />
          <ThemeSwitcher />
        </div>
        <div className="flex gap-4 text-[var(--text-muted)] text-xl">
          <span className="cursor-pointer"><MdChat /></span>
          <span className="cursor-pointer"><MdMoreVert /></span>
        </div>
      </div>

      {/* Search */}
      <div className="p-2 shrink-0">
        <div className="bg-[var(--bg-header)] flex items-center gap-4 px-3 py-1.5 rounded-lg">
          <span className="text-[var(--text-muted)] text-xl"><MdSearch /></span>
          <input
            type="text"
            placeholder="Search or start new chat"
            className="bg-transparent border-none outline-none text-sm w-full text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
          />
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
        {MOCK_CONTACTS.map((contact) => (
          <ContactItem key={contact.id} conversation={contact} />
        ))}
      </div>
    </div>
  );
};
