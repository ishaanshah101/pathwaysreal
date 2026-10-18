import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';
import { consumeRateLimit } from '../../shared/rateLimit.ts';
import { withActionLock } from '../../shared/actionLock.ts';
import { getProfile } from '../../shared/accounts.ts';
import { requirePost, readJsonObject, RequestError, safeFailure } from '../../shared/requestSafety.ts';

// Creates a Stripe Checkout Session for a Sage subscription.
//
// Nothing here trusts the browser with anything that matters. The price is
// looked up from a server-side secret by plan name, and the buyer's identity
// comes from the authenticated session, never from the request body. The
// client can only say "monthly" or "yearly".

const STRIPE_API = "https://api.stripe.com/v1";

const PLAN_TO_PRICE_ENV: Record<string, string> = {
  sage_monthly: "STRIPE_PRICE_SAGE_MONTHLY",
  sage_yearly: "STRIPE_PRICE_SAGE_YEARLY",
};

// Stripe's API errors are written for developers reading logs, not for a
// sixteen year old looking at a Subscribe button. They also quote account ids
// and internal config hints, which should never reach a browser. Translate
// them to something a student can act on, and keep the real text in the logs.
function friendlyError(raw: string): { message: string; code: string } {
  const m = raw.toLowerCase();

  if (m.includes("tax code") || m.includes("managed payments")) {
    return {
      message: "Sage checkout is not quite finished being set up. This is on our side, not yours. Please try again shortly.",
      code: "billing_misconfigured",
    };
  }
  if (m.includes("no such price") || m.includes("no such product")) {
    return {
      message: "Sage checkout is not quite finished being set up. This is on our side, not yours. Please try again shortly.",
      code: "billing_misconfigured",
    };
  }
  if (m.includes("cannot accept payments") || m.includes("capabilit") || m.includes("not activated")) {
    return {
      message: "Sage is not accepting payments just yet. Please check back soon.",
      code: "billing_inactive",
    };
  }
  if (m.includes("rate limit")) {
    return { message: "Too many attempts at once. Give it a few seconds and try again.", code: "rate_limited" };
  }
  return {
    message: "Could not start checkout. Please try again in a moment.",
    code: "checkout_failed",
  };
}

function form(params: Record<string, string | number | boolean | undefined>) {
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) body.append(k, String(v));
  }
  return body;
}

async function stripe(path, secretKey, params, method = 'POST', idempotencyKey) {
  const res = await fetch(`${STRIPE_API}${path}`, {
    method, redirect: 'manual', signal: AbortSignal.timeout(10000),
    headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/x-www-form-urlencoded', ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}) },
    body: params ? form(params) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || 'Billing request failed');
  return json;
}

export default async function(req) {
  try {
    requirePost(req);
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) return Response.json({ error: 'You must be signed in.' }, { status: 401 });
    const { plan } = await readJsonObject(req);
    if (typeof plan !== 'string' || !Object.prototype.hasOwnProperty.call(PLAN_TO_PRICE_ENV, plan)) throw new RequestError('Pick either the monthly or the yearly Sage plan.');
    const limit = await consumeRateLimit(base44, user.email.toLowerCase(), 'start_checkout', { hour: 10, day: 20 });
    if (!limit.ok) return Response.json({ error: limit.message }, { status: 429 });
    const profile = await getProfile(base44, user.email);
    if (!profile?.onboarded || profile.suspended) throw new RequestError('Finish setting up your profile before subscribing.', 403);
    const secretKey = secrets.get('STRIPE_SECRET_KEY');
    const priceId = plan === 'sage_yearly' ? secrets.get('STRIPE_PRICE_SAGE_YEARLY') : secrets.get('STRIPE_PRICE_SAGE_MONTHLY');
    if (!secretKey || !priceId) throw new RequestError('Billing is not configured yet.', 503);
    return await withActionLock(user.id, 'checkout', async () => {
      const db = base44.asServiceRole.entities.Subscription;
      if (await db.count({ user_email: user.email, status: { $in: ['active', 'trialing', 'past_due', 'unpaid', 'incomplete'] } })) throw new RequestError('You already have a Sage subscription. Manage it from your profile instead.', 409);
      const { items } = await db.filter({ user_email: user.email }, { limit: 1, sort: '-updated_date', fields: ['stripe_customer_id'] });
      let customerId = items[0]?.stripe_customer_id;
      if (!customerId) {
        const customers = await stripe(`/customers?email=${encodeURIComponent(user.email)}&limit=100`, secretKey, undefined, 'GET');
        customerId = customers.data.find((c) => !c.deleted && c.metadata?.app === 'pathways' && c.metadata?.user_id === user.id)?.id;
      }
      if (!customerId) {
        const customer = await stripe('/customers', secretKey, {
          email: user.email, 'metadata[user_email]': user.email, 'metadata[user_id]': user.id, 'metadata[app]': 'pathways',
        }, 'POST', `pathways-customer-${user.id}`);
        customerId = customer.id;
      }
      if (!/^cus_[A-Za-z0-9]+$/.test(customerId)) throw new Error('Invalid stored billing customer');
      const subscriptions = await stripe(`/subscriptions?customer=${encodeURIComponent(customerId)}&status=all&limit=100`, secretKey, undefined, 'GET');
      if (subscriptions.data.some((s) => !['canceled', 'incomplete_expired'].includes(s.status)) || subscriptions.has_more) throw new RequestError('You already have a Sage subscription. Manage it from your profile instead.', 409);
      const pending = await stripe(`/checkout/sessions?customer=${encodeURIComponent(customerId)}&status=open&limit=100`, secretKey, undefined, 'GET');
      if (pending.has_more) throw new RequestError('Please finish an existing checkout before starting another.', 409);
      for (const session of pending.data) {
        if (session.mode !== 'subscription' || session.metadata?.user_email !== user.email) continue;
        if (session.metadata?.plan === plan && session.url) return Response.json({ url: session.url, id: session.id });
        await stripe(`/checkout/sessions/${encodeURIComponent(session.id)}/expire`, secretKey);
      }
      const appUrl = new URL('https://pathways.uno');
      if (appUrl.protocol !== 'https:' || appUrl.username || appUrl.password) throw new Error('Invalid billing return address');
      const session = await stripe('/checkout/sessions', secretKey, {
        mode: 'subscription', customer: customerId, 'line_items[0][price]': priceId, 'line_items[0][quantity]': 1,
        client_reference_id: user.email, 'metadata[user_email]': user.email, 'metadata[user_id]': user.id, 'metadata[plan]': plan,
        'subscription_data[metadata][user_email]': user.email, 'subscription_data[metadata][plan]': plan, allow_promotion_codes: true,
        success_url: `${appUrl.origin}/app/sage?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl.origin}/app/sage?checkout=cancel`,
      }, 'POST', `pathways-checkout-${user.id}-${crypto.randomUUID()}`);
      return Response.json({ url: session.url, id: session.id });
    });
  } catch (error) {
    if (error instanceof RequestError || error?.status === 401 || error?.response?.status === 401) return safeFailure('stripe-create-checkout', error, 'Could not start checkout.');
    console.error('stripe-create-checkout failed', error?.message);
    const friendly = friendlyError(error?.message || 'Billing request failed');
    return Response.json({ error: friendly.message, code: friendly.code }, { status: 500 });
  }
}