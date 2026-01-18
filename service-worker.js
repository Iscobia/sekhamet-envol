self.addEventListener('fetch', (event) => {
  // LAISSER TOUTES LES REQUÊTES OneSignal PASSER SANS INTERFÉRENCE
  if (event.request.url.includes('onesignal.com') || event.request.url.includes('OneSignalSDK')) {
    return; // Laisse le navigateur/OneSignal gérer
  }

  // ICI, METTEZ VOTRE LOGIQUE DE CACHE EXISTANTE (exclusion .wav, etc.)
  // ...
});



// service-worker.js
const CACHE_NAME = 'envol-pwa-v1.0';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/data/defis.js',
  '/manifest.json'
];

// Installation : mettre en cache les ressources essentielles
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

// Activation : nettoyer les anciens caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activation');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interception des requêtes
self.addEventListener('fetch', event => {
  // NE JAMAIS mettre en cache les fichiers audio
  if (event.request.url.includes('.wav') || 
      event.request.url.includes('.mp3') ||
      event.request.url.includes('.ogg')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Pour les autres ressources : stratégie Cache First
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request).then(response => {
          // Ne pas mettre en cache les requêtes non-GET ou non-OK
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
  );
});
