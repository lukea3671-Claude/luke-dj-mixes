// Minimal service worker for PWA install support
// Network-first strategy — this is a streaming site, not an offline app

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
