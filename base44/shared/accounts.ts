// Account-level facts every write path needs: who this profile is, whether the
// account is suspended, and how much of a profile a given viewer may see.
// Lives here so send-message, create-post, request-connection, save-profile and
// get-profile all agree instead of each carrying their own copy.

export const MIN_AGE = 13;
export const ADULT_ROLES = ['educator', 'counselor', 'college_student'];

export const SUSPENDED_MESSAGE =
  'Your account is under review, so it cannot send messages, posts, or connection requests right now. Email ishaan@pathways.uno if you think this is a mistake.';

export function normalizeEmail(value: any): string {
  return String(value || '').trim().toLowerCase();
}

export async function getProfile(base44: any, email: string) {
  const { items } = await base44.asServiceRole.entities.Profile.filter({
    user_email: normalizeEmail(email),
  }, { limit: 1 });
  return items[0] || null;
}

// An account without a completed, recognized profile cannot initiate contact.
export function canRequestConnections(profile: any): boolean {
  return profile?.onboarded === true && ['student', ...ADULT_ROLES].includes(profile.role);
}

// True when the account has been suspended from the moderation queue.
export function isSuspended(profile: any): boolean {
  return Boolean(profile?.suspended);
}

export function ageFromBirthYear(birthYear: any): number | null {
  const year = Number(birthYear);
  if (!Number.isInteger(year) || year < 1900 || year > new Date().getFullYear()) return null;
  return new Date().getFullYear() - year;
}

export function firstNameOf(fullName: any): string {
  return String(fullName || '').trim().split(/\s+/)[0] || 'A Pathways member';
}

// Do the two people have an accepted connection, in either direction?
export async function areConnected(base44: any, a: string, b: string): Promise<boolean> {
  const left = normalizeEmail(a);
  const right = normalizeEmail(b);
  const rows = await base44.asServiceRole.entities.Connection.filter({ status: 'accepted' });
  return (Array.isArray(rows) ? rows : []).some((c: any) => {
    const from = normalizeEmail(c.from_email);
    const to = normalizeEmail(c.to_email);
    return (from === left && to === right) || (from === right && to === left);
  });
}

// Everyone this person has an accepted connection with, in either direction.
// One query instead of areConnected() per row, which is what get-profile needs
// when it shapes a whole directory.
export async function connectedEmails(base44: any, email: string): Promise<Set<string>> {
  const me = normalizeEmail(email);
  const rows = await base44.asServiceRole.entities.Connection.filter({ status: 'accepted' });
  const out = new Set<string>();
  for (const c of Array.isArray(rows) ? rows : []) {
    const from = normalizeEmail(c.from_email);
    const to = normalizeEmail(c.to_email);
    if (from === me) out.add(to);
    else if (to === me) out.add(from);
  }
  return out;
}

// Everyone in a block relationship with this person, in EITHER direction. A
// person who blocked me has to disappear from my directory too, not just the
// people I blocked — the client only ever knew about the latter.
export async function blockedEitherWay(base44: any, email: string): Promise<Set<string>> {
  const me = normalizeEmail(email);
  const profile = await getProfile(base44, me);
  const mine = profile ? [me, `profile:${profile.id}`] : [me];
  const query = { $or: [{ blocker_email: me }, { blocked_email: { $in: mine } }] };
  const out = new Set<string>();
  let cursor;
  do {
    const page = await base44.asServiceRole.entities.Block.filter(query, { limit: 50, cursor });
    const refs = page.items.map((b) => normalizeEmail(b.blocker_email) === me ? b.blocked_email : b.blocker_email);
    for (const ref of refs) if (!String(ref).startsWith('profile:')) out.add(normalizeEmail(ref));
    const ids = refs.filter((ref) => String(ref).startsWith('profile:')).map((ref) => ref.slice(8));
    if (ids.length) {
      const { items } = await base44.asServiceRole.entities.Profile.filter({ id: { $in: ids } }, { limit: 50, fields: ['user_email'] });
      for (const p of items) out.add(normalizeEmail(p.user_email));
    }
    cursor = page.has_more ? page.next_cursor : null;
  } while (cursor);
  return out;
}

// What a given viewer is allowed to see of a profile. A minor is never exposed
// by full name plus school plus grade to someone they have not accepted.
export function shapeProfile(profile: any, level: 'public' | 'connected' | 'self') {
  if (!profile) return null;
  if (level === 'self') return profile;

  const base = {
    id: profile.id,
    member_ref: `profile:${profile.id}`,
    role: profile.role || 'student',
    headline: profile.headline || '',
    bio: profile.bio || '',
    interests: Array.isArray(profile.interests) ? profile.interests : [],
    verified: Boolean(profile.verified),
    onboarded: Boolean(profile.onboarded),

    // An adult's credentials are the whole point of the directory — a student
    // choosing who to ask needs to see what this person can actually speak to.
    // None of these are set on student profiles.
    institution: profile.institution || '',
    job_title: profile.job_title || '',
    expertise: Array.isArray(profile.expertise) ? profile.expertise : [],
    years_experience: profile.years_experience ?? null,
    help_with: profile.help_with || '',
  };

  if (level === 'connected') {
    return {
      ...base,
      user_email: profile.user_email,
      full_name: profile.full_name || '',
      school: profile.school || '',
      grade: profile.grade || '',
      goals: profile.goals || '',
      is_minor: Boolean(profile.is_minor),
    };
  }

  // Anyone signed in: a minor is first name only, and school, grade and goals
  // are withheld entirely.
  //
  // is_minor itself is withheld at this level too. It is a true fact about the
  // row, but exposing it to every signed-in member hands anyone a way to filter
  // the directory down to the children on it, which is the exact shape of
  // targeting this function exists to prevent. Connections and the account
  // itself still see it.
  return {
    ...base,
    full_name: profile.is_minor ? firstNameOf(profile.full_name) : (profile.full_name || ''),
  };
}