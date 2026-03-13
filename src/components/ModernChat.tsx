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
  Menu,
  PanelRightOpen,
  PanelRightClose
} from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { useUIStore } from '../stores/useUIStore';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import EmojiPicker from 'emoji-picker-react';
import { toast } from 'react-toastify';

export const ModernChat = () => {
  const { activeChat, messages, addMessage, typingUser, fetchMessages } = useChatStore();
  const { user } = useAuthStore();
  const { toggleLeftSidebar, toggleRightSidebar, setShowAddStatusModal, leftSidebarOpen, rightSidebarOpen, setLeftSidebar, setRightSidebar } = useUIStore();
  const [inputValue, setInputValue] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<any>(null);
  const [statuses, setStatuses] = useState<any[]>([]);

  const fetchStatuses = async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      const allStatuses = [
        { 
          id: 'me', 
          name: 'My Status', 
          avatar: user?.avatar_url || (user as any)?.image || `https://ui-avatars.com/api/?name=${user?.username || 'You'}&background=random`, 
          isOwn: true, 
          statuses: (data.myStatuses || [])
            .map((s: any) => ({
              id: s._id,
              image: s.media_url,
              description: s.caption || '',
              time: new Date(s.created_at).toLocaleTimeString()
            }))
        },
        ...(data.friendsStatuses || []).map((f: any) => ({
          id: f.userId,
          name: f.name || f.username,
          avatar: f.image || `https://ui-avatars.com/api/?name=${f.username}&background=random`,
          isOwn: false,
          statuses: (f.statuses || [])
            .map((s: any) => ({
              id: s._id,
              image: s.media_url,
              description: s.caption || '',
              time: new Date(s.created_at).toLocaleTimeString()
            }))
        }))
      ];
      setStatuses(allStatuses);
    } catch (error) {
      console.error('Failed to fetch statuses:', error);
      toast.error('Failed to fetch statuses');
    }
  };

  useEffect(() => {
    fetchStatuses();
    // Close right sidebar by default on mobile
    if (window.innerWidth < 1024) {
      setRightSidebar(false);
    }
  }, [user]);

  const { sendMessage, joinRoom, emitTyping, emitStopTyping, emitRead } = useSocket();

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);
    }
  }, [activeChat, fetchMessages]);

  useEffect(() => {
    if (activeChat && messages.length > 0) {
      const myId = user?.id || (user as any)?._id;
      const unreadMessages = messages.filter(m => m.sender_id !== myId && m.sender_id !== 'me' && m.status !== 'read');
      
      unreadMessages.forEach(msg => {
        emitRead(msg.id, activeChat.id, myId);
      });
    }
  }, [activeChat, messages, emitRead, user]);

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
      chat_id: activeChat.id,
      sender_id: (user as any).id || (user as any)._id,
      message_text: text,
      message_type: type,
      tempId
    };

    // We rely on the socket server to save and broadcast the message
    sendMessage(messageData);

    // Optimistic update
    const optimisticMessage: any = {
      ...messageData,
      id: tempId,
      status: 'sent',
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
      toast.error('File upload failed');
    }
  };

  const StatusTopBar = () => (
    <div className="h-20 px-6 border-b border-[var(--border)] flex items-center shrink-0 bg-[var(--bg-card)]/50 backdrop-blur-sm relative w-full gap-2">
      <div className="flex items-center gap-4 overflow-x-auto custom-scrollbar flex-1">
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
        {statuses.filter(s => s.statuses?.length > 0).map(status => (
          <div
            key={status.id}
            onClick={() => setSelectedStatus({
              ...status,
              image: status.statuses[0].image,
              description: status.statuses[0].description,
              time: status.statuses[0].time
            })}
            className="flex flex-col items-center shrink-0 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full border-2 border-[var(--primary)] p-0.5 group-hover:scale-110 transition-all overflow-hidden">
              <img src={status.avatar} className="w-full h-full rounded-full object-cover" alt="" referrerPolicy="no-referrer" />
            </div>
            <span className="text-[10px] font-black mt-1 text-[var(--text-muted)] truncate w-12 text-center">
              {status.isOwn ? 'Me' : status.name.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          toggleRightSidebar();
          if (window.innerWidth < 1024) setLeftSidebar(false);
        }}
        className={cn(
          "p-2 hover:bg-[var(--accent-bg)] rounded-xl transition-all shrink-0",
          rightSidebarOpen ? "text-[var(--primary)] bg-[var(--primary-light)]" : "text-[var(--text-muted)]"
        )}
        title="Toggle Details & Notifications"
      >
        {rightSidebarOpen ? <PanelRightClose size={24} /> : <PanelRightOpen size={24} />}
      </button>
    </div>
  );

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col h-full bg-[var(--bg-card)] overflow-hidden uppercase tracking-tight relative">
        <StatusTopBar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="w-32 h-32 bg-[var(--primary-glow)] rounded-3xl flex items-center justify-center mb-8"
          >
            <span className="text-6xl">🥃</span>
          </motion.div>
          <h2 className="text-2xl md:text-4xl font-black text-[var(--text-main)] mb-4 tracking-tight">Select a conversation</h2>
          <p className="text-[var(--text-muted)] max-w-2xl text-xl text-2xl font-bold">
            Choose a contact or community to start chatting with premium real-time speed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--bg-card)]">
      {/* Status Bar */}
      <StatusTopBar />

      {/* Modern Header */}
      <div className="h-20 px-8 flex items-center justify-between border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-4">
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
          <button className="p-2.5 hover:bg-[var(--accent-bg)] text-[var(--text-muted)] rounded-xl transition-all">
            <Phone size={20} />
          </button>
          <button className="p-2.5 hover:bg-[var(--accent-bg)] text-[var(--text-muted)] rounded-xl transition-all">
            <Video size={20} />
          </button>
        </div>
      </div>

      {/* Interactive Chat Area Wrapper */}
      <div className="flex-1 relative overflow-hidden bg-[var(--accent-bg)] flex flex-col pt-2">
        <div className="chat-pattern absolute inset-0 pointer-events-none" />

        {/* Messages Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto w-full px-4 lg:px-8 pb-4 custom-scrollbar space-y-6 lg:space-y-8 z-10 scroll-smooth">
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isMe = msg.sender_id === (user as any).id || msg.sender_id === (user as any)._id || msg.sender_id === 'me';
              const sender = activeChat.isGroup
                ? (activeChat as any).participants?.find((p: any) => p._id === msg.sender_id)
                : null;

              return (
                <motion.div
                  key={msg.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 250, damping: 25 }}
                  className={cn("flex gap-3 md:gap-4 w-fit max-w-[85%] lg:max-w-3xl", isMe ? "flex-row-reverse ml-auto" : "flex-row mr-auto")}
                >
                  {!isMe && (
                    <img
                      src={sender?.image || activeChat.avatar_url || `https://ui-avatars.com/api/?name=${sender?.username || 'User'}&background=random`}
                      className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-md"
                      referrerPolicy="no-referrer"
                      alt=""
                    />
                  )}
                  <div className={cn("flex flex-col min-w-0", isMe ? "items-end" : "items-start")}>
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
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="flex items-center gap-3 text-[var(--text-muted)] text-xs font-bold w-fit bg-[var(--bg-card)]/70 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-[var(--border)]/50 mb-4"
              >
                <div className="flex gap-1">
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
        <div className="px-4 lg:px-8 pb-4 lg:pb-8 pt-2 z-10 relative shrink-0">
          <motion.div
            layout
            className="bg-[var(--bg-card)]/80 backdrop-blur-xl rounded-huge p-2 flex items-center gap-2 lg:gap-3 relative border border-[var(--border)] max-w-5xl mx-auto shadow-[0_8px_30px_rgb(0,0,0,0.06)] focus-within:shadow-[0_8px_30px_rgba(13,148,136,0.15)] focus-within:border-[var(--primary-light)] transition-all duration-500"
          >
            <AnimatePresence>
              {showEmoji && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute bottom-[calc(100%+1rem)] left-0 z-50 shadow-2xl rounded-3xl overflow-hidden border border-white/50"
                >
                  <EmojiPicker onEmojiClick={(e) => setInputValue(prev => prev + e.emoji)} />
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => setShowEmoji(!showEmoji)}
              className="p-3 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)] rounded-2xl transition-all cursor-pointer scale-95 hover:scale-100"
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
              className="p-3 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)] rounded-2xl transition-all cursor-pointer scale-95 hover:scale-100"
            >
              <Paperclip size={24} />
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 bg-transparent px-2 lg:px-4 py-2 lg:py-3 outline-none text-[var(--text-main)] font-semibold placeholder:text-slate-400 placeholder:font-medium text-sm lg:text-base"
            />

            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim()}
              className={cn(
                "w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl",
                inputValue.trim() ? "bg-[var(--primary)] text-white scale-100 shadow-[var(--primary-glow)] hover:scale-105" : "bg-[var(--accent-bg)] text-[var(--text-muted)] scale-90 shadow-none"
              )}
            >
              <Send size={24} className={cn("transition-transform duration-300", inputValue.trim() && "translate-x-0.5 -translate-y-0.5")} />
            </button>
          </motion.div>
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
              {selectedStatus.image ? (
                selectedStatus.image?.endsWith('.mp4') || selectedStatus.image?.endsWith('.webm') ? (
                  <video src={selectedStatus.image} className="w-full h-full object-contain bg-black" autoPlay controls />
                ) : (
                  <img src={selectedStatus.image} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                )
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] p-8">
                  <p className="text-white text-3xl font-black text-center leading-tight drop-shadow-xl z-10">{selectedStatus.description}</p>
                </div>
              )}
              
              {selectedStatus.description && selectedStatus.image && (
                <div className="absolute bottom-10 left-0 right-0 p-6 text-center z-20">
                  <p className="text-white text-lg font-bold drop-shadow-md bg-black/40 inline-block px-4 py-2 rounded-2xl backdrop-blur-sm">
                    {selectedStatus.description}
                  </p>
                </div>
              )}

              <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/60 to-transparent flex items-center gap-4">
                <img src={selectedStatus.avatar} className="w-12 h-12 rounded-full border-2 border-[var(--bg-card)]" alt="" referrerPolicy="no-referrer" />
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
                    transition={{ duration: selectedStatus.image?.endsWith('.mp4') ? 30 : 5 }}
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
