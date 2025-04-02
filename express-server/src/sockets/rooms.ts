import { Server, Socket } from 'socket.io';
import { roomStore } from '../store/RoomStore';
import { ChatRoom, User } from './types';
import { generateUUID } from '../utils/helper';
import InMemorySessionStore from '../store/SessionStore';

export function roomHandlers(
  io: Server,
  socket: Socket,
  sessionStore: InMemorySessionStore
) {
  const { userId, username } = socket;

  socket.on('join_room', handleJoinRoom);
  socket.on('create_room', handleCreateRoom);
  socket.on('leave_room', handleLeaveRoom);
  socket.on('typing', handleTyping);
  socket.on('update_username', handleUsernameUpdate);

  function handleJoinRoom(
    { roomId, password }: { roomId: string; password?: string },
    callback: (response: {
      error?: { type: string; message: string };
      room?: ChatRoom;
    }) => void
  ) {
    const room = roomStore.getRoomWithPassword(roomId);

    if (!room) {
      return callback({
        error: { type: 'room-not-found', message: 'Room not found' },
      });
    }

    if (room.users.some((u) => u.id === userId)) {
      return callback({
        error: { type: 'already-in-room', message: 'Already in room' },
      });
    }

    if (room.isPrivate && !roomStore.verifyPassword(roomId, password || '')) {
      return callback({
        error: { type: 'invalid-password', message: 'Invalid password' },
      });
    }

    const user = createUserState(userId, username);
    roomStore.addUserToRoom(roomId, user);
    socket.join(roomId);
    callback({ room: roomStore.getRoom(roomId)! });

    socket.to(roomId).emit('user_joined', user);
  }

  function handleCreateRoom(
    { roomName, password }: { roomName: string; password?: string },
    callback: (response: { room: ChatRoom }) => void
  ) {
    const room = createRoom(roomName, userId, username, password);
    roomStore.setRoom(room);
    socket.join(room.id);
    callback({ room });
  }

  function handleLeaveRoom(
    roomId: string,
    callback: (success: boolean) => void
  ) {
    const success = roomStore.removeUserFromRoom(roomId, userId);
    if (success) {
      socket.leave(roomId);
      socket.to(roomId).emit('user_left', { userId, username });
    }
    callback(success);
  }

  function handleTyping({
    roomId,
    isTyping,
  }: {
    roomId: string;
    isTyping: boolean;
  }) {
    roomStore.updateUserStatus(roomId, userId, { isTyping });
    socket.to(roomId).emit('typing', { userId, isTyping });
  }

  function handleUsernameUpdate(
    newUsername: string,
    callback: (success: boolean) => void
  ) {
    if (!newUsername.trim()) return callback(false);

    sessionStore.updateUsername(socket.sessionId, newUsername);
    const success = roomStore.updateUsername(userId, newUsername);

    if (success) {
      socket.username = newUsername;
      io.emit('username_updated', { userId, newUsername });
    }
    callback(success);
  }

  function createUserState(userId: string, username: string): User {
    return {
      id: userId,
      username,
      isOnline: true,
      isTyping: false,
      lastActive: Date.now(),
    };
  }

  function createRoom(
    name: string,
    creatorId: string,
    username: string,
    password?: string
  ): ChatRoom {
    return {
      id: generateUUID(),
      name,
      users: [createUserState(creatorId, username)],
      messages: [],
      isPrivate: !!password,
      password,
      creatorId,
    };
  }
}
