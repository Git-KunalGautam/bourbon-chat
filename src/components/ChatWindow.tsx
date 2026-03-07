import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../stores/useChatStore';
import { MessageBubble } from './MessageBubble';
import { MdMoreVert, MdSearch, MdAttachFile, MdSend, MdSentimentSatisfiedAlt } from 'react-icons/md';
import { useSocket } from '../hooks/useSocket';
import { cn } from '../lib/utils';

export const ChatWindow = () => {
  const { activeChat, messages, addMessage } = useChatStore();
  const [inputValue, setInputValue] = useState('');
  const { sendMessage, joinRoom } = useSocket();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeChat) {
      joinRoom(activeChat.id);
    }
  }, [activeChat, joinRoom]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim() || !activeChat) return;

    const newMessage = {
      id: Math.random().toString(36).substr(2, 9),
      conversation_id: activeChat.id,
      sender_id: 'me', // Mock user ID
      content: inputValue,
      created_at: new Date().toISOString(),
    };

    addMessage(newMessage);
    sendMessage(newMessage);
    setInputValue('');
  };

  if (!activeChat) {
    return (
      <div className="flex-1 bg-[var(--bg-chat)] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="chat-pattern" />
        <div className="z-10 text-center">
          <div className="w-24 h-24 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-white text-4xl font-bold">B</span>
          </div>
          <h2 className="text-2xl font-light text-[var(--text-main)] mb-2">bourbon-chat</h2>
          <p className="text-[var(--text-muted)] text-sm max-w-xs px-4">
            Send and receive messages in real-time with our premium whiskey-inspired interface.
          </p>
        </div>
        <div className="absolute bottom-10 text-[var(--text-muted)] text-xs flex items-center gap-1">
          <span className="opacity-50">End-to-end encrypted</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-chat)] relative overflow-hidden">
      <div className="chat-pattern" />
      
      {/* Header */}
      <div className="h-16 bg-[var(--bg-header)] flex items-center justify-between px-4 shrink-0 z-10 border-l border-[var(--border)]">
        <div className="flex items-center gap-3">
          <img
            src={activeChat.avatar_url}
            alt={activeChat.name}
            className="w-10 h-10 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div>
            <h3 className="font-medium text-[var(--text-main)] leading-tight">{activeChat.name}</h3>
            <span className="text-xs text-[var(--text-muted)]">
              {activeChat.status || 'online'}
            </span>
          </div>
        </div>
        <div className="flex gap-5 text-[var(--text-muted)] text-xl">
          <span className="cursor-pointer"><MdSearch /></span>
          <span className="cursor-pointer"><MdMoreVert /></span>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 z-10 flex flex-col"
      >
        <div className="flex-1" />
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isMe={msg.sender_id === 'me'} />
        ))}
      </div>

      {/* Input */}
      <div className="bg-[var(--bg-header)] p-2 flex items-center gap-2 z-10">
        <div className="flex gap-2 text-[var(--text-muted)] text-2xl px-2">
          <span className="cursor-pointer"><MdSentimentSatisfiedAlt /></span>
          <span className="cursor-pointer rotate-45"><MdAttachFile /></span>
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message"
          className="flex-1 bg-white rounded-lg px-4 py-2 outline-none text-sm text-[var(--text-main)]"
        />
        <button
          onClick={handleSend}
          disabled={!inputValue.trim()}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
            inputValue.trim() ? "text-[var(--primary)]" : "text-[var(--text-muted)]"
          )}
        >
          <span className="text-2xl"><MdSend /></span>
        </button>
      </div>
    </div>
  );
};
