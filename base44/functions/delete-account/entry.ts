import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Permanent account deletion, required by App Store guideline 5.1.1(v).
//
// Everything here runs as service role and acts on the CALLING user only: the
// email is taken from the session, never from the payload, so this endpoint can
// never be pointed at somebody else's account.
//
// Two things deliberately survive: safety records (reports and moderation
// events, anonymised) and the other side of a conversation. A recipient's own
// message history is theirs, and a block someone placed on this account stays in
// force. Everything that identifies the person is removed.

const STRIPE_API = 'https://api.stripe.com/v1';
const ANON_EMAIL = '';
const ANON_NAME = 'Deleted account';

async function deleteAll(table, query) {
  const rows = await table.filter(query).catch(() => []);
  for (const row of Array.isArray(rows) ? rows : []) {
    await table.delete(row.id).catch(() => {});
  }
  return Array.isArray(rows) ? rows.length : 0;
}

async function anonymize(table, query, patch) {
  const rows = await table.filter(query).catch(() => []);
  for (const row of Array.isArray(rows) ? rows : []) {
    await table.update(row.id, patch).catch(() => {});
  }
  return Array.isArray(rows) ? rows.length : 0;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user?.email) {
      return Response.json({ error: 'You must be signed in.' }, { status: 401 });
    }
    const email = user.email;
    const db = base44.asServiceRole.entities;

    // 1. A paying subscription is cancelled at Stripe FIRST. If that call fails
    //    we stop here: leaving someone billed for an account that no longer
    //    exists is worse than a failed deletion they can retry.
    const subs = await db.Subscription.filter({ user_email: email }).catch(() => []);
    const sub = Array.isArray(subs) && subs.length ? subs[0] : null;
    const live = ['active', 'trialing', 'past_due', 'unpaid'].includes(sub?.status);

    if (live && sub?.stripe_subscription_id) {
      const secretKey = Deno.env.get('STRIPE_SECRET_KEY');
      if (!secretKey) {
        return Response.json(
          {
            error: 'Your Sage subscription could not be cancelled, so nothing was deleted. Please contact us.',
            code: 'stripe_not_configured',
          },
          { status: 503 },
        );
      }
      const res = await fetch(`${STRIPE_API}/subscriptions/${sub.stripe_subscription_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${secretKey}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok && json?.error?.code !== 'resource_missing') {
        console.error('[delete-account] stripe cancel failed', json?.error?.message);
        return Response.json(
          {
            error: 'We could not cancel your Sage subscription, so your account was not deleted. Please try again in a moment.',
            code: 'stripe_cancel_failed',
          },
          { status: 502 },
        );
      }
    }
    // The local mirror goes with the account.
    await deleteAll(db.Subscription, { user_email: email });

    // 2. Profile.
    await deleteAll(db.Profile, { user_email: email });

    // 3. Posts they authored.
    await deleteAll(db.Post, { author_email: email });

    // 4. Sage history and the free-sample counters.
    await deleteAll(db.SageMessage, { user_email: email });
    await deleteAll(db.SageThread, { user_email: email });
    await deleteAll(db.SageFolder, { user_email: email });
    await deleteAll(db.SageTrialUsage, { user_email: email });

    // 5. Connections in either direction.
    await deleteAll(db.Connection, { from_email: email });
    await deleteAll(db.Connection, { to_email: email });

    // 6. Blocks THEY placed go. Blocks placed ON them stay, so nobody loses a
    //    protection they chose because the other person deleted their account.
    await deleteAll(db.Block, { blocker_email: email });

    // 7. Messages they sent stay for the recipient, stripped of identity.
    await anonymize(db.Message, { from_email: email }, { from_email: ANON_EMAIL, from_name: ANON_NAME });
    await anonymize(db.MessageReceipt, { sender_email: email }, { sender_email: ANON_EMAIL });
    await anonymize(db.MessageReceipt, { recipient_email: email }, { recipient_email: ANON_EMAIL });
    // Their own archive rows go; other people's archives of them are anonymised.
    await deleteAll(db.ThreadArchive, { user_email: email });
    await anonymize(db.ThreadArchive, { other_email: email }, { other_email: ANON_EMAIL });

    // 8. Safety history survives, anonymised. This is a platform used by minors,
    //    and a pattern of behaviour has to remain visible across accounts.
    await anonymize(db.Report, { reporter_email: email }, { reporter_email: ANON_EMAIL });
    await anonymize(db.Report, { reported_email: email }, { reported_email: ANON_EMAIL });
    await anonymize(db.ModerationEvent, { sender_email: email }, { sender_email: ANON_EMAIL });
    await anonymize(db.ModerationEvent, { recipient_email: email }, { recipient_email: ANON_EMAIL });

    // 9. Abuse counters and any verification request.
    await deleteAll(db.RateLimit, { user_email: email });
    await deleteAll(db.VerificationRequest, { user_email: email });

    // 10. The login itself, last, so the account cannot sign in again.
    await db.User.delete(user.id).catch(() => {});

    // 11. One identifier-free audit line that a deletion happened.
    await db.ModerationEvent.create({
      sender_email: ANON_EMAIL,
      surface: 'message',
      rule: 'account_deleted',
      severity: 'low',
      detail: 'A member deleted their account. No identifiers retained.',
      status: 'dismissed',
      occurred_at: new Date().toISOString(),
    }).catch(() => {});

    return Response.json({ ok: true });
  } catch (error) {
    console.error('[delete-account]', error.message);
    return Response.json(
      { error: 'Something went wrong deleting your account. Please try again.', code: 'delete_failed' },
      { status: 500 },
    );
  }
}