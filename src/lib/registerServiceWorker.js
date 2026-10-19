// Registers the service worker that makes Pathways installable and keeps
// the public app shell available offline. Failure is silent: the app works
// exactly as before without it.
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  // In development the worker would cache Vite's dev modules and serve stale
  // copies of React. Remove any existing worker and its caches instead.
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
    if (window.caches) caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
    return;
  }
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

export default registerServiceWorker;