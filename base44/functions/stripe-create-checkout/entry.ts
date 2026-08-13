import { createClientFromRequest } from "npm:@base44/sdk";

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

function form(params: Record<string, string | number | boolean | undefined>) {
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) body.append(k, String(v));
  }
  return body;
}

async function stripe(
  path: string,
  secretKey: string,
  params?: Record<string, string | number | boolean | undefined>,
  method = "POST",
) {
  const res = await fetch(`${STRIPE_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params ? form(params) : undefined,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message || `Stripe ${path} failed (${res.status})`);
  }
  return json;
}

Deno.serve(async (req) => {
  try {
    const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
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

    const { plan } = await req.json().catch(() => ({ plan: undefined }));
    const priceEnv = PLAN_TO_PRICE_ENV[plan];
    if (!priceEnv) {
      return Response.json(
        { error: "Pick either the monthly or the yearly Sage plan." },
        { status: 400 },
      );
    }

    const priceId = Deno.env.get(priceEnv);
    if (!priceId) {
      return Response.json(
        { error: `The ${plan} price is not configured yet.`, code: "stripe_not_configured" },
        { status: 503 },
      );
    }

    const appUrl = (Deno.env.get("APP_PUBLIC_URL") || "https://cac-pathways-d94b0ec7.base44.app")
      .replace(/\/+$/, "");

    // Reuse the Stripe customer if this person has subscribed before, so a
    // resubscribe lands on the same customer record instead of a duplicate.
    let customerId: string | undefined;
    const existing = await base44.asServiceRole.entities.Subscription.filter({
      user_email: user.email,
    });
    if (Array.isArray(existing) && existing.length > 0) {
      customerId = existing[0].stripe_customer_id || undefined;
    }

    if (!customerId) {
      const customer = await stripe("/customers", secretKey, {
        email: user.email,
        name: user.full_name || undefined,
        "metadata[user_email]": user.email,
        "metadata[app]": "pathways",
      });
      customerId = customer.id;
    }

    const session = await stripe("/checkout/sessions", secretKey, {
      mode: "subscription",
      customer: customerId,
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": 1,
      client_reference_id: user.email,
      // The webhook reads these back to know who paid.
      "metadata[user_email]": user.email,
      "metadata[plan]": plan,
      "subscription_data[metadata][user_email]": user.email,
      "subscription_data[metadata][plan]": plan,
      allow_promotion_codes: true,
      success_url: `${appUrl}/app/sage?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/app/sage?checkout=cancel`,
    });

    return Response.json({ url: session.url, id: session.id });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
});
