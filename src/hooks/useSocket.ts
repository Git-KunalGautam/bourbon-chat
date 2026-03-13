import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useChatStore } from '../stores/useChatStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useUIStore } from '../stores/useUIStore';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { addMessage, activeChat, setTyping, deleteMessage, updateMessage, updateMessageStatus } = useChatStore();
  const activeChatRef = useRef(activeChat);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  const showNotification = (message: any) => {
    const isEnabled = useUIStore.getState().browserNotifications;
    if (isEnabled && typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification("New Message", {
        body: message.message_text || message.content,
        icon: "/favicon.ico",
      });
    }
  };

  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.on('receive_message', (message) => {
      const currentUser = (useAuthStore.getState() as any).user;
      const myId = currentUser?.id || currentUser?._id;

      const chatId = message.chat_id || message.conversation_id;

      if (activeChatRef.current && chatId === activeChatRef.current.id) {
        addMessage({
          ...message,
          id: message._id || message.id,
          chat_id: chatId,
          message_text: message.message_text || message.content,
          message_type: message.message_type || message.type,
          created_at: message.created_at || message.createdAt
        });
        
        if (message.sender_id !== 'me' && message.sender_id !== myId) {
          emitDelivered(message._id || message.id, chatId, myId);
          
          if (document.visibilityState === 'hidden' || activeChatRef.current?.id !== chatId) {
            showNotification(message);
          }
          
          if (document.visibilityState === 'visible' && activeChatRef.current?.id === chatId) {
            emitRead(message._id || message.id, chatId, myId);
          }
        }
      } else {
        if (message.sender_id !== 'me' && message.sender_id !== myId) {
          emitDelivered(message._id || message.id, chatId, myId);
          showNotification(message);
        }
      }
    });

    socket.on('message_status_update', (data) => {
      updateMessageStatus(data.id, data.status);
    });

    socket.on('user_typing', (data) => {
      const chatId = data.chatId || data.conversationId;
      if (activeChatRef.current && chatId === activeChatRef.current.id) {
        setTyping(data.username);
      }
    });

    socket.on('user_stop_typing', () => {
      setTyping(null);
    });

    socket.on('message_deleted', (id) => {
      deleteMessage(id);
    });

    socket.on('message_updated', (data) => {
      updateMessage(data.id, data.message_text || data.content);
    });

    return () => {
      socket.disconnect();
    };
  }, [addMessage, setTyping, deleteMessage, updateMessage, updateMessageStatus]);

  const sendMessage = (message: any) => {
    socketRef.current?.emit('send_message', message);
  };

  const emitDelivered = (messageId: string, chatId: string, userId: string) => {
    socketRef.current?.emit('message_delivered', { messageId, chatId, userId });
  };

  const emitRead = (messageId: string, chatId: string, userId: string) => {
    socketRef.current?.emit('message_read', { messageId, chatId, userId });
  };

  const emitTyping = (chatId: string, username: string) => {
    socketRef.current?.emit('typing', { chatId, username });
  };

  const emitStopTyping = (chatId: string) => {
    socketRef.current?.emit('stop_typing', { chatId });
  };

  const joinRoom = (roomId: string) => {
    socketRef.current?.emit('join_room', roomId);
  };

  return { sendMessage, joinRoom, emitTyping, emitStopTyping, emitDelivered, emitRead };
};
