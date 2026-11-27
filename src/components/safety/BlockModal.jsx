import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useProfile } from '@/lib/useProfile';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

// Blocking is instant and quiet. The other person is never notified, which is
// the whole point: leaving should never require a confrontation.
export default function BlockModal({ open, onOpenChange, blockedEmail, blockedName, onBlocked }) {
  const { email } = useProfile();
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');

  const confirm = async () => {
    setState('sending');
    setError('');
    try {
      await base44.entities.Block.create({
        blocker_email: email,
        blocked_email: blockedEmail,
        blocked_name: blockedName || '',
      });
      onBlocked?.(blockedEmail);
      onOpenChange(false);
    } catch {
      setError('Could not block them just now. Please try again.');
    }
    setState('idle');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="dlg">
          <div>
            <span className="kicker">Safety</span>
            <DialogTitle>Block {blockedName || blockedEmail}?</DialogTitle>
          </div>

          <DialogDescription asChild>
            <p className="dlg-lede">
              They will no longer be able to message you, and they will disappear from your feed and
              from Explore. They are not told that you blocked them.
            </p>
          </DialogDescription>
          <p className="notice notice-info">
            Blocking is not the same as reporting. If they did something wrong, please report them
            too so the safety team can look into it.
          </p>

          {error && <span role="alert" className="msg msg-error">{error}</span>}

          <div className="dlg-actions">
            <button type="button" className="btn btn-danger" onClick={confirm} disabled={state === 'sending'}>
              {state === 'sending' ? 'Blocking…' : 'Block them'}
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => onOpenChange(false)}>
              Cancel
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
