import React from 'react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <header
      className="grid items-center"
      style={{
        gridTemplateColumns: 'minmax(0,7fr) minmax(0,5fr)',
        gap: 'clamp(24px,4vw,56px)',
        padding: 'clamp(36px,7vh,84px) 0 clamp(30px,6vh,64px)',
      }}
    >
      <div className="anim-fade-up">
        <span className="tag tag-accent-2">Free for every student, forever</span>
        <h1 style={{ fontSize: 'clamp(38px,5.2vw,62px)', lineHeight: 1.06, margin: '14px 0 18px', textWrap: 'balance' }}>
          Every student deserves someone who's been there.
        </h1>
        <p style={{ fontSize: 'clamp(15px,1.4vw,18px)', maxWidth: '52ch', color: 'var(--color-neutral-800)', marginBottom: 26 }}>
          Pathways gives every high schooler real, firsthand guidance on college and careers from students, professors, and
          counselors who actually did it. No private counselor required. No addiction loops. Just people who help.
        </p>
        <div className="flex gap-3 items-center flex-wrap">
          <Link to="/join" className="btn btn-primary" style={{ fontSize: 16, padding: '14px 30px' }}>
            Start your path, it's free
          </Link>
          <Link to="/how-it-works" className="btn btn-ghost" style={{ fontSize: 15 }}>See how it works</Link>
        </div>
        <p style={{ margin: '18px 0 0', fontSize: 12.5, color: 'var(--color-neutral-600)' }}>
          Your journey. Your community. Your future.
        </p>
      </div>
      <div className="relative anim-fade-up" style={{ animationDelay: '.15s' }}>
        <div
          className="relative overflow-hidden"
          style={{
            aspectRatio: '4 / 4.6',
            borderRadius: '44% 56% 52% 48% / 52% 46% 54% 48%',
            background: 'linear-gradient(150deg, var(--color-accent-2-400), var(--color-accent-300) 55%, var(--color-accent-400))',
          }}
        >
          <img
            src="https://media.base44.com/images/public/6a7ac32706b0616cd94b0ec7/3041b5321_images7.jpeg"
            alt="A Pathways student"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: '44% center', filter: 'brightness(1.08) contrast(1.05) saturate(1.05)' }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(150deg, rgba(174,191,146,0.18), rgba(255,198,165,0.08) 55%, rgba(246,160,107,0.22))', mixBlendMode: 'soft-light' }}
          />
        </div>
        <div className="card elev-lg anim-drift" style={{ position: 'absolute', left: -14, bottom: 34, width: 230, padding: '14px 16px', gap: 6 }}>
          <span className="card-kicker">Connected</span>
          <span style={{ fontSize: 13, lineHeight: 1.45 }}>
            <b>Sofia, CMU first-year</b> accepted your connect request. Ask her anything.
          </span>
        </div>
        <div className="card elev-md anim-drift-slow" style={{ position: 'absolute', right: -8, top: 26, padding: '10px 16px', gap: 2 }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 20 }}>
            4.8 <span style={{ fontSize: 12, color: 'var(--color-accent-700)' }}>★</span>
          </span>
          <span style={{ fontSize: 11, color: 'var(--color-neutral-700)' }}>avg. mentor rating</span>
        </div>
      </div>
    </header>
  );
}