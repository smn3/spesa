const CACHE_NAME = 'shopping-list-pwa-cache-v1';
const urlsToCache = [
    '.', // Alias per index.html
    'index.html',
    'style.css',
    'script.js',
    'manifest.json',
    // Aggiungi qui le tue icone se vuoi metterle in cache esplicitamente
    'icon-192x192.png',
    'icon-512x512.png'
    // Aggiungi altre risorse statiche se necessario
];

// Installazione del Service Worker: apre la cache e aggiunge i file principali.
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aperta');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch: intercetta le richieste di rete.
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Se la risorsa è in cache, la restituisce.
                if (response) {
                    return response;
                }
                // Altrimenti, prova a recuperarla dalla rete.
                return fetch(event.request);
            })
    );
});

// Attivazione: gestisce le vecchie cache.
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        // Rimuove le cache non più nella whitelist.
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});