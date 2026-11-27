import React from 'react';

// Framed as "these were built for something else", not as an attack. Each of
// these is genuinely good at its own job; none of them was designed for a
// 15-year-old choosing a major.
const rows = [
  ['TikTok & Instagram', 'Built for short-form entertainment, so college research is easy to lose track of', 'Long-form posts only, so a visit you read about is still useful a month later'],
  ['Reddit & College Confidential', 'Open forums where great advice and guesswork sit side by side, unlabeled', 'Professors and counselors checked by hand against the public directory of the school they name, so you know who is answering you'],
  ['LinkedIn', 'Designed for working professionals and hiring, not for high school students', 'Built for students, by a student. Peer-first and education-only'],
  ['Google', 'Excellent at finding official institutional pages, which is a different thing from firsthand experience', "Real students and mentors who recently lived the exact decision you're facing"],
];

export default function CompareTable() {
  return (
    <section id="compare" className="band">
      <div className="wrap">
        <span className="kicker">Compare notes</span>
        <h2 className="title-2" style={{ maxWidth: '22ch' }}>Where students look today, and what Pathways adds</h2>
        <p className="lede" style={{ margin: '16px 0 clamp(24px,4vh,40px)' }}>
          These are all places students already go, and each is good at what it was built for.
          None of them was built for choosing a college.
        </p>
        <table className="compare">
          <thead>
            <tr>
              <th scope="col">Where students look</th>
              <th scope="col">What it was built for</th>
              <th scope="col">What Pathways adds</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([a, b, c]) => (
              <tr key={a}>
                <td>{a}</td>
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
