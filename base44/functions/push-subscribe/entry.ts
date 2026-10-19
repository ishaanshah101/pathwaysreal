import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { getProfile } from '../../shared/accounts.ts';
import { vapidPublicKey, validatedPushSubscription } from '../../shared/webPush.ts';
import { consumeRateLimit } from '../../shared/rateLimit.ts';
import { requirePost, readJsonObject, safeFailure } from '../../shared/requestSafety.ts';

// The client's only way to turn push notifications on or off. Profile writes are
// service-role only, so this is what stores the subscription, and it stores it
// against the SESSION's email, never an email from the payload.
//
// GET-style call with no body returns the public VAPID key, which the browser
// needs before it can create a subscription.

export default async function (req: Request): Promise<Response> {
  try {
    requirePost(req);
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user?.email) return Response.json({ error: 'Please sign in again.' }, { status: 401 });
    const email = String(user.email).toLowerCase();

    const payload = await readJsonObject(req);
    const action = String(payload?.action || 'key');
    if (!['key', 'subscribe', 'unsubscribe'].includes(action)) return Response.json({ error: 'Unknown action.' }, { status: 400 });
    const limit = await consumeRateLimit(base44, email, 'push_settings', { hour: 120, day: 500 });
    if (!limit.ok) return Response.json({ error: limit.message }, { status: 429 });

    if (action === 'key') {
      const key = vapidPublicKey();
      if (!key) return Response.json({ error: 'Push is not configured.', code: 'push_not_configured' }, { status: 503 });
      return Response.json({ publicKey: key });
    }

    const profile = await getProfile(base44, email);
    if (!profile) return Response.json({ error: 'Finish setting up your profile first.' }, { status: 404 });

    if (action === 'unsubscribe') {
      await base44.asServiceRole.entities.Profile.update(profile.id, {
        push_enabled: false,
        push_subscription: {},
      });
      return Response.json({ ok: true, push_enabled: false });
    }

    if (action === 'subscribe') {
      const sub = validatedPushSubscription(payload?.subscription);
      if (!sub) {
        return Response.json({ error: 'That subscription is not usable.' }, { status: 400 });
      }
      await base44.asServiceRole.entities.Profile.update(profile.id, {
        push_enabled: true,
        push_subscription: sub,
      });
      return Response.json({ ok: true, push_enabled: true });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error: any) {
    return safeFailure('push-subscribe', error, 'Could not change notifications.');
  }
}