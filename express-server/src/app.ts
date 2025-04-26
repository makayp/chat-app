import http from 'http';
import express from 'express';
import cors from 'cors';
import initSocket from './sockets';
import uploadRoute from './routes/uploadRoutes';
import PersistentSessionStore from './store/SessionStore';
import { Server } from 'socket.io';
import { corsOptions } from './config/corsConfig';
import { limiter } from './config/rateLimiter';
import { config } from './config/dotenvConfig';
import { errorHandler } from './middlewares/errorHandler';
import { RoomStore } from './store/RoomStore';

export const sessionStore = new PersistentSessionStore();
export const roomStore = new RoomStore();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    ...corsOptions,
  },
});

// Middleware
app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json());

// API Routes
app.use('/api', uploadRoute);

// WebSockets
initSocket(io);

// Error handling
app.use(errorHandler);

// Start server
server.listen(config.PORT, () =>
  console.log(`Server running on port ${config.PORT}`)
);
