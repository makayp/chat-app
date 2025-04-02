import { Socket } from 'socket.io';

export type MessageStatus =
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed';

export interface Message {
  id: string;
  to: string;
  from: string;
  content: string;
  timestamp: number;
  status: MessageStatus;
  files?: Array<{ name: string; url: string; type: string }>;
  role: 'user' | 'system';
}

export interface User {
  id: string;
  username: string;
  isOnline: boolean;
  isTyping: boolean;
  lastActive: number;
}

export interface ChatRoom {
  id: string;
  name: string;
  users: User[];
  password?: string;
  messages: Message[];
  isPrivate: boolean;
  creatorId: string;
}

declare module 'socket.io' {
  export interface Socket {
    sessionId: string;
    userId: string;
    username: string;
  }
}
