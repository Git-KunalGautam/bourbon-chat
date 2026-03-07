import React from 'react';
import { Conversation, useChatStore } from '../stores/useChatStore';
import { cn } from '../lib/utils';

interface Props {
  conversation: Conversation;
  key?: string;
}

export const ContactItem = ({ conversation }: Props) => {
  const { activeChat, setActiveChat } = useChatStore();
  const isActive = activeChat?.id === conversation.id;

  return (
    <div
      onClick={() => setActiveChat(conversation)}
      className={cn(
        "flex items-center gap-4 p-4 cursor-pointer transition-all duration-200 rounded-huge mb-1",
        isActive ? "bg-[var(--primary-light)]" : "hover:bg-slate-50"
      )}
    >
      <div className="relative shrink-0">
        <img
          src={conversation.avatar_url || `https://ui-avatars.com/api/?name=${conversation.name}&background=random`}
          alt={conversation.name}
          className="w-12 h-12 rounded-2xl object-cover"
          referrerPolicy="no-referrer"
        />
        {conversation.status === 'typing...' ? (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[var(--primary)] border-2 border-white rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
          </div>
        ) : (
          <div className={cn(
            "absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white rounded-full",
            conversation.isActive === 1 ? "bg-green-500" : "bg-slate-300"
          )} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <h3 className={cn(
            "text-sm font-bold truncate",
            isActive ? "text-[var(--primary)]" : "text-[var(--text-main)]"
          )}>
            {conversation.name}
          </h3>
          <span className="text-[10px] font-bold text-[var(--text-muted)]">
            {conversation.last_message_time}
          </span>
        </div>
        <p className={cn(
          "text-xs truncate font-medium",
          conversation.status === 'typing...' ? "text-[var(--primary)]" : "text-[var(--text-muted)]"
        )}>
          {conversation.status === 'typing...' ? 'typing...' : conversation.last_message}
        </p>
      </div>
    </div>
  );
};
