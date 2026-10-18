import webpush from 'npm:web-push@3.6.7';

// One place that knows how to deliver a web push notification. Callers pass a
// member's email; the subscription is read from their Profile as service role,
// so a client can never aim a push at somebody else.
//
// Delivery is always best-effort: a failed push must never fail the message or
// the connection acceptance that triggered it.

// Validate at registration AND delivery, including subscriptions stored before
// this check existed. Exact provider hosts, HTTPS, no credentials or custom ports.
export function validatedPushSubscription(sub) {
  try {
    if (typeof sub?.endpoint !== 'string' || sub.endpoint.length > 4096) return null;
    const url = new URL(sub.endpoint);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash
      || !['fcm.googleapis.com', 'updates.push.services.mozilla.com', 'web.push.apple.com'].includes(url.hostname)) return null;
    const decode = (value) => {
      if (typeof value !== 'string' || value.length > 128 || !/^[A-Za-z0-9_-]+={0,2}$/.test(value)) return '';
      return atob(value.replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, ''));
    };
    const key = decode(sub?.keys?.p256dh);
    if (key.length !== 65 || key.charCodeAt(0) !== 4 || decode(sub?.keys?.auth).length !== 16) return null;
    return { endpoint: url.href, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } };
  } catch {
    return null;
  }
}

export function vapidPublicKey(): string {
  return Deno.env.get('VAPID_PUBLIC_KEY') || '';
}

function configured() {
  const pub = vapidPublicKey();
  const priv = Deno.env.get('VAPID_PRIVATE_KEY') || '';
  if (!pub || !priv) return false;
  webpush.setVapidDetails('mailto:ishaan@pathways.uno', pub, priv);
  return true;
}

export async function pushToUser(
  base44: any,
  email: string,
  payload: { title: string; body: string; url?: string; tag?: string },
) {
  try {
    if (!configured()) return { ok: false, reason: 'not_configured' };
    const rows = await base44.asServiceRole.entities.Profile.filter({
      user_email: String(email || '').toLowerCase(),
    });
    const profile = Array.isArray(rows) && rows.length ? rows[0] : null;
    if (!profile?.push_enabled || !profile?.push_subscription?.endpoint) {
      return { ok: false, reason: 'not_subscribed' };
    }

    const subscription = validatedPushSubscription(profile.push_subscription);
    if (!subscription) return { ok: false, reason: 'invalid_subscription' };
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { ok: true };
  } catch (error: any) {
    // A 404 or 410 means the browser threw the subscription away. Clear it so we
    // stop trying, and so the profile reflects reality.
    const status = error?.statusCode;
    if (status === 404 || status === 410) {
      const rows = await base44.asServiceRole.entities.Profile
        .filter({ user_email: String(email || '').toLowerCase() }).catch(() => []);
      const profile = Array.isArray(rows) && rows.length ? rows[0] : null;
      if (profile) {
        await base44.asServiceRole.entities.Profile
          .update(profile.id, { push_enabled: false, push_subscription: {} }).catch(() => {});
      }
    }
    console.error('[webPush]', error?.message);
    return { ok: false, reason: 'send_failed' };
  }
}