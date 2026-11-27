import React from 'react';
import { Link } from 'react-router-dom';

// Native apps show access information and the free sample, never external billing.
export default function SageComingSoonCard() {
  return (
    <div className="panel">
      <div className="panel-head">Sage access</div>
      <div className="panel-body" style={{ display: 'grid', gap: 14 }}>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: 'var(--ink-2)' }}>
          Existing subscribers can use Sage by signing in to their account. Subscriptions are not available in this app.
        </p>
        <Link to="/sage#sage-free-sample" className="btn btn-secondary">Try a free Sage question</Link>
        <span className="meta">Pathways' free features remain available.</span>
      </div>
    </div>
  );
}
