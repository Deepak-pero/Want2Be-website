// import Notification from '../models/Notification.js';

// // Get user notifications
// export const getUserNotifications = async (req, res) => {
//     try {
//         const notifications = await Notification.find({ recipient: req.userId })
//             .populate('sender', 'name profilePicture')
//             .populate('dream', 'content')
//             .sort({ createdAt: -1 })
//             .limit(50);

//         res.json({
//             success: true,
//             notifications
//         });
//     } catch (error) {
//         console.error('Error fetching notifications:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to fetch notifications'
//         });
//     }
// };

// // Mark as read
// export const markAsRead = async (req, res) => {
//     try {
//         const { notificationId } = req.body;

//         await Notification.findByIdAndUpdate(notificationId, { isRead: true });

//         res.json({
//             success: true,
//             message: 'Notification marked as read'
//         });
//     } catch (error) {
//         console.error('Error marking notification as read:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to mark notification as read'
//         });
//     }
// };

// // Mark all as read
// export const markAllAsRead = async (req, res) => {
//     try {
//         await Notification.updateMany(
//             { recipient: req.userId, isRead: false },
//             { isRead: true }
//         );

//         res.json({
//             success: true,
//             message: 'All notifications marked as read'
//         });
//     } catch (error) {
//         console.error('Error marking all notifications as read:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to mark all notifications as read'
//         });
//     }
// };




// server/controller/notificationController.js
import Notification from '../models/Notification.js';
import Dream from '../models/Dream.js';
import mongoose from 'mongoose';

// ============================================
// ✅ GET USER NOTIFICATIONS
// ============================================
export const getUserNotifications = async (req, res) => {
    try {
        const userId = req.userId;

        const notifications = await Notification.find({ recipient: userId })
            .populate('sender', 'name profilePicture')
            .populate('dream', 'content')
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({
            recipient: userId,
            isRead: false
        });

        console.log(`📬 Notifications for ${userId}: ${notifications.length} (${unreadCount} unread)`);

        res.json({
            success: true,
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error('❌ Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications'
        });
    }
};

// ============================================
// ✅ GET UNREAD COUNT ONLY
// ============================================
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.userId;

        const count = await Notification.countDocuments({
            recipient: userId,
            isRead: false
        });

        res.json({
            success: true,
            count
        });
    } catch (error) {
        console.error('❌ Error fetching unread count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch unread count'
        });
    }
};

// ============================================
// ✅ MARK SINGLE NOTIFICATION AS READ
// ============================================
export const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.body;
        const userId = req.userId;

        if (!notificationId) {
            return res.status(400).json({
                success: false,
                message: 'Notification ID required'
            });
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, recipient: userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        // ✅ If it's a dream share, mark the shared dream as read too
        if (notification.type === 'dream_share' && notification.dream) {
            const userObjectId = new mongoose.Types.ObjectId(userId);
            
            await Dream.updateMany(
                {
                    _id: notification.dream,
                    'sharedWith.user': userObjectId
                },
                {
                    $set: { 'sharedWith.$[elem].isRead': true }
                },
                {
                    arrayFilters: [{ 'elem.user': userObjectId }]
                }
            );
        }

        res.json({
            success: true,
            notification
        });
    } catch (error) {
        console.error('❌ Error marking as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark as read'
        });
    }
};

// ============================================
// ✅ MARK ALL AS READ
// ============================================
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.userId;

        // Mark all notifications as read
        await Notification.updateMany(
            { recipient: userId, isRead: false },
            { isRead: true }
        );

        // ✅ Also mark all shared dreams as read
        const userObjectId = new mongoose.Types.ObjectId(userId);
        
        await Dream.updateMany(
            {
                'sharedWith.user': userObjectId,
                'sharedWith.isRead': false
            },
            {
                $set: { 'sharedWith.$[elem].isRead': true }
            },
            {
                arrayFilters: [{ 'elem.user': userObjectId }]
            }
        );

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('❌ Error marking all as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark all as read'
        });
    }
};

// ============================================
// ✅ DELETE NOTIFICATION
// ============================================
export const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.userId;

        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            recipient: userId
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (error) {
        console.error('❌ Error deleting notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification'
        });
    }
};

// ============================================
// ✅ CREATE NOTIFICATION HELPER
// ============================================
export const createNotification = async ({
    recipient,
    sender,
    type,
    dream = null,
    commentText = null,
    shareMessage = null,
    dreamContent = null,
    redirectUrl = null
}) => {
    try {
        const notification = await Notification.create({
            recipient: new mongoose.Types.ObjectId(recipient),
            sender: new mongoose.Types.ObjectId(sender),
            type,
            dream,
            commentText,
            shareMessage,
            dreamContent,
            redirectUrl,
            isRead: false
        });

        console.log('✅ Notification created:', notification._id);
        return notification;
    } catch (error) {
        console.error('❌ Error creating notification:', error);
        return null;
    }
};