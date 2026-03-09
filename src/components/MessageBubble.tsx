import React from 'react';
import { Message } from '../stores/useChatStore';
import { cn } from '../lib/utils';

interface Props {
  message: Message;
  isMe: boolean;
}

export const MessageBubble = ({ message, isMe }: Props) => {
  return (
    <div
      className={cn(
        "min-w-32 max-w-[380px] px-4 py-2 rounded-2xl shadow-sm flex flex-col gap-2 overflow-hidden",
        isMe
          ? "bg-[#E0E7FF] text-[#4338CA] rounded-tr-md ml-auto"
          : "bg-[var(--accent-bg)] text-[var(--text-main)] border border-[var(--border)] rounded-tl-md"
      )}
    >
      {/* Text */}
      {(!message.type || message.type === "text") && (
        <p className="text-sm font-medium leading-relaxed text-left break-words [overflow-wrap:anywhere] whitespace-pre-wrap">
          {message.content}
        </p>
      )}

      {/* Image */}
      {message.type === "image" && (
        <div className="flex justify-center">
          <img
            src={message.content}
            className="rounded-xl max-w-[260px] w-full h-auto object-cover shadow-md"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* Video */}
      {message.type === "video" && (
        <div className="flex justify-center">
          <video
            src={message.content}
            controls
            className="rounded-xl max-w-[260px] w-full shadow-md"
          />
        </div>
      )}
    </div>
  );
};