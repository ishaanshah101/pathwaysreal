import React from 'react';

export default function BrandMark({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <rect width="24" height="24" rx="7" fill="var(--color-accent)" />
      <path d="M6.2 19.5C12 19.5 7.5 12 12.5 12s2-7.5 5.8-7.5" fill="none" stroke="var(--color-bg)" strokeWidth="6.4" strokeLinecap="round" />
      <path d="M6.2 19.5C12 19.5 7.5 12 12.5 12s2-7.5 5.8-7.5" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2.6 2.6" />
    </svg>
  );
}