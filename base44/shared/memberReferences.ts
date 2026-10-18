import { normalizeEmail } from './accounts.ts';

export const memberReference = (profile) => `profile:${profile.id}`;

export async function resolveMember(base44, reference) {
  if (typeof reference !== 'string' || !reference.trim()) return null;
  const value = reference.trim();
  if (value.startsWith('profile:') && !/^profile:[a-f0-9]{24}$/.test(value)) return null;
  const query = value.startsWith('profile:')
    ? { id: value.slice(8) }
    : { user_email: normalizeEmail(value) };
  const { items } = await base44.asServiceRole.entities.Profile.filter(query, { limit: 1 });
  return items[0] || null;
}

// Translate stored opaque references in one query, never expose the emails.
export async function profilesForReferences(base44, references) {
  const refs = [...new Set(references.filter((v) => typeof v === 'string' && v))];
  if (!refs.length) return [];
  const ids = refs.filter((v) => v.startsWith('profile:')).map((v) => v.slice(8));
  const emails = refs.filter((v) => !v.startsWith('profile:')).map(normalizeEmail);
  const { items } = await base44.asServiceRole.entities.Profile.filter(
    { $or: [{ id: { $in: ids } }, { user_email: { $in: emails } }] },
    { limit: 500, fields: ['user_email'] },
  );
  return items;
}