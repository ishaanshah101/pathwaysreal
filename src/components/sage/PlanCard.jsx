import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useProfile } from '@/lib/useProfile';
import { useSubscription, startSageCheckout } from '@/lib/useSubscription';
import { isNativeApp } from '@/lib/platform';
import SageComingSoonCard from '@/components/app/SageComingSoonCard';
import Sign from '@/components/kit/Sign';

// The price, on a yellow slip with a tear-off stub. Sage is the one thing
// here that costs money, and it is honest to make that obvious.
export default function PlanCard() {
  const [plan, setPlan] = useState('yearly');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const yearly = plan === 'yearly';
  const planKey = yearly ? 'sage_yearly' : 'sage_monthly';

  const { isAuthenticated } = useAuth();
  const { isOnboarded } = useProfile();
  const { hasSage } = useSubscription();

  // A signed-in, onboarded person can go straight to Stripe from here. Anyone
  // else has to have an account first, because a subscription has to belong to
  // somebody.
  const canCheckoutHere = isAuthenticated && isOnboarded && !hasSage;

  const subscribe = async () => {
    setBusy(true);
    setError('');
    try {
      await startSageCheckout(planKey);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  if (isNativeApp()) {
    return hasSage ? (
      <Link to="/app/sage" className="btn btn-primary btn-lg btn-go">Open Sage</Link>
    ) : <SageComingSoonCard />;
  }

  return (
    <div className="ticket">
      <div className="ticket-top">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="kicker" style={{ margin: 0 }}>Price · Sage</span>
          <div className="seg" role="group" aria-label="Billing period">
            {['monthly', 'yearly'].map((p) => (
              <button
                key={p}
                type="button"
                className="seg-opt"
                data-on={String(plan === p)}
                aria-pressed={plan === p}
                onClick={() => { setPlan(p); setError(''); }}
              >
                {p === 'monthly' ? 'Monthly' : 'Yearly'}
              </button>
            ))}
          </div>
        </div>

        <div className="ticket-price">
          <b className="num">{yearly ? '$40' : '$5'}</b>
          <span style={{ fontWeight: 700, color: 'var(--ink-2)' }}>{yearly ? 'per year' : 'per month'}</span>
          {yearly && <Sign color="yellow" style={{ marginLeft: 'auto' }}>Save 33%</Sign>}
        </div>

        <ul className="ticket-rows">
          <li><span>Billed</span><span>{yearly ? '$40 once a year' : '$5 every month'}</span></li>
          <li><span>Per week</span><span className="num">{yearly ? '$0.77' : '$1.15'}</span></li>
          <li><span>File attachments</span><span>Included</span></li>
          <li><span>Cancel anytime</span><span>Yes</span></li>
        </ul>
      </div>

      <div className="ticket-tear" aria-hidden="true" />

      <div className="ticket-bottom">
        {error && <span role="alert" className="msg msg-error">{error}</span>}

        {hasSage ? (
          <Link to="/app/sage" className="btn btn-primary btn-lg btn-block btn-go">Open Sage</Link>
        ) : canCheckoutHere ? (
          <button type="button" className="btn btn-sun btn-lg btn-block" onClick={subscribe} disabled={busy}>
            {busy ? 'Opening secure checkout…' : 'Subscribe to Sage'}
          </button>
        ) : (
          <Link to={`/join?plan=${planKey}`} className="btn btn-sun btn-lg btn-block">
            Create an account to get Sage
          </Link>
        )}

        <span className="meta" style={{ textAlign: 'center', lineHeight: 1.5 }}>
          The core app never has a paid tier. That would defeat the point.
        </span>
      </div>
    </div>
  );
}
