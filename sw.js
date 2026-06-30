

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => self.clients.claim());

self.addEventListener("fetch", event => {
  const url = event.request.url;

  if (url.includes('/nc-proxy?')) {
    const target = new URL(url).searchParams.get('url');
    if (target) {
      event.respondWith(
        fetch(target, {
          credentials: 'include',
          headers: {
            'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'es-ES,es;q=0.9',
          }
        }).then(async resp => {
          const body = await resp.arrayBuffer();
          return new Response(body, {
            status: resp.status,
            headers: {
              'Content-Type':                resp.headers.get('content-type') || 'text/html; charset=utf-8',
              'Access-Control-Allow-Origin': '*',
            }
          });
        }).catch(err => new Response('Error SW: ' + err.message + ' | target: ' + target, { status: 500 }))
      );
      return;
    }
  }

  // — Proxy local de imágenes (alternativa al Worker) —
  // Hace fetch directo al origen desde el navegador. Solo funciona si
  // el sitio permite CORS para imágenes; si no, devuelve 502 y la app
  // detiene el tráfico (no cae automáticamente al Worker).
  if (url.includes('/sw-proxy-img?')) {
    const target = new URL(url).searchParams.get('target');
    if (target) {
      event.respondWith(
        fetch(target, {
          mode:        'cors',
          credentials: 'omit',
        }).then(async resp => {
          if (!resp.ok) {
            return new Response('Error sw.js: ' + resp.status, { status: 502 });
          }
          const blob = await resp.blob();
          return new Response(blob, {
            status: 200,
            headers: { 'Content-Type': blob.type || 'application/octet-stream' },
          });
        }).catch(err => new Response('Error sw.js: ' + err.message, { status: 502 }))
      );
      return;
    }
  }

  event.respondWith(fetch(event.request));
});