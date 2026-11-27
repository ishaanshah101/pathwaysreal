import React from 'react';

// The Pathways mark: a rising sun over a road that opens up toward it.
// Drawn as vector art so it stays sharp at every size and carries no box
// behind it. Shapes are kept chunky on purpose: thin lanes turn to mush at
// favicon size.
//
// The road is asphalt on paper. On a dark surface it flips to paper on
// asphalt, the same way a printed logo has a reversed version. Pass
// tone="light" where the surface is always dark (the footer); everywhere else
// it follows the colour scheme through the --mark-* variables.
export default function BrandMark({ size = 36, tone = 'auto', style = {}, ...rest }) {
  const lane = tone === 'light' ? '#fbf6ee' : 'var(--mark-lane, #26231f)';
  const dash = tone === 'light' ? '#26231f' : 'var(--mark-dash, #fbf6ee)';
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
      {/* The sun. */}
      <circle cx="50" cy="31" r="27" fill="#e05e12" />

      {/* Two lanes running to the horizon, meeting right at the sun. */}
      <path d="M47.8 55 L42 97 L1 97 Z" fill={lane} />
      <path d="M52.2 55 L58 97 L99 97 Z" fill={lane} />

      {/* Lane markings, widening as the road comes toward the viewer. */}
      <path d="M45.6 62 L28 93" stroke={dash} strokeWidth="4" strokeDasharray="7 7" />
      <path d="M54.4 62 L72 93" stroke={dash} strokeWidth="4" strokeDasharray="7 7" />
    </svg>
  );
}
