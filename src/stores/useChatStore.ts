import { create } from 'zustand';

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  message_text: string;
  created_at: string;
  status?: 'sent' | 'delivered' | 'read' | 'seen';
  message_type?: 'text' | 'image' | 'video' | 'file';
  tempId?: string;
  attachment_url?: string;
}

export interface Conversation {
  id: string;
  name: string;
  avatar_url: string;
  last_message?: string;
  last_message_time?: string;
  status?: 'online' | 'offline' | 'typing...';
  isGroup?: boolean;
  isActive?: number;
  members?: Array<{ id: string; name: string; image?: string; username?: string }>;
}

interface ChatState {
  activeChat: Conversation | null;
  conversations: Conversation[];
  messages: Message[];
  typingUser: string | null;
  setActiveChat: (chat: Conversation | null) => void;
  setConversations: (conversations: Conversation[]) => void;
  fetchConversations: () => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, message_text: string) => void;
  updateMessageStatus: (id: string, status: 'sent' | 'delivered' | 'read' | 'seen') => void;
  deleteMessage: (id: string) => void;
  setTyping: (username: string | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeChat: null,
  conversations: [],
  messages: [],
  typingUser: null,
  setActiveChat: (chat) => set({ activeChat: chat, messages: [] }),
  setConversations: (conversations) => set({ conversations }),
  fetchConversations: async () => {
    try {
      const response = await fetch('/api/conversations');
      const data = await response.json();
      if (data.conversations) {
        set({ conversations: data.conversations });
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  },
  fetchMessages: async (chatId: string) => {
    try {
      const response = await fetch(`/api/messages?chat_id=${chatId}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        const formattedMessages = data.map((m: any) => ({
          id: m._id || m.id,
          chat_id: m.chat_id,
          sender_id: m.sender_id,
          message_text: m.message_text,
          message_type: m.message_type,
          attachment_url: m.attachment_url,
          status: m.status || 'sent',
          created_at: m.created_at || m.createdAt,
        }));
        set({ messages: formattedMessages });
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  },
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => {
    // If we received a message with a tempId that matches one of our optimistic messages
    if (message.tempId) {
      const existingIndex = state.messages.findIndex(m => m.id === message.tempId);
      if (existingIndex !== -1) {
        const newMessages = [...state.messages];
        newMessages[existingIndex] = {
          ...message,
          id: message.id // This will be the real MongoDB _id
        };
        return { messages: newMessages };
      }
    }

    if (state.messages.some(m => m.id === message.id)) return state;
    return { messages: [...state.messages, message] };
  }),
  updateMessage: (id, message_text) => set((state) => ({
    messages: state.messages.map(m => m.id === id ? { ...m, message_text } : m)
  })),
  updateMessageStatus: (id, status) => set((state) => ({
    messages: state.messages.map(m => m.id === id ? { ...m, status } : m)
  })),
  deleteMessage: (id) => set((state) => ({
    messages: state.messages.filter(m => m.id !== id)
  })),
  setTyping: (username) => set({ typingUser: username }),
}));
