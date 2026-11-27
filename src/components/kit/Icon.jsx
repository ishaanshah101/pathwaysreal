import React from 'react';

// Every icon in the product goes through here so they all share one voice:
// heavier strokes with square ends, the way a pictogram is cut for a sign,
// instead of the thin rounded line every app ships by default.
export default function Icon({ as: Glyph, size = 18, weight = 2.4, ...rest }) {
  return (
    <Glyph
      size={size}
      strokeWidth={weight}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      {...rest}
    />
  );
}
