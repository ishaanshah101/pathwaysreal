import React from 'react';
import { Link } from 'react-router-dom';
import Sign from '@/components/kit/Sign';

// What is inside, one thing per index card.
const items = [
  { label: 'Feed', color: 'green', title: 'Long posts from people who did it', body: 'Campus visits, rejections, scholarships that came through. No reposts and no short video, so you leave knowing more than when you arrived.' },
  { label: 'Mentors', color: 'blue', title: 'Checked by a person, not a bot', body: 'Professors and counselors get the verified stamp only after someone compares them against their school’s public directory.' },
  { label: 'Messages', color: 'red', title: 'One on one, and only if you both say yes', body: 'Nobody can message you until you accept their request. No group chats. Phone numbers and meetup requests are blocked automatically.' },
  { label: 'Plan', color: 'sun', title: 'Deadlines you will actually see coming', body: 'A college list and a checklist with dates, starting from what students in your grade usually need to do next.' },
  { label: 'Glossary', color: 'lime', title: 'FAFSA, ED, SAI, in plain English', body: 'The words everyone assumes you already know, each explained in a sentence or two.', to: '/glossary', cta: 'Flip through it' },
  { label: 'Sage', color: 'yellow', title: 'An AI advisor for when it is 11 p.m.', body: 'Optional, $5 a month, and the only thing on Pathways that costs money. It is what keeps the rest free.', to: '/sage', cta: 'Meet Sage' },
];

export default function MapIndex() {
  return (
    <section className="band-tight" aria-labelledby="inside-title">
      <div className="wrap">
        <span className="kicker">Table of contents</span>
        <h2 id="inside-title" className="title-1" style={{ maxWidth: '18ch', marginBottom: 'clamp(22px,4vh,38px)' }}>
          One notebook for the decision you are making.
        </h2>
        <div className="cards">
          {items.map((it) => (
            <article key={it.label} className="index-card">
              <Sign color={it.color}>{it.label}</Sign>
              <h3>{it.title}</h3>
              <p>
                {it.body}
                {it.to ? <>{' '}<Link to={it.to} style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{it.cta}</Link></> : null}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
