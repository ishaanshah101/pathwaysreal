import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { vapidPublicKey } from '../../shared/webPush.ts';

// The client's only way to turn push notifications on or off. Profile writes are
// service-role only, so this is what stores the subscription, and it stores it
// against the SESSION's email, never an email from the payload.
//
// GET-style call with no body returns the public VAPID key, which the browser
// needs before it can create a subscription.

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user?.email) return Response.json({ error: 'Please sign in again.' }, { status: 401 });
    const email = String(user.email).toLowerCase();

    const payload = await req.json().catch(() => ({} as any));
    const action = String(payload?.action || 'key');

    if (action === 'key') {
      const key = vapidPublicKey();
      if (!key) return Response.json({ error: 'Push is not configured.', code: 'push_not_configured' }, { status: 503 });
      return Response.json({ publicKey: key });
    }

    const rows = await base44.asServiceRole.entities.Profile.filter({ user_email: email });
    const profile = Array.isArray(rows) && rows.length ? rows[0] : null;
    if (!profile) return Response.json({ error: 'Finish setting up your profile first.' }, { status: 404 });

    if (action === 'unsubscribe') {
      await base44.asServiceRole.entities.Profile.update(profile.id, {
        push_enabled: false,
        push_subscription: {},
      });
      return Response.json({ ok: true, push_enabled: false });
    }

    if (action === 'subscribe') {
      const sub = payload?.subscription;
      if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
        return Response.json({ error: 'That subscription is not usable.' }, { status: 400 });
      }
      await base44.asServiceRole.entities.Profile.update(profile.id, {
        push_enabled: true,
        push_subscription: {
          endpoint: String(sub.endpoint),
          keys: { p256dh: String(sub.keys.p256dh), auth: String(sub.keys.auth) },
        },
      });
      return Response.json({ ok: true, push_enabled: true });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Could not change notifications.' }, { status: 500 });
  }
}