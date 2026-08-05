// Native Mobile Utility Helpers for EcoReward

/**
 * Trigger subtle haptic vibration feedback on touch devices
 * @param {number} durationMs 
 */
export const triggerHaptic = (durationMs = 35) => {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in window.navigator) {
    try {
      window.navigator.vibrate(durationMs);
    } catch (e) {
      // Ignore unsupported browsers
    }
  }
};

/**
 * Request Web Push Notification Permission from mobile browser
 */
export const requestPushPermission = async (addToast) => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    if (addToast) addToast('Notifications not supported on this browser', 'warning', 'Not Supported');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      if (addToast) addToast('🔔 Live Mobile Push Notifications Enabled!', 'success', 'Notifications Active');
      return true;
    } else {
      if (addToast) addToast('Notification permission denied', 'warning', 'Permission Denied');
      return false;
    }
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return false;
  }
};
