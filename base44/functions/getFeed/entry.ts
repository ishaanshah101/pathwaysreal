import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { normalizeEmail, blockedEitherWay } from '../../shared/accounts.ts';
import { pageConnections } from '../../shared/profileQueries.ts';
import { consumeRateLimit } from '../../shared/rateLimit.ts';
import { requirePost, readJsonObject, safeFailure } from '../../shared/requestSafety.ts';

// The feed, shaped for the person asking. An author's email never leaves the
// server unless the reader already has it: their own posts, and people they are
// connected with. Everyone else is identified by an opaque profile reference.
export default async function(req: Request): Promise<Response> {
  try {
    requirePost(req);
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user?.email) return Response.json({ error: 'Please sign in again.' }, { status: 401 });
    const me = normalizeEmail(user.email);
    const payload = await readJsonObject(req);
    const limit = await consumeRateLimit(base44, me, 'read_feed', { hour: 300, day: 1500 });
    if (!limit.ok) return Response.json({ error: limit.message }, { status: 429 });

    const db = base44.asServiceRole.entities;
    const mine = payload.mine === true;
    const page = await db.Post.filter(
      mine ? { author_email: { $in: [me, user.email] } } : {},
      { sort: '-created_date', limit: mine ? 50 : 100 },
    );
    const blocked = mine ? new Set() : await blockedEitherWay(base44, me);
    const rows = page.items.filter((p) => !blocked.has(normalizeEmail(p.author_email)));
    const emails = [...new Set(rows.map((p) => normalizeEmail(p.author_email)).filter(Boolean))];

    let profiles = [];
    let connections = [];
    if (emails.length) {
      const [profilePage, connectionRows] = await Promise.all([
        db.Profile.filter({ user_email: { $in: emails } }, { limit: 200 }),
        pageConnections(base44, me, emails),
      ]);
      profiles = profilePage.items;
      connections = connectionRows;
    }
    const byEmail = new Map(profiles.map((p) => [normalizeEmail(p.user_email), p]));

    const posts = rows.map(({ author_email, ...post }) => {
      const email = normalizeEmail(author_email);
      const profile = byEmail.get(email);
      const matches = connections.filter((c) => normalizeEmail(c.from_email) === email || normalizeEmail(c.to_email) === email);
      const connection = matches.find((c) => c.status === 'accepted') || matches[0];
      const isMine = Boolean(email) && email === me;
      const shaped = { ...post, is_mine: isMine, author_verified: profile?.verified === true };
      if (profile) shaped.author_ref = `profile:${profile.id}`;
      if (connection) {
        shaped.connection = {
          status: connection.status,
          direction: normalizeEmail(connection.to_email) === me ? 'incoming' : 'outgoing',
        };
      }
      if (isMine || connection?.status === 'accepted') shaped.author_email = email;
      return shaped;
    });

    return Response.json({ posts });
  } catch (error) { return safeFailure('getFeed', error, 'Could not load the feed right now.'); }
}