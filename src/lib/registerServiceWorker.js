// Registers the service worker that makes Pathways installable and keeps
// already-read posts available offline. Failure is silent: the app works
// exactly as before without it.
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

export default registerServiceWorker;