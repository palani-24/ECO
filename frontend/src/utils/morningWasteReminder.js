// 🌅 Daily 6:00 AM Waste Segregation & Doorstep Pickup Notification Manager (Web Push & Sockets)
import { soundFx } from './audioFeedback';
import { triggerHaptic } from './mobileNative';
import api from './api';

const NOTIF_TAG = 'eco-morning-waste-reminder';
const PREF_KEY = 'eco_morning_waste_reminder_enabled';
const LAST_SHOWN_KEY = 'eco_morning_waste_last_shown_date';
const PUSH_REGISTERED_KEY = 'eco_morning_waste_push_registered';

// Default VAPID Public Key fallback (matching backend)
const DEFAULT_VAPID_PUBLIC_KEY = 'BHgvSy80yvRcvB4g0mV0Ru0H6Xva0et7D0_cGu11Zqb5ycnYfV7FThFriqjSpEXIZSFlvujLpAVjxVgIt3LV4Nw';

export const MORNING_NOTIF_CONTENT = {
  title: '🌅 காலை 6:00 AM குப்பை நினைவூட்டல்!',
  titleEn: '🌅 6:00 AM Daily Waste Segregation Alert!',
  message: 'காலை வணக்கம்! இன்று உங்கள் மக்கும் & மறுசுழற்சி குப்பைகளை தரம் பிரித்து வெளியே வைக்கவும். எங்களின் தூய்மை வாகனம் விரைவில் உங்கள் பகுதிக்கு வரும்! ♻️',
  messageEn: "Good morning! Please keep today's segregated waste ready for doorstep pickup. Earn EcoPoints today!",
  icon: '/favicon.svg',
  badge: '/favicon.svg'
};

/**
 * Utility to convert base64 VAPID public key to Uint8Array for PushManager
 */
export const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

/**
 * Subscribe device to Web Push notifications so user gets real 6:00 AM alerts even when app/browser is closed
 */
export const subscribeDeviceToPushNotifications = async (userId = null) => {
  if (typeof window === 'undefined') return null;
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Web Push is not supported in this browser environment');
    return null;
  }

  try {
    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    if (permission !== 'granted') {
      console.log('Notification permission not granted');
      return null;
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      let publicKey = DEFAULT_VAPID_PUBLIC_KEY;
      try {
        const res = await api.get('/notifications/vapid-public-key');
        if (res.data?.success && res.data?.publicKey) {
          publicKey = res.data.publicKey;
        }
      } catch (keyErr) {
        console.warn('Using fallback VAPID key');
      }

      const convertedKey = urlBase64ToUint8Array(publicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey
      });
    }

    if (subscription) {
      const subJson = subscription.toJSON();
      await api.post('/notifications/subscribe', {
        endpoint: subscription.endpoint,
        keys: subJson.keys,
        userId: userId || null,
        device: navigator.userAgent
      });
      localStorage.setItem(PUSH_REGISTERED_KEY, 'true');
      console.log('✅ [WebPush] Device successfully subscribed for morning waste alerts!');
      return subscription;
    }
  } catch (err) {
    console.warn('⚠️ [WebPush Subscription Note]:', err.message);
  }
  return null;
};

/**
 * Returns milliseconds until next 6:00:00 AM
 */
export const getMillisecondsUntil6AM = () => {
  const now = new Date();
  const next6AM = new Date();
  next6AM.setHours(6, 0, 0, 0);

  // If already past 6:00 AM today, schedule for tomorrow 6:00 AM
  if (now >= next6AM) {
    next6AM.setDate(next6AM.getDate() + 1);
  }

  return next6AM.getTime() - now.getTime();
};

/**
 * Check if morning waste reminder is active
 */
export const isMorningReminderEnabled = () => {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(PREF_KEY) !== 'false';
};

/**
 * Toggle morning reminder setting
 */
export const setMorningReminderEnabled = async (enabled, userId = null) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PREF_KEY, enabled ? 'true' : 'false');
  if (enabled) {
    await subscribeDeviceToPushNotifications(userId);
  }
};

/**
 * Show the native notification & in-app alerts (and optionally trigger backend broadcast for tests)
 */
