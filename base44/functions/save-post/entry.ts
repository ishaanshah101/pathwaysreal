import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Saving and unsaving a post. SavedPost rows are service-role writes only, like
// every other sensitive write here, so this function is the single way one is
// created. The owner comes from the session, and the snapshot is copied from the
// real Post row rather than trusted from the client.

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user?.email) return Response.json({ error: 'Please sign in again.' }, { status: 401 });
    const email = String(user.email).toLowerCase();

    const payload = await req.json().catch(() => ({} as any));
    const postId = String(payload?.postId || '').trim();
    const action = String(payload?.action || 'save');
    if (!postId) return Response.json({ error: 'Which post?' }, { status: 400 });

    const existing = await base44.asServiceRole.entities.SavedPost.filter({
      user_email: email,
      post_id: postId,
    });
    const row = Array.isArray(existing) && existing.length ? existing[0] : null;

    if (action === 'unsave') {
      if (row) await base44.asServiceRole.entities.SavedPost.delete(row.id);
      return Response.json({ saved: false });
    }

    if (row) return Response.json({ saved: true, savedPost: row });

    const post = await base44.asServiceRole.entities.Post.get(postId).catch(() => null);
    if (!post) return Response.json({ error: 'That post no longer exists.' }, { status: 404 });

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
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Could not save that post.' }, { status: 500 });
  }
}