import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { consumeRateLimit } from '../../shared/rateLimit.ts';
import { withActionLock } from '../../shared/actionLock.ts';
import { requirePost, readJsonObject, safeFailure } from '../../shared/requestSafety.ts';
import { getProfile, blockedEitherWay } from '../../shared/accounts.ts';

// Marking a post helpful, and taking that back.
//
// PostReaction rows are service-role writes only, like every other sensitive
// write here, so this function is the single way one is created or removed.
// The owner comes from the session. Nobody can mark their own post, and the
// number shown on the post is always a fresh count of the rows rather than a
// counter nudged up and down, so it cannot drift or be set from the client.

export default async function (req: Request): Promise<Response> {
  try {
    requirePost(req);
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user?.email) return Response.json({ error: 'Please sign in again.' }, { status: 401 });
    const email = String(user.email).toLowerCase();

    const payload = await readJsonObject(req);
    const limit = await consumeRateLimit(base44, email, 'react_post', { hour: 200, day: 800 });
    if (!limit.ok) return Response.json({ error: limit.message }, { status: 429 });
    const postId = String(payload?.postId || '').trim();
    const action = String(payload?.action || 'add');
    if (!/^[a-f0-9]{24}$/.test(postId) || !['add', 'remove'].includes(action)) return Response.json({ error: 'Choose a valid post and action.' }, { status: 400 });

    return await withActionLock(user.id, `react_post:${postId}`, async () => {
      const db = base44.asServiceRole.entities;
      const post = await base44.entities.Post.get(postId).catch(() => null);
      if (!post) return Response.json({ error: 'That post no longer exists.' }, { status: 404 });
      const author = String(post.author_email || '').toLowerCase();

      const { items } = await db.PostReaction.filter({ user_email: email, post_id: postId }, { limit: 1 });
      const row = items[0] || null;

      if (action === 'remove') {
        if (row) await db.PostReaction.delete(row.id);
      } else if (!row) {
        if (author && author === email) return Response.json({ error: 'You cannot mark your own post.' }, { status: 400 });
        const profile = await getProfile(base44, email);
        if (profile?.suspended || (await blockedEitherWay(base44, email)).has(author)) {
          return Response.json({ error: 'That post is not available.' }, { status: 403 });
        }
        await db.PostReaction.create({
          user_email: email,
          post_id: postId,
          kind: 'helpful',
          reacted_at: new Date().toISOString(),
        });
      }

      const count = await db.PostReaction.count({ post_id: postId });
      await db.Post.update(postId, { helpful_count: count });
      return Response.json({ reacted: action === 'add', count });
    });
  } catch (error: any) {
    return safeFailure('react-to-post', error, 'Could not update that post.');
  }
}
