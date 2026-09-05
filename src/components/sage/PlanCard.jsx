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
    <div className="card elev-md" style={{ padding: 28, gap: 16 }}>
      <div className="seg self-start">
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
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 52, lineHeight: 1 }}>{yearly ? '$40' : '$5'}</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)' }}>{yearly ? 'per year' : 'per month'}</span>
          {yearly && <span className="tag tag-accent" style={{ marginLeft: 'auto' }}>Save 33%</span>}
        </div>
        <table className="table" style={{ marginTop: 14, fontSize: 13.5 }}>
          <tbody>
            <tr><td style={{ color: 'var(--text-muted)', paddingLeft: 0 }}>Billed</td><td style={{ textAlign: 'right', fontWeight: 600, paddingRight: 0 }}>{yearly ? '$40 once a year' : '$5 every month'}</td></tr>
            <tr><td style={{ color: 'var(--text-muted)', paddingLeft: 0 }}>Per week</td><td style={{ textAlign: 'right', fontWeight: 600, paddingRight: 0 }}>{yearly ? '$0.77' : '$1.15'}</td></tr>
            <tr><td style={{ color: 'var(--text-muted)', paddingLeft: 0 }}>File attachments</td><td style={{ textAlign: 'right', fontWeight: 600, paddingRight: 0 }}>Included</td></tr>
            <tr><td style={{ color: 'var(--text-muted)', paddingLeft: 0 }}>Cancel anytime</td><td style={{ textAlign: 'right', fontWeight: 600, paddingRight: 0 }}>Yes</td></tr>
          </tbody>
        </table>
      </div>

      {error && (
        <span role="alert" className="msg msg-error">{error}</span>
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

      <span style={{ fontSize: 12, color: 'var(--text-subtle)', textAlign: 'center', lineHeight: 1.5 }}>
        The core app never has a paid tier. That would defeat the point.
      </span>
    </div>
  );
}
