import { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useProfile } from '@/lib/useProfile';

// Following, kept completely apart from connections.
//
// A follow is one-way and needs nobody's permission: it only changes what shows
// up in your own feed. Connections are the mutual, student-initiated thing that
// unlocks messaging, and this hook never touches them.

const lower = (v) => String(v || '').toLowerCase();

export function useFollows() {
  const { email, profile } = useProfile();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyEmail, setBusyEmail] = useState(null);
  const [followingCount, setFollowingCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);

  const reload = useCallback(async () => {
    if (!email) { setRows([]); setLoading(false); return; }
    try {
      const all = [];
      let cursor;
      do {
        const res = await base44.functions.invoke('memberActions', { action: 'following', cursor });
        const data = res.data;
        all.push(...data.items);
        setFollowingCount(data.followingCount);
        setFollowerCount(data.followerCount);
        cursor = data.has_more ? data.next_cursor : null;
      } while (cursor);
      setRows(all);
    } catch {
      setRows([]);
    }
    setLoading(false);
  }, [email]);

  useEffect(() => { reload(); }, [reload]);

  const me = lower(email);

  // Who I follow, and who follows me. Both come out of the same rows.
  const following = useMemo(
    () => rows.filter((r) => lower(r.follower_email) === me),
    [rows, me],
  );
  const followers = useMemo(
    () => rows.filter((r) => lower(r.followed_email) === me),
    [rows, me],
  );

  const followingEmails = useMemo(
    () => following.map((r) => lower(r.followed_email)),
    [following],
  );

  const isFollowing = useCallback(
    (otherEmail) => followingEmails.includes(lower(otherEmail)),
    [followingEmails],
  );

  const follow = useCallback(async (otherEmail, otherName = '') => {
    const other = lower(otherEmail);
    if (!other || other === me) return;
    setBusyEmail(other);
    try {
      await base44.functions.invoke('memberActions', { action: 'follow', target: other });
      await reload();
    } finally {
      setBusyEmail(null);
    }
  }, [me, reload]);

  const unfollow = useCallback(async (otherEmail) => {
    const other = lower(otherEmail);
    if (!other) return;
    setBusyEmail(other);
    try {
      await base44.functions.invoke('memberActions', { action: 'unfollow', target: other });
      await reload();
    } finally {
      setBusyEmail(null);
    }
  }, [following, reload]);

  const toggleFollow = useCallback(
    (otherEmail, otherName) => (isFollowing(otherEmail)
      ? unfollow(otherEmail)
      : follow(otherEmail, otherName)),
    [isFollowing, follow, unfollow],
  );

  return {
    following,
    followers,
    followingEmails,
    followingCount,
    followerCount,
    loadingFollows: loading,
    followBusyEmail: busyEmail,
    myName: profile?.full_name || '',
    isFollowing,
    follow,
    unfollow,
    toggleFollow,
    reloadFollows: reload,
  };
}