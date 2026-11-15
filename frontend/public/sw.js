const CACHE_NAME = 'ecoreward-v7-morning-reminder';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
];

// Install Service Worker immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('PWA Pre-cache partial fail:', err);
      });
    })
  );
});

// Activate Service Worker and purge all old caches (v1, v2, etc.)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Strategy: Network-first with no-cache for navigations
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  // Skip API requests and socket traffic
  if (event.request.url.includes('/api/') || event.request.url.includes('/socket.io/')) {
    return;
  }

  // HTML page navigation: always fetch newest HTML from network
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          return (await caches.match(event.request)) || (await caches.match('/index.html')) || (await caches.match('/'));
        })
    );
    return;
  }

  // Other assets (JS, CSS, images)
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});


// ==========================================
// 🌅 MORNING 6:00 AM WASTE NOTIFICATION HANDLERS
// ==========================================
// Listen for real-time Web Push events from backend (even when app/tab is closed)
self.addEventListener('push', (event) => {
  let data = {
    title: '🌅 காலை 6:00 AM குப்பை நினைவூட்டல்!',
    body: 'காலை வணக்கம்! இன்று உங்கள் மக்கும் & மறுசுழற்சி குப்பைகளை தரம் பிரித்து வெளியே வைக்கவும். எங்களின் தூய்மை வாகனம் விரைவில் உங்கள் பகுதிக்கு வரும்! ♻️',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    data: {
      url: '/schedule-pickup',
      action: 'pickup'
    }
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/favicon.svg',
    badge: data.badge || '/favicon.svg',
    vibrate: [200, 100, 200, 100, 300],
    tag: 'eco-morning-waste-reminder',
    renotify: true,
    data: data.data || { url: '/schedule-pickup' },
    actions: [
      { action: 'book', title: 'Doorstep Pickup புக் செய்' },
      { action: 'open', title: 'Open App' }
    ]
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/schedule-pickup';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(urlToOpen);
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_MORNING_WASTE_NOTIF') {
    self.registration.showNotification(event.data.title, event.data.options);
  }
});
