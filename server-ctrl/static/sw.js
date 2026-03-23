const APP_VERSION = '1.0.1';
const CACHE_NAME = 'cultivee-ctrl-v' + APP_VERSION;
const STATIC_ASSETS = [
    '/',
    '/static/style.css',
    '/static/app.js',
    '/static/icon-192.png',
    '/static/icon-512.png',
    '/static/manifest.json'
];

// Install
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// Activate — limpa caches antigos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            const oldKeys = keys.filter(k => k.startsWith('cultivee-ctrl-') && k !== CACHE_NAME);
            if (oldKeys.length > 0) {
                // Notifica todos os clientes
                self.clients.matchAll().then(clients => {
                    clients.forEach(client => {
                        client.postMessage({ type: 'APP_UPDATED', version: APP_VERSION });
                    });
                });
            }
            return Promise.all(oldKeys.map(k => caches.delete(k)));
        })
    );
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', (event) => {
    // Nao cachear chamadas de API
    if (event.request.url.includes('/api/')) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, clone);
                });
                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});

// Skip waiting quando solicitado
self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
