// client/src/pages/SharedDreams.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dreamAPI } from '../Api/dreamApi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import DreamList from '../components/DreamList';

const SharedDreams = () => {
    // eslint-disable-next-line no-unused-vars
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [dreams, setDreams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchSharedDreams();
    }, [isAuthenticated, navigate]);

    const fetchSharedDreams = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('📥 Fetching shared dreams...');
            const response = await dreamAPI.getSharedDreams();
            
            console.log('✅ Shared dreams:', response.data);
            
            if (response.data.success) {
                setDreams(response.data.dreams || []);
            } else {
                setError(response.data.message || 'Failed to load shared dreams');
            }
        } catch (err) {
            console.error('❌ Error fetching shared dreams:', err);
            setError(err.response?.data?.message || 'Failed to load shared dreams');
            toast.error('Failed to load shared dreams');
        } finally {
            setLoading(false);
        }
    };

    // ✅ Handle actions on shared dreams
    // eslint-disable-next-line no-unused-vars
    const handleLike = async (dreamId, likesCount, isLiked, updatedDream) => {
        try {
            const res = await dreamAPI.likeDream(dreamId);
            if (res.data.success && res.data.dream) {
                setDreams(prev => prev.map(d => 
                    d._id === dreamId 
                        ? { ...res.data.dream, user: d.user, sharedBy: d.sharedBy, sharedAt: d.sharedAt }
                        : d
                ));
            }
        } catch (error) {
            console.error('Like error:', error);
            toast.error('Failed to believe in dream');
        }
    };

    const handleComment = async (dreamId, updatedDream) => {
        setDreams(prev => prev.map(d => 
            d._id === dreamId ? { ...updatedDream, sharedBy: d.sharedBy, sharedAt: d.sharedAt } : d
        ));
    };

    const handleShare = async (dreamId, sharesCount) => {
        setDreams(prev => prev.map(d => 
            d._id === dreamId ? { ...d, sharesCount } : d
        ));
    };

    const handleDelete = (dreamId) => {
        setDreams(prev => prev.filter(d => d._id !== dreamId));
    };

    const handleEdit = (dreamId, updatedDream) => {
        setDreams(prev => prev.map(d => 
            d._id === dreamId ? { ...updatedDream, sharedBy: d.sharedBy, sharedAt: d.sharedAt } : d
        ));
    };

    // ✅ Format date
    const formatDate = (dateString) => {
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

    // ============================================
    // ✅ LOADING STATE
    // ============================================
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading shared dreams...</p>
                </div>
            </div>
        );
    }

    // ============================================
    // ✅ ERROR STATE
    // ============================================
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="text-5xl mb-4">😕</div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Something went wrong
                    </h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={fetchSharedDreams}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* ✅ Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <span>🤝</span>
                                Shared With Me
                            </h1>
                            <p className="text-gray-600 text-sm mt-1">
                                Dreams that others have shared with you
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-blue-600">
                                {dreams.length}
                            </div>
                            <div className="text-xs text-gray-500">
                                {dreams.length === 1 ? 'dream' : 'dreams'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ✅ Empty State */}
                {dreams.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="text-6xl mb-4">📭</div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            No shared dreams yet
                        </h2>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            When someone shares a dream with you, it will appear here.
                            Start by connecting with other dreamers!
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
                        >
                            Explore Dreams
                        </button>
                    </div>
                ) : (
                    <>
                        {/* ✅ Shared Dreams List with "Shared by" info */}
                        <div className="space-y-4">
                            {dreams.map((dream) => (
                                <div key={dream._id}>
                                    {/* ✅ "Shared by" header */}
                                    <div className="flex items-center gap-2 mb-2 px-2">
                                        {dream.sharedBy?.profilePicture ? (
                                            <img
                                                src={dream.sharedBy.profilePicture}
                                                alt={dream.sharedBy.name}
                                                className="w-6 h-6 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                                {dream.sharedBy?.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                        <span className="text-sm text-gray-600">
                                            <span className="font-medium text-gray-900">
                                                {dream.sharedBy?.name || 'Someone'}
                                            </span>
                                            {' '}shared this with you
                                            <span className="text-gray-400 ml-2">
                                                • {formatDate(dream.sharedAt)}
                                            </span>
                                        </span>
                                    </div>

                                    {/* ✅ Share message if any */}
                                    {dream.shareMessage && (
                                        <div className="ml-8 mb-2 p-2 bg-blue-50 border-l-4 border-blue-400 rounded">
                                            <p className="text-sm text-blue-800 italic">
                                                "{dream.shareMessage}"
                                            </p>
                                        </div>
                                    )}

                                    {/* ✅ Dream card */}
                                    <DreamList
                                        dreams={[dream]}
                                        onLike={handleLike}
                                        onComment={handleComment}
                                        onShare={handleShare}
                                        onDelete={handleDelete}
                                        onEdit={handleEdit}
                                    />
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SharedDreams;