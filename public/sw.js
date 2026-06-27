const CACHE_NAME = "genctek-atlas-v2";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.svg",
  "/logo.png",
  "/data/cities.json",
  "/data/themes.json",
  "/data/turkey-provinces.geojson",
  "/assets/map/turkey.svg?v=1.1"
];

// Install Event
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching app shell assets");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Cache-First for static assets, Network-First for others
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Skip caching for Firebase calls or other dynamic analytics APIs
  if (
    url.origin !== self.location.origin ||
    e.request.method !== "GET" ||
    url.pathname.startsWith("/__/auth") ||
    e.request.url.includes("firestore.googleapis.com") ||
    e.request.url.includes("openstreetmap.org")
  ) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(e.request)
        .then((networkResponse) => {
          // Cache newly fetched local static assets
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback if network fails and asset is not cached
          if (e.request.headers.get("accept") && e.request.headers.get("accept").includes("text/html")) {
            return caches.match("/index.html");
          }
        });
    })
  );
});
