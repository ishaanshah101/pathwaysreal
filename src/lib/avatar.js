// Avatar helpers.
//
// A member's avatar is a plate: their initials on one of the sign colours,
// chosen from their email so a person always looks the same wherever they
// appear. These are literal colours, not theme tokens, because a sign is the
// same colour at night.
const PLATES = [
  ['#17604a', '#ffffff'],
  ['#1d4c8a', '#ffffff'],
  ['#6a4322', '#ffffff'],
  ['#e05e12', '#1d1a16'],
  ['#f4c21f', '#1d1a16'],
  ['#cfe043', '#1d1a16'],
  ['#26231f', '#fbf6ee'],
  ['#b3261e', '#ffffff'],
];

export function authorAvatar(key) {
  const s = String(key || '');
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return PLATES[hash % PLATES.length];
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
