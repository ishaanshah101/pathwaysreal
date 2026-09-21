import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Deletes the signed-in member's own profile data. The caller is always taken
// from the session, never from the payload, so nobody can delete anyone else.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user?.email) {
      return Response.json({ ok: false, error: 'Not signed in' }, { status: 401 });
    }
    const email = user.email;
    const db = base44.asServiceRole.entities;

    const profiles = await db.Profile.filter({ user_email: email }).catch(() => []);
    for (const p of Array.isArray(profiles) ? profiles : []) {
      await db.Profile.delete(p.id).catch(() => {});
    }

    // The member's own private Sage history goes with them.
    const threads = await db.SageThread.filter({ user_email: email }).catch(() => []);
    for (const t of Array.isArray(threads) ? threads : []) {
      await db.SageThread.delete(t.id).catch(() => {});
    }
    const messages = await db.SageMessage.filter({ user_email: email }).catch(() => []);
    for (const m of Array.isArray(messages) ? messages : []) {
      await db.SageMessage.delete(m.id).catch(() => {});
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}