'use client';

import { clientConfig } from '@/lib/constants.client';
import { ChatRoom, Message, User } from '@/types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './auth-context';
import { useWebSocket } from './web-socket-context';

interface ServerError {
  message: 'string';
  type: 'string';
}

export interface ChatState {
  rooms: ChatRoom[];
  activeRoomId: string | null;
  messages: Record<string, Message[]>;
  users: Record<string, User[]>;
  pendingFiles: Record<string, File[] | undefined>;
  typingUsers: Record<string, string[]>;
}

type ChatAction =
  | { type: 'SET_ROOMS'; payload: ChatRoom[] }
  | { type: 'JOIN_ROOM'; payload: ChatRoom }
  | { type: 'LEAVE_ROOM'; payload: string }
  | { type: 'SET_ACTIVE_ROOM_ID'; payload: string | null }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | {
      type: 'UPDATE_MESSAGE';
      payload: { roomId: string; messageId: string; updates: Partial<Message> };
    }
  | { type: 'ADD_USER'; payload: { roomId: string; user: User } }
  | { type: 'REMOVE_USER'; payload: { roomId: string; userId: string } }
  | { type: 'ADD_PENDING_FILE'; payload: File }
  | { type: 'REMOVE_PENDING_FILE'; payload: string }
  | { type: 'CLEAR_PENDING_FILES' }
  | {
      type: 'UPDATE_USER_STATUS';
      payload: {
        userId: string;
        status: {
          isOnline: boolean;
          lastActive: number;
        };
      };
    }
  | {
      type: 'SET_TYPING_USERS';
      payload: { roomId: string; typingUsers: string[] };
    };

interface ChatContextType {
  chatState: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  createRoom: (
    roomName: string,
    password?: string
  ) => Promise<ChatRoom | undefined>;
  joinRoom: (roomId: string, password?: string) => Promise<void>;
  sendMessage: (content: string) => void;
  markMessageAsRead: (roomId: string, messageId: string) => void;
  setTyping: (isTyping: boolean) => void;
}

const initialState: ChatState = {
  activeRoomId: null,
  rooms: [],
  messages: {},
  users: {},
  typingUsers: {},
  pendingFiles: {},
};

