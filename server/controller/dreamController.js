import Dream from '../models/Dream.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Create a new dream post
export const createDream = async (req, res) => {
    try {
        const { content, dreamType = 'text', audioUrl = null } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Dream content is required'
            });
        }

        const dream = new Dream({
            user: req.userId,
            content: content.trim(),
            dreamType,
            audioUrl,
            isInitialDream: false
        });

        await dream.save();
        await dream.populate('user', 'name profilePicture');

        res.status(201).json({
            success: true,
            message: 'Dream created successfully',
            dream
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get all dreams - COMPLETE FIX
export const getUserDreams = async (req, res) => {
    try {
        const dreams = await Dream.find({ user: req.userId })
            .populate('user', 'name profilePicture')
            .populate('likes', 'name profilePicture')
            .populate('comments.user', 'name profilePicture')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            dreams
        });
    } catch (error) {
        console.error('Get user dreams error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch your dreams'
        });
    }
};

// Get all dreams (community feed)
export const getAllDreams = async (req, res) => {
    try {
        const dreams = await Dream.find()
            .populate('user', 'name profilePicture')
            .populate('likes', 'name profilePicture')
            .populate('comments.user', 'name profilePicture')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            dreams
        });
    } catch (error) {
        console.error('Get all dreams error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dreams'
        });
    }
};

// Like a dream - UPDATED WITH NOTIFICATIONS
export const likeDream = async (req, res) => {
    try {
        const dream = await Dream.findById(req.params.id).populate('user');

        if (!dream) {
            return res.status(404).json({
                success: false,
                message: 'Dream not found'
            });
        }

        const alreadyLiked = dream.likes.includes(req.userId);

        if (alreadyLiked) {
            // Unlike
            dream.likes = dream.likes.filter(like =>
                like.toString() !== req.userId.toString()
            );
        } else {
            // Like
            dream.likes.push(req.userId);

            // Create notification (only if not liking own dream)
            if (dream.user._id.toString() !== req.userId) {
                const notification = new Notification({
                    recipient: dream.user._id,
                    sender: req.userId,
                    type: 'like',
                    dream: dream._id
                });

                await notification.save();
                await notification.populate('sender', 'name profilePicture');
                await notification.populate('dream', 'content');

                // Emit real-time notification
                const io = req.app.get('io');
                if (io) {
                    io.to(`user-${dream.user._id}`).emit('new-notification', notification);
                }
            }
        }

        await dream.save();
        await dream.populate('likes', 'name profilePicture');

        res.json({
            success: true,
            likes: dream.likes.length,
            liked: !alreadyLiked,
            dream
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Add comment - UPDATED WITH NOTIFICATIONS
export const addComment = async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Comment content is required'
            });
        }

        const dream = await Dream.findById(req.params.id).populate('user');

        if (!dream) {
            return res.status(404).json({
                success: false,
                message: 'Dream not found'
            });
        }

        const comment = {
            user: req.userId,
            content: content.trim()
        };

        dream.comments.push(comment);
        await dream.save();

        // Create notification (only if not commenting on own dream)
        if (dream.user._id.toString() !== req.userId) {
            const notification = new Notification({
                recipient: dream.user._id,
                sender: req.userId,
                type: 'comment',
                dream: dream._id,
                commentText: content.trim()
            });

            await notification.save();
            await notification.populate('sender', 'name profilePicture');
            await notification.populate('dream', 'content');

            // Emit real-time notification
            const io = req.app.get('io');
            if (io) {
                io.to(`user-${dream.user._id}`).emit('new-notification', notification);
            }
        }

        const updatedDream = await Dream.findById(req.params.id)
            .populate('user', 'name profilePicture')
            .populate('comments.user', 'name profilePicture')
            .populate('likes', 'name profilePicture');

        res.json({
            success: true,
            message: 'Comment added successfully',
            dream: updatedDream
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Share a dream - UPDATED WITH NOTIFICATIONS
// export const shareDream = async (req, res) => {
//     try {
//         const dream = await Dream.findById(req.params.id).populate('user');

//         if (!dream) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Dream not found'
//             });
//         }

//         dream.shares += 1;
//         await dream.save();

//         // Create notification (only if not sharing own dream)
//         if (dream.user._id.toString() !== req.userId) {
//             const notification = new Notification({
//                 recipient: dream.user._id,
//                 sender: req.userId,
//                 type: 'share',
//                 dream: dream._id
//             });

//             await notification.save();
//             await notification.populate('sender', 'name profilePicture');
//             await notification.populate('dream', 'content');

//             // Emit real-time notification
//             const io = req.app.get('io');
//             if (io) {
//                 io.to(`user-${dream.user._id}`).emit('new-notification', notification);
//             }
//         }

//         res.json({
//             success: true,
//             shares: dream.shares,
//             message: 'Dream shared successfully'
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Server error',
//             error: error.message
//         });
//     }
// };


// Delete a dream
export const deleteDream = async (req, res) => {
    try {
        const dream = await Dream.findById(req.params.id);

        if (!dream) {
            return res.status(404).json({
                success: false,
                message: 'Dream not found'
            });
        }

        if (dream.user.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this dream'
            });
        }

        await Dream.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Dream deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Update dream
export const updateDream = async (req, res) => {
    try {
        const { content } = req.body;

        console.log('🔄 updateDream called:', { dreamId: req.params.id, content });

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Dream content is required'
            });
        }

        const dream = await Dream.findById(req.params.id);

        if (!dream) {
            return res.status(404).json({
                success: false,
                message: 'Dream not found'
            });
        }

        if (dream.user.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to edit this dream'
            });
        }

        dream.content = content.trim();
        dream.updatedAt = new Date();

        await dream.save();

        const updatedDream = await Dream.findById(dream._id)
            .populate('user', 'name profilePicture')
            .populate('comments.user', 'name profilePicture')
            .populate('likes', 'name profilePicture');

        console.log('✅ Dream updated successfully:', updatedDream._id);

        res.json({
            success: true,
            message: 'Dream updated successfully',
            dream: updatedDream
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};




// server/controller/dreamController.js

// ✅ Get dream by ID
export const getDreamById = async (req, res) => {
    try {
        const dream = await Dream.findById(req.params.id)
            .populate('user', 'name profilePicture')
            .populate('likes', 'name profilePicture')
            .populate('comments.user', 'name profilePicture');

        if (!dream) {
            return res.status(404).json({
                success: false,
                message: 'Dream not found'
            });
        }

        res.json({
            success: true,
            dream
        });
    } catch (error) {
        console.error('Get dream error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ✅ Share dream with notification
export const shareDream = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, message } = req.body;
        const currentUserId = req.userId;

        console.log('📤 ===== SHARE DREAM =====');
        console.log('  Dream ID:', id);
        console.log('  Recipient:', userId);
        console.log('  Sender:', currentUserId);
        console.log('  Message:', message);

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Find dream
        const dream = await Dream.findById(id).populate('user', 'name profilePicture');
        if (!dream) {
            return res.status(404).json({
                success: false,
                message: 'Dream not found'
            });
        }

        // Find recipient
        const targetUser = await User.findById(userId).select('name profilePicture');
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if already shared
        if (!dream.sharedWith) {
            dream.sharedWith = [];
        }

        const alreadyShared = dream.sharedWith.some(
            share => share.user.toString() === userId.toString()
        );

        if (alreadyShared) {
            return res.status(400).json({
                success: false,
                message: 'Already shared with this user'
            });
        }

        // Add to sharedWith
        dream.sharedWith.push({
            user: new mongoose.Types.ObjectId(userId),
            sharedAt: new Date(),
            message: message || '',
            isRead: false
        });

        dream.sharesCount = (dream.sharesCount || 0) + 1;
        await dream.save();

        // ✅ CREATE NOTIFICATION for the recipient
        const notification = await Notification.create({
            recipient: new mongoose.Types.ObjectId(userId),
            sender: new mongoose.Types.ObjectId(currentUserId),
            type: 'dream_share',
            dream: dream._id,
            shareMessage: message || '',
            dreamContent: dream.content.substring(0, 100),
            redirectUrl: '/shared-with-me',
            isRead: false
        });

        console.log('✅ Notification created:', notification._id);

        // Populate for response
        await notification.populate('sender', 'name profilePicture');

        // ✅ Emit socket event if io is available
        const io = req.app.get('io');
        if (io) {
            io.to(`user-${userId}`).emit('new-notification', {
                ...notification.toObject(),
                sender: {
                    _id: currentUserId,
                    name: (await User.findById(currentUserId).select('name')).name,
                    profilePicture: (await User.findById(currentUserId).select('profilePicture')).profilePicture
                }
            });
            console.log('✅ Socket event emitted to user:', userId);
        }

        console.log('✅ Dream shared successfully');

        res.json({
            success: true,
            message: `Dream shared with ${targetUser.name}`,
            shares: dream.sharesCount,
            sharedWith: dream.sharedWith,
            notification,
            dream
        });

    } catch (error) {
        console.error('❌ Share dream error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to share dream'
        });
    }
};

