import React from 'react';
import { authorAvatar, initialsOf } from '@/lib/avatar';

// A member's avatar: initials on a small plate. `seed` is what the colour is
// derived from (an email or member ref), so it stays stable if a name changes.
export default function Plate({ name = '', seed = '', size = 40, style = {}, ...rest }) {
  const [bg, fg] = authorAvatar(seed || name || '?');
  return (
    <span
      className="plate"
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.37), background: bg, color: fg, ...style }}
      {...rest}
    >
      {initialsOf(name)}
    </span>
  );
}
