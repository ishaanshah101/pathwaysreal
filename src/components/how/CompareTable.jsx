import React from 'react';
import SectionHeader from '@/components/SectionHeader';

const rows = [
  ['TikTok & Instagram', 'Short-form loops are addictive and pull students off-task within minutes', 'Long-form posts only. No short videos, no reposts, no infinite dopamine loop'],
  ['Reddit & College Confidential', 'Unverified advice, toxic comparison culture, poor navigation', 'Verified educators and counselors, a credibility tier system, AI-filtered ratings'],
  ['LinkedIn', 'Too professional and intimidating for a 15-year-old picking a major', 'Built for students, by students. Warm, peer-first, education-only'],
  ['Google', 'Returns official institutional pages, not real firsthand experience', "Real students and mentors who recently lived the exact decision you're facing"],
];

export default function CompareTable() {
  return (
    <section id="compare" style={{ padding: 'clamp(28px,5vh,48px) 0 clamp(40px,6vh,64px)' }}>
      <SectionHeader
        eyebrow="The comparison"
        title="Where students look today, and what goes wrong"
        intro="Every one of these is somewhere students already go for answers. Here is what each gets wrong."
      />
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