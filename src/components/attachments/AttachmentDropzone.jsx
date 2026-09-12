import React, { useEffect, useRef, useState } from 'react';
import { Paperclip, X, Loader2 } from 'lucide-react';
import FilePreview from '@/components/attachments/FilePreview';

export default function AttachmentDropzone({ queue, disabled = false }) {
  const input = useRef(null);
  const [dragging, setDragging] = useState(false);
  const latest = useRef({ queue, disabled });
  latest.current = { queue, disabled };
  useEffect(() => {
    const over = (e) => { if (e.dataTransfer?.types?.includes('Files')) { e.preventDefault(); setDragging(true); } };
    const drop = (e) => { if (!e.dataTransfer?.files?.length) return; e.preventDefault(); setDragging(false); if (!latest.current.disabled) latest.current.queue.add(e.dataTransfer.files); };
    const leave = (e) => { if (!e.relatedTarget) setDragging(false); };
    window.addEventListener('dragover', over); window.addEventListener('drop', drop); window.addEventListener('dragleave', leave);
    return () => { window.removeEventListener('dragover', over); window.removeEventListener('drop', drop); window.removeEventListener('dragleave', leave); };
  }, []);
  return (
    <section aria-label="Attachments" className={`flex flex-col gap-3 rounded-pw-md border border-dashed p-3 ${dragging ? 'border-ring bg-accent' : 'border-border bg-surface'}`}>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-secondary" disabled={disabled || queue.files.length >= 10} onClick={() => input.current?.click()}><Paperclip size={16} aria-hidden="true" /> Add files</button>
        <span className="text-pw-sm text-ink-muted">{queue.files.length}/10 files · Drop files anywhere while composing</span>
        <input ref={input} type="file" multiple className="sr-only" tabIndex={-1} aria-label="Choose attachments" disabled={disabled} onChange={(e) => { queue.add(e.target.files); e.target.value = ''; }} />
      </div>
      <p className="m-0 text-pw-xs text-ink-muted">25 MB per file, 100 MB total. Documents, images, audio, video, archives, code and datasets. Executables are not allowed.</p>
      {queue.files.length > 0 && <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {queue.files.map((file) => <div key={file.key} className="min-w-0 rounded-pw-sm border border-border bg-surface p-3">
          <div className="flex items-center gap-2"><span className="min-w-0 flex-1 truncate text-pw-sm font-semibold" title={file.name}>{file.name}</span><button type="button" disabled={disabled} className="btn btn-quiet min-h-11 min-w-11 p-2" onClick={() => queue.remove(file.key)} aria-label={`Remove ${file.name}`}><X size={16} /></button></div>
          <FilePreview file={file} url={file.preview} localFile={file.localFile} />
          <span className="mt-2 flex items-center gap-2 text-pw-xs text-ink-muted" role="status">{file.status === 'uploading' && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}{(file.size / 1048576).toFixed(2)} MB · {file.status === 'ready' ? 'Uploaded' : file.status === 'error' ? 'Upload failed' : 'Uploading…'}</span>
          {file.error && <p role="alert" className="msg msg-error">{file.error}</p>}
        </div>)}
      </div>}
      {queue.busy && <div className="flex flex-col gap-1"><progress className="h-2 w-full accent-current" value={queue.files.filter((f) => f.status === 'ready').length} max={queue.files.length} aria-label="Files uploaded" /><p className="m-0 text-pw-xs text-ink-muted" role="status">{queue.files.filter((f) => f.status === 'ready').length} of {queue.files.length} files uploaded. Exact transfer percentage and speed are unavailable.</p></div>}
      {queue.error && <p role="alert" className="msg msg-error">{queue.error}</p>}
    </section>
  );
}