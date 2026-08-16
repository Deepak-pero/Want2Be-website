// controller/storyController.js
import Story from '../models/Story.js';
import User from '../models/User.js';
import cloudinary from '../utils/cloudinary.js';
import { Readable } from 'stream';
import { isUserOnline } from '../middleware/auth.js';

const getUserAvatar = (user) =>
    user?.profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6C63FF&color=fff&size=128`;

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                transformation: [
                    { width: 1080, height: 1920, crop: 'limit' },
                    { quality: 'auto' }
                ]
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );

        const readableStream = new Readable();
        readableStream.push(buffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
    });
};

// Get all stories (public)
export const getStories = async (req, res) => {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const stories = await Story.find({
            createdAt: { $gte: twentyFourHoursAgo }
        })
            .populate('user', 'name profilePicture lastActive')
            .populate('likes', 'name profilePicture')
            .populate('comments.user', 'name profilePicture')
            .sort({ createdAt: -1 });

        const storyGroups = {};
        stories.forEach(story => {
            const userId = story.user._id.toString();
            if (!storyGroups[userId]) {
                storyGroups[userId] = {
                    id: userId,
                    userId: userId,
                    username: story.user.name || 'User',
                    userAvatar: getUserAvatar(story.user),
                    isLive: false,
                    isOnline: isUserOnline(story.user.lastActive),
                    hasStory: true,
                    stories: []
                };
            }
            storyGroups[userId].stories.push({
                id: story._id.toString(),
                type: story.type || 'image',
                url: story.url,
                timestamp: story.createdAt,
                likes: story.likes || [],
                comments: story.comments || [],
                viewers: story.viewers || [],
                likeCount: story.likes?.length || 0,
                commentCount: story.comments?.length || 0,
                viewCount: story.viewers?.length || 0,
                user: {
                    _id: story.user._id,
                    name: story.user.name,
                    profilePicture: story.user.profilePicture,
                    avatar: getUserAvatar(story.user)
                }
            });
        });

        res.json({
            success: true,
            stories: Object.values(storyGroups)
        });
    } catch (error) {
        console.error('Error fetching stories:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Upload a story
export const uploadStory = async (req, res) => {
    try {
        console.log('📸 Upload story request received');
        console.log('👤 User:', req.userId);
        console.log('📁 File:', req.file);

        if (!req.file) {
            console.error('❌ No file uploaded');
            return res.status(400).json({
                success: false,
                message: 'No file uploaded. Please select an image.'
            });
        }

        if (!req.file.mimetype.startsWith('image/')) {
            console.error('❌ Invalid file type:', req.file.mimetype);
            return res.status(400).json({
                success: false,
                message: 'Only image files are allowed'
            });
        }

        const result = await uploadToCloudinary(req.file.buffer, 'want2be/stories');

        console.log('✅ Cloudinary story saved:', result.secure_url);

        const story = new Story({
            user: req.userId,
            type: 'image',
            url: result.secure_url,
            publicId: result.public_id,
            createdAt: new Date()
        });

        await story.save();
        await story.populate('user', 'name profilePicture lastActive');

        res.json({
            success: true,
            story,
            message: 'Story uploaded successfully! 🎉'
        });

    } catch (error) {
        console.error('❌ Error uploading story:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload story'
        });
    }
};

// Like a story
export const toggleLike = async (req, res) => {
    try {
        const story = await Story.findById(req.params.storyId);

        if (!story) {
            return res.status(404).json({ success: false, message: 'Story not found' });
        }

        const userIndex = story.likes.indexOf(req.userId);
        let isLiked = false;

        if (userIndex > -1) {
            story.likes.splice(userIndex, 1);
            isLiked = false;
        } else {
            story.likes.push(req.userId);
            isLiked = true;
        }

        await story.save();
        await story.populate('likes', 'name profilePicture');

        res.json({
            success: true,
            isLiked,
            likeCount: story.likes.length,
            story
        });
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add comment to story
export const addComment = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Comment cannot be empty' });
        }

        if (text.length > 200) {
            return res.status(400).json({ success: false, message: 'Comment cannot exceed 200 characters' });
        }

        const story = await Story.findById(req.params.storyId);

        if (!story) {
            return res.status(404).json({ success: false, message: 'Story not found' });
        }

        story.comments.push({
            user: req.userId,
            text: text.trim(),
            createdAt: new Date()
        });

        await story.save();
        await story.populate('comments.user', 'name profilePicture');

        res.json({
            success: true,
            comment: story.comments[story.comments.length - 1],
            commentCount: story.comments.length,
            story
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mark story as viewed
export const markAsViewed = async (req, res) => {
    try {
        const story = await Story.findById(req.params.storyId);

        if (!story) {
            return res.status(404).json({ success: false, message: 'Story not found' });
        }

        const alreadyViewed = story.viewers.some(v => v.user.toString() === req.userId);

        if (!alreadyViewed) {
            story.viewers.push({
                user: req.userId,
                viewedAt: new Date()
            });
            await story.save();
        }

        res.json({
            success: true,
            viewCount: story.viewers.length
        });
    } catch (error) {
        console.error('Error marking view:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 👇 ADD THIS NEW ENDPOINT - Get story viewers
export const getStoryViewers = async (req, res) => {
    try {
        const story = await Story.findById(req.params.storyId)
            .populate('viewers.user', 'name profilePicture');

        if (!story) {
            return res.status(404).json({ success: false, message: 'Story not found' });
        }

        // Check if the requesting user is the story owner
        if (story.user.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to view this story\'s viewers'
            });
        }

        const viewers = story.viewers.map(v => ({
            id: v.user._id,
            name: v.user.name,
            avatar: getUserAvatar(v.user),
            viewedAt: v.viewedAt
        }));

        res.json({
            success: true,
            viewers,
            count: viewers.length
        });
    } catch (error) {
        console.error('Error fetching story viewers:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete story
export const deleteStory = async (req, res) => {
    try {
        const story = await Story.findOne({
            _id: req.params.storyId,
            user: req.userId
        });

        if (!story) {
            return res.status(404).json({ success: false, message: 'Story not found' });
        }

        if (story.publicId) {
            try {
                await cloudinary.uploader.destroy(story.publicId);
                console.log('🗑️ Deleted from Cloudinary:', story.publicId);
            } catch (cloudinaryError) {
                console.error('Error deleting from Cloudinary:', cloudinaryError);
            }
        }

        await story.deleteOne();
        res.json({ success: true, message: 'Story deleted successfully' });
    } catch (error) {
        console.error('Error deleting story:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Check if user has stories
export const checkUserStories = async (req, res) => {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const story = await Story.findOne({
            user: req.userId,
            createdAt: { $gte: twentyFourHoursAgo }
        });

        res.json({
            success: true,
            hasStories: !!story
        });
    } catch (error) {
        console.error('Error checking stories:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
