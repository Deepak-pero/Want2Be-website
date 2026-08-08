// import Dream from '../models/Dream.js';

// // Create a new dream post
// export const createDream = async (req, res) => {
//     try {
//         const { content, dreamType = 'text', audioUrl = null } = req.body;

//         if (!content || !content.trim()) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Dream content is required'
//             });
//         }

//         const dream = new Dream({
//             user: req.userId,
//             content: content.trim(),
//             dreamType,
//             audioUrl,
//             isInitialDream: false // 🔥 Normal dreams are not initial dreams
//         });

//         await dream.save();
//         await dream.populate('user', 'name profilePicture');

//         res.status(201).json({
//             success: true,
//             message: 'Dream created successfully',
//             dream
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Server error',
//             error: error.message
//         });
//     }
// };


// // Get all dreams - COMPLETE FIX

// export const getUserDreams = async (req, res) => {
//     try {
//         const dreams = await Dream.find({ user: req.userId })
//             .populate('user', 'name profilePicture')
//             .populate('likes', 'name profilePicture')
//             .populate('comments.user', 'name profilePicture')
//             .sort({ createdAt: -1 });

//         res.json({
//             success: true,
//             dreams
//         });
//     } catch (error) {
//         console.error('Get user dreams error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to fetch your dreams'
//         });
//     }
// };

// // Get all dreams (community feed)
// export const getAllDreams = async (req, res) => {
//     try {
//         const dreams = await Dream.find()
//             .populate('user', 'name profilePicture')
//             .populate('likes', 'name profilePicture')
//             .populate('comments.user', 'name profilePicture')
//             .sort({ createdAt: -1 });

//         res.json({
//             success: true,
//             dreams
//         });
//     } catch (error) {
//         console.error('Get all dreams error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to fetch dreams'
//         });
//     }
// };


// // Like a dream
// export const likeDream = async (req, res) => {
//     try {
//         const dream = await Dream.findById(req.params.id);

//         if (!dream) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Dream not found'
//             });
//         }

//         const alreadyLiked = dream.likes.includes(req.userId);

//         if (alreadyLiked) {
//             dream.likes = dream.likes.filter(like =>
//                 like.toString() !== req.userId.toString()
//             );
//         } else {
//             dream.likes.push(req.userId);
//         }

//         await dream.save();
//         await dream.populate('likes', 'name profilePicture');

//         res.json({
//             success: true,
//             likes: dream.likes.length,
//             liked: !alreadyLiked,
//             dream
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Server error',
//             error: error.message
//         });
//     }
// };

// // Add comment
// export const addComment = async (req, res) => {
//     try {
//         const { content } = req.body;

//         if (!content || !content.trim()) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Comment content is required'
//             });
//         }

//         const dream = await Dream.findById(req.params.id);

//         if (!dream) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Dream not found'
//             });
//         }

//         const comment = {
//             user: req.userId,
//             content: content.trim()
//         };

//         dream.comments.push(comment);
//         await dream.save();

//         const updatedDream = await Dream.findById(req.params.id)
//             .populate('user', 'name profilePicture')
//             .populate('comments.user', 'name profilePicture')
//             .populate('likes', 'name profilePicture');

//         res.json({
//             success: true,
//             message: 'Comment added successfully',
//             dream: updatedDream
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Server error',
//             error: error.message
//         });
//     }
// };

// // Share a dream
// export const shareDream = async (req, res) => {
//     try {
//         const dream = await Dream.findById(req.params.id);

//         if (!dream) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Dream not found'
//             });
//         }

//         dream.shares += 1;
//         await dream.save();

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

// // Delete a dream
// export const deleteDream = async (req, res) => {
//     try {
//         const dream = await Dream.findById(req.params.id);

//         if (!dream) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Dream not found'
//             });
//         }

//         if (dream.user.toString() !== req.userId) {
//             return res.status(403).json({
//                 success: false,
//                 message: 'Not authorized to delete this dream'
//             });
//         }

//         await Dream.findByIdAndDelete(req.params.id);

//         res.json({
//             success: true,
//             message: 'Dream deleted successfully'
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Server error',
//             error: error.message
//         });
//     }
// };

// // In dreamController.js - Make sure updateDream returns the same dream
// export const updateDream = async (req, res) => {
//     try {
//         const { content } = req.body;

//         console.log('🔄 updateDream called:', { dreamId: req.params.id, content });

//         if (!content || !content.trim()) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Dream content is required'
//             });
//         }

//         const dream = await Dream.findById(req.params.id);

//         if (!dream) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Dream not found'
//             });
//         }

//         if (dream.user.toString() !== req.userId) {
//             return res.status(403).json({
//                 success: false,
//                 message: 'Not authorized to edit this dream'
//             });
//         }

//         // Update the dream content
//         dream.content = content.trim();
//         dream.updatedAt = new Date();

//         await dream.save();

//         // Get the updated dream with populated data
//         const updatedDream = await Dream.findById(dream._id)
//             .populate('user', 'name profilePicture')
//             .populate('comments.user', 'name profilePicture')
//             .populate('likes', 'name profilePicture');

//         console.log('✅ Dream updated successfully:', updatedDream._id);

//         res.json({
//             success: true,
//             message: 'Dream updated successfully',
//             dream: updatedDream // This should have the SAME _id
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Server error',
//             error: error.message
//         });
//     }
// };



import Dream from '../models/Dream.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

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
export const shareDream = async (req, res) => {
    try {
        const dream = await Dream.findById(req.params.id).populate('user');

        if (!dream) {
            return res.status(404).json({
                success: false,
                message: 'Dream not found'
            });
        }

        dream.shares += 1;
        await dream.save();

        // Create notification (only if not sharing own dream)
        if (dream.user._id.toString() !== req.userId) {
            const notification = new Notification({
                recipient: dream.user._id,
                sender: req.userId,
                type: 'share',
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

        res.json({
            success: true,
            shares: dream.shares,
            message: 'Dream shared successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};


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