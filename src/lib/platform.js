// Is the app running inside a native wrapper (an iOS or Android shell) rather
// than in a normal browser tab?
//
// This matters for one reason: Apple's Guideline 3.1.1 forbids an iOS app from
// selling a subscription outside In-App Purchase, or from linking out to a page
// that does. So when this returns true, every external payment control must be
// hidden, and the purchase has to happen through the store instead.
//
// An installed PWA is deliberately NOT treated as native: it runs in the
// browser engine, bought through the web, and Stripe is correct there.
export function isNativeApp() {
  if (typeof window === 'undefined') return false;

  // Marker the wrapper sets on the page, and the React Native / Capacitor /
  // Cordova bridges, which exist only inside a real native shell.
  if (window.__PATHWAYS_NATIVE__ === true) return true;
  if (window.ReactNativeWebView) return true;
  if (window.Capacitor?.isNativePlatform?.()) return true;
  if (window.cordova) return true;

  // Fallback for a wrapper that only brands its user agent.
  return /PathwaysApp/i.test(navigator.userAgent || '');
}

// Which store this device can charge through. Used for copy, never for
// entitlement: an existing subscription unlocks Sage on every device.
export function purchasePlatform() {
  if (!isNativeApp()) return 'web';
  return /iPad|iPhone|iPod|Mac/i.test(navigator.userAgent || '') ? 'ios' : 'android';
}