// routes/dreamAnalysisRoutes.js
import express from 'express';
import { analyzeDream, getAnalysisHistory } from '../controller/dreamAnalysisController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

router.post('/analyze', authenticateToken, analyzeDream);
router.get('/history', authenticateToken, getAnalysisHistory);

export default router;