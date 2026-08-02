import express from 'express';
import { 
  registerUser, 
  loginUser, 
  forgotPassword, 
  resetPassword, 
  getUserProfile,
  updateUserProfile,
  uploadAvatarImage,
  getPublicLeaderboard
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { uploadAvatar } from '../middleware/upload.js';

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/leaderboard', getPublicLeaderboard);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/upload-avatar', protect, uploadAvatar.single('avatar'), uploadAvatarImage);

export default router;


