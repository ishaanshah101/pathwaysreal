import React from 'react';
import Reveal from '@/components/Reveal';
import SectionHeader from '@/components/SectionHeader';

const bento = [
  { span: 4, title: 'A feed that respects your time', body: 'Real posts about campus visits, competitions, internships, and scholarships. Long-form and honest, with no short-form video and no reposts. You leave knowing more than when you arrived.', d: 'M3 10.5 12 3l9 7.5', d2: 'M5 9.5V21h14V9.5', iconBg: 'var(--color-accent-100)', iconFg: 'var(--color-accent-700)' },
  { span: 2, title: 'Follow or Connect', body: 'Follow to stay updated. Connect, mutually, to actually message and learn from someone.', d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0', d2: 'M19 8v6M22 11h-6', iconBg: 'var(--color-accent-2-200)', iconFg: 'var(--color-accent-2-800)' },
  { span: 2, title: 'Verified mentors', body: 'Professors and counselors verify with institutional email. Advice you can actually trust.', d: 'M20 6 9 17l-5-5', d2: '', iconBg: 'var(--color-accent-2-200)', iconFg: 'var(--color-accent-2-800)' },
  { span: 2, title: 'A safer inbox', body: 'One-on-one only, never group chats. Messages are permanent, and sharing contact info or arranging meetups is blocked automatically.', d: 'M22 12h-6l-2 3h-4l-2-3H2', d2: 'M5.5 5h13L22 12v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5z', iconBg: 'var(--color-accent-100)', iconFg: 'var(--color-accent-700)' },
  { span: 2, title: 'Sage, when you need an answer now', body: 'The optional AI advisor built into Pathways. It knows your grade, school, and goals, and you can hand it an essay draft to read. $5 a month, and the only thing here that costs anything.', d: 'M11.5 2.6a1 1 0 0 1 1 0l2.6 5.3 5.9.9a1 1 0 0 1 .5 1.7l-4.2 4.1 1 5.8a1 1 0 0 1-1.5 1.1L12 18.7l-5.2 2.8a1 1 0 0 1-1.5-1.1l1-5.8-4.2-4.1a1 1 0 0 1 .5-1.7l5.9-.9z', d2: '', iconBg: 'var(--color-accent-100)', iconFg: 'var(--color-accent-700)' },
  { span: 4, title: 'Search that actually finds your future', body: 'People, high schools, colleges with public or private and in-state filters, summer programs, and majors, all in one search. Counselors search for students like you, not the other way around.', d: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z', d2: 'm21 21-4.3-4.3', iconBg: 'var(--color-accent-2-200)', iconFg: 'var(--color-accent-2-800)' },
];

export default function BentoGrid() {
  return (
    <section id="how" style={{ padding: 'clamp(28px,5vh,48px) 0' }}>
      <SectionHeader
        eyebrow="The features"
        title="One focused place, built for students, by students."
        intro="Everything below exists because students told us it was missing when they went looking for answers."
        titleMaxWidth="22ch"
      />
      <div className="grid gap-[14px] bento-grid" style={{ gridTemplateColumns: 'repeat(6,1fr)', gridAutoRows: 'minmax(150px,auto)' }}>
        {bento.map((b, i) => (
          <Reveal
            key={b.title}
            className="card elev-sm hover:shadow-[var(--shadow-md)]"
            from={i % 2 === 0 ? '-36px' : '36px'}
            style={{ gridColumn: `span ${b.span}`, gap: 8, padding: 24 }}
          >
            <span className="grid place-items-center" style={{ width: 38, height: 38, borderRadius: '50%', background: b.iconBg, color: b.iconFg }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
                <path d={b.d} />
                {b.d2 ? <path d={b.d2} /> : null}
              </svg>
            </span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 19, margin: 0, fontWeight: 400 }}>{b.title}</h3>
            <span style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--color-neutral-800)' }}>{b.body}</span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}