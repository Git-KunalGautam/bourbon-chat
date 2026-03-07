import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useChatStore } from '../stores/useChatStore';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { addMessage, activeChat, setTyping, deleteMessage, updateMessage } = useChatStore();
  const activeChatRef = useRef(activeChat);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.on('receive_message', (message) => {
      if (activeChatRef.current && message.conversation_id === activeChatRef.current.id) {
        addMessage(message);
      }
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
  }, [addMessage, setTyping, deleteMessage, updateMessage]);

  const sendMessage = (message: any) => {
    socketRef.current?.emit('send_message', message);
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

  return { sendMessage, joinRoom, emitTyping, emitStopTyping };
};
