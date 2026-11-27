import React, { useEffect, useRef, useState } from 'react';
import { startSageCheckout, SAGE_PRICES } from '@/lib/useSubscription';
import { SAMPLE_SAGE_EXCHANGES } from '@/data/sampleContent';
import { isNativeApp } from '@/lib/platform';
import SageComingSoonCard from '@/components/app/SageComingSoonCard';
import PageHead from '@/components/kit/PageHead';
import Sign from '@/components/kit/Sign';

const points = [
  'Personalized to your profile, grade, and goals',
  'Saved conversations you can come back to',
  'Attach an essay draft or transcript and ask about it',
  'Funds free access for every other student',
];

export default function SagePaywall({ notice }) {
  // Someone who picked a plan before they had an account arrives here with
  // ?plan= in the URL right after onboarding. Preselect it and send them
  // straight to checkout so they finish the purchase they already started.
  const urlPlan = new URLSearchParams(window.location.search).get('plan');
  // Inside a native wrapper nothing may open an external checkout, not even a
  // ?plan= link carried over from the web.
  const native = isNativeApp();
  const validUrlPlan = !native && ['sage_monthly', 'sage_yearly'].includes(urlPlan) ? urlPlan : null;

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

  // The price, printed as a toll ticket, the same one the public Sage page
  // shows: this is the one toll road on a map where every other road is free.
  const pricing = native ? <SageComingSoonCard /> : (
    <div className="ticket">
      <div className="ticket-top">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="kicker" style={{ margin: 0 }}>Toll ticket · Sage</span>
          <div className="seg" role="group" aria-label="Billing period">
            {['sage_monthly', 'sage_yearly'].map((p) => (
              <button
                key={p}
                type="button"
                className="seg-opt"
                data-on={String(plan === p)}
                aria-pressed={plan === p}
                onClick={() => { setPlan(p); setError(''); }}
              >
                {SAGE_PRICES[p].label}
              </button>
            ))}
          </div>
        </div>

        <div className="ticket-price">
          <b className="num">{price.amount}</b>
          <span style={{ fontWeight: 700, color: 'var(--ink-2)' }}>{price.cadence}</span>
          {yearly && <Sign color="yellow" style={{ marginLeft: 'auto' }}>Save 33%</Sign>}
        </div>

        <ul className="ticket-rows">
          <li><span>Per week</span><span className="num">{price.perWeek}</span></li>
          <li><span>Cancel anytime</span><span>Yes</span></li>
        </ul>

        <ul className="checklist ticket-points">
          {points.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </div>

      <div className="ticket-tear" aria-hidden="true" />

      <div className="ticket-bottom">
        {error && <span role="alert" className="msg msg-error">{error}</span>}

        <button
          type="button"
          className="btn btn-sun btn-lg btn-block"
          onClick={() => subscribe()}
          disabled={busy}
        >
          {busy ? 'Opening secure checkout…' : 'Subscribe to Sage'}
        </button>

        <span className="meta" style={{ textAlign: 'center', lineHeight: 1.5 }}>
          Payment is handled by Stripe on their secure checkout page. Pathways never sees or stores
          your card details.
        </span>
      </div>
    </div>
  );

  return (
    <div className="page">
      <PageHead
        kicker="Sage, the AI advisor"
        title={native ? 'Sage, your college and career advisor.' : 'Sage is the one paid thing on Pathways.'}
        sub="A private counselor costs $200 an hour. Sage knows your grade, your school, and your goals, and answers like a mentor with all the time in the world. Everything else on Pathways stays free, always."
      />

      {!native && notice && (
        <div className={`notice ${notice.tone === 'error' ? 'notice-error' : 'notice-success'}`} role="status" style={{ marginBottom: 24 }}>
          {notice.text}
        </div>
      )}

      <div className="paywall-layout">
        {/* Real answers, so the value is visible before anyone is asked to pay. */}
        <div>
          <div className="paywall-samples-head">
            <h2>What Sage actually sounds like</h2>
            <p>Four real answers, unedited. Yours would also know your grade, school, and goals.</p>
          </div>
          {SAMPLE_SAGE_EXCHANGES.map((ex, i) => (
            <React.Fragment key={ex.q}>
              {i > 0 && <hr className="lane lane-soft" />}
              <div className="paywall-sample">
                <div className="turn">
                  <span className="turn-label" data-who="you">A student asked</span>
                  <div className="turn-q">{ex.q}</div>
                </div>
                <div className="turn">
                  <span className="turn-label" data-who="sage">Sage</span>
                  <div className="prose turn-a">{ex.a}</div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>

        <aside className="paywall-aside split-aside" aria-label="Sage subscription">
          {pricing}
        </aside>
      </div>
    </div>
  );
}
