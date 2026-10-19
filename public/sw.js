/* Pathways service worker.
 *
 * Keep the public app shell available offline and show web push notifications.
 * Authenticated requests and API responses are network-only and never cached.
 */

const VERSION = 'pathways-v3';
const SHELL = `${VERSION}-shell`;
const SHELL_URLS = ['/', '/app', '/manifest.json', '/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL).then((c) => c.addAll(SHELL_URLS).catch(() => {})).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('pathways-') && k !== SHELL).map((k) => caches.delete(k)),
      ))
      .then(() => self.clients.claim()),
  );
});

// Navigations: try the network, fall back to whatever shell we have. That is
// what turns an offline launch into the real app reading from cache instead of
// an error page.
async function handleNavigation(request) {
  try {
    const res = await fetch(request);
    const cache = await caches.open(SHELL);
    cache.put(request, res.clone());
    return res;
  } catch {
    const cache = await caches.open(SHELL);
    return (await cache.match(request)) || (await cache.match('/app')) || (await cache.match('/'))
      || new Response('Offline', { status: 503 });
  }
}

async function handleAsset(request) {
  const cache = await caches.open(SHELL);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Check before navigation and asset handling, even for API URLs ending in an image extension.
  if (request.headers.has('authorization') || /\/(api|entities|functions)(\/|$)/.test(url.pathname)) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }
  // Never cache code: stale JS or CSS chunks break the app after an update.
  if (/^\/(src|node_modules|@vite|@react-refresh|@id|@fs)\//.test(url.pathname)) return;
  if (/\.(svg|png|jpg|jpeg|webp|woff2?)$/.test(url.pathname)) {
    event.respondWith(handleAsset(request));
  }
});

self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { payload = {}; }
  const title = payload.title || 'Pathways';
  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body || '',
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: payload.tag || 'pathways',
      data: { url: payload.url || '/app' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data?.url || '/app';
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const open = all.find((c) => c.url.includes('/app'));
    if (open) { open.focus(); open.navigate(target); return; }
    await self.clients.openWindow(target);
  })());
});
