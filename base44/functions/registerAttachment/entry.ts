import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { kindOf, isBlockedType, MAX_FILE_BYTES } from '../../shared/attachments.ts';
import { attachmentMetadata } from '../../shared/storedAttachments.ts';
import { consumeRateLimit } from '../../shared/rateLimit.ts';
import { getProfile, isSuspended, SUSPENDED_MESSAGE } from '../../shared/accounts.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) return Response.json({ error: 'Please sign in to upload files.' }, { status: 401 });
    const body = await req.json();
    const uri = typeof body.file_uri === 'string' ? body.file_uri : '';
    const name = String(body.name || '').split(/[\\/]/).pop().replace(/[\x00-\x1f]/g, '').slice(0, 200);
    if (!/^(mp\/)?private\//.test(uri) || uri.includes('..') || !name) return Response.json({ error: 'Choose an uploaded private file with a name.' }, { status: 400 });
    if (isSuspended(await getProfile(base44, user.email))) return Response.json({ error: SUSPENDED_MESSAGE }, { status: 403 });
    if (isBlockedType(name, String(body.mime || ''))) return Response.json({ error: 'Executable files cannot be shared on Pathways.' }, { status: 400 });
    const limit = await consumeRateLimit(base44, user.email, 'register_attachment', { hour: 60, day: 200 });
    if (!limit.ok) return Response.json({ error: limit.message }, { status: 429 });
    // Keep this caller-scoped: do not elevate a client-supplied storage URI.
    const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 300 });
    const response = await fetch(signed_url, { method: 'HEAD' });
    const size = Number(response.headers.get('content-length'));
    if (!response.ok || !Number.isSafeInteger(size) || size <= 0 || size > MAX_FILE_BYTES) return Response.json({ error: 'The stored file could not be verified or exceeds 25 MB.' }, { status: 400 });
    const mime = (response.headers.get('content-type') || 'application/octet-stream').split(';')[0];
    if (isBlockedType(name, mime)) return Response.json({ error: 'Executable files cannot be shared on Pathways.' }, { status: 400 });
    const existing = await base44.asServiceRole.entities.Attachment.filter({ user_email: user.email, file_uri: uri }, '-created_date', 1);
    const attachment = existing[0] || await base44.asServiceRole.entities.Attachment.create({ user_email: user.email, file_uri: uri, name, mime, size, kind: kindOf(name, mime) });
    return Response.json({ attachment: attachmentMetadata(attachment) });
  } catch (error) {
    return Response.json({ error: error?.message || 'Could not register this upload. Remove it and try again.' }, { status: 400 });
  }
}