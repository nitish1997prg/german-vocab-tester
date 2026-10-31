
const CACHE_NAME = "german-vocab-offline-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.add(OFFLINE_URL);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames
          .filter(
            (name) =>
              name.startsWith("german-vocab-offline-") &&
              name !== CACHE_NAME
          )
          .map((name) => caches.delete(name))
      );

      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle document navigations from our app.
  if (
    request.method !== "GET" ||
    request.mode !== "navigate" ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // Always prefer the current live application.
        return await fetch(request);
      } catch {
        // Navigation failed, most commonly because
        // the device has no internet connection.
        const cachedPage = await caches.match(
          OFFLINE_URL
        );

        return cachedPage ?? Response.error();
      }
    })()
  );
});
