// controllers/searchController.js
import User from '../models/User.js';
import Dream from '../models/Dream.js';

// Search users
export const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim().length < 2) {
            return res.json({
                success: true,
                users: []
            });
        }

        const users = await User.find({
            name: { $regex: q, $options: 'i' }
        })
            .select('name email profilePicture bio')
            .limit(10);

        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: 'Search failed'
        });
    }
};

// Get user public profile
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('name email profilePicture bio createdAt');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user's public dreams
        const dreams = await Dream.find({ user: req.params.userId })
            .populate('user', 'name profilePicture')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            success: true,
            user,
            dreams
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user profile'
        });
    }
};