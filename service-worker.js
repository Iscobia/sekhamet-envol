// service-worker.js - FICHIER UNIQUE COMBINÉ (Cache + OneSignal)
// 1. Importation OFFICIELLE du SDK OneSignal pour le Service Worker
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// 2. VOTRE LOGIQUE DE CACHE EXISTANTE (à copier-coller depuis votre backup)
const CACHE_NAME = 'envol-pwa-v1.0';
const ASSETS_TO_CACHE = [
  '/sekhamet-envol/',
  '/sekhamet-envol/index.html',
  '/sekhamet-envol/style.css',
  '/sekhamet-envol/app.js',
  '/sekhamet-envol/data/defis.js',
  '/sekhamet-envol/manifest.json'
];

self.addEventListener('install', event => {
  console.log('[Service Worker] Installation');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Mise en cache des ressources');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', (event) => {
  // NE JAMAIS mettre en cache les fichiers audio (.wav, .mp3)
  if (event.request.url.includes('.wav') || event.request.url.includes('.mp3')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // NE PAS INTERFÉRER avec les requêtes OneSignal
  if (event.request.url.includes('onesignal.com')) {
    return;
  }

  // Stratégie Cache First pour vos propres ressources
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request);
      })
  );
});
