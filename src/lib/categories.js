// One place that decides how a post topic looks, so the feed, the composer,
// saved posts and the marketing pages can never disagree about it.
//
// Each topic borrows the sign colour that fits it on a real road: applications
// are destinations (green), essays are information (blue), scholarships are a
// heads-up about money (yellow), majors are places worth the detour (brown),
// campus life is a school zone (the yellow-green of a school crossing),
// internships are work zones (orange), test prep is the one that makes people
// stop (red).
export const CATEGORY_SIGN = {
  general: 'ink',
  applications: 'green',
  essays: 'blue',
  scholarships: 'yellow',
  majors: 'brown',
  campus_life: 'lime',
  internships: 'sun',
  careers: 'white',
  test_prep: 'red',
};

export function signFor(category) {
  return CATEGORY_SIGN[category] || 'ink';
}

// Roughly how long a post takes to read, at an unhurried 220 words a minute.
export function readingMinutes(text) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
