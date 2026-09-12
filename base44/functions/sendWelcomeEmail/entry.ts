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

    // The endpoint has a public URL, so the caller must prove who they are.
    // The ONLY accepted case is a signed-in member asking for the welcome email
    // for their own address, which is what the app does once, at the end of
    // onboarding. "The account was created recently" used to be accepted too,
    // but that was not proof of anything: a stranger could hit this URL during
    // the same window as a real signup and use it as a mailer.
    const caller = await base44.auth.me().catch(() => null);
    if (!caller?.email) {
      return Response.json({ ok: false, reason: 'not_signed_in' }, { status: 401 });
    }
    if (caller.email.toLowerCase() !== toEmail.toLowerCase()) {
      return Response.json({ ok: false, reason: 'not_your_address' }, { status: 403 });
    }

    const users = await base44.asServiceRole.entities.User.filter({ email: toEmail });
    const target = Array.isArray(users) ? users[0] : null;
    if (!target) {
      return Response.json({ ok: false, reason: 'not_a_registered_user' }, { status: 403 });
    }

    // Even the rightful owner only gets one welcome email per day.
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