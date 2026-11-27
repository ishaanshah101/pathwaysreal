import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Cancel as AlertDialogCancelPrimitive } from '@radix-ui/react-alert-dialog';
import {
  AlertDialog, AlertDialogContent,
  AlertDialogDescription, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useProfile } from '@/lib/useProfile';
import { useAuth } from '@/lib/AuthContext';
import { useSubscription } from '@/lib/useSubscription';
import Icon from '@/components/kit/Icon';

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
    <section className="panel profile-panel profile-panel-danger" aria-labelledby="del-head">
      <div className="panel-head" id="del-head">Delete account</div>
      <div className="panel-body">
        <p>
          Closes your Pathways account for good and deletes your profile, your posts, your Sage
          conversations, and your connections.
        </p>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={() => { setTyped(''); setError(''); setOpen(true); }}
        >
          <Icon as={Trash2} size={15} /> Delete account
        </button>
      </div>

      <AlertDialog open={open} onOpenChange={(v) => { if (!busy) setOpen(v); }}>
        <AlertDialogContent className="pw-dialog profile-danger-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="pw-dialog-title">Delete your account permanently?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="profile-danger-copy">
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

          <div className="profile-danger-acts">
            {/* The Radix cancel, used directly so it keeps its behaviour (it
                is what takes focus when the dialog opens, so the safe answer
                is the default one) without the stock button styling. */}
            <AlertDialogCancelPrimitive asChild>
              <button type="button" className="btn btn-secondary" disabled={busy}>Keep my account</button>
            </AlertDialogCancelPrimitive>
            <button
              type="button"
              className="btn btn-danger"
              disabled={busy || typed.trim() !== 'DELETE'}
              onClick={remove}
            >
              {busy ? 'Deleting…' : 'Delete my account'}
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
