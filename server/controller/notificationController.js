import Notification from '../models/Notification.js';

// Get user notifications
export const getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.userId })
            .populate('sender', 'name profilePicture')
            .populate('dream', 'content')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            success: true,
            notifications
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications'
        });
    }
};

// Mark as read
export const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.body;

        await Notification.findByIdAndUpdate(notificationId, { isRead: true });

        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read'
        });
    }
};

// Mark all as read
export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.userId, isRead: false },
            { isRead: true }
        );

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark all notifications as read'
        });
    }
};