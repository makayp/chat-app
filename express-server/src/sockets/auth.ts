import { Socket } from 'socket.io';
import InMemorySessionStore from '../store/SessionStore';
import { generateUUID } from '../utils/helper';

export default function authMiddleware(sessionStore: InMemorySessionStore) {
  return (socket: Socket, next: (err?: Error) => void) => {
    const { sessionId, username } = socket.handshake.auth;

    if (sessionId) {
      const session = sessionStore.findSession(sessionId);
      if (session) {
        socket.sessionId = sessionId;
        socket.userId = session.userId;
        socket.username = session.username;
        return next();
      }
    }

    if (!username) return next(new Error('username-required'));

    socket.sessionId = generateUUID();
    socket.userId = generateUUID();
    socket.username = username;
    next();
  };
}
