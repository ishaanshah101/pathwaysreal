/* Pathways service worker.
 *
 * Three jobs:
 *   1. Keep the app shell available offline, so launching from the home screen
 *      never shows the browser's dinosaur.
 *   2. Cache feed and post data as it is read, so previously viewed posts are
 *      still readable with no connection.
 *   3. Show web push notifications for new messages and accepted connections.
 */

const VERSION = 'pathways-v1';
const SHELL = `${VERSION}-shell`;
const DATA = `${VERSION}-data`;
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
        keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)),
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

// Reads of app data: network first so the feed is fresh when online, cache
// fallback so it is still there when it is not.
async function handleData(request) {
  const cache = await caches.open(DATA);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    const hit = await cache.match(request);
    if (hit) return hit;
    throw new Error('offline');
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
  if (url.origin !== self.location.origin && !/base44\.(app|com)$/.test(url.hostname)) return;

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }
  if (/\/api\/|\/entities\//.test(url.pathname)) {
    event.respondWith(handleData(request));
    return;
  }
  if (/\.(js|css|svg|png|jpg|jpeg|webp|woff2?)$/.test(url.pathname)) {
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
