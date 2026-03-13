import React from 'react';
import { Message } from '../stores/useChatStore';
import { cn } from '../lib/utils';
import { Check, CheckCheck } from 'lucide-react';

interface Props {
  message: Message;
  isMe: boolean;
}

export const MessageBubble = ({ message, isMe }: Props) => {
  const time = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className={cn(
        "min-w-32 max-w-[380px] px-4 py-2 rounded-2xl shadow-sm flex flex-col gap-1 overflow-hidden relative group",
        isMe
          ? "bg-[#E0E7FF] text-[#4338CA] rounded-tr-md ml-auto"
          : "bg-[var(--accent-bg)] text-[var(--text-main)] border border-[var(--border)] rounded-tl-md"
      )}
    >
      {/* Text */}
      {(!message.type || message.type === "text") && (
        <p className="text-sm font-medium leading-relaxed text-left break-words [overflow-wrap:anywhere] whitespace-pre-wrap pr-12">
          {message.content}
        </p>
      )}

      {/* Image */}
      {message.type === "image" && (
        <div className="flex justify-center mb-1">
          <img
            src={message.content}
            className="rounded-xl max-w-[260px] w-full h-auto object-cover shadow-md"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* Video */}
      {message.type === "video" && (
        <div className="flex justify-center mb-1">
          <video
            src={message.content}
            controls
            className="rounded-xl max-w-[260px] w-full shadow-md"
          />
        </div>
      )}

      {/* Info: Time and Status */}
      <div className={cn(
        "flex items-center gap-1 self-end mt-1",
        isMe ? "text-[#4338CA]/70" : "text-[var(--text-muted)]"
      )}>
        <span className="text-[10px] font-bold uppercase tracking-tight">
          {time}
        </span>
        
        {isMe && (
          <div className="ml-1">
            {message.status === 'read' ? (
              <CheckCheck size={14} className="text-emerald-500" />
            ) : message.status === 'delivered' ? (
              <CheckCheck size={14} className="text-slate-400" />
            ) : (
              <Check size={14} className="text-slate-400" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};