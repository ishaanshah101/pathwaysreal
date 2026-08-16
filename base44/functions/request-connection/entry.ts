import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { consumeRateLimit } from '../../shared/rateLimit.ts';
import { notify, displayName } from '../../shared/notify.ts';

// The only place a Connection is created.
//
// The rule that matters: an adult cannot send the first connection request to
// a member who is a minor. The younger person decides whether contact happens
// at all. A student can request an adult freely, and an adult can accept.
//
// This is enforced here rather than by hiding a button, because hiding a
// button protects nobody who knows what a browser console is.

const ADULT_ROLES = ['college_student', 'educator', 'counselor'];

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) return Response.json({ error: 'Please sign in again.' }, { status: 401 });

    const fromEmail = String(user.email).toLowerCase();
    const payload = await req.json().catch(() => ({}));
    const toEmail = String(payload?.toEmail || '').trim().toLowerCase();
    const note = String(payload?.note || '').trim().slice(0, 500);

    if (!toEmail) return Response.json({ error: 'Who are you trying to connect with?' }, { status: 400 });
    if (toEmail === fromEmail) {
      return Response.json({ error: 'You cannot connect with yourself.' }, { status: 400 });
    }

    const profiles = await base44.asServiceRole.entities.Profile.filter({});
    const all = Array.isArray(profiles) ? profiles : [];
    const me = all.find((p: any) => String(p.user_email || '').toLowerCase() === fromEmail) || null;
    const them = all.find((p: any) => String(p.user_email || '').toLowerCase() === toEmail) || null;

    if (!them) {
      return Response.json({ error: 'We could not find that person.' }, { status: 404 });
    }

    if (me?.suspended) {
      return Response.json(
        { code: 'suspended', error: 'Your account is under review, so you cannot send connection requests right now.' },
        { status: 403 },
      );
    }

    // Blocks in either direction end it, with a deliberately vague message so
    // a blocked person cannot confirm they were blocked.
    const blocks = await base44.asServiceRole.entities.Block.filter({});
    const blocked = (Array.isArray(blocks) ? blocks : []).some((b: any) => {
      const a = String(b.blocker_email || '').toLowerCase();
      const c = String(b.blocked_email || '').toLowerCase();
      return (a === fromEmail && c === toEmail) || (a === toEmail && c === fromEmail);
    });
    if (blocked) {
      return Response.json({ code: 'unavailable', error: 'That request could not be sent.' }, { status: 403 });
    }

    // THE RULE. An adult may not open contact with a minor.
    const iAmAdult = ADULT_ROLES.includes(String(me?.role || 'student'));
    const theyAreMinor = them.is_minor === true;

    if (iAmAdult && theyAreMinor) {
      return Response.json(
        {
          code: 'adult_cannot_initiate',
          error: 'On Pathways, students reach out to adults, not the other way around. If they send you a request, you can accept it.',
        },
        { status: 403 },
      );
    }

    // Already connected, or a request already open in either direction.
    const conns = await base44.asServiceRole.entities.Connection.filter({});
    const existing = (Array.isArray(conns) ? conns : []).find((c: any) => {
      const a = String(c.from_email || '').toLowerCase();
      const b = String(c.to_email || '').toLowerCase();
      return (a === fromEmail && b === toEmail) || (a === toEmail && b === fromEmail);
    });
    if (existing) {
      if (existing.status === 'accepted') {
        return Response.json({ code: 'already_connected', error: 'You are already connected.' }, { status: 409 });
      }
      if (existing.status === 'pending') {
        return Response.json({ code: 'already_pending', error: 'There is already a request open between you.' }, { status: 409 });
      }
    }

    const limit = await consumeRateLimit(base44, fromEmail, 'connection_request', { day: 50 });
    if (!limit.ok) {
      return Response.json({ code: 'rate_limited', error: limit.message }, { status: 429 });
    }

    const fromName = me?.full_name || user.full_name || '';

    const created = await base44.asServiceRole.entities.Connection.create({
      from_email: fromEmail,
      from_name: fromName,
      to_email: toEmail,
      to_name: them.full_name || '',
      status: 'pending',
      note,
    });

    // Tell the person being asked. Without this a request sits unseen until
    // they happen to open Explore, which is the reason connecting felt broken.
    await notify(base44, {
      userEmail: toEmail,
      type: 'connection_request',
      actorEmail: fromEmail,
      actorName: fromName,
      body: `${displayName(fromName, fromEmail)} requested to connect with you.`,
      link: '/app/requests',
      connectionId: created?.id,
    });

    return Response.json({ connection: created });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Could not send that request.' }, { status: 500 });
  }
}
