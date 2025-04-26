import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: process.env.PORT || 8000,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8000',
  JWT_SECRET: process.env.JWT_SECRET,
};
