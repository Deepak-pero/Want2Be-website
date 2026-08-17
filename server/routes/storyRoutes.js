// // routes/storyRoutes.js
// import express from 'express';
// import {
//   getStories,
//   uploadStory,
//   toggleLike,
//   addComment,
//   markAsViewed,
//   getStoryViewers,
//   deleteStory,
//   checkUserStories
// } from '../controller/storyController.js';
// import authenticateToken from '../middleware/auth.js';
// import upload from '../middleware/multer.js';

// const router = express.Router();

// // ============================================
// // PUBLIC ROUTES (No authentication)
// // ============================================
// router.get('/', getStories);

// // ============================================
// // PROTECTED ROUTES (Authentication required)
// // ============================================

// // 👇 IMPORTANT: Specific routes must come BEFORE dynamic routes
// router.get('/check', authenticateToken, checkUserStories);

// // 👇 Dynamic routes (with :storyId) come AFTER specific routes
// router.get('/:storyId/viewers', authenticateToken, getStoryViewers);

// // 👇 POST routes
// router.post('/', authenticateToken, upload.single('story'), upload.errorHandler, uploadStory);
// router.post('/:storyId/like', authenticateToken, toggleLike);
// router.post('/:storyId/comment', authenticateToken, addComment);
// router.post('/:storyId/view', authenticateToken, markAsViewed);

// // 👇 DELETE route
// router.delete('/:storyId', authenticateToken, deleteStory);

// export default router;




// server/routes/storyRoutes.js
import express from 'express';
import {
  getStories,
  getAllUsersWithStories,
  getUserStories,
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
// ✅ PUBLIC ROUTES (No authentication required)
// ============================================

// GET all stories - PUBLIC (no token needed)
router.get('/', getStories);

// ============================================
// ✅ PROTECTED ROUTES (Authentication required)
// ============================================

// Get all users with story status
router.get('/users', authenticateToken, getAllUsersWithStories);

// Get stories for a specific user
router.get('/user/:userId', authenticateToken, getUserStories);

// Check if user has stories
router.get('/check', authenticateToken, checkUserStories);

// Upload story
router.post('/', authenticateToken, upload.single('story'), upload.errorHandler, uploadStory);

// Like story
router.post('/:storyId/like', authenticateToken, toggleLike);

// Comment on story
router.post('/:storyId/comment', authenticateToken, addComment);

// Mark story as viewed
router.post('/:storyId/view', authenticateToken, markAsViewed);

// Get story viewers
router.get('/:storyId/viewers', authenticateToken, getStoryViewers);

// Delete story
router.delete('/:storyId', authenticateToken, deleteStory);

export default router;