// Reducer function
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_ROOMS':
      return {
        ...state,
        rooms: action.payload,
        users: action.payload.reduce(
          (acc, room) => {
            acc[room.id] = room.users;
            return acc;
          },
          { ...state.users }
        ),
        messages: action.payload.reduce(
          (acc, room) => {
            acc[room.id] = room.messages;
            return acc;
          },
          { ...state.messages }
        ),
      };

    case 'JOIN_ROOM':
      // Check if the room already exists in the state
      const updatedRooms = [...state.rooms];
      const existingRoomIndex = state.rooms.findIndex(
        (room) => room.id === action.payload.id
      );
      // If it exists, update the users and messages
      if (existingRoomIndex !== -1) {
        updatedRooms[existingRoomIndex] = {
          ...updatedRooms[existingRoomIndex],
          users: action.payload.users,
          messages: action.payload.messages,
        };
      } else {
        // If it doesn't exist, add the new room
        updatedRooms.push(action.payload);
      }
      return {
        ...state,
        activeRoomId: action.payload.id,
        rooms: updatedRooms,
        users: {
          ...state.users,
          [action.payload.id]: action.payload.users,
        },
        messages: {
          ...state.messages,
          [action.payload.id]: action.payload.messages,
        },
      };
    case 'SET_ACTIVE_ROOM_ID':
      return {
        ...state,
        activeRoomId: action.payload,
      };

    case 'ADD_MESSAGE':
      const existingMessages = state.messages[action.payload.to] || [];
      // Check if the message already exists in the room
      const messageExists = existingMessages.some(
        (message) => message.id === action.payload.id
      );
      // If the message doesn't exist, add it to the messages array
      if (!messageExists) {
        return {
          ...state,
          messages: {
            ...state.messages,
            [action.payload.to]: [...existingMessages, action.payload],
          },
        };
      }

      // If the message already exists, update it
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.to]: existingMessages.map((message) =>
            message.id === action.payload.id
              ? { ...message, ...action.payload }
              : message
          ),
        },
      };

    case 'UPDATE_MESSAGE':
      const { roomId, messageId, updates } = action.payload;
      const roomMessages = state.messages[roomId];
      const updatedRoomMessages = roomMessages.map((message) =>
        message.id === messageId ? { ...message, ...updates } : message
      );
      return {
        ...state,
        messages: {
          ...state.messages,
          [state.activeRoomId!]: updatedRoomMessages,
        },
      };

    case 'ADD_PENDING_FILE':
      return {
        ...state,
        pendingFiles: {
          ...state.pendingFiles,
          [state.activeRoomId!]: [
            ...(state.pendingFiles[state.activeRoomId!] || []),
            action.payload,
          ],
        },
      };

    case 'REMOVE_PENDING_FILE':
      return {
        ...state,
        pendingFiles: {
          ...state.pendingFiles,
          [state.activeRoomId!]: state.pendingFiles[
            state.activeRoomId!
          ]?.filter((file) => file.name !== action.payload),
        },
      };

    case 'CLEAR_PENDING_FILES':
      return {
        ...state,
        pendingFiles: {
          ...state.pendingFiles,
          [state.activeRoomId!]: [],
        },
      };

    case 'ADD_USER':
      const { roomId: addUserRoomId, user } = action.payload;
      return {
        ...state,
        users: {
          ...state.users,
          [addUserRoomId]: [...(state.users[addUserRoomId] || []), user],
        },
      };
    case 'REMOVE_USER':
      const { roomId: removeUserRoomId, userId } = action.payload;
      return {
        ...state,
        users: {
          ...state.users,
          [removeUserRoomId]: state.users[removeUserRoomId].filter(
            (user) => user.id !== userId
          ),
        },
      };

    case 'UPDATE_USER_STATUS':
      const { userId: updateUserId, status } = action.payload;
      const updatedUsers = { ...state.users };
      for (const roomId in updatedUsers) {
        updatedUsers[roomId] = updatedUsers[roomId].map((user) =>
          user.id === updateUserId ? { ...user, ...status } : user
        );
      }
      return {
        ...state,
        users: updatedUsers,
      };

    case 'SET_TYPING_USERS':
      const { roomId: typingRoomId, typingUsers } = action.payload;
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [typingRoomId]: typingUsers,
        },
      };

    default:
      return state;
  }
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chatState, dispatch] = useReducer(chatReducer, initialState);
  const { userId, setUsernameRequired } = useAuth();
  const { socket, connectionState, setConnectionState } = useWebSocket();

  useEffect(() => {
    if (connectionState.error) {
      switch (connectionState.error) {
        case 'username-required':
          setUsernameRequired(true);
          break;
      }
    }
  }, [connectionState.error, setUsernameRequired]);

  useEffect(() => {
    if (!socket) return;
    socket.on('rooms', (data) => {
      // Update chat state with joined rooms
      dispatch({ type: 'SET_ROOMS', payload: data.joinedRooms });
      setConnectionState((prev) => ({
        ...prev,
        isInitialConnect: false,
      }));

      for (const room of data.joinedRooms as ChatRoom[]) {
        const messages = room.messages || [];
        const roomId = room.id;

        // Mark messages as delivered
        messages.forEach((message) => {
          if (message.from !== userId && message.status === 'sent') {
            socket?.emit('message_delivered', {
              roomId,
              messageId: message.id,
            });
          }
        });
      }
    });

    socket.on('new_message', (data) => {
      dispatch({
        type: 'ADD_MESSAGE',
        payload: data.message,
      });

      // Mark message as delivered
      if (data.message.from !== userId) {
        socket?.emit('message_delivered', {
          roomId: data.message.to,
          messageId: data.message.id,
        });
      }
    });

    socket.on('message_status', (data) => {
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          roomId: data.roomId,
          messageId: data.messageId,
          updates: { status: data.status },
        },
      });
    });

    socket.on('user_joined', (data) => {
      console.log('User joined:', data);
      dispatch({
        type: 'ADD_USER',
        payload: { roomId: data.roomId, user: data.user },
      });
    });

    socket.on('user_left', (data) => {
      console.log('User left:', data);
      dispatch({
        type: 'REMOVE_USER',
        payload: { roomId: data.roomId, userId: data.userId },
      });
    });

    socket.on('user_status', (data) => {
      dispatch({
        type: 'UPDATE_USER_STATUS',
        payload: {
          userId: data.userId,
          status: data.status,
        },
      });
    });

    socket.on('typing', (data) => {
      const { roomId, userId, isTyping } = data;
      const typingUsers = chatState.typingUsers[roomId] || [];
      if (isTyping) {
        if (!typingUsers.includes(userId)) {
          typingUsers.push(userId);
        }
      } else {
        const index = typingUsers.indexOf(userId);
        if (index !== -1) {
          typingUsers.splice(index, 1);
        }
      }
      dispatch({
        type: 'SET_TYPING_USERS',
        payload: { roomId, typingUsers },
      });
    });

    return () => {
      socket.off('rooms');
      socket.off('new_message');
      socket.off('message_status');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('user_status');
      socket.off('typing');
    };
  }, [chatState.typingUsers, setConnectionState, socket, userId]);

  // Create a new room
  const createRoom = useCallback(
    async (
      roomName: string,
      password?: string
    ): Promise<ChatRoom | undefined> => {
      if (!socket || !socket.connected) {
        throw new Error('Not connected to server');
      }
      return new Promise((resolve, reject) => {
        socket.emit(
          'create_room',
          { roomName, password },
          (response: { error?: string; room?: ChatRoom }) => {
            if (response.room) {
              dispatch({ type: 'JOIN_ROOM', payload: response.room });

              return resolve(response.room);
            } else {
              reject(new Error('Failed to create room'));
            }
          }
        );
      });
    },
    [socket]
  );

  // Join a room
  const joinRoom = useCallback(
    async (roomId: string, password?: string): Promise<void> => {
      if (!socket || !socket.connected) {
        throw new Error('Not connected to server');
      }

      return new Promise((resolve, reject) => {
        socket.emit(
          'join_room',
          { roomId, password },
          (response: { error?: ServerError; room?: ChatRoom }) => {
            if (response.error) {
              reject(new Error(response.error.message));
            } else if (response.room) {
              dispatch({ type: 'JOIN_ROOM', payload: response.room });

              response.room.messages.forEach((message) => {
                if (message.from !== userId && message.status === 'sent') {
                  socket?.emit('message_delivered', {
                    roomId,
                    messageId: message.id,
                  });
                }
              });
              resolve();
            }
          }
        );
      });
    },
    [socket, userId]
  );

  // Send a message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!chatState.activeRoomId) {
        toast.error('No active room');
        return;
      }

      if (!userId) {
        toast.error('User ID not found');
        return;
      }

      const roomId = chatState.activeRoomId;
      const tempId = Date.now().toString();

      // Process files if any
      const pendingFiles = chatState.pendingFiles[roomId] || [];
      const tempFileData = pendingFiles.map((file) => ({
        url: URL.createObjectURL(file),
        name: file.name,
        type: file.type,
      }));

      const tempMessage: Message = {
        id: tempId,
        to: roomId,
        content,
        from: userId,
        timestamp: Date.now(),
        status: 'sending',
        files: tempFileData,
        role: 'user',
      };

      dispatch({ type: 'ADD_MESSAGE', payload: tempMessage });
      dispatch({ type: 'CLEAR_PENDING_FILES' });

      // Get files for this room

      let fileData = [];

      if (pendingFiles.length > 0) {
        const formData = new FormData();
        pendingFiles.forEach((file) => {
          formData.append('files', file);
        });

        try {
          const res = await fetch(`${clientConfig.backendUrl}/api/upload`, {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) throw new Error('Failed to upload files');

          const data = await res.json();
          fileData = data.urls.map((url: string, i: number) => ({
            url,
            name: pendingFiles[i].name,
            type: pendingFiles[i].type,
          }));
        } catch (error) {
          console.error('File upload failed:', error);
          toast.error('Failed to upload files');
          dispatch({
            type: 'UPDATE_MESSAGE',
            payload: {
              roomId,
              messageId: tempId,
              updates: { status: 'failed' },
            },
          });
          return;
        }
      }

      const message: Message = {
        ...tempMessage,
        files: fileData,
      };

      if (!socket) {
        toast.error('No socket connection');
        return;
      }

      socket.emit(
        'send_message',
        message,
        (response: { error?: string; message?: Message }) => {
          if (response.error) {
            toast.error(response.error);
            dispatch({
              type: 'UPDATE_MESSAGE',
              payload: {
                roomId,
                messageId: tempId,
                updates: { status: 'failed' },
              },
            });
            return;
          }
          if (response && response.message) {
            dispatch({
              type: 'UPDATE_MESSAGE',
              payload: {
                roomId,
                messageId: tempId,
                updates: response.message,
              },
            });
          }
        }
      );
    },
    [chatState.activeRoomId, chatState.pendingFiles, socket, userId]
  );

  // Mark messages as read
  const markMessageAsRead = useCallback(
    (roomId: string, messageId: string) => {
      if (!socket) {
        return;
      }
      socket.emit(
        'message_read',
        { roomId, messageId },
        (response: { success: boolean }) => {
          if (response.success) {
            console.log('Message marked as read:', response);
          } else {
            console.error('Failed to mark message as read:', response);
          }
        }
      );
      // Dispatch to chat context
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          roomId,
          messageId,
          updates: { status: 'read' },
        },
      });
    },
    [socket]
  );

  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (!socket || !socket.connected || !chatState.activeRoomId) {
        return;
      }

      console.log('Typing:', isTyping);
      socket.emit('typing', {
        roomId: chatState.activeRoomId,
        userId,
        isTyping,
      });
    },
    [socket, chatState.activeRoomId, userId]
  );

  const value = {
    chatState,
    dispatch,
    createRoom,
    joinRoom,
    sendMessage,
    markMessageAsRead,
    setTyping,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }

  return context;
}
