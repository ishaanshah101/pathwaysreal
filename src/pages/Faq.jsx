import React from 'react';
import Seo from '@/components/Seo';

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
    <>
      <Seo
        title="Pathways FAQ — Cost, Eligibility, and How It Compares"
        description="Straight answers about Pathways: what it is, what it costs, who can join, how it differs from a private college counselor, and what Sage the AI advisor does."
        path="/faq"
      />
      <section id="faq" style={{ padding: 'clamp(28px,6vh,64px) 0 clamp(40px,6vh,64px)' }}>
        <span className="card-kicker" style={{ display: 'block', marginBottom: 12 }}>Frequently asked questions</span>
        <h1 style={{ fontSize: 'clamp(32px,4.4vw,52px)', margin: '0 0 14px', textWrap: 'balance' }}>
          Questions, answered plainly
        </h1>
        <p style={{ maxWidth: '56ch', color: 'var(--color-neutral-800)', fontSize: 'clamp(15.5px,1.3vw,17px)', lineHeight: 1.6, margin: '0 0 34px' }}>
          If something you need isn't here, ask Sage once for free on the Sage page.
        </p>

        <div className="grid gap-[14px]" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))' }}>
          {faqs.map((f) => (
            <div key={f.q} className="card elev-sm" style={{ gap: 9, padding: '24px 26px' }}>
              <h2 style={{ fontSize: 17, margin: 0, lineHeight: 1.3 }}>{f.q}</h2>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.62, color: 'var(--color-neutral-800)' }}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}