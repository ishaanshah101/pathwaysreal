import React from 'react';

// The top of every signed-in page: a line of small print, the title, one
// sentence, and whatever the page's main action is. Same place, same size,
// every time.
export default function PageHead({ kicker = '', title, sub = null, children = null, live = false }) {
  return (
    <header className="page-head">
      <div style={{ minWidth: 0 }}>
        {kicker && <span className="kicker">{kicker}</span>}
        <h1>{title}</h1>
        {sub && <p aria-live={live ? 'polite' : undefined}>{sub}</p>}
      </div>
      {children && <div className="page-head-actions">{children}</div>}
    </header>
  );
}
