import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useProfile } from '@/lib/useProfile';

// "Helpful" marks on posts.
//
// Reads come straight from the entity, and the access rule only ever returns
// your own rows, so this is the list of posts YOU marked and nothing about
// anyone else. Every write goes through the react-to-post function, which is
// the only thing allowed to create or remove a mark and the only thing that
// sets the number on the post.
export function useReactions() {
  const { email } = useProfile();
  const [mine, setMine] = useState(() => new Set());
  // Counts returned by the function this session, so a number moves the moment
  // the server confirms it instead of waiting for the feed to reload.
  const [counts, setCounts] = useState({});
  const [busyPostId, setBusyPostId] = useState(null);
  const [reactionError, setReactionError] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!email) return undefined;
    base44.entities.PostReaction.filter({ user_email: email }, '-created_date', 500)
      .then((rows) => { if (!cancelled) setMine(new Set((Array.isArray(rows) ? rows : []).map((r) => r.post_id))); })
      .catch(() => { /* Offline or not deployed yet: nothing is marked. */ });
    return () => { cancelled = true; };
  }, [email]);

  const hasReacted = useCallback((postId) => mine.has(postId), [mine]);

  const countFor = useCallback(
    (post) => Math.max(0, Number(counts[post?.id] ?? post?.helpful_count ?? 0) || 0),
    [counts],
  );

  const toggleReaction = useCallback(async (post) => {
    if (!post?.id || busyPostId) return;
    const was = mine.has(post.id);
    const before = Math.max(0, Number(counts[post.id] ?? post.helpful_count ?? 0) || 0);
    const flip = (on, count) => {
      setMine((prev) => { const next = new Set(prev); if (on) next.add(post.id); else next.delete(post.id); return next; });
      setCounts((prev) => ({ ...prev, [post.id]: count }));
    };

    setBusyPostId(post.id);
    setReactionError('');
    // Shown at once, then corrected to whatever the server counted.
    flip(!was, Math.max(0, before + (was ? -1 : 1)));
    try {
      const res = await base44.functions.invoke('react-to-post', { postId: post.id, action: was ? 'remove' : 'add' });
      const data = res?.data ?? res;
      if (typeof data?.count === 'number') flip(!was, data.count);
    } catch (err) {
      flip(was, before);
      setReactionError(err?.response?.data?.error || 'Could not save that. Please try again.');
    }
    setBusyPostId(null);
  }, [busyPostId, counts, mine]);

  return {
    hasReacted, countFor, toggleReaction, busyPostId,
    reactionError, clearReactionError: () => setReactionError(''),
  };
}

export default useReactions;
