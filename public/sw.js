// Service Worker for Water Tracker PWA

const CACHE_NAME = 'hydra-v1'
const urlsToCache = [
  '/',
  '/dashboard',
  '/auth',
  '/offline.html',
]

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    })
  )
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response
          }

          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // Return offline page if available
          return caches.match('/offline.html')
        })
    })
  )
})

// Push notification event
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Hora de beber água!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'water-reminder',
    requireInteraction: false,
    actions: [
      {
        action: 'logged',
        title: '✓ Registrado',
        icon: '/icon-check.png',
      },
      {
        action: 'snooze',
        title: '⏰ Depois',
        icon: '/icon-snooze.png',
      },
    ],
  }

  event.waitUntil(
    self.registration.showNotification('💧 Hydra - Hora de Beber Água', options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'logged') {
    // User clicked "logged" - open dashboard
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i]
          if (client.url === '/' && 'focus' in client) {
            return client.focus()
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/dashboard')
        }
      })
    )
  } else if (event.action === 'snooze') {
    // Snooze for 30 minutes
    setTimeout(() => {
      self.registration.showNotification('💧 Hydra - Hora de Beber Água', {
        body: 'Não esqueça de beber água!',
        icon: '/icon-192.png',
        tag: 'water-reminder',
      })
    }, 30 * 60 * 1000)
  } else {
    // Click on notification itself
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i]
          if (client.url === '/dashboard' && 'focus' in client) {
            return client.focus()
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/dashboard')
        }
      })
    )
  }
})

// Background sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-water-logs') {
    event.waitUntil(
      // Sync water logs with server
      fetch('/api/water/sync', { method: 'POST' }).catch((error) => {
        console.error('Sync failed:', error)
      })
    )
  }
})
