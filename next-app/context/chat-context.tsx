'use client';

import { ChatRoom, ConnectionState, Message, User } from '@/types';
import { createContext, useContext, useEffect, useReducer } from 'react';
import { useAuth } from './auth-context';

export interface ChatState {
  rooms: ChatRoom[];
  activeRoomId: string | null;
  messages: Record<string, Message[]>;
  users: Record<string, User[]>;
  connection: ConnectionState;
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
  | { type: 'SET_CONNECTION_STATUS'; payload: Partial<ConnectionState> }
  | {
      type: 'UPDATE_USER_STATUS';
      payload: {
        userId: string;
        status: {
          isOnline: boolean;
          lastActive: number;
        };
      };
    };

interface ChatContextType {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
}

const initialState: ChatState = {
  activeRoomId: null,
  rooms: [],
  messages: {},
  users: {},
  typingUsers: {},
  connection: {
    isConnecting: false,
    isConnected: false,
    isInitialConnect: true,
    willReconnect: false,
    error: null,
  },
  pendingFiles: {},
};

// Reducer function
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        connection: { ...state.connection, ...action.payload },
      };

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

    default:
      return state;
  }
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { setUsernameRequired } = useAuth();

  useEffect(() => {
    if (state.connection.error) {
      switch (state.connection.error) {
        case 'username-required':
          setUsernameRequired(true);
          break;
      }
    }
  }, [state.connection.error, setUsernameRequired]);

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }

  return context;
}
