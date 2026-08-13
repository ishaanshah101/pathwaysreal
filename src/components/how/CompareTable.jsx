import React from 'react';

const rows = [
  ['TikTok & Instagram', 'Short-form loops are addictive and pull students off-task within minutes', 'Long-form posts only. No short videos, no reposts, no infinite dopamine loop'],
  ['Reddit & College Confidential', 'Unverified advice, toxic comparison culture, poor navigation', 'Verified educators and counselors, a credibility tier system, AI-filtered ratings'],
  ['LinkedIn', 'Too professional and intimidating for a 15-year-old picking a major', 'Built for students, by students. Warm, peer-first, education-only'],
  ['Google', 'Returns official institutional pages, not real firsthand experience', "Real students and mentors who recently lived the exact decision you're facing"],
];

export default function CompareTable() {
  return (
    <section id="compare" style={{ padding: 'clamp(24px,4vh,48px) 0 clamp(36px,6vh,64px)' }}>
      {/* The definition that used to sit here now opens the page, where it
          belongs. This section does one job: the comparison. */}
      <h2 style={{ fontSize: 'clamp(26px,3.2vw,38px)', maxWidth: '24ch', margin: '0 0 10px', textWrap: 'balance' }}>
        Where students look today, and what goes wrong
      </h2>
      <p style={{ maxWidth: '58ch', fontSize: 15.5, lineHeight: 1.6, color: 'var(--color-neutral-800)', marginBottom: 22 }}>
        Every one of these is somewhere students already go for answers. Here is what each gets wrong.
      </p>
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