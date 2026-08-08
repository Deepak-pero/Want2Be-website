
// // client/src/pages/StoryViewer.js
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import {
//     getStories,
//     likeStory,
//     commentOnStory,
//     viewStory,
//     getStoryViewers,
//     deleteStory
// } from '../Api/storyApi';
// import toast from 'react-hot-toast';

// const IMAGE_DURATION_MS = 50;
// const STORY_DURATION_MS = 5000;
// const PROGRESS_STEP = (100 / STORY_DURATION_MS) * IMAGE_DURATION_MS;

// const StoryViewer = () => {
//     const { userId } = useParams();
//     const navigate = useNavigate();
//     const { user } = useAuth();
//     const currentUserId = user?._id || user?.id;

//     // eslint-disable-next-line no-unused-vars
//     const [stories, setStories] = useState([]);
//     const [selectedUserStories, setSelectedUserStories] = useState([]);
//     const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
//     const [progress, setProgress] = useState(0);
//     const [isPaused, setIsPaused] = useState(false);
//     const [commentText, setCommentText] = useState('');
//     const [showComments, setShowComments] = useState(false);
//     const [showHeartBurst, setShowHeartBurst] = useState(false);
//     const [showViewers, setShowViewers] = useState(false);
//     const [viewersList, setViewersList] = useState([]);
//     const [loadingViewers, setLoadingViewers] = useState(false);
//     const [loading, setLoading] = useState(true);
//     const [storyUser, setStoryUser] = useState(null);
//     const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//     const [isDeleting, setIsDeleting] = useState(false);

//     const progressTimer = useRef(null);
//     const videoRef = useRef(null);
//     const touchStartX = useRef(0);
//     const touchStartY = useRef(0);
//     const lastTapRef = useRef(0);

//     useEffect(() => {
//         if (!userId) return;
//         fetchStories();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [userId, currentUserId]);

//     const fetchStories = async () => {
//         try {
//             setLoading(true);
//             const response = await getStories();
//             let allStories = response.stories || [];

//             // 👇 FIX: the route param userId might be the real Mongo _id,
//             // OR (if your feed links to your own story using a synthetic
//             // "current_user" placeholder id) it might not match any group
//             // at all. Handle both cases so the profile info always resolves.
//             const isViewingOwnStory =
//                 userId === 'current_user' ||
//                 (currentUserId && String(userId) === String(currentUserId));

//             let userStories = allStories.find(s => String(s.userId) === String(userId));

//             // Fallback: if viewing your own story but the id didn't match
//             // (e.g. because it was passed as 'current_user' or similar),
//             // match by currentUserId instead.
//             if (!userStories && isViewingOwnStory && currentUserId) {
//                 userStories = allStories.find(s => String(s.userId) === String(currentUserId));
//             }

//             if (userStories && userStories.stories.length > 0) {
//                 setSelectedUserStories(userStories.stories);

//                 // 👇 FIX: prefer the group-level username/avatar, but fall
//                 // back to the user info embedded in the first story itself
//                 // (the backend always populates story.user), so the header
//                 // never renders blank even if the group-level fields are
//                 // missing for some reason.
//                 const firstStory = userStories.stories[0];
//                 setStoryUser({
//                     username: userStories.username || firstStory?.user?.username || firstStory?.user?.name || 'User',
//                     avatar: userStories.userAvatar || firstStory?.user?.avatar || null
//                 });

//                 setCurrentStoryIndex(0);
//                 if (firstStory) {
//                     viewStory(firstStory.id).catch(console.error);
//                 }
//             } else {
//                 toast.error('No stories found');
//                 navigate(-1);
//             }
//         } catch (error) {
//             console.error('Error fetching stories:', error);
//             toast.error('Failed to load stories');
//             navigate(-1);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const currentStory = selectedUserStories[currentStoryIndex] || {};
//     const currentStoryId = currentStory.id || currentStory._id;
//     const isOwnStory =
//         userId === 'current_user' ||
//         (currentUserId && String(userId) === String(currentUserId)) ||
//         (currentUserId && currentStory.user?._id && String(currentStory.user._id) === String(currentUserId));
//     const isVideoStory = currentStory.type === 'video';

//     const goToNextStory = useCallback(() => {
//         setCurrentStoryIndex(prev => {
//             if (prev < selectedUserStories.length - 1) {
//                 return prev + 1;
//             }
//             navigate(-1);
//             return prev;
//         });
//     }, [selectedUserStories.length, navigate]);

//     // Progress timer for images
//     useEffect(() => {
//         if (!selectedUserStories.length) return;

//         setProgress(0);

//         if (progressTimer.current) {
//             clearInterval(progressTimer.current);
//         }

//         if (isPaused) return undefined;

//         const isVideo = currentStory?.type === 'video';

//         if (!isVideo) {
//             progressTimer.current = setInterval(() => {
//                 setProgress(prev => {
//                     if (prev >= 100) {
//                         goToNextStory();
//                         return 0;
//                     }
//                     return prev + PROGRESS_STEP;
//                 });
//             }, IMAGE_DURATION_MS);
//         }

//         return () => {
//             if (progressTimer.current) {
//                 clearInterval(progressTimer.current);
//             }
//         };
//     }, [currentStoryIndex, selectedUserStories, isPaused, goToNextStory, currentStory?.type]);

//     // Video controls
//     useEffect(() => {
//         if (!isVideoStory || !videoRef.current) return;
//         if (isPaused) {
//             videoRef.current.pause();
//         } else {
//             videoRef.current.play().catch(() => { });
//         }
//     }, [isPaused, isVideoStory, currentStoryIndex]);

//     const handleVideoTimeUpdate = () => {
//         if (!videoRef.current || !videoRef.current.duration) return;
//         const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
//         setProgress(pct);
//     };

//     const handleVideoEnded = () => {
//         goToNextStory();
//     };

//     const nextStory = () => {
//         if (!selectedUserStories.length) return;
//         goToNextStory();
//     };

//     const prevStory = () => {
//         if (currentStoryIndex > 0) {
//             setCurrentStoryIndex(prev => prev - 1);
//             setProgress(0);
//         }
//     };

//     const closeStoryViewer = () => {
//         navigate(-1);
//     };

//     // 👇 FIX: open the confirm dialog with the timer paused, so the story
//     // can never auto-advance (and yank the user off the page via
//     // navigate(-1)) while the confirmation modal is open.
//     const openDeleteConfirm = (e) => {
//         e?.stopPropagation?.();
//         e?.preventDefault?.();
//         setIsPaused(true);
//         setShowDeleteConfirm(true);
//     };

//     const cancelDeleteConfirm = () => {
//         setShowDeleteConfirm(false);
//         setIsPaused(false); // only resume if the user backs out
//     };

//     const handleDeleteStory = async () => {
//         try {
//             const storyId = currentStoryId ? String(currentStoryId) : null;

//             if (!storyId) {
//                 toast.error('Story ID not found');
//                 return;
//             }

//             setIsDeleting(true);
//             await deleteStory(storyId);

//             const updatedStories = selectedUserStories.filter(
//                 s => String(s.id || s._id) !== storyId
//             );

//             if (updatedStories.length === 0) {
//                 toast.success('Story deleted successfully!');
//                 navigate(-1);
//                 return;
//             }

//             setSelectedUserStories(updatedStories);
//             if (currentStoryIndex >= updatedStories.length) {
//                 setCurrentStoryIndex(updatedStories.length - 1);
//             }
//             toast.success('Story deleted successfully!');
//             setShowDeleteConfirm(false);
//             setIsPaused(false); // resume auto-advance on the next story
//         } catch (error) {
//             console.error('❌ Error deleting story:', error);
//             toast.error(error.response?.data?.message || 'Failed to delete story');
//         } finally {
//             setIsDeleting(false);
//         }
//     };

//     const handleLike = async (storyId) => {
//         try {
//             const response = await likeStory(storyId);
//             const updatedStories = selectedUserStories.map(s => {
//                 if (s.id === storyId) {
//                     return {
//                         ...s,
//                         likes: response.story.likes || [],
//                         likeCount: response.likeCount || 0
//                     };
//                 }
//                 return s;
//             });
//             setSelectedUserStories(updatedStories);
//             toast.success(response.isLiked ? '❤️ Liked!' : '💔 Unliked');
//         } catch (error) {
//             console.error('Error toggling like:', error);
//             toast.error('Failed to like story');
//         }
//     };

//     const handleDoubleTapLike = (storyId) => {
//         const alreadyLiked = currentStory.likes?.some(
//             l => l._id === user?._id || l === user?._id
//         );

//         setShowHeartBurst(true);
//         setTimeout(() => setShowHeartBurst(false), 800);

//         if (!alreadyLiked) {
//             handleLike(storyId);
//         }
//     };

//     const handleComment = async (storyId, text) => {
//         if (!text || !text.trim()) {
//             toast.error('Please write a comment');
//             return;
//         }

//         try {
//             const response = await commentOnStory(storyId, text);
//             const updatedStories = selectedUserStories.map(s => {
//                 if (s.id === storyId) {
//                     return {
//                         ...s,
//                         comments: response.story.comments || [],
//                         commentCount: response.commentCount || 0
//                     };
//                 }
//                 return s;
//             });
//             setSelectedUserStories(updatedStories);
//             setCommentText('');
//             toast.success('💬 Comment added!');
//         } catch (error) {
//             console.error('Error adding comment:', error);
//             toast.error('Failed to add comment');
//         }
//     };

//     const handleShowViewers = async () => {
//         if (!isOwnStory) return;
//         setIsPaused(true);
//         setShowViewers(true);
//         setLoadingViewers(true);
//         try {
//             const response = await getStoryViewers(currentStoryId);
//             setViewersList(response.viewers || []);
//         } catch (error) {
//             console.error('Error loading viewers:', error);
//             toast.error('Failed to load viewers');
//         } finally {
//             setLoadingViewers(false);
//         }
//     };

//     const closeViewersList = () => {
//         setShowViewers(false);
//         setIsPaused(false);
//     };

//     const handleTouchStart = (e) => {
//         const touch = e.touches[0];
//         touchStartX.current = touch.clientX;
//         touchStartY.current = touch.clientY;
//         setIsPaused(true);
//     };

//     const handleTouchEnd = (e) => {
//         // Don't auto-resume if a modal/panel is open — only the modal's own
//         // close handlers should resume the timer.
//         if (!showViewers && !showDeleteConfirm) {
//             setTimeout(() => setIsPaused(false), 100);
//         }

//         if (!selectedUserStories.length) return;

//         const touch = e.changedTouches[0];
//         const diffX = touchStartX.current - touch.clientX;
//         const diffY = touchStartY.current - touch.clientY;

//         const isTap = Math.abs(diffX) < 15 && Math.abs(diffY) < 15;

//         if (isTap) {
//             const now = Date.now();
//             if (now - lastTapRef.current < 300) {
//                 handleDoubleTapLike(currentStoryId);
//                 lastTapRef.current = 0;
//                 return;
//             }
//             lastTapRef.current = now;
//             return;
//         }

//         if (Math.abs(diffY) > Math.abs(diffX) && diffY > 50 && isOwnStory) {
//             handleShowViewers();
//             return;
//         }

//         if (Math.abs(diffX) > Math.abs(diffY)) {
//             if (diffX > 50) {
//                 nextStory();
//             } else if (diffX < -50) {
//                 prevStory();
//             }
//         }
//     };

//     const handleTouchMove = (e) => {
//         e.preventDefault();
//     };

//     useEffect(() => {
//         const handleKeyDown = (e) => {
//             if (selectedUserStories.length) {
//                 if (e.key === 'ArrowRight' || e.key === ' ') {
//                     e.preventDefault();
//                     nextStory();
//                 } else if (e.key === 'ArrowLeft') {
//                     e.preventDefault();
//                     prevStory();
//                 } else if (e.key === 'Escape') {
//                     if (showViewers) {
//                         closeViewersList();
//                     } else if (showDeleteConfirm) {
//                         cancelDeleteConfirm();
//                     } else {
//                         closeStoryViewer();
//                     }
//                 }
//             }
//         };

//         document.addEventListener('keydown', handleKeyDown);
//         return () => document.removeEventListener('keydown', handleKeyDown);
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [selectedUserStories, currentStoryIndex, showViewers, showDeleteConfirm]);

