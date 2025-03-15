export type CreateRoomResponse = {
  data?: {
    roomId: string;
    accessToken: string;
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
};

export type CheckRoomPrivacyParams = {
  roomId: string;
};
