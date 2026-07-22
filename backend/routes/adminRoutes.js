import express from 'express';
import {
  getAdminAnalytics,
  getAllUsers,
  getAllDrivers,
  approveDriver,
  getAllPickups,
  createCoupon,
  getCoupons,
  toggleCouponStatus,
  getSystemSettings,
  updateSystemSettings,
  managePendingRewards,
  approveRewardRedemption
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Allowed for all roles (to view active vouchers list)
router.get('/coupons', getCoupons);
router.get('/settings', getSystemSettings);

// Restricted to role='admin'
router.use(authorize('admin'));

router.get('/analytics', getAdminAnalytics);
router.get('/users', getAllUsers);
router.get('/drivers', getAllDrivers);
router.put('/drivers/:id/approve', approveDriver);
router.get('/pickups', getAllPickups);
router.post('/coupons', createCoupon);
router.put('/coupons/:id/toggle', toggleCouponStatus);
router.put('/settings', updateSystemSettings);
router.get('/rewards/pending', managePendingRewards);
router.put('/rewards/:id/approve', approveRewardRedemption);

export default router;
