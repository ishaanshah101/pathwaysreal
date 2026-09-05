import React from 'react';
import { Link } from 'react-router-dom';
import Reveal from '@/components/Reveal';

export default function FinalCta() {
  return (
    <Reveal as="section" style={{ padding: 'clamp(24px,5vh,56px) 0 clamp(40px,7vh,80px)' }}>
      <div
        className="card elev-md"
        style={{ padding: 'clamp(32px,5vw,56px)', gap: 16, alignItems: 'flex-start', background: 'var(--color-ink)', borderColor: 'var(--color-ink)', color: 'var(--color-bg)' }}
      >
        <h2 style={{ fontSize: 'clamp(28px,3.8vw,44px)', maxWidth: '22ch', textWrap: 'balance', margin: 0, color: 'var(--color-bg)' }}>
          The question isn't who gets in. It's who knows how to apply.
        </h2>
        <p style={{ maxWidth: '52ch', margin: 0, fontSize: 16, lineHeight: 1.6, color: 'rgba(245,234,216,0.78)' }}>
          Join students, educators, and counselors who believe guidance shouldn't depend on your zip code.
        </p>
        <Link
          to="/join"
          className="btn btn-lg no-underline"
          style={{ background: 'var(--color-bg)', color: 'var(--color-ink)', borderColor: 'var(--color-bg)', fontSize: 15.5, marginTop: 6 }}
        >
          Join Pathways free
        </Link>
      </div>
    </Reveal>
  );
}