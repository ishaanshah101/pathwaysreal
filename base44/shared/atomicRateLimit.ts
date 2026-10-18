import { secrets } from 'base44:runtime';

// Redis executes the entire script without interleaving other requests. Missing
// keys, all limit checks, all increments and expiry are handled in ONE operation.
// No pipeline, local mutex, entity fallback, or automatic retry is safe here.
const CONSUME = `
local now = tonumber(redis.call('TIME')[1])
local counts = {}
for i, key in ipairs(KEYS) do
  local limit = tonumber(ARGV[i * 2])
  local expires = tonumber(ARGV[i * 2 + 1])
  if expires <= now then return redis.error_reply('Rate limit window expired') end
  counts[i] = tonumber(redis.call('GET', key) or '0')
  if counts[i] >= limit then return {0, i} end
end
if ARGV[1] == '1' then
  for i, key in ipairs(KEYS) do
    counts[i] = redis.call('INCR', key)
    redis.call('EXPIREAT', key, ARGV[i * 2 + 1])
  end
end
return {1, 0, unpack(counts)}
`;

export async function consumeAtomicLimits(buckets, consume = true) {
  const appId = secrets.get('BASE44_APP_ID');
  const endpoint = secrets.get('UPSTASH_REDIS_REST_URL');
  const token = secrets.get('UPSTASH_REDIS_REST_TOKEN');
  if (!appId || !endpoint || !token) throw new Error('Rate limiter unavailable');
  const url = new URL(endpoint);
  if (url.protocol !== 'https:' || !url.hostname.endsWith('.upstash.io') || url.username || url.password) {
    throw new Error('Invalid rate limiter endpoint');
  }
  if (!buckets.length || buckets.some((b) => !b.key || !Number.isSafeInteger(b.limit) || b.limit < 1 || !Number.isSafeInteger(b.expiresAt))) {
    throw new Error('Invalid rate limit configuration');
  }
  const keys = await Promise.all(buckets.map(async ({ key }) => {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key));
    const hash = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
    // Same hash slot for the app; raw email addresses never leave this server.
    return `pathways:{${appId}:limits}:v1:${hash}`;
  }));
  const response = await fetch(url, {
    method: 'POST', redirect: 'manual', signal: AbortSignal.timeout(10000),
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['EVAL', CONSUME, keys.length, ...keys, consume ? '1' : '0',
      ...buckets.flatMap((b) => [String(b.limit), String(b.expiresAt)])]),
  });
  if (!response.ok) throw new Error('Rate limiter unavailable');
  const { result, error } = await response.json();
  if (error || !Array.isArray(result)) throw new Error('Rate limiter unavailable');
  if (result[0] === 0 && Number.isInteger(result[1]) && result[1] >= 1 && result[1] <= buckets.length) {
    return { ok: false, deniedIndex: result[1] - 1, counts: [] };
  }
  if (result[0] !== 1 || result[1] !== 0 || result.length !== buckets.length + 2 ||
      result.slice(2).some((count, i) => !Number.isSafeInteger(count) || count < 0 || count > buckets[i].limit)) {
    throw new Error('Invalid rate limiter response');
  }
  return { ok: true, deniedIndex: -1, counts: result.slice(2) };
}