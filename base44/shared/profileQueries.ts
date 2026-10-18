import { normalizeEmail } from './accounts.ts';

export async function relatedProfileEmails(base44, me, requested) {
  const db = base44.asServiceRole.entities;
  const tasks = ['Connection', 'Message', 'Follow'].flatMap((name) => {
    const [left, right] = name === 'Connection' ? ['from_email', 'to_email'] : name === 'Message' ? ['from_email', 'to_email'] : ['follower_email', 'followed_email'];
    return [
      db[name].filter({ [left]: me, [right]: { $in: requested } }, { distinct: right, limit: 200 }),
      db[name].filter({ [right]: me, [left]: { $in: requested } }, { distinct: left, limit: 200 }),
    ];
  });
  const results = await Promise.all(tasks);
  const posts = await db.Post.filter({ author_email: { $in: requested } }, { distinct: 'author_email', limit: 200 });
  return new Set([me, ...results.flatMap((page) => page.items), ...posts.items].map(normalizeEmail));
}

export async function pageConnections(base44, me, emails) {
  if (!emails.length) return [];
  const page = await base44.asServiceRole.entities.Connection.filter({ $or: [
    { from_email: me, to_email: { $in: emails } }, { to_email: me, from_email: { $in: emails } },
  ] }, { limit: 500, sort: '-updated_date', fields: ['from_email', 'to_email', 'status'] });
  return page.items;
}

export function directoryQuery(payload, me, blocked) {
  const query = { onboarded: true, suspended: { $ne: true }, user_email: { $nin: [me, ...blocked] } };
  if (payload.role && payload.role !== 'all') query.role = payload.role;
  if (payload.topic && payload.topic !== 'all') query.interests = payload.topic;
  if (payload.followingOnly === true) {
    const refs = Array.isArray(payload.followingRefs) ? payload.followingRefs.filter((r) => typeof r === 'string').slice(0, 2000) : [];
    query.$or = [{ id: { $in: refs.filter((r) => /^profile:[a-f0-9]{24}$/.test(r)).map((r) => r.slice(8)) } }, { user_email: { $in: refs.filter((r) => !r.startsWith('profile:')) } }];
  }
  const needle = String(payload.search || '').trim().slice(0, 100);
  if (needle) {
    const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const matches = { $regex: escaped, $options: 'i' };
    const visible = ['headline', 'bio', 'interests'].map((field) => ({ [field]: matches }));
    visible.push({ is_minor: false, $or: [{ full_name: matches }, { school: matches }] });
    // A search must not reveal a minor's hidden surname or school.
    if (!/\s/.test(needle)) visible.push({ full_name: { $regex: `^\\S*${escaped}\\S*(?:\\s|$)`, $options: 'i' } });
    query.$and = [{ $or: visible }];
  }
  return query;
}