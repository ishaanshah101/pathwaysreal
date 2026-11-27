import React from 'react';

// A count on a tab or a nav row. Hidden at zero, caps at 99+.
export default function UnreadBadge({ count, standalone = false, label = 'unread' }) {
  if (!count || count < 1) return null;
  const text = count > 99 ? '99+' : String(count);
  return (
    <span
      className="count"
      aria-label={`${count} ${label}`}
      style={standalone ? undefined : { position: 'absolute', top: -7, right: -9, boxShadow: '0 0 0 2px var(--sheet)', pointerEvents: 'none' }}
    >
      {text}
    </span>
  );
}
