/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { dreamAPI } from '../Api/dreamApi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import DreamAnalysis from './DreamAnalysis';

// ---------- Likes Modal Component ----------
const LikesModal = ({ likes, isOpen, onClose }) => {
    if (!isOpen) return null;

    const renderAvatar = (userData) => {
        if (userData?.profilePicture) {
            return (
                <img
                    src={userData.profilePicture}
                    alt={userData.name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
            );
        }
        return (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-96 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-lg">Likes</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        ✕
                    </button>
                </div>
                <div className="overflow-y-auto max-h-80">
                    {likes.map(like => (
                        <div key={like._id} className="flex items-center space-x-3 p-4 hover:bg-gray-50">
                            {renderAvatar(like)}
                            <span className="font-medium text-gray-900">{like.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ---------- Single Dream Item ----------
const DreamItem = ({ dream, onLike, onComment, onShare, onDelete, onEdit }) => {
    const { user } = useAuth();
    const [comment, setComment] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(dream?.content || '');

    if (!dream || !dream.user) return null;

    const isLiked = dream.likes?.some(like => like._id === user?.id) || false;
    const isOwner = dream.user._id === user?.id;

    const handleLike = async () => {
        try {
            const res = await dreamAPI.likeDream(dream._id);
            if (res.data.success && res.data.dream) {
                onLike(dream._id, res.data.likes, res.data.liked, { ...res.data.dream, user: dream.user });
            }
        } catch {
            toast.error('Failed to like dream');
        }
    };

    const handleComment = async e => {
        e.preventDefault();
        if (!comment.trim()) return;
        try {
            const res = await dreamAPI.addComment(dream._id, { content: comment });
            if (res.data.success && res.data.dream) {
                setComment('');
                const updatedDream = { ...res.data.dream };
                updatedDream.comments = updatedDream.comments.map(c => ({
                    ...c,
                    user: c.user || { ...dream.user }
                }));
                onComment(dream._id, updatedDream);
                toast.success('Comment added!');
            }
        } catch {
            toast.error('Failed to add comment');
        }
    };

    const handleShare = async () => {
        try {
            const res = await dreamAPI.shareDream(dream._id);
            if (res.data.success) onShare(dream._id, res.data.shares);
        } catch {
            toast.error('Failed to share dream');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this dream?')) return;
        try {
            const res = await dreamAPI.deleteDream(dream._id);
            if (res.data.success) onDelete(dream._id);
        } catch {
            toast.error('Failed to delete dream');
        }
    };
    

    // In DreamItem.js - Add debugging to handleEdit
    const handleEdit = async () => {
        if (!editContent.trim()) return toast.error('Dream content cannot be empty');
        if (editContent === dream.content) {
            console.log('ℹ️ No changes made, skipping update');
            setIsEditing(false);
            return;
        }

        try {
            console.log('✏️ Editing dream:', dream._id);
            console.log('📝 Old content:', dream.content);
            console.log('📝 New content:', editContent);

            const res = await dreamAPI.updateDream(dream._id, { content: editContent });

            if (res.data.success && res.data.dream) {
                console.log('✅ Dream updated successfully:', res.data.dream._id);
                console.log('📦 Updated dream data:', res.data.dream);

                // 🔥 Pass the COMPLETE updated dream object to parent
                onEdit(dream._id, {
                    ...res.data.dream,
                    user: dream.user // Make sure user data is preserved
                });

                setIsEditing(false);
                toast.success('Dream updated!');
            }
        } catch (error) {
            console.error('❌ Error updating dream:', error);
            toast.error('Failed to update dream');
        }
    };

    const formatDate = dateString => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const renderAvatar = userData => {
        if (userData?.profilePicture) {
            return (
                <img
                    src={userData.profilePicture}
                    alt={userData.name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
            );
        }
        return (
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
        );
    };

    return (
        <>
            <div className="bg-white rounded-lg border border-gray-200 mb-4 hover:shadow-sm transition-shadow duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-3">
                    <div className="flex items-center space-x-3">
                        {renderAvatar(dream.user)}
                        <div>
                            <h4 className="font-semibold text-gray-900 text-sm">{dream.user.name}</h4>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <span>{formatDate(dream.createdAt)}</span>
                                {/* <span>•</span>
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                                    {dream.dreamType || 'text'}
                                </span> */}
                            </div>
                        </div>
                    </div>
                    {isOwner && (
                        <div className="flex space-x-1">
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                            >
                                ✏️
                            </button>
                            <button
                                onClick={handleDelete}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                            >
                                🗑️
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="px-3 pb-2">
                    {isEditing ? (
                        <div className="space-y-2 mb-2">
                            <textarea
                                value={editContent}
                                onChange={e => setEditContent(e.target.value)}
                                rows="3"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                autoFocus
                            />
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleEdit}
                                    className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-3 py-1.5 text-xs bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap break-words mb-2">
                            {dream.content}
                        </p>
                    )}
                </div>
                {isOwner && (
                    <div className="px-3 pb-3">
                        <DreamAnalysis
                            dream={dream}
                            onAnalysisComplete={(analysis) => {
                                // Optional: Handle analysis completion
                            }}
                        />
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex border-t border-gray-100 px-2">
                    <button
                        onClick={handleLike}
                        className={`flex-1 flex items-center justify-center space-x-1 py-2 rounded-lg mx-1 text-sm font-medium transition-all duration-200 ${isLiked
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <span className="text-base">{isLiked ? '❤️' : '🤍'}</span>
                        <span>Like</span>
                    </button>

                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex-1 flex items-center justify-center space-x-1 py-2 rounded-lg mx-1 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-all duration-200"
                    >
                        <span>💬</span>
                        <span>Comment</span>
                    </button>

                    <button
                        onClick={handleShare}
                        className="flex-1 flex items-center justify-center space-x-1 py-2 rounded-lg mx-1 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-all duration-200"
                    >
                        <span>🔄</span>
                        <span>Share</span>
                    </button>
                </div>

                {/* states bar */}
                {(dream.likes?.length > 0 || dream.comments?.length > 0) && (
                    <div className="px-3 py-1 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
                        {dream.likes?.length > 0 && (
                            <button
                                onClick={() => setShowLikesModal(true)}
                                className="hover:text-gray-700 transition-colors"
                            >
                                {dream.likes.length} like{dream.likes.length !== 1 ? 's' : ''}
                            </button>
                        )}
                        {dream.comments?.length > 0 && (
                            <button
                                onClick={() => setShowComments(!showComments)}
                                className="hover:text-gray-700 transition-colors"
                            >
                                {dream.comments.length} comment{dream.comments.length !== 1 ? 's' : ''}
                            </button>
                        )}
                    </div>
                )}

                {/* Comments Section */}
                {showComments && (
                    <div className="border-t border-gray-100 p-3 bg-gray-50">
                        <form onSubmit={handleComment} className="flex space-x-2 mb-3">
                            <input
                                type="text"
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                                type="submit"
                                disabled={!comment.trim()}
                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Post
                            </button>
                        </form>

                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {dream.comments?.map(c => (
                                <div key={c._id} className="flex space-x-2">
                                    {renderAvatar(c.user)}
                                    <div className="flex-1 min-w-0">
                                        <div className="bg-white rounded-2xl px-3 py-2 border border-gray-200">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-semibold text-gray-900 text-xs">{c.user?.name}</span>
                                                <span className="text-gray-500 text-xs">{formatDate(c.createdAt)}</span>
                                            </div>
                                            <p className="text-gray-800 text-sm">{c.content}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Likes Modal */}
            <LikesModal
                likes={dream.likes || []}
                isOpen={showLikesModal}
                onClose={() => setShowLikesModal(false)}
            />
        </>
    );
};

// ---------- Dream List Component ----------
const DreamList = ({ dreams, onLike, onComment, onShare, onDelete, onEdit }) => {
    if (!dreams || dreams.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <div className="text-4xl mb-2">🌙</div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No dreams yet</h3>
                <p className="text-gray-600 text-sm">Be the first to share your dream!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 max-w-xl mx-auto">
            {dreams.map(d => (
                <DreamItem
                    key={d._id}
                    dream={d}
                    onLike={onLike}
                    onComment={onComment}
                    onShare={onShare}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    
                />
            ))}
        </div>
    );
};

export default DreamList;