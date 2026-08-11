import React from 'react';
import Reveal from '@/components/Reveal';

const AV = [
  ['var(--color-accent-200)', 'var(--color-accent-800)'],
  ['var(--color-accent-2-200)', 'var(--color-accent-2-800)'],
  ['var(--color-neutral-300)', 'var(--color-neutral-800)'],
];

const quotes = [
  { text: 'I got rejected 23 times before one internship yes. One yes is all it takes.', name: 'David Okafor', role: 'Software engineer, first-gen OSU grad', initials: 'DO', av: AV[0] },
  { text: 'The essays were the hard part, not the stats. Start them the summer before and you are way ahead.', name: 'Sofia Nguyen', role: 'First-year, Carnegie Mellon CS', initials: 'SN', av: AV[1] },
  { text: 'We read your essay before your transcript. A specific small moment beats a life summary every time.', name: 'Marcus Webb', role: 'Admissions counselor, Kenyon College', initials: 'MW', av: AV[2] },
];

export default function Quotes() {
  return (
    <Reveal as="section" style={{ padding: 'clamp(20px,4vh,44px) 0' }}>
      <div className="grid gap-[14px]" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>
        {quotes.map((qt) => (
          <figure key={qt.name} className="card elev-sm" style={{ gap: 12, padding: 24, margin: 0 }}>
            <span style={{ fontSize: 14.5, lineHeight: 1.6, fontStyle: 'italic' }}>"{qt.text}"</span>
            <figcaption className="flex items-center gap-[10px]" style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>
              <span
                className="grid place-items-center"
                style={{ width: 32, height: 32, flex: 'none', borderRadius: '50%', background: qt.av[0], fontFamily: 'var(--font-heading)', fontSize: 11, color: qt.av[1] }}
              >
                {qt.initials}
              </span>
              <span>
                <b style={{ color: 'var(--color-text)' }}>{qt.name}</b>
                <br />
                {qt.role}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
      <p style={{ fontSize: 11, color: 'var(--color-neutral-500)', margin: '10px 4px 0' }}>
        Illustrative quotes from the seeded community.
      </p>
    </Reveal>
  );
}