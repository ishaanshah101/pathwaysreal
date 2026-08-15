import { createClientFromRequest } from "npm:@base44/sdk";

// Opens Stripe's hosted billing portal so a subscriber can update their card,
// see invoices, or cancel. The customer id comes from our own database keyed
// on the signed-in user, never from the request, so nobody can open somebody
// else's billing portal by passing a customer id.

const STRIPE_API = "https://api.stripe.com/v1";

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

    const rows = await base44.asServiceRole.entities.Subscription.filter({
      user_email: user.email,
    });
    const customerId = Array.isArray(rows) && rows.length ? rows[0].stripe_customer_id : null;
    if (!customerId) {
      return Response.json({ error: "You do not have a Sage subscription yet." }, { status: 404 });
    }

    const appUrl = (Deno.env.get("APP_PUBLIC_URL") || "https://pathways.uno")
      .replace(/\/+$/, "");

    const body = new URLSearchParams({
      customer: customerId,
      return_url: `${appUrl}/app/sage`,
    });

    const res = await fetch(`${STRIPE_API}/billing_portal/sessions`, {
      method: "POST",
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
    // Keep Stripe's developer-facing text in the logs, not in a student's face.
    console.error("[stripe-portal]", (error as Error).message);
    return Response.json(
      { error: "Could not open your billing page. Please try again in a moment.", code: "portal_failed" },
      { status: 500 },
    );
  }
});
