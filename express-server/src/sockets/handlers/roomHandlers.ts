import { Server, Socket } from 'socket.io';
import { ChatRoom, User } from '../types';
import { generateUUID } from '../../utils/helper';
import PersistentSessionStore from '../../store/SessionStore';
import { RoomStore } from '../../store/RoomStore';
import { getUserSockets, joinUserSocketsToRoom } from '..';

export function roomHandlers(
  io: Server,
  socket: Socket,
  roomStore: RoomStore,
  sessionStore: PersistentSessionStore
) {
  const { userId, username } = socket;

  socket.on('join_room', handleJoinRoom);
  socket.on('create_room', handleCreateRoom);
  socket.on('leave_room', handleLeaveRoom);
  socket.on('typing', handleTyping);
  socket.on('update_username', handleUsernameUpdate);

  async function handleJoinRoom(
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
      if (!password) {
        return callback({
          error: { type: 'password-required', message: 'Password required' },
        });
      }
      return callback({
        error: { type: 'invalid-password', message: 'Invalid password' },
      });
    }

    const user = createUserState(userId, username);
    roomStore.addUserToRoom(roomId, user);
    callback({ room: roomStore.getRoom(roomId)! });

    socket.to(roomId).emit('user_joined', { roomId, user });
    socket.to(userId).emit('room_joined', {
      room: roomStore.getRoom(roomId)!,
    });

    await joinUserSocketsToRoom(io, userId, room.id);
  }

  async function handleCreateRoom(
    { roomName, password }: { roomName: string; password?: string },
    callback: (response: { room: ChatRoom }) => void
  ) {
    const room = createRoom(roomName, userId, username, password);
    roomStore.setRoom(room);
    const { password: _, ...roomWithoutPassword } = room;
    callback({ room: roomWithoutPassword });
    socket.to(userId).emit('room_created', { room: roomWithoutPassword });
    await joinUserSocketsToRoom(io, userId, room.id);
  }

  async function handleLeaveRoom(
    roomId: string,
    callback: ({ success }: { success: boolean }) => void
  ) {
    const success = roomStore.removeUserFromRoom(roomId, userId);
    if (success) {
      socket.to(roomId).emit('user_left', { roomId, userId });
      const userSockets = await getUserSockets(io, userId);
      for (const userSocket of userSockets) {
        userSocket.leave(roomId);
      }
    }
    callback({ success });
  }

  function handleTyping({
    roomId,
    isTyping,
  }: {
    roomId: string;
    isTyping: boolean;
  }) {
    roomStore.updateUserStatus(roomId, userId, { isTyping });
    socket.to(roomId).emit('typing', { roomId, userId, isTyping });
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
