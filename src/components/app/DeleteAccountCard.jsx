import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useProfile } from '@/lib/useProfile';
import { useAuth } from '@/lib/AuthContext';
import { useSubscription } from '@/lib/useSubscription';

// Account deletion, in the app, as Apple requires. There is no grace period and
// no deactivate-instead: an account that can be restored is not deleted.
export default function DeleteAccountCard() {
  const { deleteProfile } = useProfile();
  const { logout } = useAuth();
  const { hasSage } = useSubscription();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const remove = async () => {
    setError('');
    setBusy(true);
    try {
      await deleteProfile();
      // Sign out and land on the public home page with a short confirmation.
      logout();
      window.location.href = '/?deleted=1';
    } catch (err) {
      setError(err?.message || 'Could not delete your account. Please try again.');
      setBusy(false);
    }
  };

  return (
    <div
      className="card elev-sm"
      style={{ padding: 22, gap: 10, borderTop: '3px solid var(--color-danger)', marginTop: 12 }}
    >
      <span className="card-kicker" style={{ color: 'var(--color-danger)' }}>Delete account</span>
      <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: 'var(--text-muted)' }}>
        Closes your Pathways account for good and deletes your profile, your posts, your Sage
        conversations, and your connections.
      </p>
      <button
        type="button"
        className="btn btn-danger self-start"
        onClick={() => { setTyped(''); setError(''); setOpen(true); }}
      >
        <Trash2 size={15} aria-hidden="true" /> Delete account
      </button>

      <AlertDialog open={open} onOpenChange={(v) => { if (!busy) setOpen(v); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account permanently?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div style={{ fontSize: 14, lineHeight: 1.65, display: 'grid', gap: 10 }}>
                <span>
                  This is permanent and cannot be undone. There is no grace period and no way to
                  restore the account afterwards.
                </span>
                <span>
                  <b>Deleted:</b> your profile, every post you wrote, your Sage conversations and
                  folders, your connections and pending requests, the people you blocked, and your
                  sign-in, so you will not be able to log in again.
                </span>
                <span>
                  <b>Kept:</b> messages you sent stay in the other person's inbox, with your name
                  and address removed, because their conversation history is theirs. Blocks other
                  people placed on you stay in force. Safety reports and blocked-content records are
                  kept with your identifiers removed, because Pathways is used by minors and we have
                  to be able to see patterns of behaviour across accounts.
                </span>
                {hasSage && (
                  <span>
                    Your Sage subscription will be cancelled as part of this. You will not be
                    charged again.
                  </span>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="field">
            <label htmlFor="del-confirm">Type DELETE to confirm</label>
            <input
              id="del-confirm"
              className="input"
              autoComplete="off"
              value={typed}
              disabled={busy}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="DELETE"
            />
          </div>

          {error && <span className="msg msg-error" role="alert">{error}</span>}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Keep my account</AlertDialogCancel>
            <button
              type="button"
              className="btn btn-danger"
              disabled={busy || typed.trim() !== 'DELETE'}
              onClick={remove}
            >
              {busy ? 'Deleting…' : 'Delete my account'}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}