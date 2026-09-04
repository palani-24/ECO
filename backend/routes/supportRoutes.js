import express from 'express';
import { 
  sendSupportMessage, 
  getUserSupportMessages, 
  getAdminSupportMessages, 
  replySupportMessage,
  handleAIChat
} from '../controllers/supportController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Real AI Assistant Conversation Route
router.post('/ai-chat', handleAIChat);

// User / Driver Routes
router.post('/send', protect, sendSupportMessage);
router.get('/my-messages', protect, getUserSupportMessages);

// Admin Routes
router.get('/admin/all', protect, authorize('admin'), getAdminSupportMessages);
router.put('/admin/reply/:id', protect, authorize('admin'), replySupportMessage);

export default router;