// ✅ Search users to share with
export const searchUsersToShare = async (req, res) => {
    try {
        const { query } = req.query;
        const currentUserId = req.userId;

        console.log('🔍 Search users:', query);

        if (!query || query.length < 2) {
            return res.json({
                success: true,
                users: []
            });
        }

        const users = await User.find({
            _id: { $ne: currentUserId },
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
                { phone: { $regex: query, $options: 'i' } }
            ]
        })
            .select('name profilePicture email phone')
            .limit(10);

        console.log('✅ Found users:', users.length);

        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('❌ Search error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ✅ Get shared dreams
export const getSharedDreams = async (req, res) => {
    try {
        const userId = req.userId;

        const dreams = await Dream.find({
            'sharedWith.user': userId
        })
            .populate('user', 'name profilePicture')
            .populate('comments.user', 'name profilePicture')
            .sort({ 'sharedWith.sharedAt': -1 });

        const sharedDreams = dreams.map(dream => {
            const shareInfo = dream.sharedWith.find(
                s => s.user.toString() === userId
            );

            return {
                ...dream.toObject(),
                sharedAt: shareInfo?.sharedAt,
                shareMessage: shareInfo?.message,
                sharedBy: dream.user
            };
        });

        res.json({
            success: true,
            dreams: sharedDreams,
            count: sharedDreams.length
        });
    } catch (error) {
        console.error('❌ Get shared dreams error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};