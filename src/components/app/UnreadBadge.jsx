import React from 'react';

// iOS-style unread badge: a red pill that sits on the corner of the tab.
// Hidden entirely at zero, grows to a pill for two digits, caps at 99+.

export default function UnreadBadge({ count, standalone = false }) {
  if (!count || count < 1) return null;
  const label = count > 99 ? '99+' : String(count);
  const wide = label.length > 1;

  return (
    <span
      aria-label={`${count} unread message${count === 1 ? '' : 's'}`}
      style={{
        position: standalone ? 'static' : 'absolute',
        top: standalone ? undefined : -5,
        right: standalone ? undefined : -6,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 18,
        height: 18,
        padding: wide ? '0 5px' : 0,
        borderRadius: 999,
        background: '#e5484d',
        color: '#fff',
        fontSize: 11,
        fontWeight: 700,
        lineHeight: 1,
        fontFamily: 'var(--font-body)',
        // Matches iOS: the badge sits on top of the tab with a hairline of the
        // surface behind it so it reads as separate from the label.
        boxShadow: '0 0 0 2px var(--color-bg)',
        pointerEvents: 'none',
      }}
    >
      {label}
    </span>
  );
}
