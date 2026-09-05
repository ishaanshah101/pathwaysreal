import React from 'react';
import Seo from '@/components/Seo';
import PlanCard from '@/components/sage/PlanCard';
import AskSage from '@/components/sage/AskSage';

const sagePoints = [
  'Personalized to your profile, grade, and goals',
  'Saved conversations with streaming answers',
  'Attach an essay draft or transcript and ask about it',
  'Funds free access for everyone else',
];

export default function Sage() {
  return (
    <>
      <Seo
        title="Sage — An AI College Advisor for $5 a Month | Pathways"
        description="Sage is the AI college and career advisor built into Pathways, personalized to your grade, school, and goals. $5 a month. Everything else stays free."
        path="/sage"
      />

      <section id="sage" className="page-hero">
        <div className="grid items-start app-split" style={{ gridTemplateColumns: 'minmax(0,6fr) minmax(0,5fr)', gap: 'clamp(28px,5vw,72px)' }}>
            <div>
              <span className="card-kicker" style={{ display: 'block', marginBottom: 12 }}>Sage, the AI advisor</span>
              <h1 style={{ fontSize: 'clamp(32px,4.4vw,52px)', margin: '0 0 16px', maxWidth: '22ch', textWrap: 'balance' }}>
                A private counselor costs $200 an hour. Sage costs $5 a month.
              </h1>
              <p style={{ maxWidth: '50ch', fontSize: 'clamp(15.5px,1.3vw,17px)', lineHeight: 1.62, color: 'var(--color-neutral-800)', margin: 0 }}>
                Sage is the AI college and career advisor built into Pathways. It knows your grade,
                your school, and your goals, and answers like a mentor who has all the time in the
                world. Everything else on Pathways stays free, always.
              </p>
              <div className="flex flex-col gap-[10px]" style={{ marginTop: 24 }}>
                {sagePoints.map((t) => (
                  <span key={t} className="flex gap-[10px] items-start" style={{ fontSize: 15 }}>
                    <span className="grid place-items-center" style={{ width: 20, height: 20, borderRadius: 999, background: 'var(--color-accent-2-200)', flex: 'none', marginTop: 1 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-2-800)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <PlanCard />
        </div>
      </section>
      <AskSage />
    </>
  );
}
