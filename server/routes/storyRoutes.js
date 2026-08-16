// routes/storyRoutes.js
import express from 'express';
import {
  getStories,
  uploadStory,
  toggleLike,
  addComment,
  markAsViewed,
  getStoryViewers,
  deleteStory,
  checkUserStories
} from '../controller/storyController.js';
import authenticateToken from '../middleware/auth.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No authentication)
// ============================================
router.get('/', getStories);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

// 👇 IMPORTANT: Specific routes must come BEFORE dynamic routes
router.get('/check', authenticateToken, checkUserStories);

// 👇 Dynamic routes (with :storyId) come AFTER specific routes
router.get('/:storyId/viewers', authenticateToken, getStoryViewers);

// 👇 POST routes
router.post('/', authenticateToken, upload.single('story'), upload.errorHandler, uploadStory);
router.post('/:storyId/like', authenticateToken, toggleLike);
router.post('/:storyId/comment', authenticateToken, addComment);
router.post('/:storyId/view', authenticateToken, markAsViewed);

// 👇 DELETE route
router.delete('/:storyId', authenticateToken, deleteStory);

export default router;

