import { secrets } from 'base44:runtime';
import { RequestError } from './requestSafety.ts';
import { deleteOwned, deleteOwnedIfPresent, anonymizeOwned, anonymizeConversations } from './accountCleanup.ts';

// Removes a member and everything they own. Used by delete-account (a member
// deleting themselves) and by the daily real-name check (a member whose week
// to enter a real name ran out), so both always wipe exactly the same things.
// Messages are anonymized rather than deleted so the other person's side of
// the conversation survives, which is how account deletion has always worked.
// userId may be null only when the login is already gone and just the app
// records are left behind.
export async function removeAccount(db: any, rawEmail: string, userId: string | null): Promise<void> {
  const email = String(rawEmail || '').toLowerCase();
  if (!email) throw new Error('removeAccount needs an email');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`deleted-account:${userId || email}`));
  const deletedRef = 'deleted:' + Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');

  // Billing cancellation must succeed before any app data is changed.
  let cursor;
  do {
    const page = await db.Subscription.filter({ user_email: email }, { limit: 50, cursor });
    for (const sub of page.items) {
      if (sub.source === 'apple' || !sub.stripe_subscription_id || ['canceled', 'incomplete_expired'].includes(sub.status)) continue;
      if (!/^sub_[A-Za-z0-9]+$/.test(sub.stripe_subscription_id)) throw new Error('Invalid stored subscription');
      const key = secrets.get('STRIPE_SECRET_KEY');
      if (!key) throw new RequestError('Your subscription could not be cancelled, so no app data was deleted. Please try again later.', 503);
      const response = await fetch(`https://api.stripe.com/v1/subscriptions/${encodeURIComponent(sub.stripe_subscription_id)}`, {
        method: 'DELETE', redirect: 'manual', signal: AbortSignal.timeout(10000), headers: { Authorization: `Bearer ${key}` },
      });
      const result = await response.json();
      if (!response.ok && result.error?.code !== 'resource_missing') throw new RequestError('Your subscription could not be cancelled, so no app data was deleted. Please try again later.', 502);
    }
    cursor = page.has_more ? page.next_cursor : null;
  } while (cursor);

  await anonymizeOwned(db.Profile, { user_email: email, suspended: { $ne: true } }, { suspended: true });
  const profiles = await db.Profile.filter({ user_email: email }, { limit: 50, fields: ['id'] });
  const references = [email, ...profiles.items.map((p) => `profile:${p.id}`)];
  const posts = await db.Post.filter({ author_email: email }, { limit: 500, fields: ['id'] });
  const postIds = posts.items.map((p) => p.id);
  const owned = [
    ['Subscription', { user_email: email }], ['Post', { author_email: email }],
    ['SageMessage', { user_email: email }], ['SageThread', { user_email: email }], ['SageFolder', { user_email: email }],
    ['SavedPost', { user_email: email }], ['Attachment', { user_email: email }],
    ['Connection', { $or: [{ from_email: email }, { to_email: email }] }],
    ['Block', { $or: [{ blocker_email: email }, { blocked_email: email }] }],
    ['Follow', { $or: [{ follower_email: email }, { followed_email: { $in: references } }] }],
    ['ThreadArchive', { user_email: email }], ['ContactNote', { owner_email: email }],
    ['Notification', { user_email: email }], ['Signup', { email }],
    ['RateLimit', { user_email: email }], ['VerificationRequest', { user_email: email }],
  ];
  for (const [name, query] of owned) await deleteOwned(db[name], query);
  for (const name of ['PlanItem', 'PostReaction']) await deleteOwnedIfPresent(db[name], { user_email: email });
  // Copies other members saved of this member's posts, and helpful marks on them.
  if (postIds.length) {
    await deleteOwned(db.SavedPost, { post_id: { $in: postIds } });
    await deleteOwnedIfPresent(db.PostReaction, { post_id: { $in: postIds } });
  }
  await anonymizeConversations(db, email, deletedRef);
  for (const field of ['reporter_email', 'reported_email']) await anonymizeOwned(db.Report, { [field]: email }, { [field]: '' });
  for (const field of ['sender_email', 'recipient_email']) await anonymizeOwned(db.ModerationEvent, { [field]: email }, { [field]: '' });
  await anonymizeOwned(db.ThreadArchive, { other_email: email }, { other_email: deletedRef });
  await anonymizeOwned(db.ContactNote, { other_email: email }, { other_email: deletedRef, nickname: 'Deleted account' });
  await deleteOwned(db.Notification, { actor_email: email });
  await anonymizeOwned(db.Report, { context_id: { $in: references } }, { context_id: deletedRef });
  await deleteOwned(db.Profile, { user_email: email });
  await db.ModerationEvent.create({ sender_email: '', surface: 'message', rule: 'account_deleted', severity: 'low',
    detail: 'Personal app records were removed for an account deletion. No identifiers retained.', status: 'dismissed', occurred_at: new Date().toISOString() });
  // Never report success if deleting the actual login fails.
  if (userId) await db.User.delete(userId);
}
