const CACHE_NAME = 'tsr-mapfre-v1';
const urlsToCache = [
  '.',
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'favicon.ico'
];

// Instalación - cachear recursos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activación - limpiar caches antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Borrando cache antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch - servir desde cache, actualizar en segundo plano
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - devolver respuesta
        if (response) {
          // Actualizar en background
          fetch(event.request).then(fetchResponse => {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, fetchResponse);
            });
          });
          return response;
        }
        
        // No está en cache - fetch de la red
        return fetch(event.request).then(fetchResponse => {
          // Cachear la nueva respuesta
          if (fetchResponse && fetchResponse.status === 200) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, fetchResponse.clone());
            });
          }
          return fetchResponse;
        });
      })
  );
});
