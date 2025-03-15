import 'server-only';
import jwt from 'jsonwebtoken';

export const generateToken = () => {
  return jwt.sign(
    { issuer: process.env.NEXT_APP_URL },
    process.env.JWT_SECRET!,
    { expiresIn: '5min' }
  );
};
