import express from 'express';
import {
  editProfile,
  manageAddresses,
  schedulePickup,
  getMyPickups,
  getMyTransactions,
  getMyRedemptions,
  redeemReward,
  getMyNotifications,
  markNotificationRead,
  getLeaderboard,
  getImpactMetrics,
  getChallenges,
  joinChallenge
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('user')); // Restricted to role='user'

router.put('/profile', editProfile);
router.post('/addresses', manageAddresses);
router.post('/pickups', schedulePickup);
router.get('/pickups', getMyPickups);
router.get('/transactions', getMyTransactions);
router.get('/redemptions', getMyRedemptions);
router.post('/redeem', redeemReward);
router.get('/notifications', getMyNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.get('/leaderboard', getLeaderboard);
router.get('/impact', getImpactMetrics);
router.get('/challenges', getChallenges);
router.post('/challenges/:id/join', joinChallenge);

export default router;

