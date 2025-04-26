import { Event, Socket } from 'socket.io';
import { RoomStore } from '../../store/RoomStore';

export function chatMiddleware(roomStore: RoomStore, socket: Socket) {
  return (packet: Event, next: (err?: Error) => void) => {
    const [event, data, callback] = packet;

    const protectedEvents = new Set([
      'send_message',
      'typing',
      'message_read',
      'message_delivered',
    ]);

    if (!protectedEvents.has(event)) {
      return next();
    }

    const roomId = data?.roomId || data?.to;

    if (!roomId) {
      return typeof callback === 'function'
        ? callback({ error: 'Missing roomId or to field' })
        : next(new Error('Missing roomId or to field'));
    }

    const isMember = roomStore.isUserInRoom(roomId, socket.userId);

    if (!isMember) {
      console.warn(
        `User ${socket.userId} tried to access room ${roomId} without permission`
      );
      return typeof callback === 'function'
        ? callback({
            error: 'The Room does not exist or you are not a member.',
          })
        : next(new Error('Access denied: not a member of this room'));
    }

    next();
  };
}
