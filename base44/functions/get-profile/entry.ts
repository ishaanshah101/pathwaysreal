import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { normalizeEmail, shapeProfile, blockedEitherWay, getProfile } from '../../shared/accounts.ts';
import { relatedProfileEmails, pageConnections, directoryQuery } from '../../shared/profileQueries.ts';
import { consumeRateLimit } from '../../shared/rateLimit.ts';
import { requirePost, readJsonObject, RequestError, safeFailure } from '../../shared/requestSafety.ts';

export default async function(req) {
  try {
    requirePost(req);
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) return Response.json({ error: 'Please sign in again.' }, { status: 401 });
    const me = normalizeEmail(user.email);
    const payload = await readJsonObject(req);
    if (payload.cursor != null && (typeof payload.cursor !== 'string' || payload.cursor.length > 4096)) throw new RequestError('That page is not available.');
    if (payload.emails != null && (!Array.isArray(payload.emails) || payload.emails.length > 200 || payload.emails.some((v) => typeof v !== 'string' || v.length > 320))) throw new RequestError('Request no more than 200 members at once.');
    if (payload.role && !['all', 'student', 'college_student', 'educator', 'counselor'].includes(payload.role)) throw new RequestError('Choose a valid role.');
    if (payload.search != null && (typeof payload.search !== 'string' || payload.search.length > 100)) throw new RequestError('Keep searches under 100 characters.');
    if (payload.topic != null && (typeof payload.topic !== 'string' || payload.topic.length > 60)) throw new RequestError('Choose a valid topic.');
    const limit = await consumeRateLimit(base44, me, 'read_profiles', { hour: 300, day: 1500 });
    if (!limit.ok) return Response.json({ error: limit.message }, { status: 429 });
    const profile = await getProfile(base44, me);
    if (profile?.suspended) return Response.json({ error: 'Your account is under review.' }, { status: 403 });
    const directory = payload.directory === true;
    const requested = [...new Set((payload.emails || []).map(normalizeEmail).filter(Boolean))];
    if (!directory && !requested.length) return Response.json({ profiles: [], has_more: false });
    const blocked = await blockedEitherWay(base44, me);
    const db = base44.asServiceRole.entities;
    let query;
    if (directory) query = directoryQuery(payload, me, blocked);
    else {
      const related = await relatedProfileEmails(base44, me, requested);
      const allowed = requested.filter((email) => related.has(email) && (email === me || !blocked.has(email)));
      if (!allowed.length) return Response.json({ profiles: [], has_more: false });
      query = { user_email: { $in: allowed } };
    }
    const page = await db.Profile.filter(query, { limit: directory ? 50 : 200, cursor: payload.cursor, sort: 'id' });
    const connections = await pageConnections(base44, me, page.items.map((p) => normalizeEmail(p.user_email)));
    const profiles = page.items.map((p) => {
      const email = normalizeEmail(p.user_email);
      const matches = connections.filter((c) => normalizeEmail(c.from_email) === email || normalizeEmail(c.to_email) === email);
      const connection = matches.find((c) => c.status === 'accepted') || matches[0];
      const shaped = shapeProfile(p, email === me ? 'self' : matches.some((c) => c.status === 'accepted') ? 'connected' : 'public');
      if (!directory) shaped.lookup_email = email;
      if (connection) shaped.connection = { status: connection.status, direction: normalizeEmail(connection.to_email) === me ? 'incoming' : 'outgoing' };
      return shaped;
    });
    const result = { profiles, has_more: page.has_more, next_cursor: page.next_cursor, truncated: page.has_more };
    if (directory && !payload.cursor) {
      const [total, topics] = await Promise.all([
        db.Profile.count(query),
        db.Profile.filter({ onboarded: true, suspended: { $ne: true }, user_email: { $nin: [me, ...blocked] } }, { distinct: 'interests', limit: 50 }),
      ]);
      result.total = total;
      result.topics = topics.items.flat().filter((topic) => typeof topic === 'string');
    }
    return Response.json(result);
  } catch (error) { return safeFailure('get-profile', error, 'Could not load profiles right now.'); }
}