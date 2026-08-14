import React from 'react';
import Reveal from '@/components/Reveal';

// Member success stories — distinct from the mentor "quotes" section above,
// which illustrates the kind of advice you get. These are outcomes: what
// happened after a student used Pathways. Names and details are illustrative
// until real members opt in to share.
const AV = [
  ['var(--color-accent-200)', 'var(--color-accent-800)'],
  ['var(--color-accent-2-200)', 'var(--color-accent-2-800)'],
  ['var(--color-neutral-300)', 'var(--color-neutral-800)'],
];

const stories = [
  {
    result: 'Accepted to Cornell',
    text: `I was set on a reach school I'd never visited. A sophomore there walked me through her exact essay angle, and I got in. Pathways is the reason I'm not figuring this out alone.`,
    name: 'Jada Reeves',
    role: 'Senior, Atlanta public high school',
    initials: 'JR',
    av: AV[0],
  },
  {
    result: '$18k scholarship',
    text: `A mentor flagged a regional scholarship I'd never heard of, then read my application twice. Two weeks later it covered half my freshman year at Pitt.`,
    name: 'Diego Marín',
    role: 'First-year, University of Pittsburgh',
    initials: 'DM',
    av: AV[1],
  },
  {
    result: 'Found my major',
    text: `I was going to apply undeclared. Three conversations with upperclassmen later I had a real plan, not a guess. I walked in knowing what I wanted and why.`,
    name: 'Amara Osei',
    role: 'First-year, Howard University',
    initials: 'AO',
    av: AV[2],
  },
];

export default function Testimonials() {
  return (
    <Reveal as="section" aria-label="Member success stories" style={{ padding: 'clamp(16px,3vh,40px) 0' }}>
      <div style={{ marginBottom: 22 }}>
        <span className="card-kicker" style={{ display: 'block', marginBottom: 10 }}>Success stories</span>
        <h2 style={{ fontSize: 'clamp(28px,3.6vw,42px)', maxWidth: '20ch', margin: 0, textWrap: 'balance' }}>
          What happens when guidance isn't gated by zip code.
        </h2>
      </div>

      <div className="grid gap-[14px]" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>
        {stories.map((s) => (
          <figure key={s.name} className="card elev-sm" style={{ gap: 14, padding: 24, margin: 0 }}>
            <span
              className="tag tag-accent"
              style={{ alignSelf: 'flex-start', fontFamily: 'var(--font-heading)', fontSize: 12.5 }}
            >
              {s.result}
            </span>
            <span style={{ fontSize: 14.5, lineHeight: 1.6, fontStyle: 'italic' }}>
              "{s.text}"
            </span>
            <figcaption className="flex items-center gap-[10px]" style={{ fontSize: 12, color: 'var(--color-neutral-700)' }}>
              <span
                className="grid place-items-center"
                style={{ width: 32, height: 32, flex: 'none', borderRadius: '50%', background: s.av[0], fontFamily: 'var(--font-heading)', fontSize: 11, color: s.av[1] }}
              >
                {s.initials}
              </span>
              <span>
                <b style={{ color: 'var(--color-text)' }}>{s.name}</b>
                <br />
                {s.role}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
      <p style={{ fontSize: 11.5, color: 'var(--color-neutral-600)', margin: '12px 4px 0' }}>
        Illustrative stories, shown to represent the outcomes Pathways is built for.
      </p>
    </Reveal>
  );
}