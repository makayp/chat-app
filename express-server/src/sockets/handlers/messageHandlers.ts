import { Server, Socket } from 'socket.io';
import { Message } from '../types';
import { generateUUID } from '../../utils/helper';
import { RoomStore } from '../../store/RoomStore';
import PersistentSessionStore from '../../store/SessionStore';

export function messageHandlers(
  io: Server,
  socket: Socket,
  roomStore: RoomStore,
  _: PersistentSessionStore
) {
  const { userId } = socket;

  socket.on('send_message', handleMessage);
  socket.on('message_read', handleMessageRead);
  socket.on('message_delivered', handleMessageDelivered);

  function handleMessage(
    message: Message,
    callback: ({
      message,
      error,
    }: {
      message?: Message;
      error?: string;
    }) => void
  ) {
    const roomId = message.to;
    const newMessage: Message = {
      id: generateUUID(),
      to: roomId,
      from: userId,
      content: message.content,
      timestamp: Date.now(),
      status: 'sent',
      files: message.files,
      role: 'user',
    };

    roomStore.addMessageToRoom(roomId, newMessage);
    callback({ message: newMessage });
    socket.to(roomId).emit('new_message', { message: newMessage });
  }

  function handleMessageRead({
    roomId,
    messageId,
  }: {
    roomId: string;
    messageId: string;
  }) {
    roomStore.updateMessageStatus(roomId, messageId, 'read');
    io.to(roomId).emit('message_status', { roomId, messageId, status: 'read' });
  }

  function handleMessageDelivered({
    roomId,
    messageId,
  }: {
    messageId: string;
    roomId: string;
  }) {
    const success = roomStore.updateMessageStatus(
      roomId,
      messageId,
      'delivered'
    );

    if (success) {
      io.to(roomId).emit('message_status', {
        roomId,
        messageId,
        status: 'delivered',
      });
    }
  }
}
