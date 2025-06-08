import { config } from './dotenvConfig';

const { FRONTEND_URL, IS_PRODUCTION } = config;

export const corsOptions = {
  origin: IS_PRODUCTION ? FRONTEND_URL : '*',
  methods: ['GET', 'POST'],
};
