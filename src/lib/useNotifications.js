import { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useProfile } from '@/lib/useProfile';

const POLL_MS = 20000;

// In-app notifications for the bell in the header.
//
// Rows are created only by backend functions as service role, so anything read
// here genuinely happened. A member can mark their own as read and delete their
// own, which is all this needs.

export function useNotifications() {
  const { email } = useProfile();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!email) { setItems([]); setLoading(false); return; }
    try {
      const rows = await base44.entities.Notification.filter({ user_email: email }, '-created_date', 60);
      setItems(Array.isArray(rows) ? rows : []);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, [email]);

  useEffect(() => { reload(); }, [reload]);

  // Polled rather than pushed. A connection being accepted is not something
  // anyone is staring at the screen waiting for, so twenty seconds is plenty
  // and it keeps this off the realtime path that messaging uses.
  useEffect(() => {
    if (!email) return undefined;
    const id = setInterval(reload, POLL_MS);
    return () => clearInterval(id);
  }, [email, reload]);

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items]);

  const markRead = useCallback(async (id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try { await base44.entities.Notification.update(id, { read: true }); } catch { /* cosmetic */ }
  }, []);

  const markAllRead = useCallback(async () => {
    const unread = items.filter((n) => !n.read);
    if (unread.length === 0) return;
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    await Promise.all(
      unread.map((n) => base44.entities.Notification.update(n.id, { read: true }).catch(() => {})),
    );
  }, [items]);

  return { notifications: items, unreadCount, loadingNotifications: loading, markRead, markAllRead, reloadNotifications: reload };
}
