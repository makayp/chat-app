import express from 'express';
import corsMiddleware from './config/corsConfig';
import { limiter } from './config/rateLimiter';
import { config } from './config/dotenvConfig';
import chatRoutes from './routes/chatRoutes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(limiter);
app.use(express.json());

// API Routes
app.use('/api/chat', chatRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(config.PORT, () =>
  console.log(`Server running on port ${config.PORT}`)
);
