import React from 'react';
import { Sparkles } from 'lucide-react';
import { SAGE_PRICES } from '@/lib/useSubscription';

// Shown in place of the pricing card when Pathways is running inside a native
// wrapper. It deliberately contains no checkout button and no link to any
// payment page, because an iOS app may only sell a subscription through the
// App Store. Prices are still stated, which is allowed, so the offer is honest.
export default function SageComingSoonCard() {
  return (
    <div className="card elev-md" style={{ padding: 'clamp(22px,3vw,28px)', gap: 14 }}>
      <span className="card-kicker">Sage subscription</span>
      <div className="flex items-baseline gap-2 flex-wrap">
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(34px,4.4vw,46px)', lineHeight: 1 }}>
          {SAGE_PRICES.sage_monthly.amount}
        </span>
        <span style={{ fontSize: 15, color: 'var(--text-muted)' }}>{SAGE_PRICES.sage_monthly.cadence}</span>
      </div>
      <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: 'var(--text-muted)' }}>
        Subscribing from this device is coming soon. Everything else on Pathways is free and works
        here already.
      </p>
      <span
        className="btn btn-secondary btn-block btn-lg"
        aria-disabled="true"
        style={{ gap: 8, cursor: 'default', opacity: 0.7 }}
      >
        <Sparkles size={17} aria-hidden="true" /> Coming soon
      </span>
      <span style={{ fontSize: 12, color: 'var(--text-subtle)', textAlign: 'center', lineHeight: 1.55 }}>
        If you already subscribe to Sage, it unlocks here automatically.
      </span>
    </div>
  );
}