import React from 'react';
import { Link } from 'react-router-dom';
import { signInWithGoogle } from '@/lib/googleAuth';
import { parseWixMediaUrl, buildTransformUrl, buildSrcSet } from '@/components/ui/image-helpers';

// Serve a resized, WebP-encoded hero at the rendered size (plus 2x/3x for
// retina) instead of the full-resolution original JPEG. The crop focal point
// matches the old object-position so the framing stays identical.
const HERO_SRC = 'https://media.base44.com/images/public/6a7ac32706b0616cd94b0ec7/3041b5321_images7.jpeg';
const heroParsed = parseWixMediaUrl(HERO_SRC);
const heroOpts = { width: 560, height: 644, crop: true, focalPoint: { x: 0.44, y: 0.5 }, quality: 82 };
const heroSrc = heroParsed ? buildTransformUrl(heroParsed, heroOpts) : HERO_SRC;
const heroSrcSet = heroParsed ? buildSrcSet(heroParsed, heroOpts) : undefined;

export default function Hero() {
  return (
    <header
      className="grid items-center"
      style={{
        gridTemplateColumns: 'minmax(0,7fr) minmax(0,5fr)',
        gap: 'clamp(24px,4vw,64px)',
        padding: 'clamp(28px,6vh,72px) 0 clamp(28px,5vh,56px)',
      }}
    >
      <div className="anim-fade-up">
        {/* One headline, one paragraph, one primary action. The "free forever"
            promise lives inside the sentence that earns it, not as a separate
            badge competing with the headline for attention. */}
        <h1 style={{ fontSize: 'clamp(38px,5.2vw,62px)', lineHeight: 1.06, margin: '0 0 20px', textWrap: 'balance' }}>
          Every student deserves someone who's been there.
        </h1>
        <p style={{ fontSize: 'clamp(16px,1.4vw,18.5px)', maxWidth: '50ch', color: 'var(--color-neutral-800)', margin: '0 0 28px', lineHeight: 1.6 }}>
          Pathways gives every high schooler real, firsthand guidance on college and careers from
          students, professors, and counselors who actually did it. Free for every student, forever.
        </p>

        <div className="flex gap-3 items-center flex-wrap">
          <Link to="/join" className="btn btn-primary" style={{ fontSize: 16, padding: '14px 30px' }}>
            Start your path, it's free
          </Link>
          <Link to="/how-it-works" className="btn btn-ghost" style={{ fontSize: 15 }}>
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
            src={heroSrc}
            srcSet={heroSrcSet}
            sizes="(min-width: 860px) 42vw, 92vw"
            alt="A high school student who found a mentor through Pathways"
            width="520"
            height="598"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'brightness(1.08) contrast(1.05) saturate(1.05)' }}
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
            $0 <span style={{ fontSize: 12, color: 'var(--color-accent-700)' }}>forever</span>
          </span>
          <span style={{ fontSize: 11, color: 'var(--color-neutral-700)' }}>every student, every feature</span>
        </div>
        {/* Same standard as the quote and story sections below: the cards
            floating on the photo are a preview of the product, not a record of
            something that happened, so they say so. */}
        <p style={{ fontSize: 11.5, color: 'var(--color-neutral-600)', margin: '12px 4px 0' }}>
          Illustrative preview of a Pathways connection.
        </p>
      </div>
    </header>
  );
}