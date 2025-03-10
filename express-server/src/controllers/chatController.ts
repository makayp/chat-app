import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword, comparePassword } from '../utils/bcryptHelper';
import activeChats from '../model/chatStore';
import jwt from 'jsonwebtoken';
import { config } from '../config/dotenvConfig';

export async function createRoom(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { roomName, isPrivate, password } = req.body;

    const roomId = uuidv4();

    const hashedPassword =
      isPrivate && password ? await hashPassword(password) : null;
    activeChats[roomId] = {
      roomName: roomName || `Room - ${roomId}`,
      isPrivate: isPrivate || false,
      password: hashedPassword,
      users: {},
    };

    const token = jwt.sign(
      { roomId, isAdmin: true },
      config.JWT_SECRET + roomId
    );

    res
      .status(201)
      .json({ message: 'Room created successfully', roomId, token });
  } catch (error) {
    next(error);
  }
}

export async function checkPrivacy(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { roomId } = req.query;
    const room = activeChats[roomId as string];

    if (!room) {
      res.status(404).json({ error: 'Room does not exist' });
      return;
    }

    res.status(200).json({ isPrivate: room.isPrivate });
  } catch (error) {
    next(error);
  }
}
