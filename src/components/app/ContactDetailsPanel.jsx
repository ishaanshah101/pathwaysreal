import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
      <DialogContent style={{ background: 'var(--color-surface)', borderRadius: 16, maxWidth: 480 }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: 24 }}>
            Your notes on {realName || otherEmail}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col" style={{ gap: 14 }}>
          <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0, color: 'var(--text-muted)' }}>
            Only you can see this. {realName || 'They'} is never told you added a nickname or a note,
            and nobody else on Pathways can read it.
          </p>

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
            <span style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 4, display: 'block', lineHeight: 1.5 }}>
              Shown instead of their name in your messages list. Their real name is still on their
              profile.
            </span>
          </div>

          <div className="field">
            <label htmlFor="cn-notes">Notes</label>
            <textarea
              id="cn-notes"
              className="input"
              style={{ minHeight: 130 }}
              maxLength={4000}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What you talked about, what to ask next time, anything you want to remember."
            />
            <span style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 4, display: 'block' }}>
              {notes.length} / 4000
            </span>
          </div>

          {error && <span style={{ fontSize: 13, color: 'var(--color-accent-700)' }}>{error}</span>}

          <div className="flex gap-2 flex-wrap">
            <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </button>
            {note?.id && (
              <button
                type="button"
                className="btn btn-ghost"
                style={{ marginLeft: 'auto', color: 'var(--color-accent-700)' }}
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
