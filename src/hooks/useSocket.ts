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
        body: message.content,
        icon: "/favicon.ico", // Or recipient avatar if available
      });
    }
  };

  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.on('receive_message', (message) => {
      // Get current user from auth store
      const currentUser = (useAuthStore.getState() as any).user;
      const myId = currentUser?.id || currentUser?._id;

      if (activeChatRef.current && message.conversation_id === activeChatRef.current.id) {
        addMessage(message);
        
        // Mark as delivered if not me
        if (message.sender_id !== 'me' && message.sender_id !== myId) {
          emitDelivered(message.id, message.conversation_id);
          
          // Show browser notification if tab hidden or not looking at this chat
          if (document.visibilityState === 'hidden' || activeChatRef.current?.id !== message.conversation_id) {
            showNotification(message);
          }
          
          // Also mark as read automatically if we ARE currently in the chat and tab is visible
          if (document.visibilityState === 'visible' && activeChatRef.current?.id === message.conversation_id) {
            emitRead(message.id, message.conversation_id);
          }
        }
      } else {
        // Message received for non-active chat
        if (message.sender_id !== 'me' && message.sender_id !== myId) {
          emitDelivered(message.id, message.conversation_id);
          showNotification(message);
        }
      }
    });

    socket.on('message_status_update', (data) => {
      updateMessageStatus(data.id, data.status);
    });

    socket.on('user_typing', (data) => {
      if (activeChatRef.current && data.conversationId === activeChatRef.current.id) {
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
      updateMessage(data.id, data.content);
    });

    return () => {
      socket.disconnect();
    };
  }, [addMessage, setTyping, deleteMessage, updateMessage, updateMessageStatus]);

  const sendMessage = (message: any) => {
    socketRef.current?.emit('send_message', message);
  };

  const emitDelivered = (messageId: string, conversationId: string) => {
    socketRef.current?.emit('message_delivered', { messageId, conversationId });
  };

  const emitRead = (messageId: string, conversationId: string) => {
    socketRef.current?.emit('message_read', { messageId, conversationId });
  };

  const emitTyping = (conversationId: string, username: string) => {
    socketRef.current?.emit('typing', { conversationId, username });
  };

  const emitStopTyping = (conversationId: string) => {
    socketRef.current?.emit('stop_typing', { conversationId });
  };

  const joinRoom = (roomId: string) => {
    socketRef.current?.emit('join_room', roomId);
  };

  return { sendMessage, joinRoom, emitTyping, emitStopTyping, emitDelivered, emitRead };
};
