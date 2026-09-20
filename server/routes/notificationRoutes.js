// import express from 'express';
// import { getUserNotifications, markAsRead, markAllAsRead } from '../controller/notificationController.js';
// import { authenticateToken } from '../middleware/auth.js';

// const router = express.Router();

// router.get('/', authenticateToken, getUserNotifications);
// router.post('/mark-read', authenticateToken, markAsRead);
// router.post('/mark-all-read', authenticateToken, markAllAsRead);

// export default router;




// server/routes/notificationRoutes.js
import express from 'express';
import {
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
} from '../controller/notificationController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// ✅ Get all notifications
router.get('/', authenticateToken, getUserNotifications);

// ✅ Get unread count only
router.get('/unread-count', authenticateToken, getUnreadCount);

// ✅ Mark single notification as read
router.post('/mark-read', authenticateToken, markAsRead);

// ✅ Mark all as read
router.post('/mark-all-read', authenticateToken, markAllAsRead);

// ✅ Delete notification
router.delete('/:notificationId', authenticateToken, deleteNotification);

export default router;