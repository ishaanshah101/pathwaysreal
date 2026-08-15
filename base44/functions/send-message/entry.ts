import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { screenContent, classifyRisk, logModerationEvent, excerptOf, MODERATION_BLOCK_REASON } from '../../shared/moderation.ts';
import { consumeRateLimit } from '../../shared/rateLimit.ts';
import { validateAttachments, screenAttachments, IMAGE_BLOCK_REASON } from '../../shared/attachments.ts';

// The ONLY writer of Message rows. The Message entity's create rule is locked to
// a service-only role, so a browser console can no longer insert a message to an
// arbitrary address, and every message passes the safety checks below.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) return Response.json({ error: 'Please sign in again.' }, { status: 401 });

    const payload = await req.json().catch(() => ({}));
    // from_email in the request is ignored on purpose — identity comes from the
    // authenticated session only.
    const fromEmail = String(user.email).toLowerCase();
    const toEmail = String(payload?.toEmail || '').trim().toLowerCase();
    const body = String(payload?.body || '').trim();

    const valid = validateAttachments(payload?.attachments);
    if (!valid.ok) {
      return Response.json({ error: valid.error, code: valid.code }, { status: 400 });
    }
    const hasFiles = valid.files.length > 0;

    // A message carrying files does not need body text, but a bare message does.
    if (!toEmail || (!body && !hasFiles)) {
      return Response.json({ error: 'A recipient and a message are both required.' }, { status: 400 });
    }
    if (toEmail === fromEmail) {
      return Response.json({ error: 'You cannot message yourself.' }, { status: 400 });
    }
    if (body.length > 2000) {
      return Response.json({ error: 'Messages are limited to 2000 characters.' }, { status: 400 });
    }

    // Blocks come first, before anything else is checked. The refusal is
    // deliberately identical in both directions so a sender cannot work out
    // whether they were blocked or simply never connected.
    const blocks = await base44.asServiceRole.entities.Block.filter({});
    const isBlocked = (Array.isArray(blocks) ? blocks : []).some((b: any) => {
      const blocker = String(b.blocker_email || '').toLowerCase();
      const blocked = String(b.blocked_email || '').toLowerCase();
      return (blocker === fromEmail && blocked === toEmail)
        || (blocker === toEmail && blocked === fromEmail);
    });
    if (isBlocked) {
      return Response.json(
        { code: 'blocked', error: 'You can no longer message this person.' },
        { status: 403 },
      );
    }

    // A Connection is what unlocks messaging. Checked server side against the
    // real rows, so hiding the button was never the actual protection.
    const conns = await base44.asServiceRole.entities.Connection.filter({ status: 'accepted' });
    const connected = (Array.isArray(conns) ? conns : []).some((c: any) => {
      const a = String(c.from_email || '').toLowerCase();
      const b = String(c.to_email || '').toLowerCase();
      return (a === fromEmail && b === toEmail) || (a === toEmail && b === fromEmail);
    });
    if (!connected) {
      return Response.json(
        {
          code: 'not_connected',
          error: 'You can only message people you are connected with. Send a connection request first.',
        },
        { status: 403 },
      );
    }

    const limit = await consumeRateLimit(base44, fromEmail, 'send_message', { hour: 30, day: 200 });
    if (!limit.ok) {
      return Response.json({ code: 'rate_limited', error: limit.message }, { status: 429 });
    }

    // Deterministic safety checks first: contact details, meetup plans, photo
    // requests, secrecy, sexual content. File names are screened alongside the
    // body, since a filename is just as good a place to hide a phone number.
    const screenTarget = [body, ...valid.files.map((f: any) => f.name)].filter(Boolean).join('\n');
    const screened = screenContent(screenTarget);
    if (screened.blocked) {
      await logModerationEvent(base44, {
        sender_email: fromEmail,
        recipient_email: toEmail,
        surface: 'message',
        rule: screened.rule,
        severity: screened.severity,
        excerpt: excerptOf(screenTarget),
      });
      return Response.json({ blocked: true, reason: MODERATION_BLOCK_REASON });
    }

    // Then the classifier, for grooming patterns that use clean vocabulary.
    const verdict = await classifyRisk(base44, body);
    if (verdict.risk === 'high') {
      await logModerationEvent(base44, {
        sender_email: fromEmail,
        recipient_email: toEmail,
        surface: 'message',
        rule: 'classifier',
        severity: 'high',
        excerpt: excerptOf(body),
        detail: [verdict.category, verdict.reason].filter(Boolean).join(': '),
      });
      return Response.json({
        blocked: true,
        reason: 'This message was held back because it looked unsafe for a student conversation. A moderator has been notified.',
      });
    }

    // Vision check on every attached image, after the text checks and before
    // the row exists. Fails closed: an image that cannot be checked is not
    // delivered. This is the only thing standing between a private message and
    // an unreviewable image sent to a minor, so it does not get a fast path.
    const screenedFiles = await screenAttachments(base44, valid.files);
    if (!screenedFiles.ok) {
      await logModerationEvent(base44, {
        sender_email: fromEmail,
        recipient_email: toEmail,
        surface: 'message',
        rule: `image_${screenedFiles.verdict.category || 'unsafe'}`,
        severity: screenedFiles.verdict.severity === 'high' ? 'high' : 'low',
        excerpt: `${screenedFiles.file.name}: ${screenedFiles.file.url}`,
        detail: screenedFiles.verdict.reason,
      });
      return Response.json({ blocked: true, reason: IMAGE_BLOCK_REASON });
    }

    // Any attachment that is not an image reaches the recipient uninspected.
    // Log it so the moderation queue has a record of what moved through DMs,
    // even when nothing was wrong with it.
    const unscanned = screenedFiles.files.filter((f: any) => !f.scanned);
    if (unscanned.length > 0) {
      await logModerationEvent(base44, {
        sender_email: fromEmail,
        recipient_email: toEmail,
        surface: 'message',
        rule: 'unscanned_file',
        severity: 'low',
        excerpt: unscanned.map((f: any) => `${f.name} (${f.kind})`).join(', '),
        detail: 'Non-image attachment delivered without inspection',
      });
    }

    const threadKey = [fromEmail, toEmail].sort().join('|');
    const created = await base44.asServiceRole.entities.Message.create({
      thread_key: threadKey,
      from_email: fromEmail,
      from_name: String(payload?.fromName || user.full_name || ''),
      to_email: toEmail,
      body,
      attachments: screenedFiles.files,
    });

    return Response.json({ message: created });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Could not send that message.' }, { status: 500 });
  }
}