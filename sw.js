// Keeps First ID working with no signal, at a DMV counter or on a used-up data
// plan. Pages load from the network when they can and from this cache when
// they can't. Built files have hashed names, so those are served from the
// cache first. Nothing is sent anywhere: the worker only stores the site's own
// files.
// v2: drops any copy of a non-app page that v1 may have stored as the app.
const CACHE = "first-id-v2";

self.addEventListener("install", (event) => {
  // The first visit loads the script and stylesheet before this worker runs,
  // so read their hashed names from the page and store them now.
  event.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(["./", "./index.html"]);
    try {
      const html = await (await c.match("./index.html")).text();
      const assets = [...html.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g)].map((m) => m[1]);
      await c.addAll([...new Set(assets)]);
    } catch { /* they will be cached on the next visit instead */ }
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Only the app's own page becomes the offline copy: not a 404 page,
          // and not an image or other file opened directly in the browser.
          const type = res.headers.get("content-type") || "";
          if (res.ok && type.includes("text/html")) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put("./index.html", copy));
          }
          return res;
        })
        .catch(() => caches.match("./index.html")),
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((hit) =>
      hit ||
      fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }),
    ),
  );
});
