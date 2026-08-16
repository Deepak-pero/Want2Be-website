import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // Add this import
import { notificationAPI } from '../Api/notificationApi';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuth();
    const navigate = useNavigate(); // Add navigate hook
    const socketRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            setupSocket();
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const setupSocket = () => {
        socketRef.current = io("https://want2be-backend-689107792668.asia-south1.run.app");

        // Join user's personal room
        socketRef.current.emit('join-user', user._id);

        // Listen for new notifications
        socketRef.current.on('new-notification', (notification) => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Show toast notification
            showToastNotification(notification);
        });

        // Handle connection errors
        socketRef.current.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
    };

    const showToastNotification = (notification) => {
        const message = getNotificationMessage(notification);
        const senderName = notification.sender?.name || 'Someone';
        const userAvatar = notification.sender?.profilePicture;

        // Custom toast with clickable user profile
        toast.custom((t) => (
            <div
                className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
                    max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 cursor-pointer`}
                onClick={() => {
                    handleUserProfileClick(notification.sender?._id);
                    toast.dismiss(t.id);
                }}
            >
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                            {userAvatar ? (
                                <img className="h-10 w-10 rounded-full" src={userAvatar} alt={senderName} />
                            ) : (
                                <div className="h-10 w-10 bg-gradient-to-br from-red-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
                                    {senderName.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900 hover:text-purple-600 transition-colors">
                                {senderName}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                {message}
                            </p>
                            {notification.commentText && (
                                <p className="mt-1 text-xs text-gray-400 italic">
                                    "{notification.commentText}"
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-gray-200">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toast.dismiss(t.id);
                        }}
                        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Close
                    </button>
                </div>
            </div>
        ), {
            duration: 5000,
            position: 'top-right',
        });
    };

    const fetchNotifications = async () => {
        try {
            const response = await notificationAPI.getNotifications();
            if (response.data.success) {
                setNotifications(response.data.notifications);
                setUnreadCount(response.data.notifications.filter(n => !n.isRead).length);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await notificationAPI.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(notif =>
                    notif._id === notificationId ? { ...notif, isRead: true } : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
            setUnreadCount(0);
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    // NEW FUNCTION: Handle user profile click
    const handleUserProfileClick = (userId) => {
        if (!userId) return;

        setShowDropdown(false);
        navigate(`/profile/${userId}`);
    };

    // NEW FUNCTION: Handle notification click (mark as read + optional profile navigation)
    const handleNotificationClick = (notification, e) => {
        // Mark as read
        handleMarkAsRead(notification._id);

        // If click was on user avatar or name, navigate to profile
        const isUserElement = e.target.closest('.user-profile-element');
        if (isUserElement && notification.sender?._id) {
            navigate(`/profile/${notification.sender._id}`);
        }
    };

    const getNotificationMessage = (notification) => {
        switch (notification.type) {
            case 'like':
                return 'liked your dream';
            case 'comment':
                return 'commented on your dream';
            case 'share':
                return 'shared your dream';
            default:
                return 'interacted with your dream';
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'like':
                return '❤️';
            case 'comment':
                return '💬';
            case 'share':
                return '🔄';
            default:
                return '🔔';
        }
    };

    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Notification Bell */}
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 text-gray-600 hover:text-purple-600 transition-colors duration-200 group"
            >
                <div className="w-10 h-10 rounded-full bg-gray-100 hover:bg-purple-100 flex items-center justify-center transition-colors duration-200 group-hover:scale-110">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-4.66-6.24M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>

                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="text-sm text-purple-600 hover:text-purple-700 font-medium px-3 py-1 rounded-lg hover:bg-purple-50 transition-colors"
                                    >
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowDropdown(false)}
                                    className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto max-h-80">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-4.66-6.24M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 text-sm">No notifications yet</p>
                                <p className="text-gray-400 text-xs mt-1">When someone interacts with your dreams, you'll see it here</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                        }`}
                                    onClick={(e) => handleNotificationClick(notification, e)}
                                >
                                    <div className="flex items-start space-x-3">
                                        {/* User Avatar - Clickable */}
                                        <div
                                            className="flex-shrink-0 user-profile-element cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (notification.sender?._id) {
                                                    handleUserProfileClick(notification.sender._id);
                                                }
                                            }}
                                        >
                                            {notification.sender?.profilePicture ? (
                                                <img
                                                    src={notification.sender.profilePicture}
                                                    alt={notification.sender.name}
                                                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform duration-200"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-sm hover:scale-110 transition-transform duration-200">
                                                    {notification.sender?.name?.charAt(0) || 'U'}
                                                </div>
                                            )}
                                        </div>

                                        {/* Notification Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-800">
                                                        <span
                                                            className="font-semibold text-gray-900 hover:text-purple-600 transition-colors user-profile-element cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (notification.sender?._id) {
                                                                    handleUserProfileClick(notification.sender._id);
                                                                }
                                                            }}
                                                        >
                                                            {notification.sender?.name || 'Someone'}
                                                        </span>
                                                        {' '}
                                                        {getNotificationMessage(notification)}
                                                    </p>
                                                    {notification.commentText && (
                                                        <p className="text-xs text-gray-600 mt-1 bg-gray-100 p-2 rounded-lg">
                                                            "{notification.commentText}"
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {getTimeAgo(notification.createdAt)}
                                                    </p>
                                                </div>
                                                <div className="flex-shrink-0 ml-2">
                                                    <span className="text-lg">
                                                        {getNotificationIcon(notification.type)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={() => {
                                    setShowDropdown(false);
                                    navigate('/notifications');
                                }}
                                className="w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium py-2 rounded-lg hover:bg-purple-50 transition-colors"
                            >
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;