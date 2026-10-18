import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { requirePost, readJsonObject, safeFailure } from '../../shared/requestSafety.ts';
import { withActionLock } from '../../shared/actionLock.ts';
import { consumeRateLimit } from '../../shared/rateLimit.ts';
import { notify, displayName } from '../../shared/notify.ts';
import {
  screenContent, classifyRisk, logModerationEvent, excerptOf, MODERATION_BLOCK_REASON,
} from '../../shared/moderation.ts';
import { isSuspended, blockedEitherWay, canRequestConnections } from '../../shared/accounts.ts';
import { resolveMember } from '../../shared/memberReferences.ts';

// The only place a Connection is created.
//
// The rule that matters: an adult cannot send the first connection request to
// a member who is a minor. The younger person decides whether contact happens
// at all. A student can request an adult freely, and an adult can accept.
//
// This is enforced here rather than by hiding a button, because hiding a
// button protects nobody who knows what a browser console is.

export default async function (req: Request): Promise<Response> {
  try {
    requirePost(req);
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) return Response.json({ error: 'Please sign in again.' }, { status: 401 });

    const fromEmail = String(user.email).toLowerCase();
    const payload = await readJsonObject(req);
    const attempt = await consumeRateLimit(base44, fromEmail, 'connection_attempt', { hour: 100, day: 300 });
    if (!attempt.ok) return Response.json({ error: attempt.message }, { status: 429 });
    const target = payload?.targetProfileId ? `profile:${payload.targetProfileId}` : payload?.toEmail;
    const note = String(payload?.note || '').trim().slice(0, 500);

    if (typeof target !== 'string' || !target || target.length > 330 || (payload.note != null && (typeof payload.note !== 'string' || payload.note.length > 500))) return Response.json({ error: 'Choose a member and keep the note under 500 characters.' }, { status: 400 });
    const [me, them] = await Promise.all([
      resolveMember(base44, fromEmail),
      resolveMember(base44, target),
    ]);
    // Registered is not onboarded: missing/unknown roles never default to student.
    if (!canRequestConnections(me)) {
      return Response.json({ code: 'profile_required', error: 'Finish setting up your profile first.' }, { status: 403 });
    }
    const toEmail = String(them?.user_email || '').toLowerCase();
    if (toEmail === fromEmail) {
      return Response.json({ error: 'You cannot connect with yourself.' }, { status: 400 });
    }

    if (!them?.onboarded || them.suspended) {
      return Response.json({ error: 'That member is not available.' }, { status: 404 });
    }

    if (isSuspended(me)) {
      return Response.json(
        { code: 'suspended', error: 'Your account is under review, so you cannot send connection requests right now.' },
        { status: 403 },
      );
    }

    // Blocks in either direction end it, with a deliberately vague message so
    // a blocked person cannot confirm they were blocked.
    if ((await blockedEitherWay(base44, fromEmail)).has(toEmail)) {
      return Response.json({ code: 'unavailable', error: 'That request could not be sent.' }, { status: 403 });
    }

    // THE RULE. An adult may not open contact with a minor.
    const iAmAdult = me.role !== 'student' || me.account_type === 'adult';
    const theyAreMinor = them.is_minor !== false;

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
    return await withActionLock([fromEmail, toEmail].sort().join('|'), 'connection_request', async () => {
    const { items: conns } = await base44.asServiceRole.entities.Connection.filter({
      status: { $in: ['accepted', 'pending'] }, $or: [
        { from_email: fromEmail, to_email: toEmail }, { from_email: toEmail, to_email: fromEmail },
      ],
    }, { limit: 1, sort: '-updated_date' });
    const existing = conns[0];
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

    // The note is the one piece of free text that reaches a person before any
    // connection exists, which makes it the first thing a stranger can type at
    // a student. It gets exactly what a message body gets: the deterministic
    // rules, then the classifier, each logged to the moderation queue the way
    // send-message logs them.
    //
    // Two deliberate differences from send-message. The event is recorded with
    // surface 'message' because that is what the ModerationEvent schema allows,
    // so the surface is named in detail instead. And a refusal is a real 4xx
    // carrying `error`, not a 200 carrying `reason`, because useConnections only
    // reads a response body when the request fails; a 200 would look like the
    // request went through when nothing was created.
    if (note) {
      const screened = screenContent(note);
      if (screened.blocked) {
        await logModerationEvent(base44, {
          sender_email: fromEmail,
          recipient_email: toEmail,
          surface: 'message',
          rule: screened.rule,
          severity: screened.severity,
          excerpt: excerptOf(note),
          detail: 'Connection request note',
        });
        return Response.json(
          { code: 'blocked_content', blocked: true, error: MODERATION_BLOCK_REASON, reason: MODERATION_BLOCK_REASON },
          { status: 403 },
        );
      }

      const verdict = await classifyRisk(base44, note);
      if (!verdict.ok) return Response.json({ error: 'Safety checks are temporarily unavailable. Your request was not sent. Try again shortly.' }, { status: 503 });
      if (verdict.risk === 'high') {
        await logModerationEvent(base44, {
          sender_email: fromEmail,
          recipient_email: toEmail,
          surface: 'message',
          rule: 'classifier',
          severity: 'high',
          excerpt: excerptOf(note),
          detail: ['Connection request note', verdict.category, verdict.reason].filter(Boolean).join(': '),
        });
        const held = 'This request was held back because the note looked unsafe for a student conversation. A moderator has been notified.';
        return Response.json(
          { code: 'blocked_content', blocked: true, error: held, reason: held },
          { status: 403 },
        );
      }
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
    });
  } catch (error) {
    return safeFailure('request-connection', error, 'Could not send that request.');
  }
}