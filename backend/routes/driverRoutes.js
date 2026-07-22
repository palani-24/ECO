import express from 'express';
import {
  getDriverProfile,
  updateDriverStatus,
  getAssignedPickups,
  acceptPickup,
  updateCoordinates,
  completePickup
} from '../controllers/driverController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('driver')); // Restricted to role='driver'

router.get('/profile', getDriverProfile);
router.put('/status', updateDriverStatus);
router.get('/pickups', getAssignedPickups);
router.put('/pickups/:id/accept', acceptPickup);
router.put('/pickups/:id/complete', completePickup);
router.post('/coordinates', updateCoordinates);

export default router;
