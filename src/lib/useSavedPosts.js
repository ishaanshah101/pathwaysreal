import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useProfile } from '@/lib/useProfile';

// Saved posts. Reads come straight from the entity (RLS only ever returns your
// own rows); every write goes through the save-post function, which is the only
// thing allowed to create one.
//
// A copy is kept in localStorage so saved posts are readable with no connection,
// which is the whole point of saving something to read later.
const CACHE_KEY = 'pathways.savedPosts';

function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '[]'); } catch { return []; }
}

function writeCache(rows) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(rows)); } catch { /* quota, ignore */ }
}

export function useSavedPosts() {
  const { email } = useProfile();
  const [saved, setSaved] = useState(readCache);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [busyPostId, setBusyPostId] = useState(null);

  const reloadSaved = useCallback(async () => {
    if (!email) { setLoadingSaved(false); return; }
    try {
      const rows = await base44.entities.SavedPost.filter({ user_email: email }, '-saved_at', 200);
      const list = Array.isArray(rows) ? rows : [];
      setSaved(list);
      writeCache(list);
    } catch {
      // Offline: keep whatever was cached rather than blanking the list.
      setSaved(readCache());
    }
    setLoadingSaved(false);
  }, [email]);

  useEffect(() => { reloadSaved(); }, [reloadSaved]);

  const isSaved = useCallback(
    (postId) => saved.some((s) => s.post_id === postId),
    [saved],
  );

  const toggleSave = useCallback(async (postId) => {
    if (!postId || busyPostId) return;
    setBusyPostId(postId);
    const action = isSaved(postId) ? 'unsave' : 'save';
    try {
      await base44.functions.invoke('save-post', { postId, action });
      await reloadSaved();
    } catch {
      /* Nothing changed; the button simply returns to its previous state. */
    }
    setBusyPostId(null);
  }, [busyPostId, isSaved, reloadSaved]);

  return { saved, loadingSaved, isSaved, toggleSave, busyPostId, reloadSaved };
}

export default useSavedPosts;