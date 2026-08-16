import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStories, uploadStory } from '../Api/storyApi';
import toast from 'react-hot-toast';

const VIEWED_STORIES_KEY = 'want2be_viewed_stories';

const getAvatarUrl = (name, picture) =>
    picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=6C63FF&color=fff&size=128`;

const getViewedStoryGroups = () => {
    try {
        return JSON.parse(localStorage.getItem(VIEWED_STORIES_KEY) || '{}');
    } catch {
        return {};
    }
};

const markGroupViewed = (groupId) => {
    try {
        const current = getViewedStoryGroups();
        current[String(groupId)] = Date.now();
        localStorage.setItem(VIEWED_STORIES_KEY, JSON.stringify(current));
        return current;
    } catch {
        return getViewedStoryGroups();
    }
};

const Stories = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    // Tracks whether we've ever successfully loaded once, so background
    // refetches (e.g. on window focus) never trigger the full-page spinner.
    const hasLoadedOnce = useRef(false);

    const [stories, setStories] = useState([]);
    const [ownStoryGroup, setOwnStoryGroup] = useState(null);
    // 👇 FIX: renamed to make clear this is ONLY for the very first load.
    const [initialLoading, setInitialLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [viewedGroups, setViewedGroups] = useState(getViewedStoryGroups);

    const currentUserId = user?._id || user?.id;
    const hasOwnStories = (ownStoryGroup?.stories?.length ?? 0) > 0;

    // 👇 FIX: `silent` skips the loading state entirely, so a background
    // refetch (e.g. triggered by the window "focus" event when the native
    // file picker closes) can never unmount the component — and critically,
    // can never unmount the hidden <input type="file"> mid-selection, which
    // was silently swallowing every file pick before it reached onChange.
    const fetchStories = useCallback(async (silent = false) => {
        try {
            if (!silent) setInitialLoading(true);
            const response = await getStories();
            const allStories = response.stories || [];

            const myStories = currentUserId
                ? allStories.find(s => String(s.userId) === String(currentUserId))
                : null;

            setOwnStoryGroup(myStories || null);

            const others = allStories.filter(s => {
                if (!currentUserId) return true;
                return String(s.userId) !== String(currentUserId);
            });

            setStories(others);
            hasLoadedOnce.current = true;
        } catch (error) {
            console.error('Error fetching stories:', error);
            if (!silent) toast.error('Failed to load stories');
        } finally {
            if (!silent) setInitialLoading(false);
        }
    }, [currentUserId]);

    useEffect(() => {
        fetchStories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Refresh when returning from story viewer / after closing the file
    // dialog — but ALWAYS silent, so it can never rip the file input out
    // of the DOM while a selection is in flight.
    useEffect(() => {
        const onFocus = () => {
            setViewedGroups(getViewedStoryGroups());
            fetchStories(true);
        };
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [fetchStories]);

    const handleYourStoryClick = () => {
        if (!user) {
            toast.error('Please login to upload stories');
            return;
        }
        if (hasOwnStories) {
            navigate(`/story/${currentUserId}`);
        } else {
            fileInputRef.current?.click();
        }
    };

    const handleAddStoryClick = (e) => {
        e.stopPropagation();
        if (!user) {
            toast.error('Please login to upload stories');
            return;
        }
        fileInputRef.current?.click();
    };

    const handleStoryClick = (story) => {
        if (!story.hasStory) return;
        setViewedGroups(markGroupViewed(story.userId));
        navigate(`/story/${story.userId}`);
    };

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

            // Silent refresh — the visible "Uploading…" label already
            // gives feedback, no need to blank the whole row again.
            await fetchStories(true);

            if (currentUserId) {
                navigate(`/story/${currentUserId}`);
            }
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

    const getRingClass = (storyUserId, hasStory) => {
        if (!hasStory) return 'bg-gray-300/60';
        const viewed = viewedGroups[String(storyUserId)];
        if (viewed) return 'bg-gray-400/70';
        return 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600';
    };

    const renderAvatar = (src, name, sizeClass = 'w-[62px] h-[62px] sm:w-[66px] sm:h-[66px]') => (
        <img
            src={src}
            alt={name}
            className={`${sizeClass} rounded-full object-cover border-[3px] border-white bg-gray-200`}
            onError={(ev) => {
                ev.target.onerror = null;
                ev.target.src = getAvatarUrl(name);
            }}
        />
    );

    const ownAvatar = getAvatarUrl(user?.name || 'You', user?.profilePicture);
    const ownDisplayName = user?.name?.split(' ')[0] || 'Your story';

    // 👇 FIX: the hidden file input is now rendered UNCONDITIONALLY, in a
    // wrapper that's always mounted — the loading spinner is shown INSIDE
    // this wrapper instead of replacing the whole component tree. This is
    // what actually fixes the race condition: the <input> can never be
    // torn out of the DOM mid-selection again, no matter what triggers a
    // re-render (window focus, refetch, anything).
    return (
        <div className="w-full border-b border-gray-200 shadow-sm">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelected}
            />

            {initialLoading && !hasLoadedOnce.current ? (
                <div className="flex items-center justify-center h-[100px] bg-white">
                    <div className="w-7 h-7 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-start gap-3 sm:gap-4 overflow-x-auto px-3 sm:px-4 py-3 scrollbar-hide">
                        {/* Your Story */}
                        {user && (
                            <div
                                className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer select-none w-[72px] sm:w-[76px]"
                                onClick={handleYourStoryClick}
                            >
                                <div className="relative">
                                    <div className={`p-[2.5px] rounded-full ${hasOwnStories ? getRingClass(String(currentUserId), true) : 'bg-gray-300/60'}`}>
                                        <div className="p-[2px] rounded-full bg-white">
                                            {renderAvatar(ownAvatar, user.name, 'w-[58px] h-[58px] sm:w-[62px] sm:h-[62px]')}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleAddStoryClick}
                                        disabled={uploading}
                                        title="Add to your story"
                                        className="absolute -bottom-0.5 -right-0.5 w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 rounded-full flex items-center justify-center border-2 border-white shadow z-10"
                                    >
                                        {uploading
                                            ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            : <span className="text-white text-xs sm:text-sm font-bold leading-none">+</span>
                                        }
                                    </button>
                                </div>
                                <span className="text-[11px] sm:text-xs text-gray-800 font-medium truncate w-full text-center leading-tight">
                                    {uploading ? 'Uploading…' : ownDisplayName}
                                </span>
                            </div>
                        )}

                        {/* Other users' stories */}
                        {stories.map((story) => (
                            <div
                                key={story.id || story.userId}
                                className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer select-none w-[72px] sm:w-[76px]"
                                onClick={() => handleStoryClick(story)}
                            >
                                <div className="relative">
                                    <div className={`p-[2.5px] rounded-full ${getRingClass(story.userId, story.hasStory)}`}>
                                        <div className="p-[2px] rounded-full bg-white">
                                            {renderAvatar(
                                                story.userAvatar || getAvatarUrl(story.username),
                                                story.username
                                            )}
                                        </div>
                                    </div>

                                    {story.isOnline && (
                                        <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full z-10" />
                                    )}
                                </div>
                                <span className="text-[11px] sm:text-xs text-gray-800 font-medium truncate w-full text-center leading-tight">
                                    {story.username}
                                </span>
                            </div>
                        ))}

                        {stories.length === 0 && !user && (
                            <p className="text-sm text-gray-400 py-4">No stories yet</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Stories;