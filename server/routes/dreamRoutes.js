// import express from 'express';
// import {
//     createDream,
//     getAllDreams,
//     getUserDreams, // Add this import
//     likeDream,
//     addComment,
//     deleteDream,
//     updateDream,
//     shareDream,           // ✅ Add this
//     getSharedDreams,      // ✅ Add this
//     searchUsersToShare
// } from '../controller/dreamController.js';
// import authenticateToken from '../middleware/auth.js';

// const router = express.Router();

// // All routes require authentication
// router.post('/', authenticateToken, createDream);
// router.get('/', authenticateToken, getAllDreams); // Gets all community dreams
// router.get('/my-dreams', authenticateToken, getUserDreams); // Gets only user's dreams
// router.post('/:id/like', authenticateToken, likeDream);
// router.post('/:id/comment', authenticateToken, addComment);
// router.post('/:id/share', authenticateToken, shareDream);
// router.delete('/:id', authenticateToken, deleteDream);
// router.put('/:id', authenticateToken, updateDream);
// router.post('/:dreamId/share', authenticateToken, shareDream);
// router.get('/shared-with-me', authenticateToken, getSharedDreams);
// router.get('/users/search', authenticateToken, searchUsersToShare);
// // In dreamRoutes.js

// export default router;





// server/routes/dreamRoutes.js
import express from 'express';
import {
    createDream,
    getAllDreams,
    getUserDreams,
    likeDream,
    addComment,
    deleteDream,
    updateDream,
    shareDream,
    getSharedDreams,
    searchUsersToShare,
    getDreamById
} from '../controller/dreamController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// ============================================
// ✅ IMPORTANT: SPECIFIC ROUTES FIRST!
// ============================================

// ✅ User's own dreams
router.get('/my-dreams', authenticateToken, getUserDreams);

// ✅ Dreams shared with me (MUST be before /:id)
router.get('/shared-with-me', authenticateToken, getSharedDreams);

// ✅ Search users to share with (MUST be before /:id)
router.get('/users/search', authenticateToken, searchUsersToShare);

// ============================================
// ✅ GENERAL ROUTES
// ============================================

// ✅ Create dream
router.post('/', authenticateToken, createDream);

// ✅ Get all community dreams
router.get('/', authenticateToken, getAllDreams);

// ============================================
// ✅ DYNAMIC ROUTES (with :id) LAST
// ============================================

// ✅ Get single dream
router.get('/:id', authenticateToken, getDreamById);

// ✅ Like dream
router.post('/:id/like', authenticateToken, likeDream);

// ✅ Comment on dream
router.post('/:id/comment', authenticateToken, addComment);

// ✅ Share dream (single route - no duplicates!)
router.post('/:id/share', authenticateToken, shareDream);

// ✅ Update dream
router.put('/:id', authenticateToken, updateDream);

// ✅ Delete dream
router.delete('/:id', authenticateToken, deleteDream);

export default router;