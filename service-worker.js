// service-worker.js - VERSION ROBUSTE & COMPLÈTE
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

const CACHE_NAME = 'envol-pwa-v2.0';
const ASSETS_TO_CACHE = [
  '/sekhamet-envol/',
  '/sekhamet-envol/index.html',
  '/sekhamet-envol/style.css',
  '/sekhamet-envol/app.js',
  '/sekhamet-envol/data/defis.js',
  '/sekhamet-envol/manifest.json'
  // NOTE: Les icônes NE SONT PAS listées ici pour pouvoir les changer librement
];

self.addEventListener('install', event => {
  console.log('[Service Worker] Installation v2.0');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Mise en cache des ressources');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  console.log('[Service Worker] Activation - Nettoyage');
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

self.addEventListener('fetch', event => {
  const url = event.request.url;
  
  // NE JAMAIS mettre en cache les fichiers audio et OneSignal
  if (url.includes('.wav') || url.includes('.mp3') || 
      url.includes('.ogg') || url.includes('onesignal.com')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Pour les icônes : stratégie "Network First" pour pouvoir les mettre à jour
  if (url.includes('/assets/icons/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Mettre à jour le cache avec la nouvelle version
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseToCache));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  
  // Pour le reste : stratégie "Cache First"
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseToCache));
          
          return response;
        });
      })
  );
});

// Gestion des messages pour vider le cache
self.addEventListener('message', event => {
  if (event.data.action === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME)
      .then(() => {
        console.log('[Service Worker] Cache vidé avec succès');
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ success: true });
        }
      })
      .catch(error => {
        console.error('[Service Worker] Erreur vidage cache:', error);
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ success: false, error: error.message });
        }
      });
  }
});
