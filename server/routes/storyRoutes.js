// routes/storyRoutes.js
import express from 'express';
import {
  getStories,
  uploadStory,
  toggleLike,
  addComment,
  markAsViewed,
  getStoryViewers, // 👈 ADD THIS IMPORT
  deleteStory,
  checkUserStories
} from '../controller/storyController.js';
import authenticateToken from '../middleware/auth.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// Public routes (no authentication needed)
router.get('/', getStories);
router.get('/check', authenticateToken, checkUserStories);
// Protected routes (authentication required)
router.post('/', authenticateToken, upload.single('story'), upload.errorHandler, uploadStory);
router.post('/:storyId/like', authenticateToken, toggleLike);
router.post('/:storyId/comment', authenticateToken, addComment);
router.post('/:storyId/view', authenticateToken, markAsViewed);
router.get('/:storyId/viewers', authenticateToken, getStoryViewers);
router.delete('/:storyId', authenticateToken, deleteStory);

export default router;