import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { consumeAtomicLimits } from '../../shared/atomicRateLimit.ts';
import { requirePost, readLimitedBody, safeFailure } from '../../shared/requestSafety.ts';
import { inspectUpload } from '../../shared/fileInspection.ts';
import { kindOf, isBlockedType, MAX_FILE_BYTES } from '../../shared/attachments.ts';
import { attachmentMetadata } from '../../shared/storedAttachments.ts';
import { consumeRateLimit } from '../../shared/rateLimit.ts';
import { getProfile, isSuspended, SUSPENDED_MESSAGE } from '../../shared/accounts.ts';

export default async function(req) {
  try {
    requirePost(req);
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) return Response.json({ error: 'Please sign in to upload files.' }, { status: 401 });
    // A storage key, even one that exists, is not proof of upload ownership.
    // Accept file bytes only; upload and record the owner in this same request.
    if (!/^multipart\/form-data(?:;|$)/i.test(req.headers.get('content-type') || '')) {
      return Response.json({ error: 'Choose a file to upload. Existing storage references are not accepted.' }, { status: 400 });
    }
    if (isSuspended(await getProfile(base44, user.email))) return Response.json({ error: SUSPENDED_MESSAGE }, { status: 403 });
    const bytes = await readLimitedBody(req, MAX_FILE_BYTES + 65536);
    const form = await new Response(bytes, { headers: { 'content-type': req.headers.get('content-type') } }).formData();
    if ([...form.keys()].some((key) => key !== 'file') || form.getAll('file').length !== 1) return Response.json({ error: 'Upload one file at a time, without storage references.' }, { status: 400 });
    const file = form.get('file');
    if (!(file instanceof File)) return Response.json({ error: 'Choose a file to upload.' }, { status: 400 });
    const name = file.name.split(/[\\/]/).pop().replace(/[\x00-\x1f]/g, '').slice(0, 200);
    if (!name || !file.size || file.size > MAX_FILE_BYTES) return Response.json({ error: 'Choose a named, nonempty file no larger than 25 MB.' }, { status: 400 });
    if (isBlockedType(name, file.type)) return Response.json({ error: 'Executable files cannot be shared on Pathways.' }, { status: 400 });
    const mime = await inspectUpload(file, name);
    const limit = await consumeRateLimit(base44, user.email, 'register_attachment', { hour: 60, day: 200 });
    if (!limit.ok) return Response.json({ error: limit.message }, { status: 429 });
    const day = new Date().toISOString().slice(0, 10);
    const expiresAt = (Math.floor(Date.now() / 86400000) + 1) * 86400;
    const quota = await consumeAtomicLimits([
      { key: `upload-bytes:${user.id}:${day}`, limit: 100 * 1024 * 1024, cost: file.size, expiresAt },
      { key: `upload-budget:${day}`, limit: 1024 * 1024 * 1024, cost: file.size, expiresAt },
    ]);
    if (!quota.ok) return Response.json({ error: 'Uploads have reached today’s allowance. Try again tomorrow.' }, { status: 429 });
    // The URI comes exclusively from this server-performed private upload,
    // never from form fields or from the absence of another Attachment row.
    const { file_uri: uri } = await base44.integrations.Core.UploadPrivateFile({ file: new File([file], name, { type: mime }) });
    // File.size is the actual received byte count, not client-supplied metadata.
    const size = file.size;
    if (typeof uri !== 'string' || !/^(mp\/)?private\//.test(uri)) throw new Error('Private upload did not return a storage reference');
    const attachment = await base44.asServiceRole.entities.Attachment.create({ user_email: user.email, file_uri: uri, name, mime, size, kind: kindOf(name, mime) });
    return Response.json({ attachment: attachmentMetadata(attachment) });
  } catch (error) {
    return safeFailure('registerAttachment', error, 'Could not register this upload. Remove it and try again.');
  }
}