import React from 'react';

const rows = [
  ['TikTok & Instagram', 'Short-form loops are addictive and pull students off-task within minutes', 'Long-form posts only. No short videos, no reposts, no infinite dopamine loop'],
  ['Reddit & College Confidential', 'Unverified advice, toxic comparison culture, poor navigation', 'Verified educators and counselors, a credibility tier system, AI-filtered ratings'],
  ['LinkedIn', 'Too professional and intimidating for a 15-year-old picking a major', 'Built for students, by students. Warm, peer-first, education-only'],
  ['Google', 'Returns official institutional pages, not real firsthand experience', "Real students and mentors who recently lived the exact decision you're facing"],
];

export default function CompareTable() {
  return (
    <section id="compare" style={{ padding: 'clamp(36px,7vh,72px) 0' }}>
      <h2 style={{ fontSize: 'clamp(26px,3vw,36px)', maxWidth: '24ch', margin: '0 0 10px', textWrap: 'balance' }}>What is Pathways?</h2>
      <p style={{ maxWidth: '64ch', fontSize: 15.5, lineHeight: 1.65, color: 'var(--color-neutral-800)' }}>
        Pathways is a free platform that gives every high school student equal access to real, firsthand guidance on college and
        careers. Students, professors, and admissions counselors share experience, connect as mentors, and answer questions in one
        focused space, with no addiction loops and no data selling. It blends the best of Instagram, Reddit, and LinkedIn into one
        place built only for education.
      </p>
      <h3 style={{ fontSize: 20, margin: '28px 0 14px' }}>How Pathways compares to the alternatives</h3>
      <div style={{ overflowX: 'auto' }}>
        <table className="table" style={{ minWidth: 560 }}>
          <thead>
            <tr>
              <th>Where students look today</th>
              <th>What goes wrong</th>
              <th>What Pathways does instead</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([a, b, c]) => (
              <tr key={a}>
                <td><b>{a}</b></td>
                <td>{b}</td>
                <td>{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}