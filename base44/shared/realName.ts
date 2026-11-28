// Everyone on Pathways goes by their real first and last name. This is the one
// place that decides what counts, so save-profile and the daily check agree.

export const NAME_GRACE_DAYS = 7;

export const REAL_NAME_MESSAGE = 'Please enter your real first and last name, using letters only.';

// A first and a last name, letters only. Hyphens, apostrophes and a middle
// initial are fine; digits, handles and single words are not.
export function looksLikeRealName(value: unknown): boolean {
  const parts = String(value || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2 || parts.length > 5) return false;
  if (!parts.every((part) => /^\p{L}[\p{L}'’.-]*$/u.test(part))) return false;
  return parts.filter((part) => part.replace(/[^\p{L}]/gu, '').length >= 2).length >= 2;
}