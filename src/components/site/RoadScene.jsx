import React from 'react';
import Sign from '@/components/kit/Sign';

// The mark at the size of a windshield: the same sun, the same two lanes, with
// the lane lines actually moving. Signs are planted along the shoulder for the
// things students come here to find. Purely decorative, so it is hidden from
// assistive tech; the headline beside it says what the page is.
const SIGNS = [
  { label: 'College', color: 'green', style: { left: '-1%', top: '7%', '--post': '64px', transform: 'rotate(-2deg)' } },
  { label: 'Financial aid', color: 'blue', style: { right: '-2%', top: '15%', '--post': '58px', transform: 'rotate(1.5deg)' } },
  { label: 'Summer programs', color: 'brown', style: { left: '2%', top: '47%', '--post': '40px', transform: 'rotate(1deg)' } },
  { label: 'No toll. $0', color: 'yellow', style: { right: '1%', top: '51%', '--post': '36px', transform: 'rotate(-1.5deg)' } },
];

export default function RoadScene() {
  return (
    <div className="roadscene" aria-hidden="true">
      <svg viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="33" r="27" fill="#e05e12" />
        <path d="M47.8 57 L42 99 L1 99 Z" fill="var(--mark-lane, #26231f)" />
        <path d="M52.2 57 L58 99 L99 99 Z" fill="var(--mark-lane, #26231f)" />
        <path className="dash" d="M45.6 64 L28 95" stroke="var(--mark-dash, #fbf6ee)" strokeWidth="4" strokeDasharray="7 7" />
        <path className="dash" d="M54.4 64 L72 95" stroke="var(--mark-dash, #fbf6ee)" strokeWidth="4" strokeDasharray="7 7" />
      </svg>
      {SIGNS.map((s) => (
        <span key={s.label} className="post-sign" style={s.style}>
          <Sign color={s.color} size="lg">{s.label}</Sign>
        </span>
      ))}
    </div>
  );
}
