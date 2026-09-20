/* eslint-disable no-unused-vars */
// client/src/pages/ReelsPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reelAPI } from '../Api/reelApi';
import toast from 'react-hot-toast';

const ReelsPage = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const containerRef = useRef(null);

    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(true);
    const [showComments, setShowComments] = useState(false);
    const [activeReel, setActiveReel] = useState(null);
    const [commentText, setCommentText] = useState('');

    // ✅ Fetch reels
    const fetchReels = useCallback(async (pageNum = 1, append = false) => {
        try {
            setLoading(true);
            const response = await reelAPI.getFeed(pageNum, 10);

            if (response.data.success) {
                const newReels = response.data.reels;
                setReels(prev => append ? [...prev, ...newReels] : newReels);
                setHasMore(response.data.pagination.hasMore);
            }
        } catch (error) {
            console.error('Fetch reels error:', error);
            toast.error('Failed to load reels');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchReels(1, false);
    }, [isAuthenticated, navigate, fetchReels]);

    // ✅ Handle scroll to next/prev reel
    const handleScroll = (e) => {
        const container = e.target;
        const scrollTop = container.scrollTop;
        const height = container.clientHeight;
        const index = Math.round(scrollTop / height);

        if (index !== currentIndex) {
            setCurrentIndex(index);

            // Increment view for the new active reel
            if (reels[index]) {
                reelAPI.incrementView(reels[index]._id).catch(console.error);
            }

            // Load more when near end
            if (index >= reels.length - 3 && hasMore && !loading) {
                setPage(prev => {
                    const nextPage = prev + 1;
                    fetchReels(nextPage, true);
                    return nextPage;
                });
            }
        }
    };

    // ✅ Handle like
    const handleLike = async (reelId) => {
        try {
            const response = await reelAPI.likeReel(reelId);
            if (response.data.success) {
                setReels(prev =>
                    prev.map(r =>
                        r._id === reelId
                            ? {
                                ...r,
                                isLiked: response.data.isLiked,
                                likeCount: response.data.likeCount
                            }
                            : r
                    )
                );
            }
        } catch (error) {
            toast.error('Failed to like');
        }
    };

    // ✅ Handle comment
    const handleComment = async (reelId) => {
        if (!commentText.trim()) return;

        try {
            const response = await reelAPI.commentOnReel(reelId, commentText);
            if (response.data.success) {
                setReels(prev =>
                    prev.map(r =>
                        r._id === reelId
                            ? {
                                ...r,
                                comments: [...(r.comments || []), response.data.comment],
                                commentCount: response.data.commentCount
                            }
                            : r
                    )
                );
                setCommentText('');
                toast.success('Comment added!');
            }
        } catch (error) {
            toast.error('Failed to comment');
        }
    };

    // ✅ Handle delete
    const handleDelete = async (reelId) => {
        if (!window.confirm('Delete this reel?')) return;

        try {
            const response = await reelAPI.deleteReel(reelId);
            if (response.data.success) {
                setReels(prev => prev.filter(r => r._id !== reelId));
                toast.success('Reel deleted');
            }
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    // ✅ Format number (1.2K, 1.5M)
    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num || 0;
    };

    if (!isAuthenticated) return null;

    if (loading && reels.length === 0) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black pt-16">
            {/* ✅ Reels Container - Vertical Scroll */}
            <div
                ref={containerRef}
                className="h-[calc(100vh-64px)] overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
                onScroll={handleScroll}
            >
                {reels.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-6xl mb-4">📸</div>
                            <h2 className="text-white text-2xl font-semibold mb-2">No reels yet</h2>
                            <p className="text-gray-400 text-sm mb-6">Be the first to post a reel!</p>
                            <button
                                onClick={() => navigate('/reels/create')}
                                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-semibold"
                            >
                                Create Reel
                            </button>
                        </div>
                    </div>
                ) : (
                    reels.map((reel, index) => (
                        <div
                            key={reel._id}
                            className="h-full w-full snap-start snap-always relative flex items-center justify-center"
                        >
                            {/* ✅ Media */}
                            <div className="relative w-full h-full max-w-md mx-auto">
                                {reel.mediaType === 'video' ? (
                                    <video
                                        src={reel.mediaUrl}
                                        className="w-full h-full object-contain"
                                        autoPlay={index === currentIndex}
                                        loop
                                        muted={isMuted}
                                        playsInline
                                        onClick={(e) => {
                                            if (e.target.paused) {
                                                e.target.play();
                                            } else {
                                                e.target.pause();
                                            }
                                        }}
                                    />
                                ) : (
                                    <img
                                        src={reel.mediaUrl}
                                        alt={reel.caption}
                                        className="w-full h-full object-contain"
                                    />
                                )}

                                {/* ✅ Mute button for videos */}
                                {reel.mediaType === 'video' && (
                                    <button
                                        onClick={() => setIsMuted(!isMuted)}
                                        className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white z-20"
                                    >
                                        {isMuted ? '🔇' : '🔊'}
                                    </button>
                                )}

                                {/* ✅ Right Side Actions */}
                                <div className="absolute right-4 bottom-24 flex flex-col items-center space-y-4 z-20">
                                    {/* Like */}
                                    <button
                                        onClick={() => handleLike(reel._id)}
                                        className="flex flex-col items-center group"
                                    >
                                        <span className={`text-3xl transition-transform group-hover:scale-125 ${
                                            reel.isLiked ? '' : 'grayscale'
                                        }`}>
                                            {reel.isLiked ? '❤️' : '🤍'}
                                        </span>
                                        <span className="text-white text-xs font-semibold mt-1">
                                            {formatNumber(reel.likeCount)}
                                        </span>
                                    </button>

                                    {/* Comment */}
                                    <button
                                        onClick={() => {
                                            setActiveReel(reel);
                                            setShowComments(true);
                                        }}
                                        className="flex flex-col items-center group"
                                    >
                                        <span className="text-3xl group-hover:scale-125 transition-transform">
                                            💬
                                        </span>
                                        <span className="text-white text-xs font-semibold mt-1">
                                            {formatNumber(reel.commentCount)}
                                        </span>
                                    </button>

                                    {/* Share */}
                                    <button
                                        onClick={() => {
                                            if (navigator.share) {
                                                navigator.share({
                                                    title: 'Check out this reel',
                                                    url: window.location.href
                                                });
                                            } else {
                                                navigator.clipboard.writeText(window.location.href);
                                                toast.success('Link copied!');
                                            }
                                        }}
                                        className="flex flex-col items-center group"
                                    >
                                        <span className="text-3xl group-hover:scale-125 transition-transform">
                                            📤
                                        </span>
                                    </button>

                                    {/* Delete (only for own reels) */}
                                    {reel.user?._id === (user?._id || user?.id) && (
                                        <button
                                            onClick={() => handleDelete(reel._id)}
                                            className="flex flex-col items-center group"
                                        >
                                            <span className="text-2xl group-hover:scale-125 transition-transform">
                                                🗑️
                                            </span>
                                        </button>
                                    )}
                                </div>

                                {/* ✅ Bottom Info */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-10">
                                    {/* User Info */}
                                    <div className="flex items-center gap-3 mb-2">
                                        <div
                                            onClick={() => navigate(`/profile/${reel.user?._id}`)}
                                            className="cursor-pointer"
                                        >
                                            {reel.user?.profilePicture ? (
                                                <img
                                                    src={reel.user.profilePicture}
                                                    alt={reel.user.name}
                                                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold border-2 border-white">
                                                    {reel.user?.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold text-sm">
                                                {reel.user?.name}
                                            </p>
                                            <p className="text-gray-300 text-xs">
                                                {new Date(reel.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Caption */}
                                    {reel.caption && (
                                        <p className="text-white text-sm line-clamp-2">
                                            {reel.caption}
                                        </p>
                                    )}

                                    {/* Views */}
                                    <p className="text-gray-300 text-xs mt-1">
                                        👁️ {formatNumber(reel.views)} views
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {/* Loading more */}
                {loading && reels.length > 0 && (
                    <div className="h-20 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {!hasMore && reels.length > 0 && (
                    <div className="h-20 flex items-center justify-center text-gray-500 text-sm">
                        You've seen all reels ✨
                    </div>
                )}
            </div>

            {/* ✅ Create Reel Button (FAB) */}
            <button
                onClick={() => navigate('/reels/create')}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full shadow-2xl hover:scale-110 transition-transform z-30 flex items-center justify-center text-2xl"
            >
                +
            </button>

            {/* ✅ Comments Modal */}
            {showComments && activeReel && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center">
                    <div className="bg-white rounded-t-2xl w-full max-w-md max-h-[70vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-semibold">Comments</h3>
                            <button
                                onClick={() => {
                                    setShowComments(false);
                                    setActiveReel(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Comments List */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {activeReel.comments?.length > 0 ? (
                                activeReel.comments.map((comment, i) => (
                                    <div key={i} className="flex gap-3 mb-4">
                                        {comment.user?.profilePicture ? (
                                            <img
                                                src={comment.user.profilePicture}
                                                alt={comment.user.name}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm font-bold">
                                                {comment.user?.name?.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-sm">
                                                {comment.user?.name}
                                            </p>
                                            <p className="text-sm text-gray-700">
                                                {comment.content}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-8">
                                    No comments yet
                                </p>
                            )}
                        </div>

                        {/* Comment Input */}
                        <div className="p-4 border-t">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleComment(activeReel._id);
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => handleComment(activeReel._id)}
                                    disabled={!commentText.trim()}
                                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-medium disabled:opacity-50"
                                >
                                    Post
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReelsPage;