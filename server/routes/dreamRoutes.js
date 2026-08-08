import express from 'express';
import {
    createDream,
    getAllDreams,
    getUserDreams, // Add this import
    likeDream,
    addComment,
    shareDream,
    deleteDream,
    updateDream,
} from '../controller/dreamController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.post('/', authenticateToken, createDream);
router.get('/', authenticateToken, getAllDreams); // Gets all community dreams
router.get('/my-dreams', authenticateToken, getUserDreams); // Gets only user's dreams
router.post('/:id/like', authenticateToken, likeDream);
router.post('/:id/comment', authenticateToken, addComment);
router.post('/:id/share', authenticateToken, shareDream);
router.delete('/:id', authenticateToken, deleteDream);
router.put('/:id', authenticateToken, updateDream);
// In dreamRoutes.js

export default router;