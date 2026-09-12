import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { getProfile, isSuspended, SUSPENDED_MESSAGE } from '../../shared/accounts.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) return Response.json({ error: 'Please sign in to open attachments.' }, { status: 401 });
    const { id, postId } = await req.json();
    if (typeof id !== 'string' || !id) return Response.json({ error: 'Select an attachment.' }, { status: 400 });
    if (isSuspended(await getProfile(base44, user.email))) return Response.json({ error: SUSPENDED_MESSAGE }, { status: 403 });
    const file = await base44.asServiceRole.entities.Attachment.get(id).catch(() => null);
    if (!file) return Response.json({ error: 'This attachment is no longer available.' }, { status: 404 });
    if (file.user_email !== user.email && user.role !== 'admin') {
      const post = typeof postId === 'string' ? await base44.entities.Post.get(postId).catch(() => null) : null;
      if (!post?.attachments?.some((item) => item.id === id)) return Response.json({ error: 'This attachment is not available to you.' }, { status: 403 });
      const blocked = await base44.asServiceRole.entities.Block.filter({ $or: [
        { blocker_email: user.email, blocked_email: post.author_email },
        { blocker_email: post.author_email, blocked_email: user.email }
      ] }, '-created_date', 1);
      if (blocked.length) return Response.json({ error: 'This attachment is not available to you.' }, { status: 403 });
    }
    const { signed_url } = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: file.file_uri, expires_in: 300 });
    return Response.json({ url: signed_url, expires_in: 300 });
  } catch (error) {
    return Response.json({ error: error?.message || 'Could not open that attachment.' }, { status: 400 });
  }
}