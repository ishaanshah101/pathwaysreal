import webpush from 'npm:web-push@3.6.7';

// One place that knows how to deliver a web push notification. Callers pass a
// member's email; the subscription is read from their Profile as service role,
// so a client can never aim a push at somebody else.
//
// Delivery is always best-effort: a failed push must never fail the message or
// the connection acceptance that triggered it.

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

    await webpush.sendNotification(profile.push_subscription, JSON.stringify(payload));
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