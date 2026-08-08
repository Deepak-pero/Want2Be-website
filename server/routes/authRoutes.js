// // // routes/authRoutes.js
// // import express from 'express';
// // import {
// //     requestOTP,
// //     verifyOTP,
// //     getCurrentUser,
// //     updateProfile // Add this import
// // } from '../controller/authController.js';
// // import authenticateToken from '../middleware/auth.js';

// // const router = express.Router();

// // router.post('/request-otp', requestOTP);
// // router.post('/verify-otp', verifyOTP);
// // router.get('/me', authenticateToken, getCurrentUser);
// // router.put('/profile', authenticateToken, updateProfile); // Add this route

// // export default router;


// // routes/authRoutes.js
// import express from 'express';
// import {
//     requestOTP,
//     verifyOTP,
//     getCurrentUser,
//     updateProfileWithUpload
// } from '../controller/authController.js';
// import authenticateToken from '../middleware/auth.js';
// import upload from '../middleware/multer.js';

// const router = express.Router();

// router.post('/request-otp', requestOTP);
// router.post('/verify-otp', verifyOTP);
// router.get('/me', authenticateToken, getCurrentUser);

// // Apply multer middleware with error handling
// router.put('/profile',
//     authenticateToken,
//     upload.single('profilePicture'),
//     upload.errorHandler, // Add error handler
//     updateProfileWithUpload
// );

// export default router;



// routes/auth.js - Add these routes
import express from 'express';
import {
    requestOTP,
    verifyOTP,
    resendOTP,
    getCurrentUser,
    updateProfileWithUpload
} from '../controller/authController.js';
import { searchUsers, getUserProfile } from '../controller/searchController.js'; // Add this 
import authenticateToken from '../middleware/auth.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// Existing routes
router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.get('/me', authenticateToken, getCurrentUser);
router.put('/profile', authenticateToken, upload.single('profilePicture'), updateProfileWithUpload);

// Add search routes
router.get('/search/users', authenticateToken, searchUsers);
router.get('/users/:userId', authenticateToken, getUserProfile);

export default router;