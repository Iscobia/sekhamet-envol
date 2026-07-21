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

const CACHE_NAME = 'evolution-cache-v1.2.2';
const DEFAULT_ICON = '/core/assets/icons/default-192.png';

const urlsToCache = [
  '/',
  '/index.html',
  '/config.js',
  '/manifest.json',
  '/theme.css',
  '/data/defis.js',
  '/core/style.css',
  '/core/app.js',
  '/core/notifications.js',
  '/assets/pictures/BG_Marbre.webp',
  '/assets/pictures/BG_Basalte.webp',
  '/core/assets/fonts/Cinzel-Medium.ttf',
  '/core/assets/fonts/Lora-Regular.ttf'
];



self.addEventListener('install', (event) => {
  console.log('[SW] Installation');
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    for (const url of urlsToCache) {
      try {
        await cache.add(url);
        console.log('[SW] Cache OK:', url);
      } catch (e) {
        console.warn('[SW] Cache impossible:', url, e);
      }
    }
    await self.skipWaiting();
  })());
});


self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
    );
    await self.clients.claim();
  })());
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

    const {
      appId,
      appName,
      jour,
      titre,
      description,
      isTest,
      icon,
      badge,
      url,
      tag
    } = data;

    const notifTitle = isTest
      ? `🎯 ${appName} - Test - Jour ${jour} - ${titre}`
      : `${appName} - Jour ${jour} - ${titre}`;

    // Transforme toujours les chemins reçus en URL absolues.
    const notificationIcon = new URL(
      icon || DEFAULT_ICON,
      self.location.origin
    ).href;

    const notificationBadge = badge
      ? new URL(
          badge,
          self.location.origin
        ).href
      : undefined;

    self.registration.showNotification(notifTitle, {
      body: (description || '').substring(0, 240),
      icon: notificationIcon,
      badge: notificationBadge,
      tag: tag || `${appId || 'app'}-jour-${jour}`,
      requireInteraction: true,
      data: { jour: String(jour), url: url || self.location.origin },
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

self.addEventListener('notificationclick', (event) => {
  const action = event.action;
  const data = event.notification.data || {};
  const appUrl = data.url || self.location.origin;

  console.log('[SW] Clic notification :', {
    action,
    jour: data.jour,
    url: appUrl
  });

  event.notification.close();

  event.waitUntil((async () => {
    const windowClients = await clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });

    // ✅ Marquer le défi, sans remettre l’application au premier plan
    if (action === 'mark-done') {
      windowClients.forEach((client) => {
        client.postMessage({
          action: 'MARK_DONE',
          jour: data.jour
        });
      });

      return;
    }

    // ⚙️ Ouvrir directement la zone de dépannage / paramètres
    if (action === 'settings') {
      const targetClient = windowClients.find((client) => {
        return client.url === appUrl;
      });

      if (targetClient) {
        targetClient.postMessage({
          action: 'OPEN_NOTIFICATION_SETTINGS'
        });

        await targetClient.focus();
        return;
      }

      await clients.openWindow(`${appUrl}#notification-settings`);
      return;
    }

    // 👁️ Bouton Voir, ou clic sur le corps de la notification
    if (action === 'view' || action === '') {
      const targetClient = windowClients.find((client) => {
        return client.url === appUrl;
      });

      if (targetClient) {
        // 1. Ramener d’abord l’application au premier plan
        const focusedClient = await targetClient.focus();

        // 2. Laisser brièvement le navigateur rendre la page visible
        await new Promise((resolve) => setTimeout(resolve, 150));

        // 3. Demander ensuite l’affichage du défi et le défilement
        (focusedClient || targetClient).postMessage({
          action: 'VIEW_CHALLENGE',
          jour: data.jour
        });

        return;
      }

      await clients.openWindow(`${appUrl}#challenge`);
      return;
    }

    // Sécurité : une action inconnue ne valide jamais le défi
    console.warn('[SW] Action de notification inconnue :', action);
      })().catch((error) => {
        console.error('[SW] Erreur notificationclick:', error);
      }));
    });
