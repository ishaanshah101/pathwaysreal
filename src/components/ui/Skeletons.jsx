import React from 'react';

// Shaped placeholders built from the .skeleton classes. They occupy the same
// space as the real content, so arriving data does not shift the layout.

export function SkeletonLine({ width = '100%', height }) {
  return <span className="skeleton skeleton-line skeleton-block" style={{ width, height }} />;
}

export function SkeletonTitle({ width = '55%' }) {
  return <span className="skeleton skeleton-title skeleton-block" style={{ width }} />;
}

// Matches a plate + two lines row, used for conversation and people lists.
export function SkeletonRow() {
  return (
    <div className="skeleton-row">
      <span className="skeleton skeleton-avatar" />
      <span className="skeleton-row-lines">
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
