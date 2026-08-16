import { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useProfile } from '@/lib/useProfile';

// Private nicknames and notes, the way a phone's contacts app works.
//
// These are yours alone. The entity's rules only ever return rows you wrote,
// and the person a note is about is never told one exists. A nickname is
// deliberately not shown to anyone else: letting one member publicly relabel
// another would be a way to pass a stranger off as a verified mentor.

export function useContactNotes() {
  const { email } = useProfile();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!email) { setRows([]); setLoading(false); return; }
    try {
      const found = await base44.entities.ContactNote.filter({ owner_email: email });
      setRows(Array.isArray(found) ? found : []);
    } catch {
      setRows([]);
    }
    setLoading(false);
  }, [email]);

  useEffect(() => { reload(); }, [reload]);

  const byEmail = useMemo(() => {
    const map = {};
    for (const r of rows) map[String(r.other_email || '').toLowerCase()] = r;
    return map;
  }, [rows]);

  const noteFor = useCallback(
    (other) => byEmail[String(other || '').toLowerCase()] || null,
    [byEmail],
  );

  // The name to show for someone: their nickname if I set one, otherwise the
  // name they chose for themselves.
  const displayNameFor = useCallback((other, fallback) => {
    const n = byEmail[String(other || '').toLowerCase()]?.nickname;
    return (n && n.trim()) ? n.trim() : (fallback || other);
  }, [byEmail]);

  const saveNote = useCallback(async (other, patch) => {
    if (!email || !other) return null;
    const key = String(other).toLowerCase();
    const existing = byEmail[key];
    const body = {
      nickname: String(patch.nickname ?? existing?.nickname ?? '').slice(0, 80),
      notes: String(patch.notes ?? existing?.notes ?? '').slice(0, 4000),
      updated_at: new Date().toISOString(),
    };
    try {
      if (existing?.id) {
        await base44.entities.ContactNote.update(existing.id, body);
      } else {
        await base44.entities.ContactNote.create({
          owner_email: email,
          other_email: key,
          ...body,
        });
      }
      await reload();
      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not save that just now. Please try again.' };
    }
  }, [email, byEmail, reload]);

  const clearNote = useCallback(async (other) => {
    const existing = byEmail[String(other || '').toLowerCase()];
    if (!existing?.id) return;
    try {
      await base44.entities.ContactNote.delete(existing.id);
      await reload();
    } catch { /* leave it in place if the delete fails */ }
  }, [byEmail, reload]);

  return { contactNotes: rows, loadingNotes: loading, noteFor, displayNameFor, saveNote, clearNote, reloadNotes: reload };
}
