/* Gatinder — service worker da TV.
 * Guarda no aparelho o "esqueleto" do site, as fotos e as fontes, para a
 * TV continuar rodando (e até reabrir a página) se a internet cair.
 * A lista de gatos em si fica guardada pelo próprio app (localStorage).
 */
const SHELL = 'gatinder-shell-v1';
const PHOTOS = 'gatinder-photos-v1';
const FONTS = 'gatinder-fonts-v1';
const KEEP = [SHELL, PHOTOS, FONTS];

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !KEEP.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Páginas (/tv): tenta a internet; sem internet, usa a última versão guardada
  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req, SHELL, '/index.html'));
    return;
  }

  // Arquivos do próprio site (JS/CSS com nome único, logos, ícones)
  if (url.origin === self.location.origin) {
    event.respondWith(url.pathname.startsWith('/assets/') ? cacheFirst(req, SHELL) : staleWhileRevalidate(req, SHELL));
    return;
  }

  // Fotos dos gatos (nome de arquivo único, nunca mudam)
  if (url.pathname.includes('/storage/v1/object/public/cat-photos/')) {
    event.respondWith(cacheFirst(req, PHOTOS));
    return;
  }

  // Fontes do Google
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(req, FONTS));
  }
  // Todo o resto (banco de dados, tempo real) passa direto
});

async function networkFirst(req, cacheName, fallbackPath) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(fallbackPath, res.clone());
    return res;
  } catch {
    return (await cache.match(fallbackPath)) || Response.error();
  }
}

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  const fresh = fetch(req)
    .then((res) => {
      if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
      return res;
    })
    .catch(() => hit || Response.error());
  return hit || fresh;
}
