import { consumeAtomicLimits } from './atomicRateLimit.ts';
import { RequestError } from './requestSafety.ts';

// Count every attempted model call before it starts, including image screening.
// Separate safety capacity prevents Sage traffic from exhausting moderation.
const POLICIES = { sage: { hour: 300, day: 1000 }, safety: { hour: 900, day: 3000 }, trial: { hour: 100, day: 150 } };
export async function reserveAICall(kind) {
  const policy = POLICIES[kind];
  if (!policy) throw new Error('Unknown AI budget');
  const now = Date.now();
  const iso = new Date(now).toISOString();
  const result = await consumeAtomicLimits(['hour', 'day'].map((window) => {
    const duration = window === 'hour' ? 3600000 : 86400000;
    return { key: `ai-budget:${kind}:${window}:${window === 'hour' ? iso.slice(0, 13) : iso.slice(0, 10)}`,
      limit: policy[window], expiresAt: (Math.floor(now / duration) + 1) * duration / 1000 };
  }));
  if (!result.ok) throw new RequestError('This feature has reached its usage allowance. Please try again later.', 429);
}