// Per-user action counters, stored server side so a client cannot reset them.
// One bad actor should not be able to spray the whole user base in an afternoon.

function windowKey(window: string) {
  const iso = new Date().toISOString();
  return window === 'hour' ? iso.slice(0, 13) : iso.slice(0, 10);
}

async function bump(base44: any, email: string, action: string, window: string, limit: number) {
  const bucket = `${email}:${action}:${windowKey(window)}`;
  const rows = await base44.asServiceRole.entities.RateLimit.filter({ bucket });
  const existing = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  const used = existing?.count || 0;

  if (used >= limit) return { ok: false, window, limit };

  const nowIso = new Date().toISOString();
  if (existing) {
    await base44.asServiceRole.entities.RateLimit.update(existing.id, { count: used + 1, last_at: nowIso });
  } else {
    await base44.asServiceRole.entities.RateLimit.create({
      bucket, user_email: email, action, window, count: 1, last_at: nowIso,
    });
  }
  return { ok: true, window, limit };
}

// Checks (and consumes) every configured window. `limits` is e.g. { hour: 30, day: 200 }.
export async function consumeRateLimit(base44: any, email: string, action: string, limits: any) {
  for (const window of Object.keys(limits)) {
    const res = await bump(base44, email, action, window, limits[window]);
    if (!res.ok) {
      return {
        ok: false,
        message: window === 'hour'
          ? "You've sent a lot in the last hour. Take a short break and try again."
          : "You've hit today's limit for this. Try again tomorrow.",
      };
    }
  }
  return { ok: true, message: null };
}