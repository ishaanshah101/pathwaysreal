// Account-level facts every write path needs: who this profile is, whether the
// account is suspended, and how much of a profile a given viewer may see.
// Lives here so send-message, create-post, request-connection, save-profile and
// get-profile all agree instead of each carrying their own copy.

export const MIN_AGE = 13;
export const ADULT_ROLES = ['educator', 'counselor', 'college_student'];

export const SUSPENDED_MESSAGE =
  'Your account is under review, so it cannot send messages, posts, or connection requests right now. Email pathways.admins@gmail.com if you think this is a mistake.';

export function normalizeEmail(value: any): string {
  return String(value || '').trim().toLowerCase();
}

export async function getProfile(base44: any, email: string) {
  const rows = await base44.asServiceRole.entities.Profile.filter({
    user_email: normalizeEmail(email),
  });
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
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

// What a given viewer is allowed to see of a profile. A minor is never exposed
// by full name plus school plus grade to someone they have not accepted.
export function shapeProfile(profile: any, level: 'public' | 'connected' | 'self') {
  if (!profile) return null;
  if (level === 'self') return profile;

  const base = {
    user_email: profile.user_email,
    role: profile.role || 'student',
    headline: profile.headline || '',
    bio: profile.bio || '',
    interests: Array.isArray(profile.interests) ? profile.interests : [],
    is_minor: Boolean(profile.is_minor),
    verified: Boolean(profile.verified),
    onboarded: Boolean(profile.onboarded),
  };

  if (level === 'connected') {
    return {
      ...base,
      full_name: profile.full_name || '',
      school: profile.school || '',
      grade: profile.grade || '',
      goals: profile.goals || '',
    };
  }

  // Anyone signed in: a minor is first name only, and school, grade and goals
  // are withheld entirely.
  return {
    ...base,
    full_name: profile.is_minor ? firstNameOf(profile.full_name) : (profile.full_name || ''),
  };
}