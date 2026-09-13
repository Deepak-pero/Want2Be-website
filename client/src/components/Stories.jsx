// client/src/components/Stories.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllUsersWithStories, uploadStory } from '../Api/storyApi';
import toast from 'react-hot-toast';


const getAvatarUrl = (name, picture) =>
    picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=6C63FF&color=fff&size=128`;

const Stories = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const scrollContainerRef = useRef(null);

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [viewedGroups] = useState({});

    
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    // ✅ Fetch all users with story status
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getAllUsersWithStories();
            
            if (response.success) {
                // ✅ Create infinite loop by duplicating users 5 times
                const duplicatedUsers = [];
                for (let i = 0; i < 5; i++) {
                    duplicatedUsers.push(...response.users);
                }
                setUsers(duplicatedUsers);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load stories');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // ✅ Handle click on user
    const handleUserClick = (userData) => {
        if (userData.isCurrentUser) {
            if (userData.hasStory) {
                navigate(`/story/${userData.userId}`);
            } else {
                fileInputRef.current?.click();
            }
            return;
        }

        if (userData.hasStory) {
            navigate(`/story/${userData.userId}`);
        } else {
            navigate(`/profile/${userData.userId}`);
        }
    };

    // ✅ Handle file upload
    const handleUploadStory = async (file) => {
        if (!user) {
            toast.error('Please login to upload stories');
            return;
        }

        if (!file) {
            fileInputRef.current?.click();
            return;
        }

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload only images');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('story', file);
            formData.append('type', 'image');

            await uploadStory(formData);
            toast.success('Story uploaded successfully! 🎉');
            await fetchUsers();
        } catch (error) {
            console.error('Error uploading story:', error);
            toast.error(error.response?.data?.message || 'Failed to upload story');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleFileSelected = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            await handleUploadStory(file);
        }
        e.target.value = '';
    };

    // ✅ Get ring class based on story status
    const getRingClass = (hasStory, viewed = false) => {
        if (!hasStory) return 'bg-transparent';
        if (viewed) return 'bg-gray-400/70';
        return 'bg-gradient-to-tr from-red-400 via-pink-500 to-purple-600';
    };

    // ✅ Avatar renderer
    const renderAvatar = (src, name, size = 'w-[62px] h-[62px] sm:w-[66px] sm:h-[66px]') => (
        <img
            src={src}
            alt={name}
            className={`${size} rounded-full object-cover border-[3px] border-white bg-gray-200`}
            onError={(e) => {
                e.target.onerror = null;
                e.target.src = getAvatarUrl(name);
            }}
        />
    );

    // ✅ Infinite scroll - Keep in middle
    const handleScroll = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const scrollWidth = container.scrollWidth;
        const clientWidth = container.clientWidth;
        const currentScroll = container.scrollLeft;

        // ✅ Show/hide arrows based on scroll position (desktop only)
        setShowLeftArrow(currentScroll > 50);
        setShowRightArrow(currentScroll < scrollWidth - clientWidth - 50);

        // ✅ Infinite loop - jump to middle
        const middleSection = scrollWidth / 3;

        if (currentScroll < 10) {
            container.scrollLeft = middleSection;
        } else if (currentScroll > scrollWidth - clientWidth - 10) {
            container.scrollLeft = middleSection;
        }
    };

    // ✅ Scroll with arrows
    const scrollLeft = () => {
        const container = scrollContainerRef.current;
        if (container) {
            container.scrollLeft -= 300;
        }
    };

    const scrollRight = () => {
        const container = scrollContainerRef.current;
        if (container) {
            container.scrollLeft += 300;
        }
    };

    // ✅ Set initial scroll to middle
    useEffect(() => {
        if (users.length > 0 && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const middleIndex = Math.floor(users.length / 2);
            const middlePosition = middleIndex * 76;
            container.scrollLeft = middlePosition;
        }
    }, [users]);

    // ✅ Attach scroll listener
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [users]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[100px] bg-white">
                <div className="w-7 h-7 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-full border-b border-gray-200 shadow-sm bg-white relative">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelected}
            />

            <div className="max-w-7xl mx-auto relative">
                {/* ✅ LEFT ARROW - Hidden on mobile, visible on desktop */}
                <button
                    onClick={scrollLeft}
                    className={`
                        hidden md:flex
                        absolute left-0 top-1/2 -translate-y-1/2 z-10 
                        bg-white/90 hover:bg-white 
                        rounded-full w-8 h-8 
                        items-center justify-center 
                        shadow-lg border border-gray-200
                        transition-all duration-200 hover:scale-110
                        ${showLeftArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                    `}
                >
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* ✅ SCROLL CONTAINER */}
                <div
                    ref={scrollContainerRef}
                    className="flex items-start gap-3 sm:gap-4 overflow-x-auto px-3 sm:px-4 py-3 scrollbar-hide"
                    style={{
                        scrollBehavior: 'smooth',
                        WebkitOverflowScrolling: 'touch',
                        overscrollBehavior: 'none'
                    }}
                >
                    {users.map((userData, index) => {
                        const isCurrentUser = userData.isCurrentUser;
                        const hasStory = userData.hasStory;
                        const isOnline = userData.isOnline;
                        const viewed = viewedGroups[userData.userId];

                        return (
                            <div
                                key={`${userData.userId}-${index}`}
                                className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer select-none w-[72px] sm:w-[76px]"
                                onClick={() => handleUserClick(userData)}
                            >
                                <div className="relative">
                                    {/* Story Ring */}
                                    <div
                                        className={`p-[2.5px] rounded-full ${getRingClass(hasStory, viewed)}`}
                                        style={{
                                            background: hasStory ? undefined : 'transparent'
                                        }}
                                    >
                                        <div className="p-[2px] rounded-full bg-white">
                                            {renderAvatar(
                                                userData.userAvatar || getAvatarUrl(userData.username),
                                                userData.username
                                            )}
                                        </div>
                                    </div>

                                    {/* Online Green Dot */}
                                    {isOnline && (
                                        <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full z-10" />
                                    )}

                                    {/* Add Story Button */}
                                    {isCurrentUser && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                fileInputRef.current?.click();
                                            }}
                                            disabled={uploading}
                                            className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 rounded-full flex items-center justify-center border-2 border-white shadow z-10"
                                        >
                                            {uploading ? (
                                                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <span className="text-white text-sm font-bold">+</span>
                                            )}
                                        </button>
                                    )}
                                </div>

                                {/* Username */}
                                <span className="text-[11px] sm:text-xs text-gray-800 font-medium truncate w-full text-center leading-tight">
                                    {isCurrentUser ? 'Your Story' : userData.username}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* ✅ RIGHT ARROW - Hidden on mobile, visible on desktop */}
                <button
                    onClick={scrollRight}
                    className={`
                        hidden md:flex
                        absolute right-0 top-1/2 -translate-y-1/2 z-10 
                        bg-white/90 hover:bg-white 
                        rounded-full w-8 h-8 
                        items-center justify-center 
                        shadow-lg border border-gray-200
                        transition-all duration-200 hover:scale-110
                        ${showRightArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                    `}
                >
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Stories;