import React from 'react';

// The Pathways mark: a rising sun over a road that opens up toward it.
// Drawn as vector art rather than the uploaded PNG so it stays razor sharp at
// every size, carries no white box behind it, and inherits the app's palette.
// Shapes are kept chunky on purpose: thin lanes turn to mush at favicon size.
export default function BrandMark({ size = 36, style, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      role="img"
      aria-label="Pathways"
      style={{ display: 'block', flex: 'none', ...style }}
      {...rest}
    >
      {/* The sun. A deeper, more saturated orange than the original artwork. */}
      <circle cx="50" cy="31" r="27" fill="#e05e12" />

      {/* Two lanes running to the horizon, meeting right at the sun. */}
      <path d="M47.8 55 L42 97 L1 97 Z" fill="#26231f" />
      <path d="M52.2 55 L58 97 L99 97 Z" fill="#26231f" />

      {/* Lane markings, widening as the road comes toward the viewer. */}
      <path d="M45.6 62 L28 93" stroke="#fbf6ee" strokeWidth="4" strokeDasharray="7 7" />
      <path d="M54.4 62 L72 93" stroke="#fbf6ee" strokeWidth="4" strokeDasharray="7 7" />
    </svg>
  );
}