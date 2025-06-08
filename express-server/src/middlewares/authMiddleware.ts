import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../config/dotenvConfig';

declare module 'express' {
  export interface Request {
    isAuthenticated?: boolean;
    userId?: string;
    username?: string;
  }
}

// interface CustomJwtPayload extends JwtPayload {
//   userId: string;
//   username: string;
// }

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['authorization'];
  if (!token) {
    res.sendStatus(403);
    return;
  }

  jwt.verify(token, config.JWT_SECRET!, (err) => {
    if (err) {
      res.sendStatus(403);
      return;
    }

    req.isAuthenticated = true;
    next();
  });
}
