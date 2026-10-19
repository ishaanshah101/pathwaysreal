import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';
import { consumeRateLimit } from '../../shared/rateLimit.ts';
import { requirePost, readJsonObject, RequestError, safeFailure } from '../../shared/requestSafety.ts';

// Opens Stripe's hosted billing portal so a subscriber can update their card,
// see invoices, or cancel. The customer id comes from our own database keyed
// on the signed-in user, never from the request, so nobody can open somebody
// else's billing portal by passing a customer id.

const STRIPE_API = "https://api.stripe.com/v1";

export default async function(req) {
  try {
    requirePost(req);
    const secretKey = secrets.get('STRIPE_SECRET_KEY');
    if (!secretKey) {
      return Response.json(
        { error: "Billing is not configured yet.", code: "stripe_not_configured" },
        { status: 503 },
      );
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) {
      return Response.json({ error: "You must be signed in." }, { status: 401 });
    }

    const payload = await readJsonObject(req);
    if (Object.keys(payload).length) throw new RequestError('Billing details are resolved from your account, not request fields.');
    const limit = await consumeRateLimit(base44, user.email.toLowerCase(), 'billing_portal', { hour: 15, day: 50 });
    if (!limit.ok) return Response.json({ error: limit.message }, { status: 429 });
    const { items } = await base44.asServiceRole.entities.Subscription.filter({
      user_email: user.email, stripe_customer_id: { $exists: true },
    }, { limit: 1, sort: '-updated_date' });
    const customerId = items[0]?.stripe_customer_id;
    if (!customerId) {
      return Response.json({ error: "You do not have a Sage subscription yet." }, { status: 404 });
    }

    if (!/^cus_[A-Za-z0-9]+$/.test(customerId)) throw new Error('Invalid stored billing customer');
    const appUrl = 'https://pathways.uno';

    const body = new URLSearchParams({
      customer: customerId,
      return_url: `${appUrl}/app/sage`,
    });

    const res = await fetch(`${STRIPE_API}/billing_portal/sessions`, {
      method: "POST", redirect: 'manual', signal: AbortSignal.timeout(10000),
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.error?.message || "Could not open the billing portal.");
    }

    return Response.json({ url: json.url });
  } catch (error) {
    return safeFailure('stripe-portal', error, 'Could not open your billing page. Please try again in a moment.');
  }
}