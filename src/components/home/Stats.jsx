import React from 'react';
import Reveal from '@/components/Reveal';

// Every figure here has to be about the student reading it. A global
// out-of-school statistic was doing nothing for a US high schooler deciding
// whether to sign up, so it is gone.
const stats = [
  { num: '$200/hr', label: 'What a private college counselor can cost. Most families never have one.' },
  { num: '16M', label: 'US high schoolers making these decisions right now, with wildly unequal support.' },
  { num: '$0', label: 'What Pathways costs a student. Forever, not as a trial.' },
];

export default function Stats() {
  return (
    <Reveal
      as="section"
      aria-label="Why Pathways exists"
      className="grid gap-[14px]"
      style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', padding: '4px 0 30px' }}
    >
      {stats.map((s) => (
        <div key={s.num} className="card elev-sm" style={{ gap: 8, padding: '22px 24px' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 34, color: 'var(--color-text)', lineHeight: 1 }}>
            {s.num}
          </span>
          <span style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--text-muted)' }}>{s.label}</span>
        </div>
      ))}
    </Reveal>
  );
}
