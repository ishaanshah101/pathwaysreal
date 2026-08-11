import React from 'react';
import { Link } from 'react-router-dom';
import Reveal from '@/components/Reveal';

export default function FinalCta() {
  return (
    <Reveal as="section" style={{ padding: 'clamp(40px,8vh,90px) 0' }}>
      <h2 style={{ fontSize: 'clamp(30px,4vw,48px)', maxWidth: '20ch', textWrap: 'balance', marginBottom: 14 }}>
        The question isn't who gets in. It's who knows how to apply.
      </h2>
      <p style={{ maxWidth: '52ch', color: 'var(--color-neutral-800)', marginBottom: 24 }}>
        Join students, educators, and counselors who believe guidance shouldn't depend on your zip code.
      </p>
      <Link to="/join" className="btn btn-primary" style={{ fontSize: 16, padding: '14px 30px' }}>Join Pathways free</Link>
    </Reveal>
  );
}