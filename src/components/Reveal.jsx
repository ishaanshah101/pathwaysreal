import React, { useEffect, useRef, useState } from 'react';

// A gentle enter animation for sections further down a marketing page.
//
// The previous version hid every wrapped section at opacity 0 until 18% of it
// was on screen, then faded it in over 700ms. At normal scrolling speed that
// meant whole sections of ghost text, and on the Sage page the entire hero was
// invisible for over two seconds after load. Three rules now:
//
//   1. Anything already in or near the viewport when it mounts shows at once.
//   2. The observer fires 240px before the element enters the viewport, so by
//      the time you can see it, it is already there.
//   3. The animation is 320ms and moves 10px, which is enough to feel alive
//      and short enough never to look like a loading failure.
//
// Reduced-motion users get no animation at all: the element simply renders.

const prefersReducedMotion = () =>
  typeof window !== 'undefined'
  && window.matchMedia
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Reveal({ as: Tag = 'div', style, children, from = 'y', ...rest }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(() => prefersReducedMotion());

  useEffect(() => {
    if (seen) return undefined;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setSeen(true); return undefined; }

    // If it is already on screen at mount, do not make the reader wait.
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight + 240 && r.bottom > -240) { setSeen(true); return undefined; }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0, rootMargin: '240px 0px 240px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);

  const hidden = from === 'y' ? 'translateY(10px)' : `translateX(${from})`;

  return (
    <Tag
      ref={ref}
      style={{
        opacity: seen ? 1 : 0,
        transform: seen ? 'none' : hidden,
        transition: 'opacity .32s ease, transform .32s cubic-bezier(.2,.7,.2,1), box-shadow .2s',
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
