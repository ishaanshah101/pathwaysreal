import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// The single Connect control, used by both the feed and Explore.
//
// It used to differ between the two screens: Explore sent a real request, while
// a post in the feed only linked you to Explore, which is why connecting from a
// post appeared to do nothing. Both now go through this.
//
// Asking before sending is deliberate. A connection request is a message to a
// real person, often an adult a student has never spoken to, so it should never
// be one stray tap away.

export default function ConnectButton({
  targetEmail,
  targetName,
  connection,
  busy = false,
  onConnect,
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const status = connection?.status || null;
  const incoming = connection?.direction === 'incoming';
  const first = String(targetName || '').split(' ')[0] || 'them';

  const send = async () => {
    setSending(true);
    setError('');
    const res = await onConnect?.(targetEmail);
    setSending(false);
    if (res?.ok === false) setError(res.error);
    else setConfirming(false);
  };

  // Already connected: the only thing left to offer is the conversation.
  if (status === 'accepted') {
    return (
      <Link
        to={`/app/messages?to=${encodeURIComponent(targetEmail)}`}
        className="btn btn-secondary btn-sm"
      >
        Message {first}
      </Link>
    );
  }

  // They asked me. Answering happens on the Requests screen, where the profile
  // and the accept and decline controls sit together.
  if (status === 'pending' && incoming) {
    return (
      <Link to="/app/requests" className="btn btn-sun btn-sm">
        Answer their request
      </Link>
    );
  }

  if (status === 'pending') {
    return (
      <span className="badge badge-neutral" style={{ minHeight: 34, padding: '0 10px' }}>
        Request sent
      </span>
    );
  }

  if (status === 'declined') {
    return (
      <span className="meta">Not connected</span>
    );
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-primary btn-sm"
        disabled={busy}
        onClick={() => { setError(''); setConfirming(true); }}
      >
        Connect to message
      </button>

      <Dialog open={confirming} onOpenChange={(o) => { if (!o) { setConfirming(false); setError(''); } }}>
        <DialogContent style={{ maxWidth: 460 }}>
          <DialogHeader>
            <DialogTitle>
              Connect with {targetName || 'them'}?
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col" style={{ gap: 14 }}>
            <p style={{ fontSize: 16, lineHeight: 1.55, margin: 0, color: 'var(--ink)' }}>
              We will send {first} a request. They can accept, decline, or look at your profile
              first. You will be able to message each other once they accept, and you will get a
              notification when they do.
            </p>
            <p style={{ fontSize: 14.5, lineHeight: 1.5, margin: 0, color: 'var(--ink-2)' }}>
              They are not told anything about you beyond what is already on your profile.
            </p>

            {error && (
              <span role="alert" className="msg msg-error">{error}</span>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-primary"
                onClick={send}
                disabled={sending || busy}
              >
                {sending ? 'Sending…' : 'Yes, send request'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setConfirming(false); setError(''); }}
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
