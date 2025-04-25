import { useAuth } from '@/context/auth-context';
import { useChatContext } from '@/context/chat-context';
import { useWebSocket } from '@/context/web-socket-context';
import { ChatRoom, Message, User } from '@/types';
import { useCallback } from 'react';

export function useChat() {
  const {
    chatState,
    dispatch,
    createRoom,
    joinRoom,
    sendMessage,
    setTyping,
    leaveRoom,
  } = useChatContext();

  const { connect, disconnect, connectionState } = useWebSocket();
  const { userId } = useAuth();

  // Set active room
  const setActiveRoomId = useCallback(
    (roomId: string | null) => {
      dispatch({
        type: 'SET_ACTIVE_ROOM_ID',
        payload: roomId,
      });
    },
    [dispatch]
  );

  // Helper function to get active room data
  const getActiveRoom = useCallback((): ChatRoom | null => {
    if (!chatState.activeRoomId) return null;
    return (
      chatState.rooms.find((room) => room.id === chatState.activeRoomId) || null
    );
  }, [chatState.activeRoomId, chatState.rooms]);

  // Helper function to get active room messages
  const getActiveRoomMessages = useCallback((): Message[] => {
    if (!chatState.activeRoomId) return [];
    return chatState.messages[chatState.activeRoomId] || [];
  }, [chatState.activeRoomId, chatState.messages]);

  // Helper function to get active room users
  const getActiveRoomUsers = useCallback((): User[] => {
    if (!chatState.activeRoomId) return [];
    return chatState.users[chatState.activeRoomId] || [];
  }, [chatState.activeRoomId, chatState.users]);

  // Helper function to get typing users in active room
  const getTypingUsers = useCallback((): User[] => {
    if (!chatState.activeRoomId) return [];

    const typingUserIds = chatState.typingUsers[chatState.activeRoomId] || [];
    const roomUsers = chatState.users[chatState.activeRoomId] || [];

    return roomUsers.filter(
      (user) => typingUserIds.includes(user.id) && user.id !== userId
    );
  }, [chatState.activeRoomId, chatState.typingUsers, chatState.users, userId]);

  // Helper function to get pending files in active room
  const getPendingFiles = useCallback((): File[] => {
    if (!chatState.activeRoomId) return [];
    return chatState.pendingFiles[chatState.activeRoomId] || [];
  }, [chatState.activeRoomId, chatState.pendingFiles]);

  // Add pending file
  const addPendingFile = useCallback(
    (file: File) => {
      dispatch({
        type: 'ADD_PENDING_FILE',
        payload: file,
      });
    },
    [dispatch]
  );

  // Remove pending file
  const removePendingFile = useCallback(
    (file: string) => {
      dispatch({
        type: 'REMOVE_PENDING_FILE',
        payload: file,
      });
    },
    [dispatch]
  );

  // Clear pending files
  const clearPendingFiles = useCallback(() => {
    dispatch({
      type: 'CLEAR_PENDING_FILES',
    });
  }, [dispatch]);

  return {
    // Connection State
    connection: connectionState,

    // Room state
    rooms: chatState.rooms,
    activeRoomId: chatState.activeRoomId,
    activeRoom: getActiveRoom(),
    messages: getActiveRoomMessages(),
    users: getActiveRoomUsers(),
    typingUsers: getTypingUsers(),
    pendingFiles: getPendingFiles(),

    // Actions
    connect,
    disconnect,
    createRoom,
    joinRoom,
    setActiveRoomId,
    sendMessage,
    addPendingFile,
    removePendingFile,
    clearPendingFiles,
    setTyping,
    leaveRoom,
  };
}
