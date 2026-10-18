import React from 'react';
import { Link } from 'react-router-dom';

// Native apps show access information and the free sample, never external billing.
export default function SageComingSoonCard() {
  return (
    <div className="card elev-md" style={{ padding: 'clamp(22px,3vw,28px)', gap: 14 }}>
      <span className="card-kicker">Sage access</span>
      <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: 'var(--text-muted)' }}>
        Existing subscribers can use Sage by signing in to their account. Subscriptions are not available in this app.
      </p>
      <Link to="/sage#sage-free-sample" className="btn btn-secondary no-underline">Try a free Sage question</Link>
      <span style={{ fontSize: 12, color: 'var(--text-subtle)', lineHeight: 1.55 }}>
        Pathways' free features remain available.
      </span>
    </div>
  );
}