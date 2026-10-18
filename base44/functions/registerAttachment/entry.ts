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
    // A storage key, even one that exists, is not proof of upload ownership.
    // Accept file bytes only; upload and record the owner in this same request.
    if (!/^multipart\/form-data(?:;|$)/i.test(req.headers.get('content-type') || '')) {
      return Response.json({ error: 'Choose a file to upload. Existing storage references are not accepted.' }, { status: 400 });
    }
    if (isSuspended(await getProfile(base44, user.email))) return Response.json({ error: SUSPENDED_MESSAGE }, { status: 403 });
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return Response.json({ error: 'Choose a file to upload.' }, { status: 400 });
    const name = file.name.split(/[\\/]/).pop().replace(/[\x00-\x1f]/g, '').slice(0, 200);
    if (!name || !file.size || file.size > MAX_FILE_BYTES) return Response.json({ error: 'Choose a named, nonempty file no larger than 25 MB.' }, { status: 400 });
    if (isBlockedType(name, file.type)) return Response.json({ error: 'Executable files cannot be shared on Pathways.' }, { status: 400 });
    const limit = await consumeRateLimit(base44, user.email, 'register_attachment', { hour: 60, day: 200 });
    if (!limit.ok) return Response.json({ error: limit.message }, { status: 429 });
    // The URI comes exclusively from this server-performed private upload,
    // never from form fields or from the absence of another Attachment row.
    const { file_uri: uri } = await base44.integrations.Core.UploadPrivateFile({ file });
    const { signed_url } = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 300 });
    const response = await fetch(signed_url, { method: 'HEAD', signal: AbortSignal.timeout(10000), redirect: 'error' });
    const size = Number(response.headers.get('content-length'));
    if (!response.ok || !Number.isSafeInteger(size) || size <= 0 || size > MAX_FILE_BYTES) return Response.json({ error: 'The stored file could not be verified or exceeds 25 MB.' }, { status: 400 });
    const mime = (response.headers.get('content-type') || 'application/octet-stream').split(';')[0];
    if (isBlockedType(name, mime)) return Response.json({ error: 'Executable files cannot be shared on Pathways.' }, { status: 400 });
    const attachment = await base44.asServiceRole.entities.Attachment.create({ user_email: user.email, file_uri: uri, name, mime, size, kind: kindOf(name, mime) });
    return Response.json({ attachment: attachmentMetadata(attachment) });
  } catch (error) {
    console.error('registerAttachment failed', error?.message || error);
    return Response.json({ error: 'Could not register this upload. Remove it and try again.' }, { status: 400 });
  }
}