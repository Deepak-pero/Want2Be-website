import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DreamList from '../components/DreamList';
import { dreamAPI } from '../Api/dreamApi';

const Profile = () => {
    const { user, updateProfile, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        email: '',
        phone: ''
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [userDreams, setUserDreams] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (user) {
            setFormData({
                name: user.name || '',
                bio: user.bio || '',
                email: user.email || '',
                phone: user.phone || ''
            });
            fetchUserDreams();
        }
    }, [user, isAuthenticated, navigate]);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const fetchUserDreams = async () => {
        try {
            const response = await dreamAPI.getUserDreams();
            if (response.data.success) {
                setUserDreams(response.data.dreams);
            }
        } catch (error) {
            console.error('Error fetching user dreams:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file (JPEG, PNG, etc.)');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }

            // Create preview URL
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
            setSelectedFile(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);

        try {
            const submitData = new FormData();
            submitData.append('name', formData.name.trim());
            submitData.append('bio', formData.bio.trim());
            submitData.append('email', formData.email.trim());
            submitData.append('phone', formData.phone.trim());

            if (selectedFile) {
                submitData.append('profilePicture', selectedFile);
            }

            console.log('Updating profile with:', {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                hasFile: !!selectedFile
            });

            await updateProfile(submitData);
            toast.success('Profile updated successfully!');
            setShowUpdateForm(false);
            setSelectedFile(null);
            setPreviewUrl(null);
        } catch (error) {
            console.error('Profile update error:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsUpdating(false);
        }
    };

    // Dream handlers
    const handleLike = async (dreamId, likesCount, isLiked, updatedDream) => {
        try {
            if (isLiked) {
                await dreamAPI.unlikeDream(dreamId);
            } else {
                await dreamAPI.likeDream(dreamId);
            }

            setUserDreams(prevDreams =>
                prevDreams.map(dream =>
                    dream._id === dreamId ? {
                        ...dream,
                        likes: updatedDream.likes,
                        isLiked: !dream.isLiked
                    } : dream
                )
            );
        } catch (error) {
            console.error('Error liking/unliking dream:', error);
            toast.error('Failed to like/unlike dream');
        }
    };

    const handleComment = async (dreamId, updatedDream) => {
        setUserDreams(prevDreams =>
            prevDreams.map(dream =>
                dream._id === dreamId ? updatedDream : dream
            )
        );
    };

    const handleShare = async (dreamId, sharesCount) => {
        setUserDreams(prevDreams =>
            prevDreams.map(dream =>
                dream._id === dreamId ? { ...dream, shares: sharesCount } : dream
            )
        );
    };

    const handleDelete = (dreamId) => {
        setUserDreams(prevDreams =>
            prevDreams.filter(dream => dream._id !== dreamId)
        );
        toast.success('Dream deleted successfully');
    };

    const handleEdit = (dreamId, updatedDream) => {
        setUserDreams(prevDreams =>
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
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            {/* Profile Header - Fully Responsive */}
            <div className="bg-white border-b border-gray-300">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">

                        {/* Profile Picture - Responsive */}
                        <div className="flex-shrink-0">
                            <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-2 border-white shadow-lg overflow-hidden">
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Profile Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : user?.profilePicture ? (
                                    <img
                                        src={user.profilePicture}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-red-500 to-green-500 flex items-center justify-center text-white text-2xl sm:text-3xl md:text-4xl font-bold">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Profile Info - Responsive */}
                        <div className="flex-1 text-center sm:text-left min-w-0">
                            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 mb-4">
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate max-w-full">
                                    {user?.name || 'User'}
                                </h1>
                                <button
                                    onClick={() => setShowUpdateForm(true)}
                                    className="px-4 sm:px-5 py-1.5 sm:py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Edit Profile
                                </button>
                            </div>

                            {/* Stats - Responsive Grid */}
                            <div className="flex justify-center sm:justify-start gap-6 sm:gap-8 mb-4">
                                <div className="text-center">
                                    <span className="font-semibold text-lg block">{userDreams.length}</span>
                                    <span className="text-gray-600 text-xs sm:text-sm">dreams</span>
                                </div>
                                <div className="text-center">
                                    <span className="font-semibold text-lg block">0</span>
                                    <span className="text-gray-600 text-xs sm:text-sm">followers</span>
                                </div>
                                <div className="text-center">
                                    <span className="font-semibold text-lg block">0</span>
                                    <span className="text-gray-600 text-xs sm:text-sm">following</span>
                                </div>
                            </div>

                            {/* Bio and Contact - Responsive */}
                            <div className="space-y-1 max-w-full break-words">
                                {user?.bio && (
                                    <p className="text-gray-800 text-sm sm:text-base">{user.bio}</p>
                                )}
                                <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                                    {user?.email && (
                                        <p className="flex items-center justify-center sm:justify-start gap-2">
                                            <span>📧</span>
                                            <span className="truncate">{user.email}</span>
                                        </p>
                                    )}
                                    {user?.phone && (
                                        <p className="flex items-center justify-center sm:justify-start gap-2">
                                            <span>📱</span>
                                            <span>{user.phone}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dreams Grid - Responsive */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {userDreams.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="text-4xl sm:text-5xl mb-4">🌙</div>
                        <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No dreams yet</h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Share your first dream to start your journey</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg text-sm sm:text-base hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md"
                        >
                            Share a Dream
                        </button>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
                            Your Dreams
                        </h2>
                        <DreamList
                            dreams={userDreams}
                            onLike={handleLike}
                            onComment={handleComment}
                            onShare={handleShare}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                        />
                    </div>
                )}
            </div>

            {/* Update Profile Modal - Fully Responsive */}
            {showUpdateForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">

                        {/* Modal Header - Responsive */}
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Edit Profile</h3>
                            <button
                                onClick={() => {
                                    setShowUpdateForm(false);
                                    setPreviewUrl(null);
                                    setSelectedFile(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body - Responsive */}
                        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 sm:space-y-6">

                            {/* Profile Picture Upload - Responsive */}
                            <div className="flex flex-col items-center">
                                <div className="relative mb-3">
                                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-3 border-gray-200 shadow-md">
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : user?.profilePicture ? (
                                            <img
                                                src={user.profilePicture}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold">
                                                {formData.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={triggerFileInput}
                                        className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg border-2 border-white hover:bg-blue-600 hover:scale-110 transition-all duration-200"
                                    >
                                        +
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleProfilePicChange}
                                        className="hidden"
                                    />
                                </div>
                                <p className="text-xs sm:text-sm text-gray-500">
                                    {selectedFile ? 'Photo selected ✓' : 'Click + to change photo'}
                                </p>
                                {selectedFile && (
                                    <p className="text-xs text-green-600 mt-1">
                                        {selectedFile.name}
                                    </p>
                                )}
                            </div>

                            {/* Form Fields - Responsive */}
                            <div className="space-y-4">
                                {/* Name Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>

                                {/* Bio Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Bio
                                    </label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
                                        placeholder="Tell us about yourself and your dreams..."
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formData.bio.length}/500 characters
                                    </p>
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>

                                {/* Phone Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="+91 12345 67890"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons - Responsive */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowUpdateForm(false);
                                        setPreviewUrl(null);
                                        setSelectedFile(null);
                                    }}
                                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base font-medium order-2 sm:order-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating || !formData.name || !formData.email}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base font-medium order-1 sm:order-2 shadow-md"
                                >
                                    {isUpdating ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Saving...</span>
                                        </div>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;