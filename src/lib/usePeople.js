import { useCallback, useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Reading other members' profiles.
//
// Every page used to do this itself with base44.entities.Profile.list(), which
// cannot work: the Profile read rule only matches your own row or an admin, so
// a normal member got back a list of one and the directory rendered empty.
// Profiles now come from the get-profile function, which reads as service role
// and shapes each row for the person asking.
//
// Rows are already filtered server-side (blocks in both directions, suspended
// and un-onboarded accounts) and already shaped, so callers should treat what
// they get as the whole truth rather than filtering further for privacy.

async function fetchProfiles(body) {
  const res = await base44.functions.invoke('get-profile', body);
  const data = res?.data ?? res;
  const rows = data?.profiles;
  return Array.isArray(rows) ? rows : [];
}

/**
 * The member directory. Used by Explore.
 */
export function useDirectory(filters = {}) {
  const query = useInfiniteQuery({
    queryKey: ['member-directory', filters],
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      const response = await base44.functions.invoke('get-profile', { directory: true, ...filters, cursor: pageParam });
      return response.data;
    },
    getNextPageParam: (page) => page.has_more ? page.next_cursor : undefined,
    staleTime: 15000,
    retry: 1,
  });
  return {
    people: query.data?.pages.flatMap((page) => page.profiles) || [],
    total: query.data?.pages[0]?.total || 0,
    topics: query.data?.pages[0]?.topics || [],
    loading: query.isPending,
    loadingMore: query.isFetchingNextPage,
    hasMore: Boolean(query.hasNextPage),
    error: query.error ? 'We could not load the directory. Check your connection and try again.' : '',
    reload: query.refetch,
    loadMore: () => query.fetchNextPage(),
  };
}

/**
 * Resolve specific people by email. Used by Messages and Requests, which only
 * ever need the handful of people in the current conversations or requests
 * rather than everybody.
 *
 * `emails` may change identity on every render, so it is joined into a stable
 * key before being used as an effect dependency.
 */
export function usePeopleByEmail(emails) {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);

  const key = (Array.isArray(emails) ? emails : [])
    .map((e) => String(e || '').trim().toLowerCase())
    .filter(Boolean)
    .sort()
    .join(',');

  useEffect(() => {
    let cancelled = false;
    if (!key) { setPeople([]); return undefined; }

    setLoading(true);
    fetchProfiles({ emails: key.split(',') })
      .then((rows) => { if (!cancelled) setPeople(rows); })
      .catch(() => { if (!cancelled) setPeople([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [key]);

  const profileFor = useCallback(
    (addr) => people.find(
      (p) => String(p.user_email || p.lookup_email || '').toLowerCase() === String(addr || '').toLowerCase(),
    ) || null,
    [people],
  );

  return { people, loading, profileFor };
}