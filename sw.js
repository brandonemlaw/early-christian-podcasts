const CACHE_NAME = 'early-christian-podcasts-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/data/podcasts.js',
  '/manifest.json',
  '/icons/icon.svg',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://code.jquery.com/jquery-3.6.0.min.js'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Cache installation failed:', err);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
      .catch(() => {
        // If both cache and network fail, return offline page
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'podcast-position-sync') {
    event.waitUntil(syncPodcastPositions());
  }
});

// Handle push notifications (if needed in the future)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New content available!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('Early Christian Podcasts', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Sync podcast positions when online
async function syncPodcastPositions() {
  try {
    // This would sync with a server if you had one
    // For now, just log that sync was attempted
    console.log('Syncing podcast positions...');
    
    // Get stored positions from IndexedDB or localStorage
    const positions = await getStoredPositions();
    
    // Send to server (placeholder)
    // await sendPositionsToServer(positions);
    
    console.log('Podcast positions synced successfully');
  } catch (error) {
    console.error('Failed to sync podcast positions:', error);
  }
}

// Helper function to get stored positions
async function getStoredPositions() {
  // This would retrieve from IndexedDB in a real implementation
  return {};
}
