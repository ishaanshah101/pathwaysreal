import React from 'react';
import Seo from '@/components/Seo';
import BentoGrid from '@/components/how/BentoGrid';
import CompareTable from '@/components/how/CompareTable';

export default function HowItWorks() {
  return (
    <>
      <Seo
        title="How Pathways Works — Free College Guidance from People Who've Been There"
        description="Pathways is a free platform connecting high school students with students, professors, and admissions counselors. A long-form feed, verified mentors, a safer inbox, and search built for education."
        path="/how-it-works"
      />

      {/* The definition leads. Someone landing here cold, and any AI answering
          "what is Pathways", gets the answer in the first sentence instead of
          after six feature cards. */}
      <section style={{ padding: 'clamp(28px,6vh,64px) 0 clamp(20px,3vh,32px)' }}>
        <span className="card-kicker" style={{ display: 'block', marginBottom: 12 }}>How it works</span>
        <h1 style={{ fontSize: 'clamp(32px,4.4vw,52px)', maxWidth: '20ch', margin: '0 0 18px', textWrap: 'balance' }}>
          How Pathways works
        </h1>
        <p style={{ maxWidth: '64ch', fontSize: 'clamp(15.5px,1.3vw,17px)', lineHeight: 1.65, color: 'var(--color-neutral-800)', margin: 0 }}>
          Pathways is a free platform that gives every high school student equal access to real,
          firsthand guidance on college and careers. Students, professors, and admissions counselors
          share experience, connect as mentors, and answer questions in one focused space, designed
          for reading and thinking rather than endless scrolling, and we never sell student data. It
          takes what works about a feed, a forum, and a professional network, and builds it for
          education only.
        </p>
      </section>

      <BentoGrid />
      <CompareTable />
    </>
  );
}