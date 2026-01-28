// service-worker.js - VERSION ULTRA SIMPLE ET STABLE
console.log('[Service Worker] Chargement version simplifiée');

try {
  importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
} catch (error) {
  console.log('[SW] OneSignal non chargé (Firefox protection)');
}

// IMPORTANT: OneSignal doit être importé AVANT tout autre code
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// Cache basique
const CACHE_NAME = 'envol-cache-v1';
const urlsToCache = [
  '/sekhamet-envol/',
  '/sekhamet-envol/index.html',
  '/sekhamet-envol/style.css',
  '/sekhamet-envol/data/defis.js',
];

// Installation
self.addEventListener('install', event => {
  console.log('[SW] Installation');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activation
self.addEventListener('activate', event => {
  console.log('[SW] Activation');
  event.waitUntil(self.clients.claim());
});

// Fetch
self.addEventListener('fetch', event => {
  // Laisser OneSignal gérer ses propres requêtes
  if (event.request.url.includes('onesignal.com')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
