// service-worker.js - STABLE (OneSignal + notifications natives + actions)
console.log('[Service Worker] Chargement');

// ✅ OneSignal désactivé pour l’instant : évite les handlers de click qui ouvrent "/"
// (à réactiver quand ton backend OneSignal sera prêt)
/*
try {
  importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
  console.log('[SW] OneSignal SDK chargé');
} catch (error) {
  console.log('[SW] OneSignal non chargé (Firefox protection)');
}
*/

const CACHE_NAME = 'envol-cache-v1';
const urlsToCache = [
  '/sekhamet-envol/',
  '/sekhamet-envol/index.html',
  '/sekhamet-envol/style.css',
  '/sekhamet-envol/data/defis.js',
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installation');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activation');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('onesignal.com')) return;
  event.respondWith(caches.match(event.request).then(r => r || fetch(event.request)));
});

// Notifications natives (quotidienne + test)
self.addEventListener('message', (event) => {
  try {
    const data = event.data || {};
    if (data.action !== 'SEND_NOTIFICATION') return;

    const { jour, titre, description, isTest } = data;

    const notifTitle = isTest
      ? `🎯 Test - Jour ${jour} - ${titre}`
      : `Jour ${jour} - ${titre}`;

    self.registration.showNotification(notifTitle, {
      body: (description || '').substring(0, 240),
      icon: '/sekhamet-envol/assets/icons/ENVOL-192_sansMarges.png',
      badge: '/sekhamet-envol/assets/icons/ENVOL-192.png',
      tag: `envol-jour-${jour}`,
      requireInteraction: true,
      data: { jour: String(jour), url: '/sekhamet-envol/#notifications' },
      actions: [
        { action: 'view', title: '👁️ Voir' },
        { action: 'mark-done', title: '✅ Marquer' },
        { action: 'settings', title: '⚙️ Paramètres' },
      ],
    });

    console.log('[SW] Notification affichée:', notifTitle);
  } catch (e) {
    console.error('[SW] Erreur message:', e);
  }
});

// UN SEUL notificationclick
self.addEventListener('notificationclick', (event) => {
  try {
    const action = event.action;
    const data = event.notification.data || {};
    event.notification.close();

    const appUrl = new URL('/sekhamet-envol/', self.location.origin).href;

    if (action === 'mark-done') {
      event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
          .then((list) => {

            // Envoyer le message MARK_DONE à toutes les fenêtres ouvertes
            list.forEach((client) => {
              client.postMessage({
                action: 'MARK_DONE',
                jour: data.jour
              });
            });

            // Si une fenêtre existe, on la focus
            if (list && list.length > 0) {
              return list[0].focus();
            }

            // Sinon on ouvre l'app proprement
            return clients.openWindow(appUrl);
          })
      );
      return;
    }

    // view / settings / clic normal -> ouvrir ou focus l'app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((list) => {
          if (list && list.length) {
            return list[0].focus();
          }
          return clients.openWindow(appUrl);
        })
    );

  } catch (e) {
    console.error('[SW] Erreur notificationclick:', e);
  }
});
