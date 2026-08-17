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
    const wanted = requested.length ? new Set(requested) : null;

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
