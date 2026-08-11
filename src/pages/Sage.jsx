import React from 'react';
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
      <Reveal as="section" id="sage" style={{ padding: 'clamp(36px,7vh,72px) 0' }}>
        <div className="card elev-md" style={{ padding: 'clamp(26px,4vw,48px)', gap: 0, background: 'var(--color-accent-2-100)' }}>
          <div className="grid items-start" style={{ gridTemplateColumns: 'minmax(0,6fr) minmax(0,5fr)', gap: 'clamp(24px,4vw,56px)' }}>
            <div>
              <span className="tag tag-accent-2">Sage · your AI advisor</span>
              <h2 style={{ fontSize: 'clamp(26px,3vw,36px)', margin: '14px 0 10px', maxWidth: '20ch', textWrap: 'balance' }}>
                A private counselor costs $200 an hour. Sage costs $5 a month.
              </h2>
              <p style={{ maxWidth: '50ch', fontSize: 15, color: 'var(--color-neutral-800)' }}>
                Sage knows your grade, your school, and your goals, and answers like a mentor who has all the time in the world.
                Everything else on Pathways stays free, always.
              </p>
              <div className="flex flex-col gap-[9px]" style={{ marginTop: 18 }}>
                {sagePoints.map((t) => (
                  <span key={t} className="flex gap-[9px] items-start" style={{ fontSize: 14 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-2-700)" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: 3 }}>
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