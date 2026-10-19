import { useEffect, useReducer } from 'react';

// Re-render at expiry even when the member leaves Sage open without interacting.
export function useSubscriptionExpiry(deadline) {
  const [, refresh] = useReducer((value) => value + 1, 0);
  useEffect(() => {
    let timer;
    const end = Date.parse(deadline || '');
    const schedule = () => {
      const remaining = end - Date.now();
      if (Number.isFinite(end) && remaining > 0) {
        timer = setTimeout(() => { refresh(); schedule(); }, Math.min(remaining + 20, 2147483647));
      }
    };
    const onResume = () => refresh();
    schedule();
    window.addEventListener('focus', onResume);
    window.addEventListener('pageshow', onResume);
    document.addEventListener('visibilitychange', onResume);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', onResume);
      window.removeEventListener('pageshow', onResume);
      document.removeEventListener('visibilitychange', onResume);
    };
  }, [deadline]);
}