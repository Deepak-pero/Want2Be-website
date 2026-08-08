/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
// // pages/UserProfile.js
// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import { searchAPI } from '../Api/searchApi';
// import DreamList from '../components/DreamList';
// import toast from 'react-hot-toast';

// const UserProfile = () => {
//     const { userId } = useParams();
//     const [user, setUser] = useState(null);
//     const [dreams, setDreams] = useState([]);
//     const [isLoading, setIsLoading] = useState(true);

//     useEffect(() => {
//         fetchUserProfile();
//     }, [userId]);

//     const fetchUserProfile = async () => {
//         try {
//             const response = await searchAPI.getUserProfile(userId);
//             if (response.data.success) {
//                 setUser(response.data.user);
//                 setDreams(response.data.dreams);
//             } else {
//                 toast.error('User not found');
//             }
//         } catch (error) {
//             console.error('Fetch user profile error:', error);
//             toast.error('Failed to load user profile');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     if (isLoading) {
//         return (
//             <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
//                 <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//             </div>
//         );
//     }

//     if (!user) {
//         return (
//             <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
//                 <div className="text-center">
//                     <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
//                     <p className="text-gray-600">The user you're looking for doesn't exist.</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gray-50 pt-16">
//             {/* User Profile Header */}
//             <div className="bg-white border-b border-gray-300">
//                 <div className="max-w-4xl mx-auto px-4 py-8">
//                     <div className="flex items-start space-x-8">
//                         {/* Profile Picture */}
//                         <div className="flex-shrink-0">
//                             <div className="w-32 h-32 rounded-full border-2 border-white shadow-lg overflow-hidden">
//                                 {user.profilePicture ? (
//                                     <img
//                                         src={user.profilePicture}
//                                         alt={user.name}
//                                         className="w-full h-full object-cover"
//                                     />
//                                 ) : (
//                                     <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
//                                         {user.name.charAt(0).toUpperCase()}
//                                     </div>
//                                 )}
//                             </div>
//                         </div>

//                         {/* Profile Info */}
//                         <div className="flex-1 min-w-0">
//                             <div className="flex items-center space-x-4 mb-4">
//                                 <h1 className="text-2xl font-light text-gray-900">{user.name}</h1>
//                             </div>

//                             {/* Stats */}
//                             <div className="flex space-x-8 mb-4">
//                                 <div className="text-center">
//                                     <span className="font-semibold block">{dreams.length}</span>
//                                     <span className="text-gray-600 text-sm">dreams</span>
//                                 </div>
//                             </div>

//                             {/* Bio and Contact */}
//                             <div className="space-y-1">
//                                 {user.bio && (
//                                     <p className="text-gray-800">{user.bio}</p>
//                                 )}
//                                 <div className="text-sm text-gray-600 space-y-1">
//                                     {user.email && <p>📧 {user.email}</p>}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* User's Dreams */}
//             <div className="max-w-4xl mx-auto px-4 py-8">
//                 {dreams.length === 0 ? (
//                     <div className="text-center py-12">
//                         <div className="text-4xl mb-4">🌙</div>
//                         <h3 className="text-xl font-medium text-gray-900 mb-2">No dreams yet</h3>
//                         <p className="text-gray-600">This user hasn't shared any dreams yet.</p>
//                     </div>
//                 ) : (
//                     <div>
//                         <h2 className="text-xl font-semibold text-gray-900 mb-6">{user.name}'s Dreams</h2>
//                         <DreamList dreams={dreams} />
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default UserProfile;





// pages/UserProfile.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { searchAPI } from '../Api/searchApi';
import { dreamAPI } from '../Api/dreamApi'; // Add this import
import DreamList from '../components/DreamList';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext'; // Add this import

