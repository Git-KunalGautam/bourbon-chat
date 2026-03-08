import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../stores/useChatStore';
import { useAuthStore } from '../stores/useAuthStore';
import { MessageBubble } from './MessageBubble';
import {
  MoreVertical,
  Search,
  Paperclip,
  Send,
  Smile,
  Video,
  Phone,
  ChevronLeft,
  UserPlus,
  Info,
  CircleDashed,
  Plus,
  X,
  Menu
} from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { useUIStore } from '../stores/useUIStore';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import EmojiPicker from 'emoji-picker-react';

export const ModernChat = () => {
  const { activeChat, messages, addMessage, typingUser, fetchMessages } = useChatStore();
  const { user } = useAuthStore();
  const { toggleLeftSidebar, toggleRightSidebar, setShowAddStatusModal, leftSidebarOpen, rightSidebarOpen, setLeftSidebar, setRightSidebar } = useUIStore();
  const [inputValue, setInputValue] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<any>(null);
  const [statuses, setStatuses] = useState<any[]>([]);
  const { sendMessage, joinRoom, emitTyping, emitStopTyping } = useSocket();

  const fetchStatuses = async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      const allStatuses = [
        { id: 'me', name: 'My Status', avatar: user?.avatar_url, isOwn: true, statuses: data.myStatuses || [] },
        ...(data.friendsStatuses || []).map((f: any) => ({
          id: f.userId,
          name: f.name || f.username,
          avatar: f.image || `https://ui-avatars.com/api/?name=${f.username}&background=random`,
          statuses: f.statuses
        }))
      ];
      setStatuses(allStatuses);
    } catch (error) {
      console.error('Failed to fetch statuses:', error);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, [user]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);
    }
  }, [activeChat, fetchMessages]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (activeChat) {
      joinRoom(activeChat.id);
    }
  }, [activeChat, joinRoom]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (activeChat && user) {
      emitTyping(activeChat.id, user.username);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        emitStopTyping(activeChat.id);
      }, 2000);
    }
  };

  const handleSend = async (content?: string, type: 'text' | 'image' | 'video' = 'text') => {
    if (!activeChat || !user) return;
    const text = content || inputValue;
    if (!text.trim() && type === 'text') return;

    const tempId = Math.random().toString(36).substr(2, 9);
    const messageData = {
      conversation_id: activeChat.id,
      sender_id: (user as any).id || (user as any)._id,
      content: text,
      type,
      tempId
    };

    // We rely on the socket server to save and broadcast the message
    sendMessage(messageData);

    // Optimistic update
    const optimisticMessage = {
      ...messageData,
      id: tempId,
      created_at: new Date().toISOString()
    };
    addMessage(optimisticMessage);

    setInputValue('');
    setShowEmoji(false);
    if (activeChat) emitStopTyping(activeChat.id);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      const type = file.type.startsWith('video') ? 'video' : 'image';
      handleSend(data.url, type);
    } catch (err) {
      console.error('Upload failed', err);
    }
  };

  const StatusTopBar = () => (
    <div className="h-20 px-6 border-b border-[var(--border)] flex items-center gap-4 overflow-x-auto custom-scrollbar shrink-0 bg-white/50 backdrop-blur-sm">
      <div
        onClick={() => setShowAddStatusModal(true)}
        className="flex flex-col items-center shrink-0 cursor-pointer group"
      >
        <div className="w-12 h-12 rounded-full border-2 border-dashed border-[var(--primary)] p-0.5 group-hover:scale-110 transition-all">
          <div className="w-full h-full bg-[var(--primary-light)] rounded-full flex items-center justify-center text-[var(--primary)]">
            <Plus size={20} />
          </div>
        </div>
        <span className="text-[10px] font-black mt-1 text-[var(--text-muted)]">Add</span>
      </div>
      {statuses.filter(s => !s.isOwn && s.statuses?.length > 0).map(status => (
        <div
          key={status.id}
          onClick={() => setSelectedStatus({
            ...status,
            image: status.statuses[0].content, // Assuming first status for now
            time: new Date(status.statuses[0].createdAt).toLocaleTimeString()
          })}
          className="flex flex-col items-center shrink-0 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full border-2 border-[var(--primary)] p-0.5 group-hover:scale-110 transition-all overflow-hidden">
            <img src={status.avatar} className="w-full h-full rounded-full object-cover" alt="" referrerPolicy="no-referrer" />
          </div>
          <span className="text-[10px] font-black mt-1 text-[var(--text-muted)] truncate w-12 text-center">{status.name.split(' ')[0]}</span>
        </div>
      ))}
    </div>
  );

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col h-full bg-white overflow-hidden uppercase tracking-tight relative">
        <StatusTopBar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="w-32 h-32 bg-[var(--primary-glow)] rounded-3xl flex items-center justify-center mb-8"
          >
            <span className="text-6xl">🥃</span>
          </motion.div>
          <h2 className="text-4xl font-black text-[var(--text-main)] mb-4 tracking-tight">Select a conversation</h2>
          <p className="text-[var(--text-muted)] max-w-md font-bold">
            Choose a contact or community to start chatting with premium real-time speed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {/* Status Bar */}
      <StatusTopBar />

      {/* Modern Header */}
      <div className="h-20 px-8 flex items-center justify-between border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              toggleLeftSidebar();
              if (window.innerWidth < 1024) setRightSidebar(false);
            }}
            className={cn(
              "p-2 hover:bg-slate-50 rounded-xl text-[var(--text-muted)] transition-all",
              leftSidebarOpen ? "text-[var(--primary)] bg-[var(--primary-light)]" : ""
            )}
          >
            <Menu size={24} />
          </button>
          <div className="relative">
            <img
              src={activeChat.avatar_url}
              className="w-10 h-10 rounded-xl object-cover shadow-md"
              alt=""
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[var(--text-main)] leading-tight">{activeChat.name}</h3>
            <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest">
              {typingUser ? 'typing...' : 'online'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeChat.isGroup && (
            <button
              onClick={() => {
                toggleRightSidebar();
                if (window.innerWidth < 1024) setLeftSidebar(false);
              }}
              className="p-2.5 hover:bg-[var(--primary-light)] text-[var(--text-muted)] hover:text-[var(--primary)] rounded-xl transition-all"
              title="Add More Participants"
            >
              <UserPlus size={20} />
            </button>
          )}
          <button
            onClick={() => {
              toggleRightSidebar();
              if (window.innerWidth < 1024) setLeftSidebar(false);
            }}
            className={cn(
              "p-2.5 hover:bg-[var(--primary-light)] text-[var(--text-muted)] hover:text-[var(--primary)] rounded-xl transition-all",
              rightSidebarOpen ? "text-[var(--primary)] bg-[var(--primary-light)]" : ""
            )}
            title="Participants Details"
          >
            <Info size={20} />
          </button>
          <div className="w-[1px] h-8 bg-[var(--border)] mx-2 shrink-0" />
          <button className="p-2.5 hover:bg-slate-50 text-[var(--text-muted)] rounded-xl transition-all">
            <Phone size={20} />
          </button>
          <button className="p-2.5 hover:bg-slate-50 text-[var(--text-muted)] rounded-xl transition-all">
            <Video size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8 bg-slate-50/30">
        <AnimatePresence>
          {messages.map((msg) => {
            const isMe = msg.sender_id === (user as any).id || msg.sender_id === (user as any)._id || msg.sender_id === 'me';
            const sender = activeChat.isGroup
              ? (activeChat as any).participants?.find((p: any) => p._id === msg.sender_id)
              : null;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-4", isMe ? "flex-row-reverse" : "flex-row")}
              >
                {!isMe && (
                  <img
                    src={sender?.image || activeChat.avatar_url || `https://ui-avatars.com/api/?name=${sender?.username || 'User'}&background=random`}
                    className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-md"
                    referrerPolicy="no-referrer"
                    alt=""
                  />
                )}
                <div className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                  {!isMe && (
                    <span className="text-[10px] font-black text-[var(--text-muted)] mb-2 ml-1 uppercase tracking-wider">
                      {sender?.username || sender?.name || activeChat.name} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  <MessageBubble message={msg} isMe={isMe} />
                </div>
              </motion.div>
            );
          })}
          {typingUser && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 text-[var(--text-muted)] text-xs font-bold"
            >
              <div className="flex gap-1 bg-white p-2 rounded-full shadow-sm border border-[var(--border)]">
                <span className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="italic">{typingUser} is typing...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modern Input Bar */}
      <div className="p-8 pt-0 bg-white">
        <div className="bg-white rounded-huge p-3 flex items-center gap-3 relative border border-[var(--border)] shadow-2xl">
          <AnimatePresence>
            {showEmoji && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-full right-0 mb-4 z-50"
              >
                <EmojiPicker onEmojiClick={(e) => setInputValue(prev => prev + e.emoji)} />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className="p-3 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors cursor-pointer"
          >
            <Smile size={24} />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,video/*"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors cursor-pointer"
          >
            <Paperclip size={24} />
          </button>

          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Write your message..."
            className="flex-1 bg-transparent px-2 py-2 outline-none text-[var(--text-main)] font-bold placeholder:text-slate-400"
          />

          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim()}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-xl",
              inputValue.trim() ? "bg-[var(--primary)] text-white scale-100 shadow-[var(--primary-light)]" : "bg-slate-100 text-slate-400 scale-90 shadow-none"
            )}
          >
            <Send size={24} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {selectedStatus && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
          >
            <button
              onClick={() => setSelectedStatus(null)}
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
            >
              <X size={40} />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-lg w-full aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl"
            >
              {selectedStatus.image?.endsWith('.mp4') || selectedStatus.image?.endsWith('.webm') ? (
                <video src={selectedStatus.image} className="w-full h-full object-contain bg-black" autoPlay controls />
              ) : (
                <img src={selectedStatus.image} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
              )}

              <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/60 to-transparent flex items-center gap-4">
                <img src={selectedStatus.avatar} className="w-12 h-12 rounded-full border-2 border-white" alt="" referrerPolicy="no-referrer" />
                <div>
                  <p className="text-white font-black">{selectedStatus.name}</p>
                  <p className="text-white/70 text-xs font-bold">{selectedStatus.time}</p>
                </div>
              </div>

              <div className="absolute top-2 left-4 right-4 flex gap-1">
                <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 5 }}
                    onAnimationComplete={() => setSelectedStatus(null)}
                    className="h-full bg-white"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
