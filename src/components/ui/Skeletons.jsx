import React from 'react';

// Shaped placeholders built from the .skeleton tokens. They occupy the same
// space as the real content, so arriving data does not shift the layout.

export function SkeletonLine({ width = '100%', height }) {
  return <span className="skeleton skeleton-line" style={{ display: 'block', width, height }} />;
}

export function SkeletonTitle({ width = '55%' }) {
  return <span className="skeleton skeleton-title" style={{ display: 'block', width }} />;
}

// Matches an avatar + two lines row, used for conversation and people lists.
export function SkeletonRow() {
  return (
    <div className="flex items-start" style={{ gap: 'var(--space-3)', padding: '10px 12px' }}>
      <span className="skeleton skeleton-avatar" />
      <span className="flex flex-col" style={{ gap: 6, flex: 1 }}>
        <SkeletonLine width="45%" />
        <SkeletonLine width="80%" />
      </span>
    </div>
  );
}

export function SkeletonRows({ count = 4 }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => <SkeletonRow key={i} />)}
    </div>
  );
}