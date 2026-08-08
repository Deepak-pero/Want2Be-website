import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const ONLINE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export const isUserOnline = (lastActive) => {
    if (!lastActive) return false;
    return Date.now() - new Date(lastActive).getTime() < ONLINE_THRESHOLD_MS;
};

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'dream-app-secret', (err, decoded) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Invalid token'
            });
        }

        req.userId = decoded.userId;

        // Keep lastActive fresh without blocking the request
        User.findByIdAndUpdate(decoded.userId, { lastActive: new Date() }).catch(() => {});

        next();
    });
};



export default authenticateToken