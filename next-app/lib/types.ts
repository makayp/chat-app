export type CreateRoomResponse = {
  data?: {
    roomId: string;
  };
  error?: string;
};

export type CheckRoomPrivacyResponse = {
  data?: {
    isPrivate: boolean;
  };
  error?: string;
};

export type CreateRoomParams = {
  roomName: string;
  userToken: string;
};

export type CheckRoomPrivacyParams = {
  roomId: string;
};

export interface ChatRoom {
  id: string;
  name: string;
  messages: ChatMessage[];
  members: Record<string, string>;
  isPrivate: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
}
