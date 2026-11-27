import React, { useState } from 'react';
import AttachmentDropzone from '@/components/attachments/AttachmentDropzone';
import useAttachmentQueue from '@/components/attachments/useAttachmentQueue';

// The input row. Files are uploaded as they are picked, so by the time the
// question is sent Sage already has real urls to read.
export default function SageComposer({ onSend, thinking }) {
  const [text, setText] = useState('');
  const queue = useAttachmentQueue();
  const [sending, setSending] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim() || thinking || sending || queue.blocked) return;
    setSending(true);
    try {
      const result = await onSend(text.trim(), queue.attachments);
      if (result?.ok) { setText(''); queue.clear(); }
    } finally { setSending(false); }
  };

  return (
    <form onSubmit={submit} className="convo-compose sage-compose">
      <AttachmentDropzone queue={queue} disabled={thinking || sending} />
      <div className="compose-row">
        <textarea
          className="input"
          aria-label="Your question for Sage"
          disabled={thinking || sending}
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask about applications, majors, essays, or scholarships."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) submit(e);
          }}
        />
        <button type="submit" className="btn btn-primary btn-go" disabled={thinking || sending || queue.blocked || !text.trim()}>
          {queue.busy ? 'Uploading…' : thinking || sending ? 'Thinking…' : 'Ask Sage'}
        </button>
      </div>
      <span className="field-hint">
        Sage reads images, PDFs and common documents together. Extract archives or provide transcripts for audio/video. It helps you write your own work, not submit work written for you.
      </span>
    </form>
  );
}
