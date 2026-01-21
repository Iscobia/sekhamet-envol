// service-worker-simple.js - ULTRA SIMPLE
console.log('Service Worker simple chargé');

// IMPORTANT: Pas d'importScripts pour OneSignal ici
// Juste un cache basique

const CACHE_NAME = 'envol-simple-v1';

self.addEventListener('install', event => {
    console.log('[SW Simple] Installation');
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('[SW Simple] Activation');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    // Laisser passer toutes les requêtes
    return;
});
