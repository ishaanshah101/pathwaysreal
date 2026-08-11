import React, { useEffect, useRef, useState } from 'react';

export default function Reveal({ as: Tag = 'div', style, children, from = 'y', ...rest }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.18 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hidden = from === 'y' ? 'translateY(22px)' : `translateX(${from})`;

  return (
    <Tag
      ref={ref}
      style={{
        opacity: seen ? 1 : 0,
        transform: seen ? 'none' : hidden,
        transition: 'opacity .7s ease, transform .7s cubic-bezier(.2,.7,.2,1), box-shadow .2s',
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}