//     const getMediaUrl = (url) => {
//         if (!url) return '';
//         if (url.startsWith('http://') || url.startsWith('https://')) {
//             return url;
//         }
//         return 'https://via.placeholder.com/400x700/333/fff?text=Story';
//     };

//     if (loading) {
//         return (
//             <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
//                 <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
//             </div>
//         );
//     }

//     if (!selectedUserStories.length) {
//         return (
//             <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
//                 <div className="text-center px-4">
//                     <p className="text-white text-lg">No stories available</p>
//                     <button
//                         onClick={closeStoryViewer}
//                         className="mt-4 text-blue-400 hover:text-blue-300"
//                     >
//                         Go Back
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     const isCurrentLiked = currentStory.likes?.some(
//         l => l._id === user?._id || l === user?._id
//     );

//     return (
//         <div
//             className="fixed inset-0 bg-black z-50 flex items-center justify-center touch-none"
//             onTouchStart={handleTouchStart}
//             onTouchEnd={handleTouchEnd}
//             onTouchMove={handleTouchMove}
//         >
//             {/* Close button */}
//             <button
//                 onClick={closeStoryViewer}
//                 className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white text-xl sm:text-2xl z-20 hover:text-gray-300 transition-colors p-2"
//                 style={{ touchAction: 'none' }}
//             >
//                 ✕
//             </button>

//             <div className="relative w-full max-w-sm sm:max-w-md h-screen max-h-[600px] sm:max-h-[700px] bg-black">
//                 {/* Progress bars */}
//                 <div className="absolute top-0 left-0 right-0 flex gap-1 p-1.5 sm:p-2 z-10">
//                     {selectedUserStories.map((_, idx) => (
//                         <div key={idx} className="flex-1 h-0.5 sm:h-1 bg-gray-600 rounded-full overflow-hidden">
//                             <div
//                                 className="h-full bg-white transition-all duration-100 ease-linear"
//                                 style={{
//                                     width: idx === currentStoryIndex ? `${progress}%` : idx < currentStoryIndex ? '100%' : '0%'
//                                 }}
//                             />
//                         </div>
//                     ))}
//                 </div>

//                 {/* User info with delete button for own story */}
//                 <div className="absolute top-6 sm:top-8 left-3 sm:left-4 right-3 sm:right-4 flex items-center gap-2 sm:gap-3 z-20 pointer-events-auto">
//                     <img
//                         src={storyUser?.avatar || `https://ui-avatars.com/api/?name=${storyUser?.username || 'User'}&background=6C63FF&color=fff&size=60`}
//                         alt={storyUser?.username || 'User'}
//                         className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white object-cover"
//                         onError={(e) => {
//                             e.target.onerror = null;
//                             e.target.src = `https://ui-avatars.com/api/?name=${storyUser?.username || 'User'}&background=6C63FF&color=fff&size=60`;
//                         }}
//                     />
//                     <div className="flex-1 min-w-0">
//                         <span className="text-white font-semibold text-xs sm:text-sm truncate block">
//                             {storyUser?.username || 'User'}
//                         </span>
//                         <span className="text-gray-300 text-[10px] sm:text-xs">
//                             {currentStory.timestamp ? new Date(currentStory.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
//                         </span>
//                     </div>

//                     {/* Delete button — only for own stories */}
//                     {isOwnStory && (
//                         <button
//                             onClick={openDeleteConfirm}
//                             className="text-white/60 hover:text-red-500 transition-colors p-1 text-lg"
//                             style={{ touchAction: 'none' }}
//                             disabled={isDeleting}
//                         >
//                             {isDeleting ? '⏳' : '🗑️'}
//                         </button>
//                     )}

//                     {isVideoStory && (
//                         <button
//                             className="text-white text-lg p-1"
//                             onClick={(e) => {
//                                 e.stopPropagation();
//                                 setIsPaused(p => !p);
//                             }}
//                         >
//                             {isPaused ? '▶️' : '⏸️'}
//                         </button>
//                     )}
//                 </div>

//                 {/* Story media */}
//                 <div
//                     className="w-full h-full flex items-center justify-center cursor-pointer relative"
//                     onClick={(e) => {
//                         if (e.pointerType === 'mouse') {
//                             nextStory();
//                         }
//                     }}
//                     onContextMenu={(e) => {
//                         e.preventDefault();
//                         prevStory();
//                     }}
//                 >
//                     {isVideoStory ? (
//                         <video
//                             key={currentStory.id}
//                             ref={videoRef}
//                             src={getMediaUrl(currentStory.url)}
//                             className="w-full h-full object-contain"
//                             autoPlay
//                             playsInline
//                             muted={false}
//                             onTimeUpdate={handleVideoTimeUpdate}
//                             onEnded={handleVideoEnded}
//                             onError={() => {
//                                 console.error('Video failed to load:', currentStory.url);
//                                 toast.error('Video failed to load');
//                                 goToNextStory();
//                             }}
//                         />
//                     ) : (
//                         <img
//                             src={getMediaUrl(currentStory.url)}
//                             alt="Story"
//                             className="w-full h-full object-contain"
//                             loading="lazy"
//                             onError={(e) => {
//                                 console.error('Image failed to load:', currentStory.url);
//                                 e.target.onerror = null;
//                                 e.target.src = 'https://via.placeholder.com/400x700/333/fff?text=Story';
//                             }}
//                         />
//                     )}

//                     {showHeartBurst && (
//                         <span className="absolute text-white text-8xl pointer-events-none animate-ping-once drop-shadow-lg">
//                             ❤️
//                         </span>
//                     )}
//                 </div>

//                 {/* Left/Right tap areas */}
//                 <div
//                     className="absolute top-0 left-0 w-1/3 h-full z-10"
//                     onClick={(e) => {
//                         e.stopPropagation();
//                         if (e.pointerType === 'mouse') {
//                             prevStory();
//                         }
//                     }}
//                 />
//                 <div
//                     className="absolute top-0 right-0 w-2/3 h-full z-10"
//                     onClick={(e) => {
//                         e.stopPropagation();
//                         if (e.pointerType === 'mouse') {
//                             nextStory();
//                         }
//                     }}
//                 />

//                 {/* Bottom Actions */}
//                 <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4 z-10">
//                     <button
//                         onClick={() => handleLike(currentStory.id)}
//                         className="text-white hover:scale-110 transition-transform p-1"
//                         style={{ touchAction: 'none' }}
//                     >
//                         <span className="text-2xl">{isCurrentLiked ? '❤️' : '🤍'}</span>
//                         <span className="text-xs ml-1">{currentStory.likeCount || 0}</span>
//                     </button>

//                     <button
//                         onClick={() => setShowComments(!showComments)}
//                         className="text-white hover:scale-110 transition-transform flex items-center gap-1 p-1"
//                         style={{ touchAction: 'none' }}
//                     >
//                         <span className="text-2xl">💬</span>
//                         <span className="text-xs">{currentStory.commentCount || 0}</span>
//                     </button>

//                     {isOwnStory ? (
//                         <button
//                             onClick={handleShowViewers}
//                             className="text-white/80 text-xs ml-auto flex items-center gap-1 hover:text-white p-1"
//                             style={{ touchAction: 'none' }}
//                         >
//                             👁️ {currentStory.viewCount || 0} views
//                         </button>
//                     ) : (
//                         <span className="text-white/60 text-xs ml-auto">
//                             👁️ {currentStory.viewCount || 0}
//                         </span>
//                     )}
//                 </div>

//                 {/* Comments Section */}
//                 {showComments && (
//                     <div className="absolute bottom-16 left-0 right-0 bg-black/80 backdrop-blur-sm p-3 z-10 max-h-48 overflow-y-auto">
//                         <div className="space-y-2 mb-2">
//                             {currentStory.comments && currentStory.comments.length > 0 ? (
//                                 currentStory.comments.map((comment, idx) => (
//                                     <div key={idx} className="flex items-start gap-2 text-sm">
//                                         <span className="text-white font-semibold text-xs">
//                                             {comment.user?.name || 'User'}:
//                                         </span>
//                                         <span className="text-gray-300 text-xs break-words">{comment.text}</span>
//                                     </div>
//                                 ))
//                             ) : (
//                                 <p className="text-gray-500 text-xs text-center">No comments yet</p>
//                             )}
//                         </div>

//                         <div className="flex gap-2">
//                             <input
//                                 type="text"
//                                 value={commentText}
//                                 onChange={(e) => setCommentText(e.target.value)}
//                                 placeholder="Add a comment..."
//                                 className="flex-1 bg-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none placeholder-gray-400"
//                                 maxLength="200"
//                                 onKeyPress={(e) => {
//                                     if (e.key === 'Enter' && commentText.trim()) {
//                                         handleComment(currentStory.id, commentText);
//                                     }
//                                 }}
//                             />
//                             <button
//                                 onClick={() => handleComment(currentStory.id, commentText)}
//                                 disabled={!commentText.trim()}
//                                 className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50"
//                             >
//                                 Send
//                             </button>
//                         </div>
//                     </div>
//                 )}

//                 {/* "Seen by" viewers panel */}
//                 {showViewers && (
//                     <div
//                         className="absolute inset-x-0 bottom-0 top-1/3 bg-black/95 backdrop-blur-sm rounded-t-2xl z-20 flex flex-col"
//                         onClick={(e) => e.stopPropagation()}
//                     >
//                         <div className="flex items-center justify-between p-4 border-b border-white/10">
//                             <span className="text-white font-semibold text-sm">
//                                 Seen by {viewersList.length}
//                             </span>
//                             <button onClick={closeViewersList} className="text-white text-lg p-1">✕</button>
//                         </div>

//                         <div className="flex-1 overflow-y-auto p-3 space-y-3">
//                             {loadingViewers ? (
//                                 <div className="flex justify-center py-6">
//                                     <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                                 </div>
//                             ) : viewersList.length > 0 ? (
//                                 viewersList.map((viewer) => (
//                                     <div key={viewer.id} className="flex items-center gap-3">
//                                         <img
//                                             src={viewer.avatar || `https://ui-avatars.com/api/?name=${viewer.name || 'User'}&background=6C63FF&color=fff&size=60`}
//                                             alt={viewer.name}
//                                             className="w-9 h-9 rounded-full object-cover"
//                                         />
//                                         <div className="flex-1 min-w-0">
//                                             <p className="text-white text-sm font-medium truncate">{viewer.name}</p>
//                                             {viewer.username && (
//                                                 <p className="text-gray-400 text-xs truncate">@{viewer.username}</p>
//                                             )}
//                                         </div>
//                                         <span className="text-gray-500 text-[10px] flex-shrink-0">
//                                             {new Date(viewer.viewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                                         </span>
//                                     </div>
//                                 ))
//                             ) : (
//                                 <p className="text-gray-500 text-sm text-center py-6">No views yet</p>
//                             )}
//                         </div>
//                     </div>
//                 )}

//                 {/* Delete confirmation modal */}
//                 {showDeleteConfirm && (
//                     <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-30">
//                         <div className="bg-gray-900 rounded-2xl p-6 max-w-xs w-full mx-4">
//                             <div className="text-center">
//                                 <div className="text-5xl mb-4">🗑️</div>
//                                 <h3 className="text-white text-lg font-semibold mb-2">Delete Story?</h3>
//                                 <p className="text-gray-400 text-sm mb-6">
//                                     This story will be permanently deleted and cannot be recovered.
//                                 </p>
//                                 <div className="flex gap-3">
//                                     <button
//                                         onClick={cancelDeleteConfirm}
//                                         className="flex-1 bg-gray-700 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-600 transition"
//                                         disabled={isDeleting}
//                                     >
//                                         Cancel
//                                     </button>
//                                     <button
//                                         onClick={handleDeleteStory}
//                                         className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 transition"
//                                         disabled={isDeleting}
//                                     >
//                                         {isDeleting ? 'Deleting...' : 'Delete'}
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default StoryViewer;




// client/src/pages/StoryViewer.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    getStories,
    likeStory,
    commentOnStory,
    viewStory,
    getStoryViewers,
    deleteStory,
    uploadStory // 👈 ADD THIS
} from '../Api/storyApi';
import toast from 'react-hot-toast';

