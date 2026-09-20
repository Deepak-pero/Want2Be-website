// import api from './api.js'; // Import your existing axios instance

// export const notificationAPI = {
//     // Get all notifications for current user
//     getNotifications: () => api.get('/notifications'),

//     // Mark single notification as read
//     markAsRead: (notificationId) => api.post('/notifications/mark-read', { notificationId }),

//     // Mark all notifications as read
//     markAllAsRead: () => api.post('/notifications/mark-all-read')
// };



// client/src/Api/notificationApi.js
import api from './api';

export const notificationAPI = {
    // ✅ Get all notifications
    getNotifications: () => api.get('/notifications'),

    // ✅ Get unread count
    getUnreadCount: () => api.get('/notifications/unread-count'),

    // ✅ Mark single as read
    markAsRead: (notificationId) => 
        api.post('/notifications/mark-read', { notificationId }),

    // ✅ Mark all as read
    markAllAsRead: () => api.post('/notifications/mark-all-read'),

    // ✅ Delete notification
    deleteNotification: (notificationId) => 
        api.delete(`/notifications/${notificationId}`),
};

export default notificationAPI;