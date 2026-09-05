import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useProfile } from '@/lib/useProfile';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
      <DialogContent style={{ background: 'var(--color-surface)', borderRadius: 16, maxWidth: 440 }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: 24 }}>
            Block {blockedName || blockedEmail}?
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col" style={{ gap: 14 }}>
          <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, color: 'var(--color-neutral-800)' }}>
            They will no longer be able to message you, and they will disappear from your feed and
            from Explore. They are not told that you blocked them.
          </p>
          <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0, color: 'var(--text-muted)' }}>
            Blocking is not the same as reporting. If they did something wrong, please report them
            too so the safety team can look into it.
          </p>

          {error && <span style={{ fontSize: 12.5, color: 'var(--color-accent-700)' }}>{error}</span>}

          <div className="flex gap-2">
            <button type="button" className="btn btn-primary" onClick={confirm} disabled={state === 'sending'}>
              {state === 'sending' ? 'Blocking…' : 'Block them'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}