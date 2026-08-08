import express from 'express';
import { getUserNotifications, markAsRead, markAllAsRead } from '../controller/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getUserNotifications);
router.post('/mark-read', authenticateToken, markAsRead);
router.post('/mark-all-read', authenticateToken, markAllAsRead);

export default router;