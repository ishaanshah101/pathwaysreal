import { useCallback, useEffect, useState } from 'react';
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
export function useDirectory() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setPeople(await fetchProfiles({ directory: true }));
      setError('');
    } catch {
      setPeople([]);
      // A failed load must not render as an empty directory, or the page
      // reports "0 members" for what is actually an outage.
      setError('We could not load the directory. Check your connection and try again.');
    }
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return { people, loading, error, reload };
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
      (p) => String(p.user_email || '').toLowerCase() === String(addr || '').toLowerCase(),
    ) || null,
    [people],
  );

  return { people, loading, profileFor };
}
