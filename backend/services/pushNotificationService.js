import { createRequire } from 'module';
import PushSubscription from '../models/PushSubscription.js';
import { broadcastEvent } from '../config/socket.js';

const require = createRequire(import.meta.url);
const webpush = require('web-push');

// Default VAPID keys if not set in environment
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BHgvSy80yvRcvB4g0mV0Ru0H6Xva0et7D0_cGu11Zqb5ycnYfV7FThFriqjSpEXIZSFlvujLpAVjxVgIt3LV4Nw';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'vtuKUu2vqouwDQWynqT7BDWgz1UmAP_uVRPzWC8ZW34';
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:support@ecoreward.org';

try {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  console.log('✅ [WebPush Service] VAPID configured successfully');
} catch (err) {
  console.warn('⚠️ [WebPush Service] VAPID init warning:', err.message);
}

export const getVapidPublicKey = () => VAPID_PUBLIC_KEY;

/**
 * Register or update a browser Web Push subscription
 */
export const registerPushSubscription = async ({ endpoint, keys, userId = null, device = '' }) => {
  if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
    throw new Error('Invalid push subscription payload');
  }

  const existing = await PushSubscription.findOne({ endpoint });
  if (existing) {
    existing.keys = keys;
    if (userId) existing.user = userId;
    if (device) existing.device = device;
    existing.isActive = true;
    await existing.save();
    return existing;
  }

  const newSub = await PushSubscription.create({
    endpoint,
    keys,
    user: userId || null,
    device: device || 'Mobile PWA / Web Client',
    isActive: true
  });

  return newSub;
};

/**
 * Broadcast Morning 6:00 AM Waste Segregation & Pickup Notification to ALL installed devices & active sockets
 */
export const broadcastMorningWasteAlert = async ({ isTest = false } = {}) => {
  const payload = {
    title: '🌅 6:00 AM Daily Waste Segregation Alert!',
    titleEn: '🌅 6:00 AM Daily Waste Segregation Alert!',
    body: 'Good morning! Please keep today\'s segregated recyclables ready for doorstep collection. Earn instant EcoPoints & cash! ♻️',
    bodyEn: "Good morning! Please keep today's segregated waste ready for doorstep pickup. Earn EcoPoints today!",
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'eco-morning-waste-reminder',
    timestamp: Date.now(),
    isTest,
    data: {
      url: '/schedule-pickup',
      action: 'pickup'
    }
  };

  // 1. Broadcast to ALL real-time active Socket.IO connected clients
  try {
    broadcastEvent('morning-waste-reminder', payload);
    console.log('📡 [Socket Broadcast] Morning waste reminder dispatched to live clients');
  } catch (socketErr) {
    console.warn('⚠️ [Socket Broadcast Warning]:', socketErr.message);
  }

  // 2. Broadcast Native Web Push to ALL installed devices & registered push subscriptions in MongoDB
  let successCount = 0;
  let failureCount = 0;

  try {
    const subscriptions = await PushSubscription.find({ isActive: true });
    console.log(`📱 [WebPush] Broadcasting to ${subscriptions.length} registered push subscriptions...`);

    const stringPayload = JSON.stringify(payload);

    const pushPromises = subscriptions.map(async (sub) => {
      const pushConfig = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth
        }
      };

      try {
        await webpush.sendNotification(pushConfig, stringPayload);
        sub.lastNotifiedAt = new Date();
        await sub.save();
        successCount++;
      } catch (err) {
        failureCount++;
        // If device unsubscribed or token expired (410 Gone / 404 Not Found)
        if (err.statusCode === 410 || err.statusCode === 404) {
          sub.isActive = false;
          await sub.save();
        }
      }
    });

    await Promise.allSettled(pushPromises);
  } catch (dbErr) {
    console.warn('⚠️ [WebPush DB Warning]:', dbErr.message);
  }

  return {
    success: true,
    message: isTest 
      ? 'Morning waste test notification dispatched successfully to all devices!' 
      : 'Morning 6:00 AM waste reminder delivered to all registered citizens!',
    sentCount: successCount,
    failedCount: failureCount,
    timestamp: new Date()
  };
};
