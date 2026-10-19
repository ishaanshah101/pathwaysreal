import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { consumeRateLimit } from '../../shared/rateLimit.ts';
import { withActionLock } from '../../shared/actionLock.ts';
import { requirePost, readJsonObject, safeFailure } from '../../shared/requestSafety.ts';
import { getProfile, blockedEitherWay } from '../../shared/accounts.ts';

// Saving and unsaving a post. SavedPost rows are service-role writes only, like
// every other sensitive write here, so this function is the single way one is
// created. The owner comes from the session, and the snapshot is copied from the
// real Post row rather than trusted from the client.

export default async function (req: Request): Promise<Response> {
  try {
    requirePost(req);
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user?.email) return Response.json({ error: 'Please sign in again.' }, { status: 401 });
    const email = String(user.email).toLowerCase();

    const payload = await readJsonObject(req);
    const limit = await consumeRateLimit(base44, email, 'save_post', { hour: 150, day: 500 });
    if (!limit.ok) return Response.json({ error: limit.message }, { status: 429 });
    const postId = String(payload?.postId || '').trim();
    const action = String(payload?.action || 'save');
    if (!/^[a-f0-9]{24}$/.test(postId) || !['save', 'unsave'].includes(action)) return Response.json({ error: 'Choose a valid post and action.' }, { status: 400 });

    return await withActionLock(user.id, `save_post:${postId}`, async () => {
    const { items } = await base44.asServiceRole.entities.SavedPost.filter({ user_email: email, post_id: postId }, { limit: 1 });
    const row = items[0] || null;

    if (action === 'unsave') {
      if (row) await base44.asServiceRole.entities.SavedPost.delete(row.id);
      return Response.json({ saved: false });
    }

    if (row) return Response.json({ saved: true, savedPost: row });

    const post = await base44.entities.Post.get(postId).catch(() => null);
    if (!post) return Response.json({ error: 'That post no longer exists.' }, { status: 404 });
    const profile = await getProfile(base44, email);
    if (profile?.suspended || (await blockedEitherWay(base44, email)).has(String(post.author_email || '').toLowerCase())) {
      return Response.json({ error: 'That post is not available to save.' }, { status: 403 });
    }

    const saved = await base44.asServiceRole.entities.SavedPost.create({
      user_email: email,
      post_id: postId,
      title: post.title || '',
      body: post.body || '',
      author_name: post.author_name || '',
      author_headline: post.author_headline || '',
      category: post.category || 'general',
      saved_at: new Date().toISOString(),
    });

    return Response.json({ saved: true, savedPost: saved });
    });
  } catch (error: any) {
    return safeFailure('save-post', error, 'Could not save that post.');
  }
}