import express from 'express';
import {
  getStoreProducts,
  redeemStoreProduct,
  getMyStoreOrders
} from '../controllers/storeController.js';
import { protect, authorize } from '../middleware/auth.js';
import { cacheResponse } from '../middleware/cache.js';

const router = express.Router();

// Public route to view products catalog with 60s in-memory caching
router.get('/products', cacheResponse(60), getStoreProducts);

// Protected routes for authenticated users
router.use(protect);
router.post('/redeem', authorize('user'), redeemStoreProduct);
router.get('/my-orders', authorize('user'), getMyStoreOrders);

export default router;