const UserProfile = () => {
    const { userId } = useParams();
    const { user: currentUser } = useAuth(); // Add current user context
    const [user, setUser] = useState(null);
    const [dreams, setDreams] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchUserProfile();
    }, [userId]);

    const fetchUserProfile = async () => {
        try {
            const response = await searchAPI.getUserProfile(userId);
            if (response.data.success) {
                setUser(response.data.user);
                setDreams(response.data.dreams);
            } else {
                toast.error('User not found');
            }
        } catch (error) {
            console.error('Fetch user profile error:', error);
            toast.error('Failed to load user profile');
        } finally {
            setIsLoading(false);
        }
    };

    // Add event handlers for dream interactions
    const handleLike = async (dreamId, likesCount, isLiked, updatedDream) => {
        if (!currentUser) {
            toast.error('Please login to like dreams');
            return;
        }

        try {
            const res = await dreamAPI.likeDream(dreamId);
            if (res.data.success && res.data.dream) {
                setDreams(prevDreams =>
                    prevDreams.map(dream =>
                        dream._id === dreamId ? {
                            ...res.data.dream,
                            user: dream.user // Preserve user data
                        } : dream
                    )
                );
            }
        } catch (error) {
            console.error('Like error:', error);
            toast.error('Failed to like dream');
        }
    };

    const handleComment = async (dreamId, updatedDream) => {
        if (!currentUser) {
            toast.error('Please login to comment');
            return;
        }

        try {
            // The updatedDream should come from the DreamList component
            setDreams(prevDreams =>
                prevDreams.map(dream =>
                    dream._id === dreamId ? updatedDream : dream
                )
            );
        } catch (error) {
            console.error('Comment update error:', error);
        }
    };

    const handleShare = async (dreamId, sharesCount) => {
        if (!currentUser) {
            toast.error('Please login to share dreams');
            return;
        }

        try {
            const res = await dreamAPI.shareDream(dreamId);
            if (res.data.success) {
                setDreams(prevDreams =>
                    prevDreams.map(dream =>
                        dream._id === dreamId ? { ...dream, shares: res.data.shares } : dream
                    )
                );
                toast.success('Dream shared successfully!');
            }
        } catch (error) {
            console.error('Share error:', error);
            toast.error('Failed to share dream');
        }
    };

    const handleDelete = (dreamId) => {
        // Only allow deleting own dreams
        if (currentUser && currentUser.id === user?._id) {
            setDreams(prevDreams =>
                prevDreams.filter(dream => dream._id !== dreamId)
            );
            toast.success('Dream deleted successfully');
        }
    };

    const handleEdit = (dreamId, updatedDream) => {
        // Only allow editing own dreams
        if (currentUser && currentUser.id === user?._id) {
            setDreams(prevDreams =>
                prevDreams.map(dream => {
                    if (dream._id === dreamId) {
                        return {
                            ...updatedDream,
                            user: dream.user
                        };
                    }
                    return dream;
                })
            );
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
                    <p className="text-gray-600">The user you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    const isOwnProfile = currentUser && currentUser.id === user._id;

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            {/* User Profile Header */}
            <div className="bg-white border-b border-gray-300">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="flex items-start space-x-8">
                        {/* Profile Picture */}
                        <div className="flex-shrink-0">
                            <div className="w-32 h-32 rounded-full border-2 border-white shadow-lg overflow-hidden">
                                {user.profilePicture ? (
                                    <img
                                        src={user.profilePicture}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-4 mb-4">
                                <h1 className="text-2xl font-light text-gray-900">{user.name}</h1>
                                {isOwnProfile && (
                                    <button
                                        onClick={() => navigate('/profile')}
                                        className="px-4 py-1.5 text-sm font-medium border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="flex space-x-8 mb-4">
                                <div className="text-center">
                                    <span className="font-semibold block">{dreams.length}</span>
                                    <span className="text-gray-600 text-sm">dreams</span>
                                </div>
                            </div>

                            {/* Bio and Contact */}
                            <div className="space-y-1">
                                {user.bio && (
                                    <p className="text-gray-800">{user.bio}</p>
                                )}
                                <div className="text-sm text-gray-600 space-y-1">
                                    {user.email && <p>📧 {user.email}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* User's Dreams */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                {dreams.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-4xl mb-4">🌙</div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No dreams yet</h3>
                        <p className="text-gray-600">
                            {isOwnProfile
                                ? "You haven't shared any dreams yet."
                                : "This user hasn't shared any dreams yet."
                            }
                        </p>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            {isOwnProfile ? 'Your Dreams' : `${user.name}'s Dreams`}
                        </h2>
                        <DreamList
                            dreams={dreams}
                            onLike={handleLike}
                            onComment={handleComment}
                            onShare={handleShare}
                            onDelete={isOwnProfile ? handleDelete : undefined} // Only allow delete on own profile
                            onEdit={isOwnProfile ? handleEdit : undefined} // Only allow edit on own profile
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;