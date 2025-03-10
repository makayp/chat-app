interface ChatRoom {
  roomName: string;
  isPrivate: boolean;
  password: string | null;
  users: Record<string, string>; // userId -> access token
}

const activeChats: Record<string, ChatRoom> = {
  'test-room': {
    roomName: 'Test Room',
    isPrivate: false,
    password: null,
    users: {},
  },
}; // Centralized chat storage

export default activeChats;
