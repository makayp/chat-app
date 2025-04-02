interface Session {
  id: string;
  userId: string;
  username: string;
  isConnected: boolean;
}

export default class InMemorySessionStore {
  private sessions = new Map<string, Session>();

  findSession(sessionId: string) {
    return this.sessions.get(sessionId);
  }

  saveSession(sessionId: string, session: Omit<Session, 'id'>) {
    this.sessions.set(sessionId, { id: sessionId, ...session });
  }

  updateUsername(sessionId: string, newUsername: string) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.username = newUsername;
      return true;
    }
    return false;
  }

  getAllSessions() {
    return Array.from(this.sessions.values());
  }
}

export const sessionStore = new InMemorySessionStore();
