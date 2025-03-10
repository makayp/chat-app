import express from 'express';
import { checkPrivacy, createRoom } from '../controllers/chatController';

const router = express.Router();

router.post('/create', createRoom);
router.get('/check-privacy', checkPrivacy);

export default router;
