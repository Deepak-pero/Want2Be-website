// server/routes/reelRoutes.js
import express from 'express';
import {
    createReel,
    getFeedReels,
    getReelById,
    likeReel,
    commentOnReel,
    deleteReel,
    incrementView
} from '../controller/reelController.js';
import authenticateToken from '../middleware/auth.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// ✅ Get feed (with pagination)
router.get('/feed', authenticateToken, getFeedReels);

// ✅ Get single reel
router.get('/:id', authenticateToken, getReelById);

// ✅ Create reel (upload image/video)
router.post('/', authenticateToken, upload.single('media'), upload.errorHandler, createReel);

// ✅ Like reel
router.post('/:id/like', authenticateToken, likeReel);

// ✅ Comment on reel
router.post('/:id/comment', authenticateToken, commentOnReel);

// ✅ Increment view
router.post('/:id/view', authenticateToken, incrementView);

// ✅ Delete reel
router.delete('/:id', authenticateToken, deleteReel);

export default router;