import React from 'react';
import Reveal from '@/components/Reveal';

const lines = [
  'Pathways was built by a high school student who wanted the advice he could not find.',
  'It is operated by iPathways in San Ramon, California.',
  'Every mentor is verified one by one by a person, not an algorithm.',
];

export default function WhoIsBehind() {
  return (
    <Reveal as="section" aria-label="Who is behind this" style={{ padding: 'clamp(16px,3vh,40px) 0' }}>
      <div className="card elev-sm" style={{ padding: 'clamp(22px,3vw,32px)', gap: 14 }}>
        <h2 style={{ fontSize: 'clamp(26px,3.2vw,36px)', margin: 0 }}>Who is behind this</h2>
        <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 15.5, lineHeight: 1.6 }}>
          {lines.map((l) => <li key={l}>{l}</li>)}
        </ul>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-muted)' }}>
          <b>Endorsed by</b> Ascend Rehab Services, Ascend Pediatrics, and the Ascend Giving Foundation.
        </p>
      </div>
    </Reveal>
  );
}