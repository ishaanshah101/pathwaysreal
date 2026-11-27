import React from 'react';
import Seo from '@/components/Seo';
import PlanCard from '@/components/sage/PlanCard';
import AskSage from '@/components/sage/AskSage';
import { isNativeApp } from '@/lib/platform';

const sagePoints = [
  'Personalized to your profile, grade, and goals',
  'Saved conversations with streaming answers',
  'Attach an essay draft or transcript and ask about it',
  'Funds free access for everyone else',
];

export default function Sage() {
  const native = isNativeApp();
  return (
    <>
      <Seo
        title={native ? 'Sage — AI College Advisor | Pathways' : 'Sage — An AI College Advisor for $5 a Month | Pathways'}
        description={native ? 'Sage is the AI college and career advisor built into Pathways. Try a free question or sign in with an existing subscription.' : 'Sage is the AI college and career advisor built into Pathways, personalized to your grade, school, and goals. $5 a month. Everything else stays free.'}
        path="/sage"
      />

      <section id="sage" className="page-top gridded">
        <div className="wrap top-split">
          <div>
            <span className="kicker kicker-sun">Sage, the AI advisor</span>
            <h1 className="title-1" style={{ maxWidth: '15ch' }}>
              {native ? 'College and career guidance, with Sage.' : 'A private counselor costs $200 an hour. Sage costs $5 a month.'}
            </h1>
            <p className="lede">
              Sage is the AI college and career advisor built into Pathways. It knows your grade,
              your school, and your goals, and answers like a mentor who has all the time in the
              world. Everything else on Pathways stays free, always.
            </p>
            <ul className="checklist">
              {sagePoints.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </div>
          <PlanCard />
        </div>
      </section>

      <AskSage />
    </>
  );
}
