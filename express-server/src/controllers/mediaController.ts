import { Request, Response } from 'express';
import { config } from '../config/dotenvConfig';
import path from 'path';
import fs from 'fs';

export async function uploadMedia(req: Request, res: Response) {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || !Array.isArray(files) || files.length === 0) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    const urls = files.map(
      (file) => `${config.BACKEND_URL}/api/uploads/${file.filename}`
    );

    res.status(200).json({ urls });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getMedia(req: Request, res: Response) {
  const { filename } = req.params;
  const imagePath = path.join(__dirname, '../../uploads', filename);

  if (!fs.existsSync(imagePath)) {
    res.status(404).send('File not found');
    return;
  }

  res.sendFile(imagePath);
}
