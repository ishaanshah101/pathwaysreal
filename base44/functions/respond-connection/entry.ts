import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { notify, displayName } from '../../shared/notify.ts';
import { pushToUser } from '../../shared/webPush.ts';
import { blockedEitherWay, getProfile } from '../../shared/accounts.ts';
import { consumeRateLimit } from '../../shared/rateLimit.ts';
import { withActionLock } from '../../shared/actionLock.ts';
import { requirePost, readJsonObject, safeFailure } from '../../shared/requestSafety.ts';

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
    requirePost(req);
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) return Response.json({ error: 'Please sign in again.' }, { status: 401 });

    const myEmail = String(user.email).toLowerCase();
    const payload = await readJsonObject(req);
    const limit = await consumeRateLimit(base44, myEmail, 'respond_connection', { hour: 100, day: 300 });
    if (!limit.ok) return Response.json({ error: limit.message }, { status: 429 });
    const connectionId = String(payload?.connectionId || '').trim();
    const decision = String(payload?.decision || '').trim();

    if (!/^[a-f0-9]{24}$/.test(connectionId)) {
      return Response.json({ error: 'Which request are you answering?' }, { status: 400 });
    }
    if (!DECISIONS.includes(decision)) {
      return Response.json({ error: 'That is not a valid response.' }, { status: 400 });
    }

    return await withActionLock(connectionId, 'connection_response', async () => {
    const { items } = await base44.asServiceRole.entities.Connection.filter({ id: connectionId, to_email: myEmail }, { limit: 1 });
    const conn = items[0] || null;
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
    const [me, sender] = await Promise.all([getProfile(base44, myEmail), getProfile(base44, fromEmail)]);
    if (!me?.onboarded || me.suspended || !sender?.onboarded || sender.suspended) {
      return Response.json(
        { code: 'suspended', error: 'Your account is under review, so you cannot accept requests right now.' },
        { status: 403 },
      );
    }

    // If either side has since blocked the other, the request quietly dies
    // rather than opening a thread.
    if ((await blockedEitherWay(base44, myEmail)).has(fromEmail)) {
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
      await pushToUser(base44, fromEmail, {
        title: 'Connection accepted',
        body: `${displayName(myName, myEmail)} accepted your connection request. You can message them now.`,
        url: `/app/messages?to=${encodeURIComponent(myEmail)}`,
        tag: `conn-${connectionId}`,
      }).catch(() => {});
    }

    return Response.json({ connection: updated });
    });
  } catch (error: any) {
    return safeFailure('respond-connection', error, 'Could not answer that request.');
  }
}