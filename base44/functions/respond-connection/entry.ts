import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { notify, displayName } from '../../shared/notify.ts';

// Accepting or declining a connection request.
//
// This exists as a function rather than a client-side Connection.update for
// two reasons:
//
//   1. Only the person who RECEIVED a request may answer it. The entity rules
//      let either participant update the row, which is right for archiving but
//      would also let the sender quietly mark their own request as accepted and
//      unlock messaging. That is checked here.
//   2. Accepting has to notify the requester, and a notification must be
//      written as service role so it cannot be forged.

const DECISIONS = ['accepted', 'declined'];

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) return Response.json({ error: 'Please sign in again.' }, { status: 401 });

    const myEmail = String(user.email).toLowerCase();
    const payload = await req.json().catch(() => ({}));
    const connectionId = String(payload?.connectionId || '').trim();
    const decision = String(payload?.decision || '').trim();

    if (!connectionId) {
      return Response.json({ error: 'Which request are you answering?' }, { status: 400 });
    }
    if (!DECISIONS.includes(decision)) {
      return Response.json({ error: 'That is not a valid response.' }, { status: 400 });
    }

    const rows = await base44.asServiceRole.entities.Connection.filter({ id: connectionId });
    const conn = Array.isArray(rows) && rows.length ? rows[0] : null;
    if (!conn) return Response.json({ error: 'That request no longer exists.' }, { status: 404 });

    const fromEmail = String(conn.from_email || '').toLowerCase();
    const toEmail = String(conn.to_email || '').toLowerCase();

    // Only the recipient answers. The sender gets a deliberately plain refusal.
    if (toEmail !== myEmail) {
      return Response.json(
        { code: 'not_yours', error: 'Only the person who received a request can answer it.' },
        { status: 403 },
      );
    }

    if (conn.status !== 'pending') {
      return Response.json(
        { code: 'already_answered', error: 'That request has already been answered.' },
        { status: 409 },
      );
    }

    // A suspended account cannot open a messaging channel by accepting.
    const profiles = await base44.asServiceRole.entities.Profile.filter({});
    const all = Array.isArray(profiles) ? profiles : [];
    const me = all.find((p: any) => String(p.user_email || '').toLowerCase() === myEmail) || null;
    if (me?.suspended) {
      return Response.json(
        { code: 'suspended', error: 'Your account is under review, so you cannot accept requests right now.' },
        { status: 403 },
      );
    }

    // If either side has since blocked the other, the request quietly dies
    // rather than opening a thread.
    const blocks = await base44.asServiceRole.entities.Block.filter({});
    const blocked = (Array.isArray(blocks) ? blocks : []).some((b: any) => {
      const a = String(b.blocker_email || '').toLowerCase();
      const c = String(b.blocked_email || '').toLowerCase();
      return (a === myEmail && c === fromEmail) || (a === fromEmail && c === myEmail);
    });
    if (blocked) {
      await base44.asServiceRole.entities.Connection.update(connectionId, { status: 'declined' });
      return Response.json({ code: 'unavailable', error: 'That request is no longer available.' }, { status: 403 });
    }

    const updated = await base44.asServiceRole.entities.Connection.update(connectionId, {
      status: decision,
    });

    // Only an acceptance is announced. Someone who declines should not have to
    // send a notification saying so, and the requester simply sees the request
    // is no longer pending.
    if (decision === 'accepted') {
      const myName = me?.full_name || user.full_name || conn.to_name || '';
      await notify(base44, {
        userEmail: fromEmail,
        type: 'connection_accepted',
        actorEmail: myEmail,
        actorName: myName,
        body: `${displayName(myName, myEmail)} accepted your connection request. You can message them now.`,
        link: `/app/messages?to=${encodeURIComponent(myEmail)}`,
        connectionId,
      });
    }

    return Response.json({ connection: updated });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Could not answer that request.' }, { status: 500 });
  }
}
