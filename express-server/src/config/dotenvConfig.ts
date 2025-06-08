import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

export const config = {
  IS_PRODUCTION: isProduction,
  PORT: process.env.PORT || 8000,
  FRONTEND_URL: isProduction
    ? process.env.FRONTEND_URL
    : 'http://localhost:3000',
  BACKEND_URL: isProduction ? process.env.BACKEND_URL : 'http://localhost:8000',
  JWT_SECRET: process.env.JWT_SECRET,
};
