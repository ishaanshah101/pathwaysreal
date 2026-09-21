import { useCallback, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useProfile } from '@/lib/useProfile';

// Web push opt-in. Off by default and never requested on load: the browser
// prompt only appears when the member presses the button, and only after
// onboarding is finished.

function urlBase64ToUint8Array(base64) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function usePushNotifications() {
  const { profile, refetchProfile } = useProfile();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const supported = typeof window !== 'undefined'
    && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

  const enabled = Boolean(profile?.push_enabled);

  const enable = useCallback(async () => {
    setError('');
    if (!supported) {
      setError('This browser cannot show notifications. On iPhone, add Pathways to your home screen first.');
      return false;
    }
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setError('Notifications are turned off in your browser settings.');
        return false;
      }
      const keyRes = await base44.functions.invoke('push-subscribe', { action: 'key' });
      const publicKey = keyRes?.data?.publicKey;
      if (!publicKey) throw new Error('Notifications are not set up yet.');

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      await base44.functions.invoke('push-subscribe', {
        action: 'subscribe',
        subscription: JSON.parse(JSON.stringify(sub)),
      });
      await refetchProfile?.();
      return true;
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Could not turn notifications on.');
      return false;
    } finally {
      setBusy(false);
    }
  }, [supported, refetchProfile]);

  const disable = useCallback(async () => {
    setError('');
    setBusy(true);
    try {
      if (supported) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) await sub.unsubscribe().catch(() => {});
      }
      await base44.functions.invoke('push-subscribe', { action: 'unsubscribe' });
      await refetchProfile?.();
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not turn notifications off.');
    }
    setBusy(false);
  }, [supported, refetchProfile]);

  return { supported, enabled, busy, error, enable, disable };
}

export default usePushNotifications;