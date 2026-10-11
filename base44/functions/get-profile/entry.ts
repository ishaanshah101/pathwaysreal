import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import {
  normalizeEmail,
  shapeProfile,
  connectedEmails,
  blockedEitherWay,
} from '../../shared/accounts.ts';

// Reading other people's profiles.
//
// The Profile entity's read rule is deliberately narrow: your own row, or a row
// you created, or an admin. That is correct — raw rows carry birth_year,
// is_minor, plan and suspended, and none of that should ever reach another
// member's browser.
//
// The consequence is that a client CANNOT read anyone else's profile directly.
// Explore, Messages and Requests were all calling Profile.list() from the
// browser, which returned exactly one row (your own) for a normal member and
// every row for an admin. The app therefore looked complete to its admin and
// showed an empty directory to everybody else. This function is the missing
// piece the Profile schema already refers to.
//
// Two modes:
//   { directory: true }        the member directory, for Explore
//   { emails: [...] }          resolve specific people, for Messages/Requests
//
// Every row comes back through shapeProfile, so what a viewer sees depends on
// whether they are connected to that person.

const MAX_EMAILS = 200;
const MAX_DIRECTORY = 500;

// Of the requested emails, keep only those tied to the caller by a connection
// (any status), a follow, a message, or a post they authored.
async function relatedEmails(base44: any, me: string, requested: string[]): Promise<Set<string>> {
  const db = base44.asServiceRole.entities;
  const asList = (r: any) => (Array.isArray(r) ? r : (r?.items || []));
  const [conns, follows, msgs, posts] = await Promise.all([
    db.Connection.filter({ $or: [{ from_email: me }, { to_email: me }] }).catch(() => []),
    db.Follow.filter({ $or: [{ follower_email: me }, { followed_email: me }] }).catch(() => []),
    db.Message.filter({ $or: [{ from_email: me }, { to_email: me }] }, '-created_date', 1000).catch(() => []),
    db.Post.filter({ author_email: { $in: requested } }, '-created_date', 1000).catch(() => []),
  ]);
  const ok = new Set<string>();
  for (const c of asList(conns)) { ok.add(normalizeEmail(c.from_email)); ok.add(normalizeEmail(c.to_email)); }
  for (const f of asList(follows)) { ok.add(normalizeEmail(f.follower_email)); ok.add(normalizeEmail(f.followed_email)); }
  for (const m of asList(msgs)) { ok.add(normalizeEmail(m.from_email)); ok.add(normalizeEmail(m.to_email)); }
  for (const p of asList(posts)) ok.add(normalizeEmail(p.author_email));
  return new Set(requested.filter((e) => ok.has(e)));
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) {
      return Response.json({ error: 'Please sign in again.' }, { status: 401 });
    }

    const myEmail = normalizeEmail(user.email);
    const payload = await req.json().catch(() => ({}));

    const wantsDirectory = payload?.directory === true;
    const requested = Array.isArray(payload?.emails)
      ? payload.emails.map(normalizeEmail).filter(Boolean).slice(0, MAX_EMAILS)
      : [];

    if (!wantsDirectory && requested.length === 0) {
      return Response.json({ profiles: [] });
    }

    // One read of each supporting table, not one per row.
    const [rawProfiles, connected, blocked] = await Promise.all([
      base44.asServiceRole.entities.Profile.filter({}),
      connectedEmails(base44, myEmail),
      blockedEitherWay(base44, myEmail),
    ]);

    const all = Array.isArray(rawProfiles) ? rawProfiles : [];
    // Email lookups only resolve people the caller already has a relationship
    // with, so this mode cannot be used to enumerate the membership past the
    // directory cap.
    const wanted = requested.length ? await relatedEmails(base44, myEmail, requested) : null;

    const rows = [];
    for (const p of all) {
      const addr = normalizeEmail(p.user_email);
      if (!addr) continue;

      if (wanted && !wanted.has(addr) && addr !== myEmail) continue;

      // A block hides the person in both directions. The client only ever knew
      // about people IT had blocked, so someone who blocked a member still
      // appeared in that member's directory.
      if (blocked.has(addr) && addr !== myEmail) continue;

      // Suspended accounts drop out of the directory, but stay resolvable by
      // email so an existing conversation does not turn into a nameless thread
      // mid-review.
      if (wantsDirectory && !wanted && p.suspended && addr !== myEmail) continue;
      if (wantsDirectory && !wanted && !p.onboarded && addr !== myEmail) continue;

      const level = addr === myEmail
        ? 'self'
        : (connected.has(addr) ? 'connected' : 'public');

      rows.push(shapeProfile(p, level));
      if (rows.length >= MAX_DIRECTORY) break;
    }

    return Response.json({ profiles: rows, truncated: rows.length >= MAX_DIRECTORY });
  } catch (error: any) {
    console.error('get-profile failed', error?.message || error);
    return Response.json({ error: 'Could not load profiles right now.' }, { status: 500 });
  }
}