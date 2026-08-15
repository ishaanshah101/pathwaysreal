// Avatar helpers. These used to live in the sample-data files, which meant
// deleting the seed content would have taken the real app's avatars with it.
// They are app infrastructure, not sample content, so they live here now.

// Deterministic pastel from the brand palette so a person always looks the same.
const AVATAR_COLORS = [
  ['var(--color-accent-200)', 'var(--color-accent-800)'],
  ['var(--color-accent-2-200)', 'var(--color-accent-2-800)'],
  ['var(--color-neutral-300)', 'var(--color-neutral-800)'],
  ['var(--color-accent-300)', 'var(--color-accent-900)'],
  ['var(--color-accent-2-300)', 'var(--color-accent-2-900)'],
];

export function authorAvatar(key) {
  const s = String(key || '');
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function initialsOf(name) {
  return String(name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}
