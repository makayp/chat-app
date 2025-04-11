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

export interface ChatRoom {
  id: string;
  name: string;
  users: User[];
  messages: Message[];
  isPrivate: boolean;
  creatorId: string;
}

export interface ConnectionState {
  isConnecting: boolean;
  isConnected: boolean;
  isInitialConnect: boolean;
  willReconnect: boolean;
  error: string | null;
}
