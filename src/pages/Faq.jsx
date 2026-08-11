import React from 'react';

const faqs = [
  { q: 'What is Pathways?', a: 'Pathways is a free platform that gives every high school student equal access to real, firsthand guidance on college and careers. Students, professors, and admissions counselors share experience, connect as mentors, and answer questions in one focused space with no addiction loops.' },
  { q: 'Is Pathways free?', a: 'Yes. The core app, including the feed, search, connections, messaging, and profiles, is completely free with no premium tier. The only paid feature is Sage, an optional AI advisor, at $5 per month or $40 per year.' },
  { q: 'How is Pathways different from a college counselor?', a: 'Private college counselors can cost $200 an hour. Pathways gives students the same kind of guidance for free, through real students who recently applied, verified professors, and admissions counselors, plus an optional AI advisor at $5 a month.' },
  { q: 'Who can use Pathways?', a: 'Any student 14 or older, from 9th grade up. College students use it for peer mentorship, and educators, professors, and admissions counselors join as verified mentors using their institutional email.' },
  { q: 'How does Pathways help low-income students?', a: 'Everything that matters is free: mentorship from people who have been there, college search, application advice, and scholarship posts. Students without private counselors or alumni networks get the same access as everyone else. Pathways never sells student data.' },
  { q: 'What is Sage on Pathways?', a: 'Sage is the AI college and career advisor built into Pathways. It is personalized to your grade, school, and goals, saves your conversations, and costs $5 per month or $40 per year, which also turns off college ads.' },
  { q: 'How much does Pathways cost?', a: 'The core app is free forever. Sage, the optional AI advisor, costs $5 per month or $40 per year. Colleges pay for clearly labeled ad placements, which keeps the platform free for students.' },
];

export default function Faq() {
  return (
    <section id="faq" style={{ padding: 'clamp(20px,4vh,48px) 0' }}>
      <h2 style={{ fontSize: 'clamp(26px,3vw,36px)', margin: '0 0 22px' }}>Questions, answered plainly</h2>
      <div className="grid gap-[14px]" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>
        {faqs.map((f) => (
          <div key={f.q} className="card elev-sm" style={{ gap: 8, padding: '22px 24px' }}>
            <h3 style={{ fontSize: 16.5, margin: 0 }}>{f.q}</h3>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: 'var(--color-neutral-800)' }}>{f.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}