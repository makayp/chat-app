import { useAuth } from '@/context/auth-context';
import { useChatContext } from '@/context/chat-context';
import { useWebSocket } from '@/context/web-socket-context';
import { ChatRoom, Message, User } from '@/types';
import { useCallback } from 'react';

export function useChat() {
  const { state, dispatch } = useChatContext();
  const { userId } = useAuth();

  // Initialize WebSocket connection and get methods
  const {
    connect,
    disconnect,
    joinRoom,
    createRoom,
    sendMessage,
    markMessageAsRead,
  } = useWebSocket();

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
    if (!state.activeRoomId) return null;
    return state.rooms.find((room) => room.id === state.activeRoomId) || null;
  }, [state.activeRoomId, state.rooms]);

  // Helper function to get active room messages
  const getActiveRoomMessages = useCallback((): Message[] => {
    if (!state.activeRoomId) return [];
    return state.messages[state.activeRoomId] || [];
  }, [state.activeRoomId, state.messages]);

  // Helper function to get active room users
  const getActiveRoomUsers = useCallback((): User[] => {
    if (!state.activeRoomId) return [];
    return state.users[state.activeRoomId] || [];
  }, [state.activeRoomId, state.users]);

  // Helper function to get typing users in active room
  const getTypingUsers = useCallback((): User[] => {
    if (!state.activeRoomId) return [];

    const typingUserIds = state.typingUsers[state.activeRoomId] || [];
    const roomUsers = state.users[state.activeRoomId] || [];

    return roomUsers.filter(
      (user) => typingUserIds.includes(user.id) && user.id !== userId
    );
  }, [state.activeRoomId, state.typingUsers, state.users, userId]);

  // Helper function to get pending files in active room
  const getPendingFiles = useCallback((): File[] => {
    if (!state.activeRoomId) return [];
    return state.pendingFiles[state.activeRoomId] || [];
  }, [state.activeRoomId, state.pendingFiles]);

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
    connection: { ...state.connection, connect, disconnect },

    // Room state
    rooms: state.rooms,
    activeRoomId: state.activeRoomId,
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
    markMessageAsRead,
  };
}
