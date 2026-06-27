// 🔧 Configuración: cambia solo estas dos constantes
const PROJECT_NAME = "PerfectView"; // nombre del proyecto
const VERSION = "21";                 // versión actual

const CACHE_NAME = `${PROJECT_NAME}-cache-${VERSION}`;
const FILES_TO_CACHE = [
  `/${PROJECT_NAME}/`,          // index
  `/${PROJECT_NAME}/icono.jpg`, // ícono
  `/${PROJECT_NAME}/manifest.json`
];

// Instalación: guarda archivos
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting(); // activa inmediatamente
});

// Activación: limpia cachés viejas
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim(); // toma control de las páginas abiertas
});

// Fetch: responde desde caché o red
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});