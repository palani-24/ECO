import express from 'express';
import { 
  getVapidPublicKey, 
  registerPushSubscription, 
  broadcastMorningWasteAlert 
} from '../services/pushNotificationService.js';
import { getMsUntilNext6AMIST } from '../services/morningScheduler.js';

const router = express.Router();

/**
 * GET /api/notifications/vapid-public-key
 * Returns VAPID public key so client PWA can subscribe
 */
router.get('/vapid-public-key', (req, res) => {
  res.json({
    success: true,
    publicKey: getVapidPublicKey()
  });
});

/**
 * POST /api/notifications/subscribe
 * Registers or updates a user's device Web Push subscription
 */
router.post('/subscribe', async (req, res) => {
  try {
    const { endpoint, keys, userId, device } = req.body;
    if (!endpoint || !keys) {
      return res.status(400).json({ success: false, message: 'Missing push subscription payload' });
    }

    const sub = await registerPushSubscription({ endpoint, keys, userId, device });
    res.json({
      success: true,
      message: 'Web push notification subscription registered successfully!',
      subscriptionId: sub._id
    });
  } catch (err) {
    console.error('[Push Subscribe Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/notifications/broadcast-morning
 * Broadcasts morning waste segregation reminder to all subscribers & socket clients
 */
router.post('/broadcast-morning', async (req, res) => {
  try {
    const isTest = req.body.isTest !== false;
    const result = await broadcastMorningWasteAlert({ isTest });
    res.json(result);
  } catch (err) {
    console.error('[Broadcast Morning Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/notifications/scheduler-status
 * Check next 6:00 AM IST alarm status
 */
router.get('/scheduler-status', (req, res) => {
  const { diffMs, targetDateIST } = getMsUntilNext6AMIST();
  res.json({
    success: true,
    nextRunIST: targetDateIST,
    hoursRemaining: (diffMs / 3600000).toFixed(2),
    timestamp: new Date()
  });
});

export default router;
