import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';
import { withActionLock } from '../../shared/actionLock.ts';

// Stripe webhook. This is the ONLY thing that grants or revokes Sage.
//
// It runs as service role because Stripe is not a signed-in user, and the
// Subscription entity denies writes to every real account. Every request is
// signature-verified first, so an attacker cannot POST themselves a
// subscription by hitting this URL.

const STRIPE_API = "https://api.stripe.com/v1";
const TOLERANCE_SECONDS = 300;

const PRICE_TO_PLAN = (priceId: string) => {
  if (priceId && priceId === secrets.get("STRIPE_PRICE_SAGE_YEARLY")) return "sage_yearly";
  if (priceId && priceId === secrets.get("STRIPE_PRICE_SAGE_MONTHLY")) return "sage_monthly";
  return undefined;
};

function hexFromBuffer(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Constant-time comparison so we do not leak the signature via timing.
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verifyStripeSignature(rawBody: string, header: string, secret: string) {
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const i = p.indexOf("=");
      return [p.slice(0, i).trim(), p.slice(i + 1).trim()];
    }),
  ) as Record<string, string>;

  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  // Reject replays of an old, previously valid request.
  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > TOLERANCE_SECONDS) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${rawBody}`),
  );
  return safeEqual(hexFromBuffer(mac), signature);
}

async function stripeGet(path: string, secretKey: string) {
  const res = await fetch(`${STRIPE_API}${path}`, {
    redirect: 'manual', signal: AbortSignal.timeout(10000),
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || `Stripe GET ${path} failed`);
  return json;
}

function isoOrNull(unixSeconds?: number | null) {
  return unixSeconds ? new Date(unixSeconds * 1000).toISOString() : undefined;
}

export default async function(req) {
  const secretKey = secrets.get("STRIPE_SECRET_KEY");
  const webhookSecret = secrets.get("STRIPE_WEBHOOK_SECRET");

  if (!secretKey || !webhookSecret) {
    return Response.json({ error: "Billing is not configured." }, { status: 503 });
  }

  // Signature verification needs the byte-exact body, so read it as text
  // before any JSON parsing.
  const rawBody = await req.text();
  const sigHeader = req.headers.get("stripe-signature") || "";

  const valid = await verifyStripeSignature(rawBody, sigHeader, webhookSecret).catch(() => false);
  if (!valid) {
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Malformed payload." }, { status: 400 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities.Subscription;

    // Resolve the Stripe subscription this event concerns, whatever its type.
    let subscriptionId: string | undefined;
    let userEmail: string | undefined;
    let customerId: string | undefined;

    const obj = event?.data?.object || {};

    switch (event.type) {
      case "checkout.session.completed":
        subscriptionId = obj.subscription;
        customerId = obj.customer;
        userEmail = obj.metadata?.user_email || obj.client_reference_id || obj.customer_email;
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        subscriptionId = obj.id;
        customerId = obj.customer;
        userEmail = obj.metadata?.user_email;
        break;
      case "invoice.payment_succeeded":
      case "invoice.payment_failed":
        subscriptionId = obj.subscription || obj.parent?.subscription_details?.subscription;
        customerId = obj.customer;
        break;
      default:
        // Anything else is acknowledged and ignored so Stripe stops retrying.
        return Response.json({ received: true, ignored: event.type });
    }

    if (!subscriptionId) {
      return Response.json({ received: true, note: "no subscription on event" });
    }

    if (typeof subscriptionId !== 'string' || !/^sub_[A-Za-z0-9]+$/.test(subscriptionId)) {
      return Response.json({ error: 'Invalid subscription reference.' }, { status: 400 });
    }
    return await withActionLock(subscriptionId, 'stripe_subscription_sync', async () => {
    // Serialize reads and writes so delayed events cannot restore stale access.
    const sub = await stripeGet(`/subscriptions/${encodeURIComponent(subscriptionId)}`, secretKey);
    customerId = sub.customer;
    userEmail = sub.metadata?.user_email || userEmail;

    if (!userEmail && customerId) {
      const customer = await stripeGet(`/customers/${customerId}`, secretKey);
      userEmail = customer?.metadata?.user_email || customer?.email;
    }

    if (!userEmail) {
      return Response.json({ received: true, note: "could not resolve user" });
    }

    const item = sub.items?.data?.find((entry) => PRICE_TO_PLAN(entry.price?.id));
    if (!item) return Response.json({ received: true, ignored: 'not_a_sage_subscription' });
    const priceId = item.price.id;
    // Newer Stripe versions put billing-period dates on each subscription item.
    const periodEnd = Number(sub.current_period_end || item.current_period_end || (sub.status === 'trialing' ? sub.trial_end : 0));
    const ends = [periodEnd, sub.status === 'trialing' ? Number(sub.trial_end) : 0,
      Number(sub.cancel_at), sub.status === 'canceled' ? Number(sub.ended_at) : 0]
      .filter((value) => Number.isFinite(value) && value > 0);
    if (['active', 'trialing'].includes(sub.status) && !periodEnd) throw new Error('Stripe did not provide an access expiry');
    const paidThrough = ends.length ? Math.min(...ends) : 0;
    userEmail = String(userEmail).trim().toLowerCase();
    const patch = {
      user_email: userEmail,
      // Every row this function writes is a Stripe row. An Apple webhook will
      // write source "apple" into the same table later, and entitlement reads
      // the status field either way.
      source: "stripe",
      external_id: sub.id,
      status: sub.status,
      plan: PRICE_TO_PLAN(priceId),
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      stripe_price_id: priceId,
      current_period_end: isoOrNull(paidThrough) || '',
      cancel_at_period_end: Boolean(sub.cancel_at_period_end || (sub.cancel_at && sub.status !== 'canceled')),
      last_event_at: new Date().toISOString(),
    };

    // Keep separate purchases separate: an old cancellation must never
    // overwrite a newer subscription belonging to the same member.
    const { items } = await db.filter({ stripe_subscription_id: sub.id }, { limit: 1 });
    if (items[0]) await db.update(items[0].id, patch);
    else await db.create(patch);

    return Response.json({ received: true, type: event.type, status: sub.status });
    });
  } catch (error) {
    // A 500 tells Stripe to retry, which is what we want on a transient failure.
    console.error('stripe-webhook failed', (error as Error)?.message || error);
    return Response.json({ error: 'Webhook processing failed.' }, { status: 500 });
  }
}