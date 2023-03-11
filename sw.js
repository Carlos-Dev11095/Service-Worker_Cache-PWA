// Definir los nombres de las cachés
const CACHE_STATIC_NAME = 'mi-caché-estático';
const CACHE_DYNAMIC_NAME = 'mi-caché-dinámico';
const CACHE_INMUTABLE_NAME = 'mi-caché-inmutable';

// Escuchar el evento install
self.addEventListener('install', event => {
  // Abrir la caché estática y agregar los archivos
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(cache => {
        return cache.addAll([
          '/',
          '/index.html',
          '/offline.html',
          '/js/app.js',
          '/css/styles.css',
          '/assets/img/perfil.jpg',
          '/assets/img/canelo.png',
          '/assets/img/header-bg.jpg',
        ]);
      })
  );

  // Precargar los archivos inmutables
  event.waitUntil(
    caches.open(CACHE_INMUTABLE_NAME)
      .then(cache => {
        return cache.addAll([
          'https://cdn.jsdelivr.net/npm/vue',
          'https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.1/axios.min.js',
        ]);
      })
  );
});

// Escuchar el evento fetch
self.addEventListener('fetch', event => {
  // Estrategia de caché con red primero
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          return caches.open(CACHE_DYNAMIC_NAME)
            .then(cache => {
              cache.put(event.request.url, response.clone());
              return response;
            });
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  } else {
    // Estrategia de caché con caché primero
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }

          return fetch(event.request)
            .then(fetchResponse => {
              if (fetchResponse && fetchResponse.status === 200) {
                return caches.open(CACHE_DYNAMIC_NAME)
                  .then(cache => {
                    cache.put(event.request.url, fetchResponse.clone());
                    return fetchResponse;
                  });
              } else {
                return fetchResponse;
              }
            });
        })
        .catch(() => {
          return caches.match('/');
        })
    );
  }
});

// Escuchar el evento activate
self.addEventListener('activate', event => {
  // Eliminar las cachés antiguas
  event.waitUntil(
    caches.keys()
      .then(keyList => {
        return Promise.all(keyList.map(key => {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME && key !== CACHE_INMUTABLE_NAME) {
            return caches.delete(key);
          }
        }));
      })
  );
});
