import React from 'react';
import { Message } from '../stores/useChatStore';
import { cn } from '../lib/utils';

interface Props {
  message: Message;
  isMe: boolean;
  key?: string;
}

export const MessageBubble = ({ message, isMe }: Props) => {
  return (
    <div className={cn(
      "max-w-[80%] px-6 py-4 rounded-huge shadow-sm relative",
      isMe 
        ? "bg-[#E0E7FF] text-[#4338CA] rounded-tr-none" 
        : "bg-[var(--accent-bg)] text-[var(--text-main)] rounded-tl-none border border-[var(--border)]"
    )}>
      {message.type === 'image' && (
        <img src={message.content} className="rounded-2xl mb-3 max-w-full h-auto shadow-md" referrerPolicy="no-referrer" />
      )}
      {message.type === 'video' && (
        <video src={message.content} controls className="rounded-2xl mb-3 max-w-full shadow-md" />
      )}
      {(!message.type || message.type === 'text') && (
        <p className="text-sm font-bold leading-relaxed">{message.content}</p>
      )}
    </div>
  );
};
