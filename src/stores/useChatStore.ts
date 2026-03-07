import { create } from 'zustand';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  type?: 'text' | 'image' | 'video';
}

export interface Conversation {
  id: string;
  name: string;
  avatar_url: string;
  last_message?: string;
  last_message_time?: string;
  status?: 'online' | 'offline' | 'typing...';
  isGroup?: boolean;
}

interface ChatState {
  activeChat: Conversation | null;
  messages: Message[];
  typingUser: string | null;
  setActiveChat: (chat: Conversation | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, content: string) => void;
  deleteMessage: (id: string) => void;
  setTyping: (username: string | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeChat: null,
  messages: [],
  typingUser: null,
  setActiveChat: (chat) => set({ activeChat: chat, messages: [] }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  updateMessage: (id, content) => set((state) => ({
    messages: state.messages.map(m => m.id === id ? { ...m, content } : m)
  })),
  deleteMessage: (id) => set((state) => ({
    messages: state.messages.filter(m => m.id !== id)
  })),
  setTyping: (username) => set({ typingUser: username }),
}));
