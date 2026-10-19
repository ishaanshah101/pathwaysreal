import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { getProfile, isSuspended, SUSPENDED_MESSAGE, blockedEitherWay } from '../../shared/accounts.ts';
import { requirePost, readJsonObject, safeFailure } from '../../shared/requestSafety.ts';
import { consumeRateLimit } from '../../shared/rateLimit.ts';

export default async function(req) {
  try {
    requirePost(req);
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) return Response.json({ error: 'Please sign in to open attachments.' }, { status: 401 });
    const { id, postId } = await readJsonObject(req);
    if (typeof id !== 'string' || !/^[a-f0-9]{24}$/.test(id) || (postId != null && (typeof postId !== 'string' || !/^[a-f0-9]{24}$/.test(postId)))) return Response.json({ error: 'Select a valid attachment.' }, { status: 400 });
    const limit = await consumeRateLimit(base44, user.email.toLowerCase(), 'open_attachment', { hour: 300, day: 1500 });
    if (!limit.ok) return Response.json({ error: limit.message }, { status: 429 });
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
    return safeFailure('getAttachmentAccess', error, 'Could not open that attachment.');
  }
}