import React from 'react';

export default function BrandMark({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="7" fill="var(--color-accent-2-100)" />
      <circle cx="12" cy="8.3" r="3.3" fill="var(--color-accent)" />
      <path d="M9.4 22 L12 11 L14.6 22 Z" fill="var(--color-neutral-900)" />
      <path
        d="M12 21.4 L12 11.4"
        stroke="var(--color-bg)"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeDasharray="1.7 1.7"
      />
    </svg>
  );
}