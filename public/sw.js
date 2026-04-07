// Minimal SW — unregisters any previous caching SW, serves everything from network
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', async () => {
  // Delete all old caches
  const keys = await caches.keys();
  await Promise.all(keys.map(k => caches.delete(k)));
  await self.clients.claim();
});
// No fetch handler — all requests go straight to network
