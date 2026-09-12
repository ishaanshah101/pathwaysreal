import { MAX_FILES, MAX_TOTAL_BYTES } from './attachments.ts';

export function attachmentMetadata(file) {
  return { id: file.id, name: file.name, mime: file.mime, size: file.size, kind: file.kind, scanned: Boolean(file.scanned) };
}

export async function resolveOwnedAttachments(base44, user, raw) {
  if (raw == null) return { ok: true, files: [] };
  if (!Array.isArray(raw) || raw.length > MAX_FILES) return { ok: false, error: 'Attach no more than 10 files.', code: 'bad_attachments' };
  const ids = raw.map((file) => file?.id);
  if (ids.some((id) => typeof id !== 'string' || !id) || new Set(ids).size !== ids.length) {
    return { ok: false, error: 'Remove duplicate or incomplete uploads and try again.', code: 'bad_attachments' };
  }
  const records = await Promise.all(ids.map((id) => base44.asServiceRole.entities.Attachment.get(id).catch(() => null)));
  if (records.some((file) => !file || file.user_email !== user.email)) {
    return { ok: false, error: 'One of those attachments is not available in your uploads.', code: 'attachment_not_owned' };
  }
  if (records.reduce((sum, file) => sum + file.size, 0) > MAX_TOTAL_BYTES) {
    return { ok: false, error: 'Attachments must total 100 MB or less.', code: 'total_too_big' };
  }
  const files = await Promise.all(records.map(async (file) => {
    const { signed_url } = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: file.file_uri, expires_in: 3600 });
    return { ...attachmentMetadata(file), url: signed_url };
  }));
  return { ok: true, files };
}