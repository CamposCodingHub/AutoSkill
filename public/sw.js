// Service Worker placeholder para desenvolvimento
// Em produção, o VitePWA substituirá este arquivo
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Em desenvolvimento, não cache - apenas passa para rede
  event.respondWith(fetch(event.request));
});
