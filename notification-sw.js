/* ═══════════════════════════════════════════
   notification-sw.js — YLG Bullion
   Service Worker: PWA caching + trade notifications
   ═══════════════════════════════════════════ */

var CACHE = 'ylg-v1';
var SHELL = [
    '/',
    '/index.html',
    '/login.html',
    '/trading.html',
    '/manifest.json',
    '/logo.png',
    '/favicon.png',
    '/dashboard-styles.css',
    '/mobile-responsive.css',
    '/theme.css',
    '/mobile-nav.js'
];

/* ── Install: cache app shell ── */
self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE).then(function(c) { return c.addAll(SHELL); })
    );
    self.skipWaiting();
});

/* ── Activate: remove old caches ── */
self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(k) { return k !== CACHE; })
                    .map(function(k) { return caches.delete(k); })
            );
        })
    );
    self.clients.claim();
});

/* ── Fetch: network-first, fallback to cache ── */
self.addEventListener('fetch', function(e) {
    if (e.request.method !== 'GET') return;
    var url = e.request.url;
    /* Skip Firebase, TradingView, external APIs */
    if (url.includes('firestore') || url.includes('firebase') ||
        url.includes('tradingview') || url.includes('googleapis') ||
        url.includes('metals.live') || url.includes('gold-api')) return;

    e.respondWith(
        fetch(e.request)
            .then(function(res) {
                var clone = res.clone();
                caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
                return res;
            })
            .catch(function() {
                return caches.match(e.request);
            })
    );
});

/* ── Push: trade result notifications ── */
self.addEventListener('message', async function(event) {
    if (!event.data || event.data.type !== 'TRADE_RESULT') return;
    await self.registration.showNotification(event.data.title, {
        body:             event.data.body,
        icon:             '/logo.png',
        badge:            '/logo.png',
        tag:              'ylg-trade-result',
        renotify:         true,
        requireInteraction: false,
        vibrate:          event.data.isWin ? [100, 50, 100] : [200]
    });
});
