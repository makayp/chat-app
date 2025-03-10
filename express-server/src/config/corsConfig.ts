import cors from 'cors';
import { config } from './dotenvConfig';

export const corsOptions = {
  origin: config.FRONTEND_URL,
  methods: ['GET', 'POST'],
};

export default cors(corsOptions);
