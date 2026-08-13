import { createClientFromRequest } from "npm:@base44/sdk";

// Stripe webhook. This is the ONLY thing that grants or revokes Sage.
//
// It runs as service role because Stripe is not a signed-in user, and the
// Subscription entity denies writes to every real account. Every request is
// signature-verified first, so an attacker cannot POST themselves a
// subscription by hitting this URL.

const STRIPE_API = "https://api.stripe.com/v1";
const TOLERANCE_SECONDS = 300;

const PRICE_TO_PLAN = (priceId: string) => {
  if (priceId && priceId === Deno.env.get("STRIPE_PRICE_SAGE_YEARLY")) return "sage_yearly";
  if (priceId && priceId === Deno.env.get("STRIPE_PRICE_SAGE_MONTHLY")) return "sage_monthly";
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
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || `Stripe GET ${path} failed`);
  return json;
}

function isoOrNull(unixSeconds?: number | null) {
  return unixSeconds ? new Date(unixSeconds * 1000).toISOString() : undefined;
}

Deno.serve(async (req) => {
  const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

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
        subscriptionId = obj.subscription;
        customerId = obj.customer;
        break;
      default:
        // Anything else is acknowledged and ignored so Stripe stops retrying.
        return Response.json({ received: true, ignored: event.type });
    }

    if (!subscriptionId) {
      return Response.json({ received: true, note: "no subscription on event" });
    }

    // Always re-read the subscription from Stripe rather than trusting the
    // event payload's shape. Stripe is the source of truth for entitlement.
    const sub = await stripeGet(`/subscriptions/${subscriptionId}`, secretKey);
    customerId = customerId || sub.customer;
    userEmail = userEmail || sub.metadata?.user_email;

    if (!userEmail && customerId) {
      const customer = await stripeGet(`/customers/${customerId}`, secretKey);
      userEmail = customer?.metadata?.user_email || customer?.email;
    }

    if (!userEmail) {
      return Response.json({ received: true, note: "could not resolve user" });
    }

    const priceId = sub.items?.data?.[0]?.price?.id;
    const patch = {
      user_email: userEmail,
      status: sub.status,
      plan: PRICE_TO_PLAN(priceId) || sub.metadata?.plan || undefined,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      stripe_price_id: priceId,
      current_period_end: isoOrNull(sub.current_period_end),
      cancel_at_period_end: Boolean(sub.cancel_at_period_end),
      last_event_at: new Date().toISOString(),
    };

    // One row per person. Upsert so repeated or out-of-order events converge
    // on the same record instead of piling up duplicates.
    const existing = await db.filter({ user_email: userEmail });
    if (Array.isArray(existing) && existing.length > 0) {
      await db.update(existing[0].id, patch);
      // Clean up any duplicates a previous bad run may have left behind.
      for (const dup of existing.slice(1)) {
        await db.delete(dup.id).catch(() => {});
      }
    } else {
      await db.create(patch);
    }

    return Response.json({ received: true, type: event.type, status: sub.status });
  } catch (error) {
    // A 500 tells Stripe to retry, which is what we want on a transient failure.
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});
