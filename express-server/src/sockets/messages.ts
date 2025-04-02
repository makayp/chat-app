import { Server, Socket } from 'socket.io';
import { roomStore } from '../store/RoomStore';
import { Message } from './types';
import { generateUUID } from '../utils/helper';

export function messageHandlers(io: Server, socket: Socket) {
  const { userId } = socket;

  socket.on('send_message', handleMessage);
  socket.on('message_read', handleMessageRead);
  socket.on('message_delivered', handleMessageDelivered);

  function handleMessage({
    roomId,
    content,
  }: {
    roomId: string;
    content: string;
  }) {
    const message: Message = {
      id: generateUUID(),
      to: roomId,
      from: userId,
      content,
      timestamp: Date.now(),
      status: 'sent',
      role: 'user',
    };

    roomStore.addMessageToRoom(roomId, message);
    io.to(roomId).emit('new_message', message);
  }

  function handleMessageRead({
    messageId,
    roomId,
  }: {
    messageId: string;
    roomId: string;
  }) {
    roomStore.updateMessageStatus(roomId, messageId, 'read');
    io.to(roomId).emit('message_status', { messageId, status: 'read' });
  }

  function handleMessageDelivered({
    messageId,
    roomId,
  }: {
    messageId: string;
    roomId: string;
  }) {
    roomStore.updateMessageStatus(roomId, messageId, 'delivered');
    io.to(roomId).emit('message_status', { messageId, status: 'delivered' });
  }
}
