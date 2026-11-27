import React from 'react';
import { Link } from 'react-router-dom';
import Sign from '@/components/kit/Sign';

// What is actually inside, as an index rather than six identical cards.
const items = [
  { sign: 'Feed', color: 'green', title: 'Long posts from people who did it', body: 'Campus visits, rejections, scholarships that came through. No reposts and no short video, so you leave knowing more than when you arrived.' },
  { sign: 'Mentors', color: 'blue', title: 'Checked by a person, not a bot', body: 'Professors and counselors get the verified badge only after someone compares them against their school’s public directory.' },
  { sign: 'Messages', color: 'ink', title: 'One on one, and only if you both say yes', body: 'Nobody can message you until you accept their request. No group chats. Phone numbers and meetup requests are blocked automatically.' },
  { sign: 'Plan', color: 'sun', title: 'Deadlines you will actually see coming', body: 'A college list and a checklist with dates, starting from what students in your grade usually need to do next.' },
  { sign: 'Glossary', color: 'brown', title: 'FAFSA, ED, SAI, in plain English', body: 'The words everyone assumes you already know, each explained in a sentence or two.', to: '/glossary' },
  { sign: 'Sage', color: 'yellow', title: 'An AI advisor for when it is 11 p.m.', body: 'Optional, $5 a month, and the only thing on Pathways that costs money. It is what keeps the rest free.', to: '/sage' },
];

export default function MapIndex() {
  return (
    <section className="band band-sheet" aria-labelledby="map-index-title">
      <div className="wrap">
        <span className="kicker">What is on the map</span>
        <h2 id="map-index-title" className="title-1" style={{ maxWidth: '16ch', marginBottom: 'clamp(24px,4vh,44px)' }}>
          One place, built for the decision you are making.
        </h2>
        <div className="index-grid">
          {items.map((it) => (
            <div key={it.sign} className="index-item">
              <Sign color={it.color}>{it.sign}</Sign>
              <div>
                <h3>{it.title}</h3>
                <p>
                  {it.body}
                  {it.to ? <>{' '}<Link to={it.to} style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Take a look</Link></> : null}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
