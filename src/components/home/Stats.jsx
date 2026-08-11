import React from 'react';
import Reveal from '@/components/Reveal';

const stats = [
  { num: '244M', label: 'children and adolescents are out of school worldwide (UNESCO)' },
  { num: '$200/hr', label: 'what a private college counselor can cost. Most families never have one.' },
  { num: '16M', label: 'US high schoolers navigating the same decisions, with wildly unequal support' },
];

export default function Stats() {
  return (
    <Reveal
      as="section"
      className="grid gap-[14px]"
      style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', padding: '10px 0 26px' }}
    >
      {stats.map((s) => (
        <div key={s.num} className="card elev-sm" style={{ gap: 4, padding: '20px 22px' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 30, color: 'var(--color-accent-700)' }}>{s.num}</span>
          <span style={{ fontSize: 13, color: 'var(--color-neutral-800)' }}>{s.label}</span>
        </div>
      ))}
    </Reveal>
  );
}