import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { consumeRateLimit } from '../../shared/rateLimit.ts';
import { welcomeEmail } from '../../shared/welcomeEmailTemplate.ts';
import { requirePost, readJsonObject, RequestError, safeFailure } from '../../shared/requestSafety.ts';

// Mail goes out through Base44's built-in email sender (Base44's own domain,
// shown as "Pathways"), not the pathways.uno Gmail connector. pathways.uno mail
// was landing in Gmail spam because of the domain's outreach history, and a
// welcome email that lands in spam is worse than none. Safety alerts still use
// the Gmail connector through shared/gmail.ts.

export default async function(req) {
  try {
    requirePost(req);
    const body = await readJsonObject(req);
    if (typeof body.email !== 'string' || body.email.length > 320 || (body.full_name != null && (typeof body.full_name !== 'string' || body.full_name.length > 120))) {
      throw new RequestError('Enter a valid email and name.');
    }
    const toEmail = body.email.trim();
    const fullName = (body.full_name || '').trim();
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

    const recipient = caller.email;
    const users = await base44.asServiceRole.entities.User.filter({ email: recipient });
    const target = Array.isArray(users) ? users[0] : null;
    if (!target) {
      return Response.json({ ok: false, reason: 'not_a_registered_user' }, { status: 403 });
    }

    // Even the rightful owner only gets one welcome email per day.
    const limit = await consumeRateLimit(base44, toEmail.toLowerCase(), 'welcome_email', { day: 1 });
    if (!limit.ok) {
      return Response.json({ ok: false, reason: 'already_sent_today' }, { status: 429 });
    }

    const { subject, html } = welcomeEmail(fullName || target.full_name || '');

    const globalLimit = await consumeRateLimit(base44, '__app__', 'welcome_email_budget', { hour: 50, day: 100 });
    if (!globalLimit.ok) return Response.json({ ok: false, error: 'Welcome emails have reached their allowance. Try again later.' }, { status: 429 });
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: recipient,
        subject,
        body: html,
        from_name: 'Pathways',
      });
    } catch (mailError) {
      console.error('Welcome email delivery failed', mailError?.message || mailError);
      return Response.json({ ok: false, error: 'Could not send the welcome email right now.' }, { status: 502 });
    }
    return Response.json({ ok: true });
  } catch (error) {
    return safeFailure('sendWelcomeEmail', error, 'Could not send the welcome email right now.');
  }
}
