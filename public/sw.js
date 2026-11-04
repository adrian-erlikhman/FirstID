// Keeps First ID working with no signal, at a DMV counter or on a used-up data
// plan. Pages load from the network when they can and from this cache when
// they can't. Built files have hashed names, so those are served from the
// cache first. Nothing is sent anywhere: the worker only stores the site's own
// files.
// v2: drops any copy of a non-app page that v1 may have stored as the app.
const CACHE = "first-id-v2";
/** How long a page waits for the network before opening the stored copy. */
const SLOW_MS = 3000;

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
      await storeLater(c, assets);
    } catch { /* they will be cached on the next visit instead */ }
    await self.skipWaiting();
  })());
});

// The pictures and the font load only when they come near the screen, so a
// visit that never scrolled to them would leave them out of the offline copy.
// Their hashed names are in the script and the stylesheet (next to them in
// ./assets/); store any not stored yet. Skipped when the phone asks to save
// data, and one that fails doesn't stop the rest.
async function storeLater(c, assets) {
  if (self.navigator && self.navigator.connection && self.navigator.connection.saveData) return;
  const names = new Set();
  for (const a of assets.filter((x) => /\.(js|css)$/.test(x))) {
    const hit = await c.match(a);
    if (!hit) continue;
    const text = await hit.text();
    for (const m of text.matchAll(/["(]\.?\/?([\w.-]+\.(?:png|jpe?g|webp|svg|woff2))["')]/g)) names.add("./assets/" + m[1]);
  }
  await Promise.all([...names].map(async (u) => {
    try { if (!(await c.match(u))) await c.add(u); } catch { /* fetched when it's shown instead */ }
  }));
}

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
    const network = fetch(req).then((res) => {
      // Only the app's own page becomes the offline copy: not a 404 page,
      // and not an image or other file opened directly in the browser.
      const type = res.headers.get("content-type") || "";
      if (res.ok && type.includes("text/html")) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put("./index.html", copy));
      }
      return res;
    });
    // The network first, but on one bar of signal nobody should wait on it:
    // after a few seconds the stored copy opens, and the network answer still
    // refreshes it for next time.
    event.respondWith((async () => {
      const slow = new Promise((resolve) => setTimeout(resolve, SLOW_MS, "slow"));
      try {
        const first = await Promise.race([network, slow]);
        if (first !== "slow") return first;
        return (await caches.match("./index.html")) || (await network);
      } catch {
        return caches.match("./index.html");
      }
    })());
    event.waitUntil(network.catch(() => {}));
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
