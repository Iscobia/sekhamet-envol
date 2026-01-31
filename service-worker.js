// service-worker.js - VERSION ULTRA SIMPLE ET STABLE
console.log('[Service Worker] Chargement version simplifiée');

try {
  // IMPORTANT: OneSignal doit être importé AVANT tout autre code
  importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
  console.log('[SW] OneSignal SDK chargé');
} catch (error) {
  console.log('[SW] OneSignal non chargé (Firefox protection)');
}


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


//=================================================
//====== GESTION NOTIFICATIONS NATIVES ============

self.addEventListener('message', event => {
  if (event.data.action === 'SEND_NOTIFICATION') {
    const { jour, titre, description } = event.data;
    
    self.registration.showNotification(`Jour ${jour} - ${titre}`, {
      body: description.substring(0, 120) + '...',
      icon: '/sekhamet-envol/assets/icons/ENVOL-192_sansMarges.png',
      badge: '/sekhamet-envol/assets/icons/ENVOL-192.png',
      tag: `envol-jour-${jour}`,
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: '👁️ Voir le défi'
        },
        {
          action: 'mark-done',
          title: '✅ Marquer comme accompli'
        }
      ]
    });
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'mark-done') {
    // Envoyer un message à la page pour marquer comme accompli
    event.waitUntil(
      clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            action: 'MARK_DONE',
            jour: event.notification.tag.replace('envol-jour-', '')
          });
        });
      })
    );
  } else {
    // Ouvrir/activer l'app
    event.waitUntil(clients.openWindow('/sekhamet-envol/'));
  }
});



// ======== GESTION DES NOTIFICATIONS PUSH ========= 
self.addEventListener('push', function(event) {
  console.log('[SW] Push reçu:', event);
  
  try {
    let data = {};
    
    if (event.data) {
      try {
        data = event.data.json();
      } catch (e) {
        data = { body: event.data.text() };
      }
    }
    
    const options = {
      body: data.body || 'Nouveau défi ENVOL !',
      icon: '/sekhamet-envol/assets/icons/ENVOL-192_sansMarges.png',
      badge: '/sekhamet-envol/assets/icons/ENVOL-192_sansMarges.png',
      tag: data.tag || 'envol-notification',
      requireInteraction: true,
      vibrate: [200, 100, 200],
      data: data,
      actions: [
        { action: 'open', title: '📖 Voir le défi' },
        { action: 'later', title: '⏰ Plus tard' }
      ]
    };
    
    console.log('[SW] Affichage notification avec options:', options);
    
    event.waitUntil(
      self.registration.showNotification('🎯 ENVOL', options)
    );
    
  } catch (error) {
    console.error('[SW] Erreur affichage notification:', error);
  }
}); // ← FIN de addEventListener('push')

// Gardez séparément
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/sekhamet-envol/')
    );
  }
});
