import React, { useRef, useState } from 'react';
import { Paperclip, X, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const MAX_FILES = 4;

// The input row. Files are uploaded as they are picked, so by the time the
// question is sent Sage already has real urls to read.
export default function SageComposer({ onSend, thinking }) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const pick = async (e) => {
    const chosen = Array.from(e.target.files || []).slice(0, MAX_FILES - files.length);
    e.target.value = '';
    if (!chosen.length) return;
    setError('');
    setUploading(true);
    for (const file of chosen) {
      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name} is over 10MB. Try a smaller file.`);
        continue;
      }
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setFiles((f) => [...f, { name: file.name, url: file_url }]);
      } catch {
        setError(`Could not upload ${file.name}. Try again.`);
      }
    }
    setUploading(false);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim() || thinking || uploading) return;
    onSend(text.trim(), files);
    setText('');
    setFiles([]);
  };

  return (
    <form onSubmit={submit} className="flex flex-col" style={{ gap: 8 }}>
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((f) => (
            <span key={f.url} className="badge badge-accent" style={{ padding: '5px 10px', fontSize: 12 }}>
              {f.name}
              <button
                type="button"
                onClick={() => setFiles((list) => list.filter((x) => x.url !== f.url))}
                style={{ background: 'none', border: 0, cursor: 'pointer', padding: 0, display: 'flex', color: 'inherit' }}
                aria-label={`Remove ${f.name}`}
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}

      {error && <span className="msg msg-error" role="alert">{error}</span>}

      <div className="flex gap-2 items-end">
        <button
          type="button"
          className="btn btn-secondary"
          style={{ padding: '11px 13px' }}
          onClick={() => fileRef.current?.click()}
          disabled={uploading || files.length >= MAX_FILES}
          aria-label="Attach a file"
          title="Attach an essay draft, transcript, or assignment"
        >
          <Paperclip size={16} />
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          className="sr-only"
          aria-label="Choose files to attach"
          tabIndex={-1}
          accept=".pdf,.doc,.docx,.txt,.rtf,.png,.jpg,.jpeg,.csv,.xlsx"
          onChange={pick}
        />
        <textarea
          className="input"
          style={{ minHeight: 46, flex: 1 }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask about applications, majors, essays, or scholarships. Attach a draft and Sage will read it."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) submit(e);
          }}
        />
        <button type="submit" className="btn btn-primary" disabled={thinking || uploading || !text.trim()}>
          <Send size={15} aria-hidden="true" /> {uploading ? 'Uploading…' : 'Ask Sage'}
        </button>
      </div>
      <span className="field-hint" style={{ marginTop: 0 }}>
        Sage helps you write your own work. It will not write an essay for you to submit.
      </span>
    </form>
  );
}