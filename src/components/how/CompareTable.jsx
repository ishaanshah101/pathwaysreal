import React from 'react';
import SectionHeader from '@/components/SectionHeader';

// Framed as "these were built for something else", not as an attack. Each of
// these is genuinely good at its own job; none of them was designed for a
// 15-year-old choosing a major.
const rows = [
  ['TikTok & Instagram', 'Built for short-form entertainment, so college research is easy to lose track of', 'Long-form posts only, so a visit you read about is still useful a month later'],
  ['Reddit & College Confidential', 'Open forums where great advice and guesswork sit side by side, unlabeled', 'Professors and counselors checked by hand against the public directory of the school they name, so you know who is answering you'],
  ['LinkedIn', 'Designed for working professionals and hiring, not for high school students', 'Built for students, by students. Warm, peer-first, education-only'],
  ['Google', 'Excellent at finding official institutional pages, which is a different thing from firsthand experience', "Real students and mentors who recently lived the exact decision you're facing"],
];

export default function CompareTable() {
  return (
    <section id="compare" className="page-section" style={{ paddingBottom: 'clamp(40px,6vh,72px)' }}>
      <SectionHeader
        eyebrow="The comparison"
        title="Where students look today, and what Pathways adds"
        intro="These are all places students already go, and each is good at what it was built for. None of them was built for choosing a college."
      />
      <div className="card elev-sm compare-card" style={{ padding: '4px 8px' }}>
        <table className="table compare-table">
          <thead>
            <tr>
              <th>Where students look today</th>
              <th>What it was built for</th>
              <th>What Pathways adds</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([a, b, c]) => (
              <tr key={a}>
                <td className="compare-name" style={{ fontWeight: 700 }}>{a}</td>
                <td data-label="What it was built for">{b}</td>
                <td data-label="What Pathways adds">{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}