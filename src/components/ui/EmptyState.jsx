import React from 'react';

// One empty/error state for the whole product. Every state says what happened,
// why, and what to do next, so no screen is ever an unexplained blank.
export default function EmptyState({ icon: Icon, title, body, action, tone = 'neutral' }) {
  const toneColor = tone === 'error' ? 'var(--color-danger)' : 'var(--text-muted)';
  return (
    <div
      className="flex flex-col items-center text-center"
      style={{ gap: 'var(--space-3)', padding: 'var(--space-7) var(--space-4)' }}
    >
      {Icon && <Icon size={26} strokeWidth={1.6} style={{ color: toneColor }} aria-hidden="true" />}
      <p style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-lg)', margin: 0 }}>{title}</p>
      {body && (
        <p
          style={{
            margin: 0, maxWidth: 380, fontSize: 'var(--text-base)',
            lineHeight: 'var(--leading-normal)', color: toneColor,
          }}
        >
          {body}
        </p>
      )}
      {action}
    </div>
  );
}