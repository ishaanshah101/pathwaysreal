// One place that decides how a post topic looks, so the feed, the composer,
// saved posts and the marketing pages can never disagree about it.
//
// Each topic has its own highlighter, and keeps it everywhere: applications
// green, essays blue, scholarships yellow, majors brown, campus life lime,
// internships orange, test prep pink.
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