export const triggerMorningWasteNotification = async ({ isTest = false, addToast = null, triggerBackend = false } = {}) => {
  if (typeof window === 'undefined') return false;

  const todayStr = new Date().toISOString().split('T')[0];

  // If not a test and already shown today, skip
  if (!isTest && localStorage.getItem(LAST_SHOWN_KEY) === todayStr) {
    return false;
  }

  // 1. Play gentle morning chime & vibration
  triggerHaptic(40);
  try {
    soundFx.playSuccessChime();
  } catch (e) {
    console.warn('Audio feedback failed:', e);
  }

  // 2. Mark as shown for today
  if (!isTest) {
    localStorage.setItem(LAST_SHOWN_KEY, todayStr);
  }

  // 3. Dispatch global in-app event for active UI components
  window.dispatchEvent(new CustomEvent('eco-morning-waste-reminder', {
    detail: {
      isTest,
      timestamp: Date.now(),
      title: MORNING_NOTIF_CONTENT.title,
      message: MORNING_NOTIF_CONTENT.message
    }
  }));

  // 4. Trigger Web Push / Native System Notification if supported & granted
  let showedNative = false;
  if ('Notification' in window) {
    let perm = Notification.permission;
    if (perm === 'default') {
      try {
        perm = await Notification.requestPermission();
      } catch (err) {
        console.warn('Notification permission error:', err);
      }
    }

    if (perm === 'granted') {
      const options = {
        body: MORNING_NOTIF_CONTENT.message,
        icon: MORNING_NOTIF_CONTENT.icon,
        badge: MORNING_NOTIF_CONTENT.badge,
        tag: NOTIF_TAG,
        renotify: true,
        vibrate: [200, 100, 200, 100, 300],
        data: {
          url: '/schedule-pickup',
          action: 'pickup'
        },
        actions: [
          { action: 'book', title: 'Doorstep Pickup புக் செய்' },
          { action: 'open', title: 'Open App' }
        ]
      };

      try {
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.ready;
          if (reg && reg.showNotification) {
            await reg.showNotification(MORNING_NOTIF_CONTENT.title, options);
            showedNative = true;
          }
        }
      } catch (swErr) {
        console.warn('SW showNotification failed, trying fallback:', swErr);
      }

      if (!showedNative) {
        try {
          new Notification(MORNING_NOTIF_CONTENT.title, options);
          showedNative = true;
        } catch (notifErr) {
          console.warn('new Notification fallback failed:', notifErr);
        }
      }
    }
  }

  // 5. If test is requested with triggerBackend, send push notification from server to all registered devices
  if (isTest && triggerBackend) {
    try {
      api.post('/notifications/broadcast-morning', { isTest: true }).catch((err) => {
        console.warn('Backend broadcast alert note:', err.message);
      });
    } catch (e) {
      console.warn('Broadcast trigger note:', e);
    }
  }

  if (addToast) {
    addToast(
      isTest 
        ? '🌅 6:00 AM குப்பை சேகரிப்பு Notification Real-Time-ல் அனுப்பப்பட்டது!' 
        : MORNING_NOTIF_CONTENT.message,
      'success',
      'காலை 6:00 AM குப்பை நினைவூட்டல்'
    );
  }

  return true;
};

/**
 * Setup daily 6:00 AM schedule & heartbeat loop + auto push registration
 */
export const setupMorningWasteReminder = (addToast = null, userId = null) => {
  if (typeof window === 'undefined') return () => {};

  // Automatically attempt background Web Push subscription
  if (isMorningReminderEnabled()) {
    subscribeDeviceToPushNotifications(userId);
  }

  let scheduledTimeoutId = null;
  let heartbeatIntervalId = null;

  const scheduleNext6AM = () => {
    if (!isMorningReminderEnabled()) return;

    const delay = getMillisecondsUntil6AM();
    console.log(`[EcoReward Morning Reminder] Next 6:00 AM notification scheduled in ${Math.round(delay / 60000)} minutes.`);

    if (scheduledTimeoutId) clearTimeout(scheduledTimeoutId);

    scheduledTimeoutId = setTimeout(async () => {
      await triggerMorningWasteNotification({ isTest: false, addToast });
      scheduleNext6AM(); // Schedule for next morning
    }, delay);
  };

  // Heartbeat check every 60 seconds (prevents missed alarms if device was asleep at 6:00)
  heartbeatIntervalId = setInterval(() => {
    if (!isMorningReminderEnabled()) return;
    const now = new Date();
    // If between 6:00 AM and 6:05 AM and haven't shown today
    if (now.getHours() === 6 && now.getMinutes() >= 0 && now.getMinutes() <= 5) {
      const todayStr = now.toISOString().split('T')[0];
      if (localStorage.getItem(LAST_SHOWN_KEY) !== todayStr) {
        triggerMorningWasteNotification({ isTest: false, addToast });
      }
    }
  }, 60000);

  // Initial schedule
  scheduleNext6AM();

  // Return cleanup hook
  return () => {
    if (scheduledTimeoutId) clearTimeout(scheduledTimeoutId);
    if (heartbeatIntervalId) clearInterval(heartbeatIntervalId);
  };
};
