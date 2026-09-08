const CACHE_PREFIX = "ad-ec-guide-";
const CACHE_NAME = `${CACHE_PREFIX}v57`;
const APP_ASSETS = ["./", "./index.html", "./styles.css", "./save.js", "./data.js", "./content.js", "./konzepte.js", "./plan.js", "./app.js", "./manifest.webmanifest"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const contentType = response.headers.get("content-type") ?? "";
          if (response.ok && contentType.includes("text/html")) {
            const copy = response.clone();
            // Never store shared progress parameters as their own navigation cache key.
            caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then(response => response ?? caches.match("./index.html"))),
    );
    return;
  }

  event.respondWith(
    // Online immer die ausgelieferten Dateien verwenden. Stale-while-revalidate
    // lieferte nach einem Update zuerst alte Parser-/Plan-Dateien und konnte
    // damit eine Mischung verschiedener Versionen erzeugen.
    fetch(event.request).then(async response => {
      if (response.ok && APP_ASSETS.some(asset => new URL(asset, self.location.href).pathname === new URL(event.request.url).pathname)) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(event.request, response.clone());
      }
      return response;
    }).catch(async () => (await caches.open(CACHE_NAME)).match(event.request)),
  );
});
