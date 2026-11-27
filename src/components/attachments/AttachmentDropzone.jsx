import React, { useEffect, useRef, useState } from 'react';
import { Paperclip, X } from 'lucide-react';
import FilePreview from '@/components/attachments/FilePreview';
import Icon from '@/components/kit/Icon';

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
  const done = queue.files.filter((f) => f.status === 'ready').length;

  return (
    <section aria-label="Attachments" className="dropzone" data-dragging={dragging ? 'true' : 'false'}>
      <div className="dropzone-top">
        <button type="button" className="btn btn-secondary btn-sm" disabled={disabled || queue.files.length >= 10} onClick={() => input.current?.click()}>
          <Icon as={Paperclip} size={15} /> Add files
        </button>
        <span className="meta num">{queue.files.length}/10<span className="hide-mobile"> files · Drop files anywhere while composing</span></span>
        <input ref={input} type="file" multiple className="sr-only" tabIndex={-1} aria-label="Choose attachments" disabled={disabled} onChange={(e) => { queue.add(e.target.files); e.target.value = ''; }} />
      </div>
      <p className="dropzone-rules">25 MB per file, 100 MB total. Documents, images, audio, video, archives, code and datasets. Executables are not allowed.</p>
      {queue.files.length > 0 && (
        <div className="queue">
          {queue.files.map((file) => (
            <div key={file.key} className="queue-row">
              <div className="queue-row-head">
                <span className="queue-name" title={file.name}>{file.name}</span>
                <button type="button" disabled={disabled} className="mini-tool" onClick={() => queue.remove(file.key)} aria-label={`Remove ${file.name}`}>
                  <Icon as={X} size={16} />
                </button>
              </div>
              <FilePreview file={file} url={file.preview} localFile={file.localFile} />
              <span className="meta num queue-status" data-status={file.status} role="status">
                {file.status === 'uploading' && <span className="lane-run lane-run-sm" aria-hidden="true" />}
                {(file.size / 1048576).toFixed(2)} MB · {file.status === 'ready' ? 'Uploaded' : file.status === 'error' ? 'Upload failed' : 'Uploading…'}
              </span>
              {file.error && <p role="alert" className="msg msg-error">{file.error}</p>}
            </div>
          ))}
        </div>
      )}
      {queue.busy && (
        <div className="upload-progress">
          <progress value={done} max={queue.files.length} aria-label="Files uploaded" />
          <p className="dropzone-rules" role="status">{done} of {queue.files.length} files uploaded. Exact transfer percentage and speed are unavailable.</p>
        </div>
      )}
      {queue.error && <p role="alert" className="msg msg-error">{queue.error}</p>}
    </section>
  );
}
