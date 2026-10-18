import { consumeAtomicLimits } from './atomicRateLimit.ts';

// Keep the existing callers and UTC hour/day limits. All configured windows
// are checked and consumed together, including concurrent first requests.
export async function consumeRateLimit(_base44, email, action, limits) {
  const now = Date.now();
  const iso = new Date(now).toISOString();
  const windows = Object.keys(limits);
  const buckets = windows.map((window) => {
    if (window !== 'hour' && window !== 'day') throw new Error('Invalid rate limit window');
    const duration = window === 'hour' ? 3600000 : 86400000;
    return {
      key: `member:${email}:${action}:${window}:${window === 'hour' ? iso.slice(0, 13) : iso.slice(0, 10)}`,
      limit: limits[window],
      expiresAt: (Math.floor(now / duration) + 1) * duration / 1000,
    };
  });
  const result = await consumeAtomicLimits(buckets);
  if (!result.ok) {
    return {
      ok: false,
      message: windows[result.deniedIndex] === 'hour'
        ? "You've sent a lot in the last hour. Take a short break and try again."
        : "You've hit today's limit for this. Try again tomorrow.",
    };
  }
  return { ok: true, message: null };
}