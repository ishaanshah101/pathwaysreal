import React, { useState } from 'react';
import { Download, Paperclip } from 'lucide-react';
import { getAttachmentAccess } from '@/functions/getAttachmentAccess';
import FilePreview from '@/components/attachments/FilePreview';
import Icon from '@/components/kit/Icon';

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
    <div className="attach">
      <button type="button" disabled={busy} onClick={open} className="attach-open" aria-busy={busy || undefined}>
        {busy ? <span className="lane-run lane-run-sm" aria-hidden="true" /> : <Icon as={Paperclip} size={16} />}
        <span>{file.name}</span>
      </button>
      {file.size > 0 && <p className="meta num attach-meta">{(file.size / 1048576).toFixed(2)} MB{postId && !file.scanned ? ' · Not content-scanned; only open files you trust.' : ''}</p>}
      {url && (
        <div className="attach-opened">
          <FilePreview file={file} url={url} />
          <a href={url} download={file.name} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" onClick={(e) => { if (Date.now() >= expires) { e.preventDefault(); setUrl(''); open(); } }}>
            <Icon as={Download} size={14} /> Open or download
          </a>
          <span className="meta">Temporary link. Click the filename again to refresh access.</span>
        </div>
      )}
      {error && <p role="alert" className="msg msg-error">{error}</p>}
    </div>
  );
}
