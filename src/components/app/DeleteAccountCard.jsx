import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useProfile } from '@/lib/useProfile';
import { useAuth } from '@/lib/AuthContext';

// Permanent account deletion, behind a confirmation. Required for app-store
// review, and kept in its own card away from the save action.
export default function DeleteAccountCard() {
  const { deleteProfile } = useProfile();
  const { logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const remove = async () => {
    setError('');
    setBusy(true);
    try {
      await deleteProfile();
      logout(true);
    } catch (err) {
      setError(err?.message || 'Could not delete your account. Please try again.');
      setBusy(false);
    }
  };

  return (
    <div className="card elev-sm" style={{ padding: 20, gap: 10, borderLeft: '3px solid var(--color-danger)' }}>
      <span className="card-kicker" style={{ color: 'var(--color-danger)' }}>Delete account</span>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--text-muted)' }}>
        This permanently removes your profile and your private Sage history. It cannot be undone.
      </p>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button type="button" className="btn btn-danger btn-sm self-start" disabled={busy}>
            <Trash2 size={15} aria-hidden="true" /> {busy ? 'Deleting…' : 'Delete my account'}
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              Your profile and private Sage conversations will be deleted permanently, and you will be
              signed out. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep my account</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>Delete permanently</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {error && <span className="msg msg-error" role="alert">{error}</span>}
    </div>
  );
}