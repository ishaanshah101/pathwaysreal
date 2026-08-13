import React from 'react';
import Seo from '@/components/Seo';
import Reveal from '@/components/Reveal';
import PlanCard from '@/components/sage/PlanCard';
import AskSage from '@/components/sage/AskSage';

const sagePoints = [
  'Personalized to your profile, grade, and goals',
  'Saved conversations with streaming answers',
  'Turns off college ads across the whole app',
  'Funds free access for everyone else',
];

export default function Sage() {
  return (
    <>
      <Seo
        title="Sage — An AI College Advisor for $5 a Month | Pathways"
        description="Sage is the AI college and career advisor built into Pathways. Personalized to your grade, school, and goals, $5 a month or $40 a year. Everything else on Pathways stays free."
        path="/sage"
      />

      <Reveal as="section" id="sage" style={{ padding: 'clamp(28px,6vh,64px) 0 clamp(20px,4vh,44px)' }}>
        <div className="card elev-md" style={{ padding: 'clamp(26px,4vw,48px)', gap: 0, background: 'var(--color-accent-2-100)' }}>
          <div className="grid items-start" style={{ gridTemplateColumns: 'minmax(0,6fr) minmax(0,5fr)', gap: 'clamp(24px,4vw,56px)' }}>
            <div>
              {/* The old eyebrow tag said "Sage, your AI advisor" directly above
                  a headline about Sage being an advisor. One of them had to go. */}
              <h1 style={{ fontSize: 'clamp(28px,3.6vw,42px)', margin: '0 0 14px', maxWidth: '20ch', textWrap: 'balance' }}>
                A private counselor costs $200 an hour. Sage costs $5 a month.
              </h1>
              <p style={{ maxWidth: '50ch', fontSize: 15.5, lineHeight: 1.62, color: 'var(--color-neutral-800)', margin: 0 }}>
                Sage is the AI college and career advisor built into Pathways. It knows your grade,
                your school, and your goals, and answers like a mentor who has all the time in the
                world. Everything else on Pathways stays free, always.
              </p>
              <div className="flex flex-col gap-[10px]" style={{ marginTop: 22 }}>
                {sagePoints.map((t) => (
                  <span key={t} className="flex gap-[10px] items-start" style={{ fontSize: 14.5 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-2-700)" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: 4 }} aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <PlanCard />
          </div>
        </div>
      </Reveal>
      <AskSage />
    </>
  );
}
