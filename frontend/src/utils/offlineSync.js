// PWA Offline Sync Engine for EcoReward
const OFFLINE_QUEUE_KEY = 'ecoreward_offline_pickups';

export const saveOfflinePickup = (pickupData) => {
  try {
    const existing = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
    existing.push({
      ...pickupData,
      offlineId: `off-${Date.now()}`,
      savedAt: new Date().toISOString()
    });
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(existing));
    return true;
  } catch (e) {
    console.error('Failed to save offline pickup:', e);
    return false;
  }
};

export const getOfflineQueue = () => {
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
  } catch (e) {
    return [];
  }
};

export const clearOfflineQueue = () => {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
};

export const initOfflineAutoSync = (api, addToast) => {
  window.addEventListener('online', async () => {
    const queue = getOfflineQueue();
    if (queue.length > 0) {
      if (addToast) addToast(`📡 Reconnected! Syncing ${queue.length} offline pickup requests...`, 'info', 'Auto-Syncing');
      
      let syncedCount = 0;
      for (const item of queue) {
        try {
          await api.post('/user/pickups', item);
          syncedCount++;
        } catch (err) {
          console.warn('Offline sync retry queued', err);
        }
      }

      if (syncedCount > 0) {
        clearOfflineQueue();
        if (addToast) addToast(`✅ Successfully synced ${syncedCount} offline pickups!`, 'success', 'Sync Completed');
      }
    }
  });
};
