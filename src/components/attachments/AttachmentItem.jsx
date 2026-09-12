import React, { useState } from 'react';
import { Download, Loader2, Paperclip } from 'lucide-react';
import { getAttachmentAccess } from '@/functions/getAttachmentAccess';
import FilePreview from '@/components/attachments/FilePreview';

export default function AttachmentItem({ file, postId }) {
  const [url, setUrl] = useState('');
  const [expires, setExpires] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const open = async () => {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const next = file.id ? (await getAttachmentAccess({ id: file.id, postId })).data.url : file.url;
      if (!/^https:\/\//i.test(next || '')) throw new Error('This attachment has no valid download link.');
      setUrl(next); setExpires(Date.now() + 240000);
    } catch (err) { setError(err?.response?.data?.error || err.message || 'Could not open this file. Try again.'); }
    setBusy(false);
  };
  return (
    <div className="min-w-0 rounded-pw-sm border border-border bg-surface p-3 text-ink">
      <button type="button" disabled={busy} onClick={open} className="btn btn-quiet w-full justify-start whitespace-normal break-all text-left">
        {busy ? <Loader2 size={16} className="shrink-0 animate-spin" aria-hidden="true" /> : <Paperclip size={16} className="shrink-0" aria-hidden="true" />}{file.name}
      </button>
      {file.size > 0 && <p className="m-0 text-pw-xs text-ink-muted">{(file.size / 1048576).toFixed(2)} MB{postId && !file.scanned ? ' · Not content-scanned; only open files you trust.' : ''}</p>}
      {url && <div className="mt-2 flex flex-col gap-2"><FilePreview file={file} url={url} /><a href={url} download={file.name} target="_blank" rel="noopener noreferrer" className="btn btn-secondary text-pw-sm" onClick={(e) => { if (Date.now() >= expires) { e.preventDefault(); setUrl(''); open(); } }}><Download size={14} aria-hidden="true" /> Open / download file</a><span className="text-pw-xs text-ink-muted">Temporary link. Click the filename again to refresh access.</span></div>}
      {error && <p role="alert" className="msg msg-error">{error}</p>}
    </div>
  );
}