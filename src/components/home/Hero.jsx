import React from 'react';
import { Link } from 'react-router-dom';
import { signInWithGoogle } from '@/lib/googleAuth';
import { Image } from '@/components/ui/image';

export default function Hero() {
  return (
    <header
      className="grid items-center"
      style={{
        gridTemplateColumns: 'minmax(0,7fr) minmax(0,5fr)',
        gap: 'clamp(24px,4vw,64px)',
        padding: 'clamp(32px,7vh,80px) 0 clamp(28px,5vh,56px)',
      }}
    >
      <div className="anim-fade-up">
        {/* One headline, one paragraph, one primary action. The "free forever"
            promise lives inside the sentence that earns it, not as a separate
            badge competing with the headline for attention. */}
        <span className="card-kicker" style={{ display: 'block', marginBottom: 16 }}>Free college and career guidance</span>
        <h1 style={{ fontSize: 'clamp(38px,5.2vw,62px)', lineHeight: 1.05, margin: '0 0 20px', textWrap: 'balance' }}>
          Every student deserves someone who's been there.
        </h1>
        <p style={{ fontSize: 'clamp(16px,1.4vw,18.5px)', maxWidth: '50ch', color: 'var(--color-neutral-800)', margin: '0 0 28px', lineHeight: 1.6 }}>
          Pathways gives every high schooler real, firsthand guidance on college and careers from
          students, professors, and counselors who actually did it. Free for every student, forever.
        </p>

        <div className="flex gap-3 items-center flex-wrap">
          <Link to="/join" className="btn btn-primary btn-lg" style={{ fontSize: 15.5, padding: '13px 26px' }}>
            Start your path, it's free
          </Link>
          <Link to="/how-it-works" className="btn btn-secondary btn-lg" style={{ fontSize: 15 }}>
            See how it works
          </Link>
        </div>

        <p style={{ margin: '18px 0 0', fontSize: 13.5, color: 'var(--color-neutral-700)' }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => signInWithGoogle('/')}
            style={{
              background: 'none', border: 0, padding: 0, font: 'inherit', cursor: 'pointer',
              color: 'var(--color-accent-700)', fontWeight: 600, textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            Log in with Google
          </button>
        </p>
      </div>

      <div className="anim-fade-up" style={{ animationDelay: '.15s' }}>
        {/* Keep the photo and its floating pricing card in one positioning context. */}
        <div className="relative">
          <div
            className="relative overflow-hidden"
            style={{
              aspectRatio: '4 / 4.6',
              borderRadius: 4,
              background: 'var(--color-accent-200)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <Image
              src="https://media.base44.com/images/public/6a7ac32706b0616cd94b0ec7/3041b5321_images7.jpeg"
              alt="Student featured on the Pathways homepage"
              width={520}
              height={598}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              fittingType="fill"
              focalPointX={0.44}
              focalPointY={0.5}
              quality={82}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ filter: 'brightness(1.08) contrast(1.05) saturate(1.05)' }}
            />
          </div>
          <div className="card elev-md hero-float-right" style={{ position: 'absolute', right: -12, top: 22, padding: '10px 16px', gap: 2 }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 22, lineHeight: 1 }}>
              $0 <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12, color: 'var(--color-accent-700)' }}>forever</span>
            </span>
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>the core app, for every student</span>
          </div>
        </div>
      </div>
    </header>
  );
}