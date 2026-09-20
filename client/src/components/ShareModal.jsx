/* eslint-disable no-unused-vars */
// client/src/components/ShareModal.js
import React, { useState, useEffect, useRef } from 'react';
import { dreamAPI } from '../Api/dreamApi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ShareModal = ({ dream, isOpen, onClose }) => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [message, setMessage] = useState('');
    const [isSharing, setIsSharing] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeout = useRef(null);

    // Reset when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setSearchQuery('');
            setSearchResults([]);
            setSelectedUsers([]);
            setMessage('');
        }
    }, [isOpen]);

    // ✅ Debounced search
    useEffect(() => {
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        if (searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        searchTimeout.current = setTimeout(async () => {
            try {
                const response = await dreamAPI.searchUsersToShare(searchQuery);
                if (response.data.success) {
                    // Filter out already selected users
                    const filtered = response.data.users.filter(
                        u => !selectedUsers.some(su => su._id === u._id)
                    );
                    setSearchResults(filtered);
                }
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
    }, [searchQuery, selectedUsers]);

    const handleSelectUser = (userToAdd) => {
        setSelectedUsers(prev => [...prev, userToAdd]);
        setSearchResults(prev => prev.filter(u => u._id !== userToAdd._id));
        setSearchQuery('');
    };

    const handleRemoveUser = (userId) => {
        setSelectedUsers(prev => prev.filter(u => u._id !== userId));
    };

    // ✅ Handle share
    const handleShare = async () => {
        if (selectedUsers.length === 0) {
            toast.error('Please select at least one user');
            return;
        }

        setIsSharing(true);

        try {
            // Share with each selected user
            const sharePromises = selectedUsers.map(u =>
                dreamAPI.shareDream(dream._id, {
                    userId: u._id,
                    message: message.trim()
                })
            );

            const results = await Promise.all(sharePromises);

            const successCount = results.filter(r => r.data.success).length;

            if (successCount > 0) {
                toast.success(
                    `Dream shared with ${successCount} ${successCount === 1 ? 'person' : 'people'}! 🎉`
                );

                // ✅ Copy link to clipboard
                const shareLink = `${window.location.origin}/dream/${dream._id}`;
                try {
                    await navigator.clipboard.writeText(shareLink);
                    toast.success('Link copied to clipboard!');
                } catch (err) {
                    console.log('Clipboard error:', err);
                }

                onClose();
            }
        } catch (error) {
            console.error('❌ Share error:', error);
            toast.error(error.response?.data?.message || 'Failed to share dream');
        } finally {
            setIsSharing(false);
        }
    };

    // ✅ Share via other apps (Web Share API)
    const handleNativeShare = async () => {
        const shareData = {
            title: 'Check out this dream on Want2Be',
            text: dream.content.substring(0, 100) + '...',
            url: `${window.location.origin}/dream/${dream._id}`
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                toast.success('Shared successfully!');
                onClose();
            } else {
                // Fallback: Copy link
                await navigator.clipboard.writeText(shareData.url);
                toast.success('Link copied to clipboard!');
                onClose();
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Share error:', error);
            }
        }
    };

    const renderAvatar = (userData, size = 'w-10 h-10') => {
        if (userData?.profilePicture) {
            return (
                <img
                    src={userData.profilePicture}
                    alt={userData.name}
                    className={`${size} rounded-full object-cover`}
                />
            );
        }
        return (
            <div className={`${size} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold`}>
                {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-lg text-gray-900">
                        Share Dream
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Dream Preview */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-start gap-3">
                        {renderAvatar(dream.user, 'w-8 h-8')}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                                {dream.user?.name}
                            </p>
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                {dream.content}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Selected Users */}
                {selectedUsers.length > 0 && (
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex flex-wrap gap-2">
                            {selectedUsers.map(u => (
                                <div
                                    key={u._id}
                                    className="flex items-center gap-2 bg-blue-50 rounded-full px-3 py-1.5"
                                >
                                    {renderAvatar(u, 'w-6 h-6')}
                                    <span className="text-sm text-gray-800">
                                        {u.name}
                                    </span>
                                    <button
                                        onClick={() => handleRemoveUser(u._id)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Search Input */}
                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search users by name, email, or phone..."
                            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                        {isSearching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Search Results */}
                <div className="flex-1 overflow-y-auto">
                    {searchResults.length > 0 && (
                        <div className="p-2">
                            {searchResults.map(u => (
                                <button
                                    key={u._id}
                                    onClick={() => handleSelectUser(u)}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors"
                                >
                                    {renderAvatar(u)}
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="font-medium text-gray-900 truncate">
                                            {u.name}
                                        </p>
                                        {u.email && (
                                            <p className="text-sm text-gray-500 truncate">
                                                {u.email}
                                            </p>
                                        )}
                                    </div>
                                    <span className="text-blue-500 text-sm font-medium">
                                        Add
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                        <div className="p-8 text-center">
                            <p className="text-gray-500 text-sm">
                                No users found
                            </p>
                        </div>
                    )}

                    {searchQuery.length < 2 && selectedUsers.length === 0 && (
                        <div className="p-8 text-center">
                            <div className="text-4xl mb-2">🔍</div>
                            <p className="text-gray-500 text-sm">
                                Search for users to share this dream with
                            </p>
                        </div>
                    )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Add a message (optional)..."
                        rows="2"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                        maxLength="200"
                    />
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-gray-200 space-y-2">
                    <button
                        onClick={handleShare}
                        disabled={selectedUsers.length === 0 || isSharing}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isSharing ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Sharing...
                            </span>
                        ) : (
                            `Share with ${selectedUsers.length} ${selectedUsers.length === 1 ? 'person' : 'people'}`
                        )}
                    </button>

                    <button
                        onClick={handleNativeShare}
                        className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                    >
                        <span>🔗</span>
                        Share via other apps
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;