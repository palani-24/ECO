import express from 'express';
import { 
  sendSupportMessage, 
  getUserSupportMessages, 
  getAdminSupportMessages, 
  replySupportMessage 
} from '../controllers/supportController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// User / Driver Routes
router.post('/send', protect, sendSupportMessage);
router.get('/my-messages', protect, getUserSupportMessages);

// Admin Routes
router.get('/admin/all', protect, admin, getAdminSupportMessages);
router.put('/admin/reply/:id', protect, admin, replySupportMessage);

export default router;
