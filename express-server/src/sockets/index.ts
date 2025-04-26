import { Server } from 'socket.io';
import authMiddleware from './middlewares/authMiddleware';
import { roomHandlers } from './handlers/roomHandlers';
import { messageHandlers } from './handlers/messageHandlers';
import { roomStore, sessionStore } from '../app';
import { chatMiddleware } from './middlewares/chatMiddleware';

export default function initSocket(io: Server) {
  io.use(authMiddleware(sessionStore));

  io.on('connection', (socket) => {
    const { userId, username, sessionId } = socket;
    console.log(`User ${username} connected with session ID: ${sessionId}`);

    socket.use(chatMiddleware(roomStore, socket));

    sessionStore.saveSession(sessionId, {
      userId,
      username,
      isConnected: true,
      lastActive: Date.now(),
    });

    socket.join(userId);
    socket.emit('session', { userId, username, sessionId });

    const joinedRooms = roomStore.getJoinedRooms(userId);
    socket.emit('rooms', { joinedRooms });

    roomStore.updateUserStatusInAllRooms(userId, {
      isOnline: true,
      lastActive: Date.now(),
    });

    for (const room of joinedRooms) {
      socket.join(room.id);

      io.to(room.id).emit('user_status', {
        userId,
        status: {
          isOnline: true,
          lastActive: Date.now(),
        },
      });
    }

    roomHandlers(io, socket, roomStore, sessionStore);
    messageHandlers(io, socket, roomStore, sessionStore);

    socket.on('disconnect', async () => {
      const matchingSockets = await getUserSockets(io, userId);
      const isDisconnected = matchingSockets.length === 0;

      if (isDisconnected) {
        console.log(`User ${username} is disconnected`);

        roomStore.updateUserStatusInAllRooms(userId, {
          isOnline: false,
          lastActive: Date.now(),
        });

        const joinedRooms = roomStore.getJoinedRooms(userId);

        for (const room of joinedRooms) {
          socket.to(room.id).emit('user_status', {
            userId,
            status: {
              isOnline: false,
              lastActive: Date.now(),
            },
          });
        }

        sessionStore.saveSession(sessionId, {
          userId,
          username,
          isConnected: false,
          lastActive: Date.now(),
        });
      }
    });
  });
}

export async function getUserSockets(io: Server, userId: string) {
  return io.in(userId).fetchSockets();
}

export async function joinUserSocketsToRoom(
  io: Server,
  userId: string,
  roomId: string
) {
  const sockets = await getUserSockets(io, userId);
  for (const socket of sockets) {
    socket.join(roomId);
  }
}
