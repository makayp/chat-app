'use client';

import { createContext, useContext, useEffect, useReducer } from 'react';
import { useAuth } from './auth-context';

type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Message {
  id: string;
  to: string;
  from: string;
  content: string;
  timestamp: number;
  status: MessageStatus;
  files?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  role: 'user' | 'system';
}

export interface User {
  id: string;
  username: string;
  isOnline: boolean;
  isTyping: boolean;
  lastActive: number;
}

export interface Room {
  id: string;
  name: string;
  users: User[];
  messages: Message[];
  isPrivate: boolean;
  creatorId: string;
}

interface ConnectionState {
  isConnecting: boolean;
  isConnected: boolean;
  isInitialConnect: boolean;
  willReconnect: boolean;
  error: string | null;
}

interface ChatState {
  rooms: Room[];
  activeRoomId: string | null;
  messages: Record<string, Message[]>;
  users: Record<string, User[]>;
  connection: ConnectionState;
  pendingFiles: Record<string, File[]>;
  typingUsers: Record<string, User[]>;
}

type ChatAction =
  | { type: 'SET_ROOMS'; payload: Room[] }
  | { type: 'JOIN_ROOM'; payload: Room }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | {
      type: 'UPDATE_MESSAGE';
      payload: { id: string; updates: Partial<Message> };
    }
  | { type: 'SET_CONNECTION_STATUS'; payload: Partial<ConnectionState> };

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
