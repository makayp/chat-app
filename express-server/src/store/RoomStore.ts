import { ChatRoom, User, Message, MessageStatus } from '../sockets/types';

export class RoomStore {
  private rooms = new Map<string, ChatRoom>();

  setRoom(room: ChatRoom) {
    this.rooms.set(room.id, room);
  }

  getRoom(roomId: string): Omit<ChatRoom, 'password'> | null {
    const room = this.rooms.get(roomId);
    return room ? this.sanitizeRoom(room) : null;
  }

  getRoomWithPassword(roomId: string): ChatRoom | null {
    return this.rooms.get(roomId) || null;
  }

  verifyPassword(roomId: string, password: string): boolean {
    return this.rooms.get(roomId)?.password === password;
  }

  addUserToRoom(roomId: string, user: User) {
    const room = this.rooms.get(roomId);
    if (room && !room.users.some((u) => u.id === user.id)) {
      room.users.push(user);
    }
  }

  removeUserFromRoom(roomId: string, userId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const initialLength = room.users.length;
    room.users = room.users.filter((user) => user.id !== userId);

    if (room.users.length === 0) {
      this.rooms.delete(roomId);
    }

    return initialLength !== room.users.length;
  }

  addMessageToRoom(roomId: string, message: Message) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.messages.push(message);
    }
  }

  updateMessageStatus(
    roomId: string,
    messageId: string,
    status: MessageStatus
  ) {
    const room = this.rooms.get(roomId);
    const message = room?.messages.find((m) => m.id === messageId);
    if (message) {
      message.status = status;
    }
  }

  updateUsername(userId: string, newUsername: string): boolean {
    let updated = false;
    this.rooms.forEach((room) => {
      room.users.forEach((user) => {
        if (user.id === userId) {
          user.username = newUsername;
          updated = true;
        }
      });
    });
    return updated;
  }

  updateUserStatus(roomId: string, userId: string, status: Partial<User>) {
    const room = this.rooms.get(roomId);
    const user = room?.users.find((u) => u.id === userId);
    if (user) {
      Object.assign(user, status);
      user.lastActive = Date.now();
    }
  }

  updateUserStatusInAllRooms(userId: string, status: Partial<User>) {
    this.rooms.forEach((room) => {
      const user = room.users.find((u) => u.id === userId);
      if (user) {
        Object.assign(user, status);
        user.lastActive = Date.now();
      }
    });
  }

  getJoinedRooms(userId: string): Array<Omit<ChatRoom, 'password'>> {
    return Array.from(this.rooms.values())
      .filter((room) => room.users.some((u) => u.id === userId))
      .map((room) => this.sanitizeRoom(room));
  }

  private sanitizeRoom(room: ChatRoom): Omit<ChatRoom, 'password'> {
    const { password, ...sanitized } = room;
    return sanitized;
  }
}

export const roomStore = new RoomStore();
