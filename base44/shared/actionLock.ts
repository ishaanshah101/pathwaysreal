import { secrets } from 'base44:runtime';
import { RequestError } from './requestSafety.ts';

async function command(args) {
  const endpoint = secrets.get('UPSTASH_REDIS_REST_URL');
  const token = secrets.get('UPSTASH_REDIS_REST_TOKEN');
  const url = new URL(endpoint);
  if (!token || url.protocol !== 'https:' || !url.hostname.endsWith('.upstash.io') || url.username || url.password) throw new Error('Action lock unavailable');
  const response = await fetch(url, {
    method: 'POST', redirect: 'error', signal: AbortSignal.timeout(10000),
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(args),
  });
  if (!response.ok) throw new Error('Action lock unavailable');
  const data = await response.json();
  if (data.error) throw new Error('Action lock unavailable');
  return data.result;
}

export async function withActionLock(identity, action, work) {
  const appId = secrets.get('BASE44_APP_ID');
  if (!appId) throw new Error('Action lock unavailable');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${identity}:${action}`));
  const hash = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
  const key = `pathways:${appId}:lock:${hash}`;
  const token = crypto.randomUUID();
  if (await command(['SET', key, token, 'NX', 'EX', 300]) !== 'OK') throw new RequestError('This action is already in progress. Try again shortly.', 409);
  try { return await work(); }
  finally {
    try { await command(['EVAL', "if redis.call('GET',KEYS[1]) == ARGV[1] then return redis.call('DEL',KEYS[1]) else return 0 end", 1, key, token]); }
    catch (error) { console.error('Action lock release failed', error?.message); }
  }
}