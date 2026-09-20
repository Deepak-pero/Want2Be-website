// server/controllers/reelController.js
import mongoose from 'mongoose';
import Reel from '../models/Reels.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import cloudinary from '../utils/cloudinary.js';
import { Readable } from 'stream';

// ============================================
// ✅ HELPER: Upload to Cloudinary
// ============================================
const uploadToCloudinary = (buffer, folder, resourceType = 'auto') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: resourceType,
                transformation: resourceType === 'video' 
                    ? [{ quality: 'auto' }, { fetch_format: 'auto' }]
                    : [{ quality: 'auto' }, { fetch_format: 'auto' }]
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

// ============================================
// ✅ CREATE REEL
// ============================================
export const createReel = async (req, res) => {
    try {
        console.log('📸 Create reel request');
        console.log('👤 User:', req.userId);
        console.log('📁 File:', req.file);

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const isVideo = req.file.mimetype.startsWith('video/');
        const isImage = req.file.mimetype.startsWith('image/');

        if (!isVideo && !isImage) {
            return res.status(400).json({
                success: false,
                message: 'Only images and videos are allowed'
            });
        }

        const { caption = '' } = req.body;

        // ✅ Extract hashtags from caption
        const hashtags = caption.match(/#\w+/g)?.map(tag => tag.slice(1).toLowerCase()) || [];

        // ✅ Upload to Cloudinary
        const result = await uploadToCloudinary(
            req.file.buffer,
            'want2be/reels',
            isVideo ? 'video' : 'image'
        );

        console.log('✅ Cloudinary upload:', result.secure_url);

        const reel = new Reel({
            user: req.userId,
            mediaType: isVideo ? 'video' : 'image',
            mediaUrl: result.secure_url,
            publicId: result.public_id,
            caption: caption.trim(),
            hashtags
        });

        await reel.save();
        await reel.populate('user', 'name profilePicture');

        res.json({
            success: true,
            reel,
            message: 'Reel posted successfully! 🎉'
        });

    } catch (error) {
        console.error('❌ Create reel error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create reel'
        });
    }
};

// ============================================
// ✅ GET FEED REELS (Paginated)
// ============================================
export const getFeedReels = async (req, res) => {
    try {
        const { page = 1, limit = 10, userId } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        let query = { isPublic: true, isArchived: false };

        // ✅ If userId provided, show only that user's reels
        if (userId) {
            query.user = userId;
        }

        const reels = await Reel.find(query)
            .populate('user', 'name profilePicture')
            .populate('comments.user', 'name profilePicture')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Reel.countDocuments(query);

        // ✅ Add isLiked field
        const reelsWithLikeStatus = reels.map(reel => {
            const reelObj = reel.toObject();
            reelObj.isLiked = reel.likes.some(
                like => like.toString() === req.userId
            );
            reelObj.likeCount = reel.likes.length;
            reelObj.commentCount = reel.comments.length;
            return reelObj;
        });

        res.json({
            success: true,
            reels: reelsWithLikeStatus,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                hasMore: skip + reels.length < total
            }
        });

    } catch (error) {
        console.error('❌ Get feed error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// ✅ GET SINGLE REEL
// ============================================
export const getReelById = async (req, res) => {
    try {
        const reel = await Reel.findById(req.params.id)
            .populate('user', 'name profilePicture')
            .populate('comments.user', 'name profilePicture');

        if (!reel) {
            return res.status(404).json({
                success: false,
                message: 'Reel not found'
            });
        }

        // ✅ Increment views
        if (!reel.viewers.includes(req.userId)) {
            reel.viewers.push(req.userId);
            reel.views = reel.viewers.length;
            await reel.save();
        }

        const reelObj = reel.toObject();
        reelObj.isLiked = reel.likes.some(like => like.toString() === req.userId);
        reelObj.likeCount = reel.likes.length;
        reelObj.commentCount = reel.comments.length;

        res.json({
            success: true,
            reel: reelObj
        });

    } catch (error) {
        console.error('❌ Get reel error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// ✅ LIKE REEL
// ============================================
export const likeReel = async (req, res) => {
    try {
        const reel = await Reel.findById(req.params.id);

        if (!reel) {
            return res.status(404).json({
                success: false,
                message: 'Reel not found'
            });
        }

        const userId = req.userId;
        const isLiked = reel.likes.includes(userId);

        if (isLiked) {
            reel.likes = reel.likes.filter(id => id.toString() !== userId);
        } else {
            reel.likes.push(userId);

            // ✅ Create notification
            if (reel.user.toString() !== userId) {
                await Notification.create({
                    recipient: reel.user,
                    sender: userId,
                    type: 'like',
                    message: 'liked your reel'
                });
            }
        }

        await reel.save();

        res.json({
            success: true,
            isLiked: !isLiked,
            likeCount: reel.likes.length
        });

    } catch (error) {
        console.error('❌ Like error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// ✅ COMMENT ON REEL
// ============================================
export const commentOnReel = async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Comment cannot be empty'
            });
        }

        const reel = await Reel.findById(req.params.id);

        if (!reel) {
            return res.status(404).json({
                success: false,
                message: 'Reel not found'
            });
        }

        reel.comments.push({
            user: req.userId,
            content: content.trim()
        });

        await reel.save();
        await reel.populate('comments.user', 'name profilePicture');

        const newComment = reel.comments[reel.comments.length - 1];

        res.json({
            success: true,
            comment: newComment,
            commentCount: reel.comments.length
        });

    } catch (error) {
        console.error('❌ Comment error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// ✅ DELETE REEL
// ============================================
export const deleteReel = async (req, res) => {
    try {
        const reel = await Reel.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!reel) {
            return res.status(404).json({
                success: false,
                message: 'Reel not found or unauthorized'
            });
        }

        // Delete from Cloudinary
        if (reel.publicId) {
            try {
                await cloudinary.uploader.destroy(reel.publicId, {
                    resource_type: reel.mediaType === 'video' ? 'video' : 'image'
                });
            } catch (err) {
                console.error('Cloudinary delete error:', err);
            }
        }

        await reel.deleteOne();

        res.json({
            success: true,
            message: 'Reel deleted successfully'
        });

    } catch (error) {
        console.error('❌ Delete error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============================================
// ✅ INCREMENT VIEW
// ============================================
export const incrementView = async (req, res) => {
    try {
        const reel = await Reel.findById(req.params.id);

        if (!reel) {
            return res.status(404).json({
                success: false,
                message: 'Reel not found'
            });
        }

        if (!reel.viewers.includes(req.userId)) {
            reel.viewers.push(req.userId);
            reel.views = reel.viewers.length;
            await reel.save();
        }

        res.json({
            success: true,
            views: reel.views
        });

    } catch (error) {
        console.error('❌ View error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};