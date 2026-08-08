import api from './api.js'; // Import your existing axios instance

export const notificationAPI = {
    // Get all notifications for current user
    getNotifications: () => api.get('/notifications'),

    // Mark single notification as read
    markAsRead: (notificationId) => api.post('/notifications/mark-read', { notificationId }),

    // Mark all notifications as read
    markAllAsRead: () => api.post('/notifications/mark-all-read')
};