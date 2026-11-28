import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { requirePost, readJsonObject, RequestError, safeFailure } from '../../shared/requestSafety.ts';
import { consumeRateLimit } from '../../shared/rateLimit.ts';
import { withActionLock } from '../../shared/actionLock.ts';
import { removeAccount } from '../../shared/removeAccount.ts';

export default async function(req) {
  try {
    requirePost(req);
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) return Response.json({ error: 'You must be signed in.' }, { status: 401 });
    const payload = await readJsonObject(req);
    if (payload.confirmation !== 'DELETE') throw new RequestError('Confirm permanent account deletion first.');
    const email = user.email.toLowerCase();
    const limit = await consumeRateLimit(base44, email, 'delete_account', { hour: 5, day: 10 });
    if (!limit.ok) return Response.json({ error: limit.message }, { status: 429 });
    return await withActionLock(user.id, 'account_write', async () => {
      await removeAccount(base44.asServiceRole.entities, email, user.id);
      return Response.json({ ok: true });
    });
  } catch (error) { return safeFailure('delete-account', error, 'Account deletion did not finish. Please try again. Some records may already have been removed.'); }
}
