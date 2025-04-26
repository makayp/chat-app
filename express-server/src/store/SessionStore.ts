import fs from 'fs';
import path from 'path';

interface Session {
  id: string;
  userId: string;
  username: string;
  isConnected: boolean;
  lastActive?: number;
}

export default class PersistentSessionStore {
  private sessions = new Map<string, Session>();
  private readonly filePath = path.join(__dirname, '../../data/sessions.json');

  constructor() {
    console.log('Initializing PersistentSessionStore');
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Load existing sessions if file exists
    if (fs.existsSync(this.filePath)) {
      try {
        const data = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(data);
        parsed.forEach((session: Session) => {
          this.sessions.set(session.id, session);
        });
      } catch (err) {
        console.error('Failed to load sessions:', err);
      }
    }
  }

  private saveSessions() {
    try {
      fs.writeFileSync(
        this.filePath,
        JSON.stringify([...this.sessions.values()], null, 2)
      );
    } catch (err) {
      console.error('Failed to save sessions:', err);
    }
  }

  findSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  saveSession(sessionId: string, session: Omit<Session, 'id'>): void {
    this.sessions.set(sessionId, { id: sessionId, ...session });
    this.saveSessions();
  }

  updateUsername(sessionId: string, newUsername: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.username = newUsername;
      this.saveSessions();
      return true;
    }
    return false;
  }

  getAllSessions(): Session[] {
    return Array.from(this.sessions.values());
  }

  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.saveSessions();
  }
}
