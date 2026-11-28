// Everyone on Pathways goes by their real first and last name. This is the one
// place that decides what counts, so save-profile and the daily check agree.

// How long a member has to fix their name. A real first name with no proper
// last name gets a month. Anything else (a handle, digits, a made-up first
// name) gets a week. Keep in step with src/components/app/NameWarning.jsx.
export const NAME_GRACE_DAYS = 7;
export const LAST_NAME_GRACE_DAYS = 30;

export const REAL_NAME_MESSAGE = 'Please enter your real first and last name, using letters only.';

// A first and a last name, letters only. Hyphens, apostrophes and a middle
// initial are fine; digits, handles and single words are not.
export function looksLikeRealName(value: unknown): boolean {
  const parts = String(value || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2 || parts.length > 5) return false;
  if (!parts.every((part) => /^\p{L}[\p{L}'’.-]*$/u.test(part))) return false;
  return parts.filter((part) => part.replace(/[^\p{L}]/gu, '').length >= 2).length >= 2;
}

// True when the first word is a real-looking first name (letters only, at least two).
export function hasRealFirstName(value: unknown): boolean {
  const first = String(value || '').trim().split(/\s+/)[0] || '';
  return /^\p{L}[\p{L}'’.-]*$/u.test(first) && first.replace(/[^\p{L}]/gu, '').length >= 2;
}

// Days allowed to fix this name, or 0 when the name is already fine.
export function nameGraceDays(value: unknown): number {
  if (looksLikeRealName(value)) return 0;
  return hasRealFirstName(value) ? LAST_NAME_GRACE_DAYS : NAME_GRACE_DAYS;
}