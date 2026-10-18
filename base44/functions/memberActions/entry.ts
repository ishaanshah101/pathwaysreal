import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { requirePost, readJsonObject, RequestError, safeFailure } from '../../shared/requestSafety.ts';
import { consumeRateLimit } from '../../shared/rateLimit.ts';
import { withActionLock } from '../../shared/actionLock.ts';
import { resolveMember, memberReference, profilesForReferences } from '../../shared/memberReferences.ts';
import { normalizeEmail, blockedEitherWay, shapeProfile } from '../../shared/accounts.ts';

// Directory controls use opaque profile references. Never return the resolved
// email, including through the caller's readable Follow/Block records.
export default async function(req) {
  try {
    requirePost(req);
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) return Response.json({ error: 'Please sign in again.' }, { status: 401 });
    const email = normalizeEmail(user.email);
    const body = await readJsonObject(req);
    if (!['following', 'follow', 'unfollow', 'report'].includes(body.action)) throw new RequestError('Unknown action.');
    if (body.cursor != null && (typeof body.cursor !== 'string' || body.cursor.length > 4096)) throw new RequestError('That page is not available.');
    const limits = body.action === 'following' ? { hour: 300, day: 1500 } : body.action === 'report' ? { hour: 10, day: 30 } : { hour: 60, day: 200 };
    const limit = await consumeRateLimit(base44, email, body.action === 'report' ? 'file_report' : body.action === 'following' ? 'read_follows' : 'change_follow', limits);
    if (!limit.ok) return Response.json({ error: limit.message }, { status: 429 });
    const db = base44.asServiceRole.entities;
    const me = await resolveMember(base44, email);
    if (!me?.onboarded || me.suspended) return Response.json({ error: 'Your profile is not available for this action.' }, { status: 403 });

    if (body.action === 'following') {
      const [page, followingCount, followerCount] = await Promise.all([
        db.Follow.filter({ follower_email: email }, { limit: 50, cursor: body.cursor }),
        db.Follow.count({ follower_email: email }),
        db.Follow.count({ followed_email: { $in: [email, memberReference(me)] } }),
      ]);
      const profiles = await profilesForReferences(base44, page.items.map((r) => r.followed_email));
      const refs = new Map(profiles.flatMap((p) => [[normalizeEmail(p.user_email), memberReference(p)], [memberReference(p), memberReference(p)]]));
      return Response.json({ ...page, items: page.items.map((r) => ({
        id: r.id, follower_email: email,
        followed_email: refs.get(normalizeEmail(r.followed_email)) || r.followed_email,
        followed_name: r.followed_name,
      })), followingCount, followerCount });
    }

    const target = await resolveMember(base44, body.target);
    if (!target?.onboarded || normalizeEmail(target.user_email) === email) return Response.json({ error: 'That member is not available.' }, { status: 404 });
    const reference = memberReference(target);
    if (body.action === 'report') {
      const reasons = ['inappropriate_contact', 'sexual_content', 'harassment', 'spam', 'impersonation', 'safety_concern', 'other'];
      if (!reasons.includes(body.reason)) return Response.json({ error: 'Choose a report reason.' }, { status: 400 });
      const contextType = body.context_type || 'profile';
      if (!['profile', 'message', 'post'].includes(contextType)) throw new RequestError('Choose what you want to report.');
      let contextId = target.id;
      if (contextType !== 'profile') {
        if (typeof body.context_id !== 'string' || !/^[a-f0-9]{24}$/.test(body.context_id)) throw new RequestError('That item is not available.');
        const item = await base44.entities[contextType === 'message' ? 'Message' : 'Post'].get(body.context_id);
        if (normalizeEmail(contextType === 'message' ? item.from_email : item.author_email) !== normalizeEmail(target.user_email)) throw new RequestError('That item is not available.');
        contextId = item.id;
      }
      if (body.details != null && (typeof body.details !== 'string' || body.details.length > 2000)) throw new RequestError('Keep report details under 2,000 characters.');
      const report = await db.Report.create({
        reporter_email: email, reported_email: normalizeEmail(target.user_email),
        context_type: contextType, context_id: contextId, reason: body.reason,
        details: String(body.details || '').slice(0, 2000), status: 'open', occurred_at: new Date().toISOString(),
      });
      return Response.json({ id: report.id });
    }
    if (!['follow', 'unfollow'].includes(body.action)) return Response.json({ error: 'Unknown action.' }, { status: 400 });
    if (target.suspended || (await blockedEitherWay(base44, email)).has(normalizeEmail(target.user_email))) return Response.json({ error: 'That member is not available.' }, { status: 403 });
    const query = { follower_email: email, followed_email: { $in: [normalizeEmail(target.user_email), reference] } };
    await withActionLock(user.id, `follow:${target.id}`, async () => {
      if (body.action === 'unfollow') await db.Follow.deleteMany(query);
      else if (!await db.Follow.count(query)) await db.Follow.create({ follower_email: email, followed_email: reference, followed_name: shapeProfile(target, 'public').full_name });
    });
    return Response.json({ ok: true });
  } catch (error) {
    return safeFailure('memberActions', error, 'Could not complete that action.');
  }
}