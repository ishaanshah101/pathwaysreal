import React from 'react';

export default function BrandMark({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="7" fill="var(--color-accent)" />
      <path
        d="M5 18 C 5 12.5 12 12.5 12 8.5 S 19 7.5 19 5"
        fill="none"
        stroke="var(--color-bg)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="3 2.4"
      />
      <circle cx="19" cy="5" r="2.4" fill="var(--color-bg)" />
    </svg>
  );
}