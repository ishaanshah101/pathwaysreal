// Avatar helpers.
//
// A member's avatar is a round sticker: their initials in marker on one of the
// highlighter colours, chosen from their email so a person always looks the
// same wherever they appear. Literal colours, because a sticker is the same
// colour whatever the lamp is doing.
const PLATES = [
  ['#ffe45e', '#232732'],
  ['#b4e3b9', '#232732'],
  ['#b9d4f2', '#232732'],
  ['#f8c0d2', '#232732'],
  ['#fbc79a', '#232732'],
  ['#dbec86', '#232732'],
  ['#232732', '#fffdf6'],
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
