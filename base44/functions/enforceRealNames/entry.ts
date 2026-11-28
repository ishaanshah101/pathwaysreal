import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { looksLikeRealName, NAME_GRACE_DAYS } from '../../shared/realName.ts';
import { notify } from '../../shared/notify.ts';

// Runs once a day from the "Real Name Check" workflow. Admin only.
//   - A member whose name is not a real first and last name gets a warning and
//     one week to change it.
//   - Once the week is up, the account is locked until they enter a real name.
//   - Anyone who fixed their name has the warning cleared.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const db = base44.asServiceRole.entities;
    const now = Date.now();
    const stamp = new Date(now).toISOString();
    const updates = [];
    const warned = [];
    let locked = 0;
    let cleared = 0;
    let cursor;
    do {
      const page = await db.Profile.filter(
        { onboarded: true, suspended: { $ne: true } },
        { limit: 200, cursor, sort: 'id' },
      );
      for (const profile of page.items) {
        if (looksLikeRealName(profile.full_name)) {
          if (profile.name_flagged_at) { updates.push({ id: profile.id, name_flagged_at: '' }); cleared += 1; }
          continue;
        }
        const flaggedAt = Date.parse(profile.name_flagged_at || '');
        if (!Number.isFinite(flaggedAt)) {
          updates.push({ id: profile.id, name_flagged_at: stamp });
          warned.push(profile.user_email);
        } else if (now - flaggedAt >= NAME_GRACE_DAYS * 86400000) {
          updates.push({ id: profile.id, suspended: true, name_locked: true });
          locked += 1;
        }
      }
      cursor = page.has_more ? page.next_cursor : null;
    } while (cursor);

    for (let i = 0; i < updates.length; i += 500) {
      await db.Profile.bulkUpdate(updates.slice(i, i + 500));
    }
    for (let i = 0; i < warned.length; i += 6) {
      await Promise.allSettled(warned.slice(i, i + 6).map((userEmail) => notify(base44, {
        userEmail,
        type: 'account_notice',
        actorName: 'Pathways',
        body: `Pathways needs your real first and last name. Change it within ${NAME_GRACE_DAYS} days or your account will be locked.`,
        link: '/app/profile',
      })));
    }

    return Response.json({ warned: warned.length, locked, cleared });
  } catch (error) {
    console.error('enforceRealNames failed', error);
    return Response.json({ error: 'Could not run the name check.' }, { status: 500 });
  }
}