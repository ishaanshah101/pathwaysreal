import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { looksLikeRealName, NAME_GRACE_DAYS } from '../../shared/realName.ts';
import { notify } from '../../shared/notify.ts';
import { removeAccount } from '../../shared/removeAccount.ts';
import { withActionLock } from '../../shared/actionLock.ts';
import { sendGmail, escapeHtml } from '../../shared/gmail.ts';

const ALERT_TO = 'ishaan@pathways.uno';

// Safety brake. If a bug ever made the name rule reject real names, many
// accounts would come due on the same day. Past this many in one run nothing
// is removed and Ishaan is emailed to look first.
const MAX_REMOVALS_PER_RUN = 20;

// Runs once a day from the "Real Name Check" workflow. Admin only.
//   - A member whose name is not a real first and last name gets a warning and
//     one week to change it.
//   - Once the week is up, the account is removed for good: the login, the
//     profile, posts, connections, follows, Sage chats, plan, and everything
//     else delete-account removes. Admin accounts are never removed.
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
    const graceMs = NAME_GRACE_DAYS * 86400000;
    const updates = [];
    const warned = [];
    const due = new Map();
    let cleared = 0;
    let cursor;
    do {
      // Accounts locked under the old rule are included, so they are removed too.
      const page = await db.Profile.filter(
        { onboarded: true, $or: [{ suspended: { $ne: true } }, { name_locked: true }] },
        { limit: 200, cursor, sort: 'id' },
      );
      for (const profile of page.items) {
        if (profile.suspended && !profile.name_locked) continue;
        if (looksLikeRealName(profile.full_name)) {
          if (profile.name_flagged_at) { updates.push({ id: profile.id, name_flagged_at: '' }); cleared += 1; }
          continue;
        }
        const flaggedAt = Date.parse(profile.name_flagged_at || '');
        if (!Number.isFinite(flaggedAt)) {
          if (!profile.name_locked) {
            updates.push({ id: profile.id, name_flagged_at: stamp });
            warned.push(profile.user_email);
          }
        } else if (now - flaggedAt >= graceMs || profile.name_locked) {
          const email = String(profile.user_email || '').toLowerCase();
          if (email) due.set(email, profile.id);
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
        body: `Pathways needs your real first and last name. Change it within ${NAME_GRACE_DAYS} days or your account and everything on it will be deleted.`,
        link: '/app/profile',
      })));
    }

    let removed = 0;
    let skippedAdmins = 0;
    const failed = [];
    if (due.size > MAX_REMOVALS_PER_RUN) {
      await alert(base44, 'Pathways real-name check paused',
        `${due.size} accounts reached the end of their week today, which is more than the limit of ${MAX_REMOVALS_PER_RUN} for one day. ` +
        'Nothing was deleted. Check that the name rule is not rejecting real names, then raise the limit or remove them by hand.');
    } else {
      for (const [email, profileId] of due) {
        try {
          // Look again right before deleting, in case the name was fixed in the meantime.
          const fresh = await db.Profile.get(profileId).catch(() => null);
          if (fresh && looksLikeRealName(fresh.full_name)) continue;
          const users = await db.User.filter({ email }, { limit: 2 });
          const account = users.items?.[0] ?? (Array.isArray(users) ? users[0] : null);
          if (account?.role === 'admin') { skippedAdmins += 1; continue; }
          if (account?.id) {
            await withActionLock(account.id, 'account_write', () => removeAccount(db, email, account.id));
          } else {
            await removeAccount(db, email, null);
          }
          removed += 1;
        } catch (error) {
          console.error('Real-name removal failed for one account', error?.message || error);
          failed.push(email);
        }
      }
      if (failed.length) {
        await alert(base44, 'Pathways real-name check: some removals failed',
          `${failed.length} account(s) could not be fully removed today and will be tried again tomorrow: ${failed.join(', ')}`);
      }
    }

    return Response.json({ warned: warned.length, due: due.size, removed, failed: failed.length, skippedAdmins, cleared });
  } catch (error) {
    console.error('enforceRealNames failed', error);
    return Response.json({ error: 'Could not run the name check.' }, { status: 500 });
  }
}

async function alert(base44: any, subject: string, text: string) {
  try {
    const sent = await sendGmail(base44, {
      to: ALERT_TO, subject, plain: text, fromName: 'Pathways Safety',
      html: `<div style="font-family:Verdana,Arial,sans-serif;font-size:14.5px;line-height:1.6;color:#232732">${escapeHtml(text)}</div>`,
    });
    if (!sent.ok) console.error('Real-name alert email failed', sent.error || sent.reason);
  } catch (error) {
    console.error('Real-name alert email failed', error?.message || error);
  }
}
