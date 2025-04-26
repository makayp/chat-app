import express from 'express';
import { uploadMedia, getMedia } from '../controllers/mediaController';
import upload from '../utils/multer';

const router = express.Router();

// Route to get media by filename
router.get('/uploads/:filename', getMedia);
// Route to handle multiple uploads
router.post('/upload', upload.array('files'), uploadMedia);

export default router;
