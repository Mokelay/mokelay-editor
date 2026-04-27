const CACHE_PREFIX = 'mokelay-editor';
const SW_VERSION = new URL(self.location.href).searchParams.get('v') || 'dev';
const CACHE_VERSION = `${CACHE_PREFIX}-${SW_VERSION}`;
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest'];

function isValidNavigationShellResponse(response) {
  if (!response || !response.ok) {
    return false;
  }

  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('text/html');
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_VERSION)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (isValidNavigationShellResponse(response)) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put('/index.html', copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match('/index.html');
          if (cached) {
            return cached;
          }
          return caches.match('/');
        })
    );
    return;
  }

  if (
    requestUrl.pathname.startsWith('/@vite/') ||
    requestUrl.pathname.startsWith('/src/') ||
    requestUrl.searchParams.has('t')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const copy = networkResponse.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkFetch;
    })
  );
});
