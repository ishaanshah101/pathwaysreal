import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Check, Loader2 } from 'lucide-react';
import { startSageCheckout, SAGE_PRICES } from '@/lib/useSubscription';
import { SAMPLE_SAGE_EXCHANGES } from '@/data/sampleContent';

const points = [
  'Personalized to your profile, grade, and goals',
  'Saved conversations you can come back to',
  'Turns off college ads across the whole app',
  'Funds free access for every other student',
];

export default function SagePaywall({ notice }) {
  // Someone who picked a plan before they had an account arrives here with
  // ?plan= in the URL right after onboarding. Preselect it and send them
  // straight to checkout so they finish the purchase they already started.
  const urlPlan = new URLSearchParams(window.location.search).get('plan');
  const validUrlPlan = ['sage_monthly', 'sage_yearly'].includes(urlPlan) ? urlPlan : null;

  const [plan, setPlan] = useState(validUrlPlan || 'sage_monthly');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const yearly = plan === 'sage_yearly';
  const price = SAGE_PRICES[plan];
  const autoStarted = useRef(false);

  const subscribe = async (chosen = plan) => {
    setBusy(true);
    setError('');
    try {
      await startSageCheckout(chosen);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!validUrlPlan || autoStarted.current) return;
    autoStarted.current = true;
    // Drop the param so back-navigating here doesn't relaunch checkout.
    const url = new URL(window.location.href);
    url.searchParams.delete('plan');
    window.history.replaceState({}, '', url.pathname + url.search);
    subscribe(validUrlPlan);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col" style={{ gap: 18, maxWidth: 720 }}>
      <div>
        <h1 style={{ fontSize: 'clamp(26px,3.2vw,36px)', margin: '0 0 8px' }}>
          Sage is the one paid thing on Pathways.
        </h1>
        <p style={{ color: 'var(--color-neutral-800)', margin: 0, maxWidth: '56ch', lineHeight: 1.6 }}>
          A private counselor costs $200 an hour. Sage knows your grade, your school, and your goals,
          and answers like a mentor with all the time in the world. Everything else on Pathways stays
          free, always.
        </p>
      </div>

      {notice && (
        <div
          className="card"
          style={{
            padding: '12px 16px', borderRadius: 18, gap: 0,
            background: notice.tone === 'error' ? 'var(--color-accent-100)' : 'var(--color-accent-2-100)',
            border: `1px solid ${notice.tone === 'error' ? 'var(--color-accent-400)' : 'var(--color-accent-2-400)'}`,
          }}
        >
          <span style={{ fontSize: 14, lineHeight: 1.5 }}>{notice.text}</span>
        </div>
      )}

      <div className="card elev-md" style={{ padding: 'clamp(22px,3vw,32px)', gap: 18, background: 'var(--color-accent-2-100)' }}>
        <div className="seg self-start" style={{ background: 'var(--color-surface)' }}>
          {['sage_monthly', 'sage_yearly'].map((p) => (
            <button
              key={p}
              type="button"
              className="seg-opt"
              data-on={String(plan === p)}
              onClick={() => { setPlan(p); setError(''); }}
            >
              {SAGE_PRICES[p].label}
            </button>
          ))}
        </div>

        <div key={plan} className="anim-fade-swap">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(40px,6vw,56px)', lineHeight: 1 }}>
              {price.amount}
            </span>
            <span style={{ fontSize: 15, color: 'var(--color-neutral-700)' }}>{price.cadence}</span>
            {yearly && <span className="tag tag-accent" style={{ marginLeft: 8 }}>Save 33%</span>}
          </div>
          <span style={{ fontSize: 13, color: 'var(--color-neutral-700)' }}>
            That is {price.perWeek} a week. Cancel anytime.
          </span>
        </div>

        <div className="flex flex-col" style={{ gap: 10 }}>
          {points.map((t) => (
            <span key={t} className="flex gap-[10px] items-start" style={{ fontSize: 14.5, lineHeight: 1.5 }}>
              <Check size={16} strokeWidth={3} style={{ flex: 'none', marginTop: 3, color: 'var(--color-accent-2-700)' }} />
              {t}
            </span>
          ))}
        </div>

        {error && (
          <span style={{ fontSize: 13.5, color: 'var(--color-accent-700)', lineHeight: 1.5 }}>{error}</span>
        )}

        <button
          type="button"
          className="btn btn-primary btn-block"
          style={{ minHeight: 50, fontSize: 15.5, gap: 8 }}
          onClick={() => subscribe()}
          disabled={busy}
        >
          {busy ? (
            <>
              <Loader2 size={17} className="animate-spin" /> Opening secure checkout…
            </>
          ) : (
            <>
              <Sparkles size={17} /> Subscribe to Sage
            </>
          )}
        </button>

        <span style={{ fontSize: 11.5, color: 'var(--color-neutral-600)', textAlign: 'center', lineHeight: 1.55 }}>
          Payment is handled by Stripe on their secure checkout page. Pathways never sees or stores
          your card details.
        </span>
      </div>

      {/* Real answers, so the value is visible before anyone is asked to pay. */}
      <div className="flex flex-col" style={{ gap: 12, marginTop: 6 }}>
        <h2 style={{ fontSize: 'clamp(20px,2.4vw,26px)', margin: 0 }}>What Sage actually sounds like</h2>
        <p style={{ color: 'var(--color-neutral-700)', margin: '0 0 4px', fontSize: 14 }}>
          Four real answers, unedited. Yours would also know your grade, school, and goals.
        </p>
        {SAMPLE_SAGE_EXCHANGES.map((ex) => (
          <div key={ex.q} className="card elev-sm" style={{ padding: 20, gap: 12, borderRadius: 24 }}>
            <div
              style={{
                alignSelf: 'flex-end', maxWidth: '85%',
                background: 'var(--color-accent)', color: 'var(--color-bg)',
                padding: '10px 15px', borderRadius: 20, fontSize: 14, lineHeight: 1.5,
              }}
            >
              {ex.q}
            </div>
            <div
              style={{
                alignSelf: 'flex-start', maxWidth: '95%',
                background: 'var(--color-bg)', padding: '12px 16px', borderRadius: 20,
                fontSize: 14.5, lineHeight: 1.62, whiteSpace: 'pre-wrap',
              }}
            >
              {ex.a}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}