import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

// The private nickname and notes for one person, like the notes field on a
// phone contact. Only the owner ever sees any of this.

export default function ContactDetailsPanel({
  open,
  onOpenChange,
  otherEmail,
  realName,
  note,
  onSave,
  onClear,
}) {
  const [nickname, setNickname] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Reload the fields whenever the panel opens or the person changes, so it
  // never shows the previous contact's notes for a frame.
  useEffect(() => {
    if (!open) return;
    setNickname(note?.nickname || '');
    setNotes(note?.notes || '');
    setError('');
  }, [open, otherEmail, note?.nickname, note?.notes]);

  const save = async () => {
    setSaving(true);
    setError('');
    const res = await onSave(otherEmail, { nickname, notes });
    setSaving(false);
    if (res?.ok === false) setError(res.error);
    else onOpenChange(false);
  };

  const clear = async () => {
    setSaving(true);
    await onClear(otherEmail);
    setSaving(false);
    setNickname('');
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="dlg">
          <div>
            <span className="kicker">Private note</span>
            <DialogTitle>Your notes on {realName || otherEmail}</DialogTitle>
          </div>

          <DialogDescription asChild>
            <p className="notice">
              Only you can see this. {realName || 'They'} is never told you added a nickname or a note,
              and nobody else on Pathways can read it.
            </p>
          </DialogDescription>

          <div className="field">
            <label htmlFor="cn-nickname">Nickname</label>
            <input
              id="cn-nickname"
              className="input"
              maxLength={80}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={realName ? `e.g. ${String(realName).split(' ')[0]} from Berkeley` : 'A name you will recognise'}
            />
            <span className="field-hint">
              Shown instead of their name in your messages list. Their real name is still on their
              profile.
            </span>
          </div>

          <div className="field">
            <label htmlFor="cn-notes">Notes</label>
            <textarea
              id="cn-notes"
              className="input notes-field"
              maxLength={4000}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What you talked about, what to ask next time, anything you want to remember."
            />
            <span className="meta num dlg-count">{notes.length} / 4000</span>
          </div>

          {error && <span role="alert" className="msg msg-error">{error}</span>}

          <div className="dlg-actions">
            <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save notes'}
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </button>
            {note?.id && (
              <button
                type="button"
                className="btn btn-quiet dlg-remove dlg-end"
                onClick={clear}
                disabled={saving}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
