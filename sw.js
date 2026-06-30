/* ハゼモト建設 安全KY  Service Worker
   方式：network-first（オンライン時は常に最新を取得しキャッシュ更新／圏外時はキャッシュを返す）
   → 再アップロードした新しい版が古いキャッシュに邪魔されない。 */
const CACHE = "ky-anzen-v1";

self.addEventListener("install", e => { self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(self.clients.claim()); });

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // 別オリジン（天気APIなど）は素通し。圏外なら通常どおり失敗し、アプリ側が天気なしで動く
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() =>
        caches.match(req).then(r => r || caches.match("./") || caches.match("index.html"))
      )
  );
});
