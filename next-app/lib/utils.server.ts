'use server';
import jwt from 'jsonwebtoken';

export async function generateToken({
  userId,
  username,
}: {
  userId: string;
  username: string;
}) {
  return jwt.sign(
    { issuer: process.env.NEXT_APP_URL, userId, username },
    process.env.JWT_SECRET!,
    { expiresIn: '5min' }
  );
}