const IMAGE_DURATION_MS = 50;
const STORY_DURATION_MS = 5000;
const PROGRESS_STEP = (100 / STORY_DURATION_MS) * IMAGE_DURATION_MS;

const StoryViewer = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const currentUserId = user?._id || user?.id;

    // eslint-disable-next-line no-unused-vars
    const [stories, setStories] = useState([]);
    const [selectedUserStories, setSelectedUserStories] = useState([]);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [showHeartBurst, setShowHeartBurst] = useState(false);
    const [showViewers, setShowViewers] = useState(false);
    const [viewersList, setViewersList] = useState([]);
    const [loadingViewers, setLoadingViewers] = useState(false);
    const [loading, setLoading] = useState(true);
    const [storyUser, setStoryUser] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [uploading, setUploading] = useState(false); // 👈 ADD THIS

    const progressTimer = useRef(null);
    const videoRef = useRef(null);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const lastTapRef = useRef(0);
    const fileInputRef = useRef(null); // 👈 ADD THIS

    useEffect(() => {
        if (!userId) return;
        fetchStories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, currentUserId]);

    const fetchStories = async () => {
        try {
            setLoading(true);
            const response = await getStories();
            let allStories = response.stories || [];

            const isViewingOwnStory =
                userId === 'current_user' ||
                (currentUserId && String(userId) === String(currentUserId));

            let userStories = allStories.find(s => String(s.userId) === String(userId));

            if (!userStories && isViewingOwnStory && currentUserId) {
                userStories = allStories.find(s => String(s.userId) === String(currentUserId));
            }

            if (userStories && userStories.stories.length > 0) {
                setSelectedUserStories(userStories.stories);

                const firstStory = userStories.stories[0];
                setStoryUser({
                    username: userStories.username || firstStory?.user?.username || firstStory?.user?.name || 'User',
                    avatar: userStories.userAvatar || firstStory?.user?.avatar || null
                });

                setCurrentStoryIndex(0);
                if (firstStory) {
                    viewStory(firstStory.id).catch(console.error);
                }
            } else {
                // If no stories and viewing own story, show empty state with upload option
                if (isViewingOwnStory) {
                    setSelectedUserStories([]);
                    setStoryUser({
                        username: user?.name || user?.username || 'You',
                        avatar: user?.avatar || null
                    });
                } else {
                    toast.error('No stories found');
                    navigate(-1);
                }
            }
        } catch (error) {
            console.error('Error fetching stories:', error);
            toast.error('Failed to load stories');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    // 👇 ADD UPLOAD STORY FUNCTION
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

            // Refresh stories and stay on the same page
            await fetchStories();
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

    const currentStory = selectedUserStories[currentStoryIndex] || {};
    const currentStoryId = currentStory.id || currentStory._id;
    const isOwnStory =
        userId === 'current_user' ||
        (currentUserId && String(userId) === String(currentUserId)) ||
        (currentUserId && currentStory.user?._id && String(currentStory.user._id) === String(currentUserId));
    const isVideoStory = currentStory.type === 'video';
    const hasNoStories = selectedUserStories.length === 0 && isOwnStory;

    const goToNextStory = useCallback(() => {
        setCurrentStoryIndex(prev => {
            if (prev < selectedUserStories.length - 1) {
                return prev + 1;
            }
            navigate(-1);
            return prev;
        });
    }, [selectedUserStories.length, navigate]);

    // Progress timer for images
    useEffect(() => {
        if (!selectedUserStories.length || hasNoStories) return;

        setProgress(0);

        if (progressTimer.current) {
            clearInterval(progressTimer.current);
        }

        if (isPaused) return undefined;

        const isVideo = currentStory?.type === 'video';

        if (!isVideo) {
            progressTimer.current = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        goToNextStory();
                        return 0;
                    }
                    return prev + PROGRESS_STEP;
                });
            }, IMAGE_DURATION_MS);
        }

        return () => {
            if (progressTimer.current) {
                clearInterval(progressTimer.current);
            }
        };
    }, [currentStoryIndex, selectedUserStories, isPaused, goToNextStory, currentStory?.type, hasNoStories]);

    // Video controls
    useEffect(() => {
        if (!isVideoStory || !videoRef.current) return;
        if (isPaused) {
            videoRef.current.pause();
        } else {
            videoRef.current.play().catch(() => { });
        }
    }, [isPaused, isVideoStory, currentStoryIndex]);

    const handleVideoTimeUpdate = () => {
        if (!videoRef.current || !videoRef.current.duration) return;
        const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        setProgress(pct);
    };

    const handleVideoEnded = () => {
        goToNextStory();
    };

    const nextStory = () => {
        if (!selectedUserStories.length) return;
        goToNextStory();
    };

    const prevStory = () => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(prev => prev - 1);
            setProgress(0);
        }
    };

    const closeStoryViewer = () => {
        navigate(-1);
    };

    const openDeleteConfirm = (e) => {
        e?.stopPropagation?.();
        e?.preventDefault?.();
        setIsPaused(true);
        setShowDeleteConfirm(true);
    };

    const cancelDeleteConfirm = () => {
        setShowDeleteConfirm(false);
        setIsPaused(false);
    };

    const handleDeleteStory = async () => {
        try {
            const storyId = currentStoryId ? String(currentStoryId) : null;

            if (!storyId) {
                toast.error('Story ID not found');
                return;
            }

            setIsDeleting(true);
            await deleteStory(storyId);

            const updatedStories = selectedUserStories.filter(
                s => String(s.id || s._id) !== storyId
            );

            if (updatedStories.length === 0) {
                toast.success('Story deleted successfully!');
                // Refresh to show empty state
                await fetchStories();
                return;
            }

            setSelectedUserStories(updatedStories);
            if (currentStoryIndex >= updatedStories.length) {
                setCurrentStoryIndex(updatedStories.length - 1);
            }
            toast.success('Story deleted successfully!');
            setShowDeleteConfirm(false);
            setIsPaused(false);
        } catch (error) {
            console.error('❌ Error deleting story:', error);
            toast.error(error.response?.data?.message || 'Failed to delete story');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleLike = async (storyId) => {
        try {
            const response = await likeStory(storyId);
            const updatedStories = selectedUserStories.map(s => {
                if (s.id === storyId) {
                    return {
                        ...s,
                        likes: response.story.likes || [],
                        likeCount: response.likeCount || 0
                    };
                }
                return s;
            });
            setSelectedUserStories(updatedStories);
            toast.success(response.isLiked ? '❤️ Liked!' : '💔 Unliked');
        } catch (error) {
            console.error('Error toggling like:', error);
            toast.error('Failed to like story');
        }
    };

    const handleDoubleTapLike = (storyId) => {
        const alreadyLiked = currentStory.likes?.some(
            l => l._id === user?._id || l === user?._id
        );

        setShowHeartBurst(true);
        setTimeout(() => setShowHeartBurst(false), 800);

        if (!alreadyLiked) {
            handleLike(storyId);
        }
    };

    const handleComment = async (storyId, text) => {
        if (!text || !text.trim()) {
            toast.error('Please write a comment');
            return;
        }

        try {
            const response = await commentOnStory(storyId, text);
            const updatedStories = selectedUserStories.map(s => {
                if (s.id === storyId) {
                    return {
                        ...s,
                        comments: response.story.comments || [],
                        commentCount: response.commentCount || 0
                    };
                }
                return s;
            });
            setSelectedUserStories(updatedStories);
            setCommentText('');
            toast.success('💬 Comment added!');
        } catch (error) {
            console.error('Error adding comment:', error);
            toast.error('Failed to add comment');
        }
    };

    const handleShowViewers = async () => {
        if (!isOwnStory) return;
        setIsPaused(true);
        setShowViewers(true);
        setLoadingViewers(true);
        try {
            const response = await getStoryViewers(currentStoryId);
            setViewersList(response.viewers || []);
        } catch (error) {
            console.error('Error loading viewers:', error);
            toast.error('Failed to load viewers');
        } finally {
            setLoadingViewers(false);
        }
    };

    const closeViewersList = () => {
        setShowViewers(false);
        setIsPaused(false);
    };

    const handleTouchStart = (e) => {
        const touch = e.touches[0];
        touchStartX.current = touch.clientX;
        touchStartY.current = touch.clientY;
        setIsPaused(true);
    };

    const handleTouchEnd = (e) => {
        if (!showViewers && !showDeleteConfirm) {
            setTimeout(() => setIsPaused(false), 100);
        }

        if (!selectedUserStories.length) return;

        const touch = e.changedTouches[0];
        const diffX = touchStartX.current - touch.clientX;
        const diffY = touchStartY.current - touch.clientY;

        const isTap = Math.abs(diffX) < 15 && Math.abs(diffY) < 15;

        if (isTap) {
            const now = Date.now();
            if (now - lastTapRef.current < 300) {
                handleDoubleTapLike(currentStoryId);
                lastTapRef.current = 0;
                return;
            }
            lastTapRef.current = now;
            return;
        }

        if (Math.abs(diffY) > Math.abs(diffX) && diffY > 50 && isOwnStory) {
            handleShowViewers();
            return;
        }

        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 50) {
                nextStory();
            } else if (diffX < -50) {
                prevStory();
            }
        }
    };

    const handleTouchMove = (e) => {
        e.preventDefault();
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (selectedUserStories.length) {
                if (e.key === 'ArrowRight' || e.key === ' ') {
                    e.preventDefault();
                    nextStory();
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    prevStory();
                } else if (e.key === 'Escape') {
                    if (showViewers) {
                        closeViewersList();
                    } else if (showDeleteConfirm) {
                        cancelDeleteConfirm();
                    } else {
                        closeStoryViewer();
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedUserStories, currentStoryIndex, showViewers, showDeleteConfirm]);

    const getMediaUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return 'https://via.placeholder.com/400x700/333/fff?text=Story';
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
                <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // 👇 SHOW UPLOAD BUTTON WHEN NO STORIES (OWN STORY)
    if (hasNoStories) {
        return (
            <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelected}
                />
                <div className="text-center px-4">
                    <div className="text-6xl mb-4">📸</div>
                    <h2 className="text-white text-2xl font-semibold mb-2">No Stories Yet</h2>
                    <p className="text-gray-400 text-sm mb-6">
                        Share your first story with the community
                    </p>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform disabled:opacity-50"
                    >
                        {uploading ? 'Uploading...' : '📤 Upload Story'}
                    </button>
                    <button
                        onClick={closeStoryViewer}
                        className="block mt-4 text-gray-500 hover:text-gray-300 text-sm"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const isCurrentLiked = currentStory.likes?.some(
        l => l._id === user?._id || l === user?._id
    );

    return (
        <div
            className="fixed inset-0 bg-black z-50 flex items-center justify-center touch-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
        >
            {/* Hidden file input for upload */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelected}
            />

            {/* Close button */}
            <button
                onClick={closeStoryViewer}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white text-xl sm:text-2xl z-20 hover:text-gray-300 transition-colors p-2"
                style={{ touchAction: 'none' }}
            >
                ✕
            </button>

            <div className="relative w-full max-w-sm sm:max-w-md h-screen max-h-[600px] sm:max-h-[700px] bg-black">
                {/* Progress bars */}
                <div className="absolute top-0 left-0 right-0 flex gap-1 p-1.5 sm:p-2 z-10">
                    {selectedUserStories.map((_, idx) => (
                        <div key={idx} className="flex-1 h-0.5 sm:h-1 bg-gray-600 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-100 ease-linear"
                                style={{
                                    width: idx === currentStoryIndex ? `${progress}%` : idx < currentStoryIndex ? '100%' : '0%'
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* User info with delete button for own story */}
                <div className="absolute top-6 sm:top-8 left-3 sm:left-4 right-3 sm:right-4 flex items-center gap-2 sm:gap-3 z-20 pointer-events-auto">
                    <img
                        src={storyUser?.avatar || `https://ui-avatars.com/api/?name=${storyUser?.username || 'User'}&background=6C63FF&color=fff&size=60`}
                        alt={storyUser?.username || 'User'}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white object-cover"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${storyUser?.username || 'User'}&background=6C63FF&color=fff&size=60`;
                        }}
                    />
                    <div className="flex-1 min-w-0">
                        <span className="text-white font-semibold text-xs sm:text-sm truncate block">
                            {storyUser?.username || 'User'}
                        </span>
                        <span className="text-gray-300 text-[10px] sm:text-xs">
                            {currentStory.timestamp ? new Date(currentStory.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </span>
                    </div>

                    {/* 👇 UPLOAD BUTTON IN HEADER */}
                    {isOwnStory && (
                        <>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="text-white/60 hover:text-blue-400 transition-colors p-1 text-lg"
                                style={{ touchAction: 'none' }}
                                disabled={uploading}
                                title="Upload new story"
                            >
                                {uploading ? '⏳' : '📤'}
                            </button>
                            <button
                                onClick={openDeleteConfirm}
                                className="text-white/60 hover:text-red-500 transition-colors p-1 text-lg"
                                style={{ touchAction: 'none' }}
                                disabled={isDeleting}
                            >
                                {isDeleting ? '⏳' : '🗑️'}
                            </button>
                        </>
                    )}

                    {isVideoStory && (
                        <button
                            className="text-white text-lg p-1"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsPaused(p => !p);
                            }}
                        >
                            {isPaused ? '▶️' : '⏸️'}
                        </button>
                    )}
                </div>

                {/* Story media */}
                <div
                    className="w-full h-full flex items-center justify-center cursor-pointer relative"
                    onClick={(e) => {
                        if (e.pointerType === 'mouse') {
                            nextStory();
                        }
                    }}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        prevStory();
                    }}
                >
                    {isVideoStory ? (
                        <video
                            key={currentStory.id}
                            ref={videoRef}
                            src={getMediaUrl(currentStory.url)}
                            className="w-full h-full object-contain"
                            autoPlay
                            playsInline
                            muted={false}
                            onTimeUpdate={handleVideoTimeUpdate}
                            onEnded={handleVideoEnded}
                            onError={() => {
                                console.error('Video failed to load:', currentStory.url);
                                toast.error('Video failed to load');
                                goToNextStory();
                            }}
                        />
                    ) : (
                        <img
                            src={getMediaUrl(currentStory.url)}
                            alt="Story"
                            className="w-full h-full object-contain"
                            loading="lazy"
                            onError={(e) => {
                                console.error('Image failed to load:', currentStory.url);
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/400x700/333/fff?text=Story';
                            }}
                        />
                    )}

                    {showHeartBurst && (
                        <span className="absolute text-white text-8xl pointer-events-none animate-ping-once drop-shadow-lg">
                            ❤️
                        </span>
                    )}
                </div>

                {/* Left/Right tap areas */}
                <div
                    className="absolute top-0 left-0 w-1/3 h-full z-10"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (e.pointerType === 'mouse') {
                            prevStory();
                        }
                    }}
                />
                <div
                    className="absolute top-0 right-0 w-2/3 h-full z-10"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (e.pointerType === 'mouse') {
                            nextStory();
                        }
                    }}
                />

                {/* Bottom Actions */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4 z-10">
                    <button
                        onClick={() => handleLike(currentStory.id)}
                        className="text-white hover:scale-110 transition-transform p-1"
                        style={{ touchAction: 'none' }}
                    >
                        <span className="text-2xl">{isCurrentLiked ? '❤️' : '🤍'}</span>
                        <span className="text-xs ml-1">{currentStory.likeCount || 0}</span>
                    </button>

                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="text-white hover:scale-110 transition-transform flex items-center gap-1 p-1"
                        style={{ touchAction: 'none' }}
                    >
                        <span className="text-2xl">💬</span>
                        <span className="text-xs">{currentStory.commentCount || 0}</span>
                    </button>

                    {isOwnStory ? (
                        <button
                            onClick={handleShowViewers}
                            className="text-white/80 text-xs ml-auto flex items-center gap-1 hover:text-white p-1"
                            style={{ touchAction: 'none' }}
                        >
                            👁️ {currentStory.viewCount || 0} views
                        </button>
                    ) : (
                        <span className="text-white/60 text-xs ml-auto">
                            👁️ {currentStory.viewCount || 0}
                        </span>
                    )}
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="absolute bottom-16 left-0 right-0 bg-black/80 backdrop-blur-sm p-3 z-10 max-h-48 overflow-y-auto">
                        <div className="space-y-2 mb-2">
                            {currentStory.comments && currentStory.comments.length > 0 ? (
                                currentStory.comments.map((comment, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-sm">
                                        <span className="text-white font-semibold text-xs">
                                            {comment.user?.name || 'User'}:
                                        </span>
                                        <span className="text-gray-300 text-xs break-words">{comment.text}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-xs text-center">No comments yet</p>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 bg-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none placeholder-gray-400"
                                maxLength="200"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && commentText.trim()) {
                                        handleComment(currentStory.id, commentText);
                                    }
                                }}
                            />
                            <button
                                onClick={() => handleComment(currentStory.id, commentText)}
                                disabled={!commentText.trim()}
                                className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                )}

                {/* "Seen by" viewers panel */}
                {showViewers && (
                    <div
                        className="absolute inset-x-0 bottom-0 top-1/3 bg-black/95 backdrop-blur-sm rounded-t-2xl z-20 flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <span className="text-white font-semibold text-sm">
                                Seen by {viewersList.length}
                            </span>
                            <button onClick={closeViewersList} className="text-white text-lg p-1">✕</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-3">
                            {loadingViewers ? (
                                <div className="flex justify-center py-6">
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : viewersList.length > 0 ? (
                                viewersList.map((viewer) => (
                                    <div key={viewer.id} className="flex items-center gap-3">
                                        <img
                                            src={viewer.avatar || `https://ui-avatars.com/api/?name=${viewer.name || 'User'}&background=6C63FF&color=fff&size=60`}
                                            alt={viewer.name}
                                            className="w-9 h-9 rounded-full object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate">{viewer.name}</p>
                                            {viewer.username && (
                                                <p className="text-gray-400 text-xs truncate">@{viewer.username}</p>
                                            )}
                                        </div>
                                        <span className="text-gray-500 text-[10px] flex-shrink-0">
                                            {new Date(viewer.viewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm text-center py-6">No views yet</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Delete confirmation modal */}
                {showDeleteConfirm && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-30">
                        <div className="bg-gray-900 rounded-2xl p-6 max-w-xs w-full mx-4">
                            <div className="text-center">
                                <div className="text-5xl mb-4">🗑️</div>
                                <h3 className="text-white text-lg font-semibold mb-2">Delete Story?</h3>
                                <p className="text-gray-400 text-sm mb-6">
                                    This story will be permanently deleted and cannot be recovered.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={cancelDeleteConfirm}
                                        className="flex-1 bg-gray-700 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-600 transition"
                                        disabled={isDeleting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteStory}
                                        className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 transition"
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoryViewer;