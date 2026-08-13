import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useProfile } from '@/lib/useProfile';
import { useSubscription, startSageCheckout } from '@/lib/useSubscription';

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

  return (
    <div className="card elev-md" style={{ background: 'var(--color-bg)', padding: 28, gap: 16 }}>
      <div className="seg self-start" style={{ background: 'var(--color-surface)' }}>
        {['monthly', 'yearly'].map((p) => (
          <button
            key={p}
            type="button"
            className="seg-opt"
            data-on={String(plan === p)}
            onClick={() => { setPlan(p); setError(''); }}
          >
            {p === 'monthly' ? 'Monthly' : 'Yearly'}
          </button>
        ))}
      </div>

      <div key={plan} className="anim-fade-swap">
        <div className="flex items-baseline gap-2">
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 52 }}>{yearly ? '$40' : '$5'}</span>
          <span style={{ fontSize: 14, color: 'var(--color-neutral-700)' }}>{yearly ? 'per year' : 'per month'}</span>
          {yearly && <span className="tag tag-accent" style={{ marginLeft: 'auto' }}>Save 33%</span>}
        </div>
        <table className="table" style={{ marginTop: 14, fontSize: 13 }}>
          <tbody>
            <tr><td style={{ opacity: 0.65 }}>Billed</td><td style={{ textAlign: 'right', fontWeight: 700 }}>{yearly ? '$40 once a year' : '$5 every month'}</td></tr>
            <tr><td style={{ opacity: 0.65 }}>Per week</td><td style={{ textAlign: 'right', fontWeight: 700 }}>{yearly ? '$0.77' : '$1.15'}</td></tr>
            <tr><td style={{ opacity: 0.65 }}>College ads</td><td style={{ textAlign: 'right', fontWeight: 700 }}>Turned off</td></tr>
            <tr><td style={{ opacity: 0.65 }}>Cancel anytime</td><td style={{ textAlign: 'right', fontWeight: 700 }}>Yes</td></tr>
          </tbody>
        </table>
      </div>

      {error && (
        <span style={{ fontSize: 13, color: 'var(--color-accent-700)', lineHeight: 1.5 }}>{error}</span>
      )}

      {hasSage ? (
        <Link to="/app/sage" className="btn btn-primary btn-block no-underline" style={{ minHeight: 46, fontSize: 15 }}>
          Open Sage
        </Link>
      ) : canCheckoutHere ? (
        <button
          type="button"
          className="btn btn-primary btn-block"
          style={{ minHeight: 46, fontSize: 15 }}
          onClick={subscribe}
          disabled={busy}
        >
          {busy ? 'Opening secure checkout…' : 'Subscribe to Sage'}
        </button>
      ) : (
        <Link
          to={`/join?plan=${planKey}`}
          className="btn btn-primary btn-block no-underline"
          style={{ minHeight: 46, fontSize: 15 }}
        >
          Create an account to get Sage
        </Link>
      )}

      <span style={{ fontSize: 11.5, color: 'var(--color-neutral-600)', textAlign: 'center', lineHeight: 1.5 }}>
        The core app never has a paid tier. That would defeat the point.
      </span>
    </div>
  );
}
