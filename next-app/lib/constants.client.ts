export const ClientConstants = {
  WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  ALLOWED_FILE_TYPES: ['image/png', 'image/jpeg', 'application/pdf'],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
};
