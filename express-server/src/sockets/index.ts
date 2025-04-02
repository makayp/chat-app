import { Server } from 'socket.io';
import authMiddleware from './auth';
import { roomHandlers } from './rooms';
import { messageHandlers } from './messages';
import { roomStore } from '../store/RoomStore';
import { sessionStore } from '../store/SessionStore';

export default function initSocket(io: Server) {
  io.use(authMiddleware(sessionStore));

  io.on('connection', (socket) => {
    const { userId, username, sessionId } = socket;

    sessionStore.saveSession(sessionId, {
      userId,
      username,
      isConnected: true,
    });

    socket.emit('session', { userId, username, sessionId });

    const joinedRooms = roomStore.getJoinedRooms(userId);
    socket.emit('rooms', { joinedRooms });

    roomStore.updateUserStatusInAllRooms(userId, {
      isOnline: true,
      lastActive: Date.now(),
    });

    roomHandlers(io, socket, sessionStore);
    messageHandlers(io, socket);

    socket.on('disconnect', () => {
      sessionStore.saveSession(sessionId, {
        userId,
        username,
        isConnected: false,
      });

      roomStore.updateUserStatusInAllRooms(userId, {
        isOnline: false,
        isTyping: false,
        lastActive: Date.now(),
      });
    });
  });
}
