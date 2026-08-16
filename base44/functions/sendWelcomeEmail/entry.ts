import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { consumeRateLimit } from '../../shared/rateLimit.ts';
import { sendGmail } from '../../shared/gmail.ts';
import { welcomeEmail } from '../../shared/welcomeEmailTemplate.ts';

// Mail goes out through the shared Gmail connector, via the shared helper that
// the moderation alert uses too.

export default async function(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const toEmail = (body.email || '').toString().trim();
    const fullName = (body.full_name || '').toString().trim();
    if (!toEmail) {
      return Response.json({ ok: false, reason: 'no_email' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // The endpoint has a public URL, so the caller is never trusted. A request
    // is only honoured when it is one of the two legitimate cases:
    //   1. the signup workflow, right after a real signup, or
    //   2. a signed-in user asking for their own welcome email again.
    // Anything else is refused, which is what stops a stranger from using this
    // as a free mailer pointed at arbitrary addresses.
    const users = await base44.asServiceRole.entities.User.filter({ email: toEmail });
    const target = Array.isArray(users) ? users[0] : null;
    if (!target) {
      return Response.json({ ok: false, reason: 'not_a_registered_user' }, { status: 403 });
    }

    const caller = await base44.auth.me().catch(() => null);
    const isOwnAddress = Boolean(caller?.email) && caller.email.toLowerCase() === toEmail.toLowerCase();

    // Case 1: the account was created moments ago, which only the signup
    // workflow can be reacting to. The window is deliberately short so an
    // address stops being a valid target almost immediately after signup.
    const createdAt = target.created_date ? new Date(target.created_date).getTime() : 0;
    const isFreshSignup = createdAt > 0 && Date.now() - createdAt < 15 * 60 * 1000;

    if (!isOwnAddress && !isFreshSignup) {
      return Response.json({ ok: false, reason: 'not_authorized' }, { status: 403 });
    }

    // And even an allowed caller only gets one welcome email per address per day.
    const limit = await consumeRateLimit(base44, toEmail.toLowerCase(), 'welcome_email', { day: 1 });
    if (!limit.ok) {
      return Response.json({ ok: false, reason: 'already_sent_today' }, { status: 429 });
    }

    const { subject, plain, html } = welcomeEmail(fullName || target.full_name || '');

    const sent = await sendGmail(base44, { to: toEmail, subject, plain, html });
    if (!sent.ok) {
      return Response.json(
        { ok: false, ...sent },
        { status: sent.reason === 'gmail_not_connected' ? 503 : 502 },
      );
    }
    return Response.json({ ok: true, id: sent.id });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}