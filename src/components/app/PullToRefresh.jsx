import React, { useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';

// Swipe down at the top of a list to reload it, the way every native app works.
// Touch only: a mouse has a real refresh affordance already, and hijacking
// wheel scrolling on desktop would be worse than useless.
const TRIGGER = 64;

export default function PullToRefresh({ onRefresh, children }) {
  const [pull, setPull] = useState(0);
  const [busy, setBusy] = useState(false);
  const startY = useRef(null);

  const start = (e) => {
    if (busy) return;
    const atTop = (window.scrollY || document.documentElement.scrollTop || 0) <= 0;
    startY.current = atTop ? e.touches[0].clientY : null;
  };

  const move = (e) => {
    if (startY.current === null || busy) return;
    const dy = e.touches[0].clientY - startY.current;
    // Halved, so the sheet follows the finger without running away with it.
    setPull(dy > 0 ? Math.min(dy * 0.5, 88) : 0);
  };

  const end = async () => {
    const fire = pull >= TRIGGER && !busy;
    startY.current = null;
    if (!fire) { setPull(0); return; }
    setBusy(true);
    setPull(TRIGGER);
    try { await onRefresh(); } catch { /* the list keeps whatever it had */ }
    setBusy(false);
    setPull(0);
  };

  const armed = pull >= TRIGGER;

  return (
    <div onTouchStart={start} onTouchMove={move} onTouchEnd={end} onTouchCancel={end}>
      <div
        aria-hidden={!busy}
        className="flex items-center justify-center"
        style={{
          height: pull,
          overflow: 'hidden',
          color: 'var(--text-muted)',
          transition: startY.current === null ? 'height .2s ease' : 'none',
        }}
      >
        <RefreshCw
          size={18}
          className={busy ? 'animate-spin' : undefined}
          style={{ transform: `rotate(${armed ? 180 : pull * 2}deg)`, opacity: Math.min(pull / TRIGGER, 1) }}
        />
      </div>
      {children}
    </div>
  );
}