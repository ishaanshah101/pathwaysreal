import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { getProfile, isSuspended, SUSPENDED_MESSAGE, blockedEitherWay } from '../../shared/accounts.ts';

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
      if ((await blockedEitherWay(base44, user.email)).has(String(post.author_email || '').toLowerCase())) {
        return Response.json({ error: 'This attachment is not available to you.' }, { status: 403 });
      }
    }
    const { signed_url } = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: file.file_uri, expires_in: 300 });
    return Response.json({ url: signed_url, expires_in: 300 });
  } catch (error) {
    console.error('getAttachmentAccess failed', error?.message || error);
    return Response.json({ error: 'Could not open that attachment.' }, { status: 400 });
  }
}