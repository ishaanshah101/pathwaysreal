import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import Seo from '@/components/Seo';
import GoogleButton from '@/components/GoogleButton';
import { useAuth } from '@/lib/AuthContext';
import { useProfile } from '@/lib/useProfile';
import { Spinner } from '@/components/RequireAuth';

const perks = [
  'A feed of real, firsthand advice, no short-form loops',
  'Connect and message students, professors, and counselors',
  'Sage, your AI advisor, ready with your grade and goals',
  'Free forever for every student',
];

export default function Join() {
  const { isAuthenticated, isLoadingAuth, isLoadingPublicSettings } = useAuth();
  const { isLoadingProfile, isOnboarded } = useProfile();

  const planFromUrl = new URLSearchParams(window.location.search).get('plan');
  const plan = ['sage_monthly', 'sage_yearly'].includes(planFromUrl) ? planFromUrl : null;
  const returnTo = `/onboarding${plan ? `?plan=${plan}` : ''}`;

  if (isLoadingPublicSettings || isLoadingAuth) return <Spinner />;

  if (isAuthenticated) {
    if (isLoadingProfile) return <Spinner />;
    return <Navigate to={isOnboarded ? '/app' : returnTo} replace />;
  }

  return (
    <>
      <Seo
        title="Join Pathways Free — College Guidance for High School Students"
        description="Create a free Pathways account with Google or email and get matched with students, professors, and counselors who've been exactly where you are."
        path="/join"
      />

      <section style={{ padding: 'clamp(28px,6vh,64px) 0 clamp(36px,6vh,64px)' }}>
        <h1 style={{ fontSize: 'clamp(32px,4.4vw,52px)', maxWidth: '18ch', margin: '0 0 14px', textWrap: 'balance' }}>
          Start your path, it's free.
        </h1>
        <p style={{ maxWidth: '50ch', color: 'var(--color-neutral-800)', fontSize: 'clamp(15.5px,1.3vw,17px)', lineHeight: 1.6, marginBottom: 32 }}>
          Create your account and we'll match you with mentors who've been exactly where you are.
          Free for every student, forever.
        </p>

        <div
          className="grid items-start app-split"
          style={{ gridTemplateColumns: 'minmax(0,6fr) minmax(0,5fr)', gap: 'clamp(24px,4vw,52px)', maxWidth: 900 }}
        >
          <div className="card elev-sm" style={{ padding: 28, gap: 16 }}>
            {/* Google covers both cases: a returning member is signed straight
                back in, a new one goes on to set up a profile. */}
            <GoogleButton label="Continue with Google" returnTo={returnTo} block />

            <div className="relative" style={{ margin: '2px 0' }}>
              <div style={{ borderTop: '1px solid var(--color-divider)' }} />
              <span
                style={{
                  position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--color-surface)', padding: '0 12px', fontSize: 11,
                  letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-neutral-600)',
                }}
              >
                or
              </span>
            </div>

            <Link
              to={`/register?returnTo=${encodeURIComponent(returnTo)}`}
              className="btn btn-secondary btn-block no-underline"
              style={{ minHeight: 46, fontSize: 14.5 }}
            >
              Sign up with email
            </Link>

            <span style={{ fontSize: 13.5, textAlign: 'center', color: 'var(--color-neutral-700)' }}>
              Already have an account?{' '}
              <Link to={`/login?returnTo=${encodeURIComponent('/')}`} style={{ color: 'var(--color-accent-700)', fontWeight: 600 }}>
                Log in
              </Link>
            </span>

            <span style={{ fontSize: 11.5, color: 'var(--color-neutral-600)', textAlign: 'center', lineHeight: 1.55 }}>
              13+ · COPPA and FERPA aligned · We never sell student data
              <br />
              By joining you agree to our{' '}
              <Link to="/terms" style={{ color: 'var(--color-accent-700)' }}>Terms</Link> and{' '}
              <Link to="/privacy" style={{ color: 'var(--color-accent-700)' }}>Privacy Policy</Link>.
            </span>
          </div>

          <div className="flex flex-col" style={{ gap: 13, paddingTop: 6 }}>
            <h2 className="card-kicker" style={{ margin: 0 }}>What you get</h2>
            {perks.map((t) => (
              <span key={t} className="flex gap-[10px] items-start" style={{ fontSize: 14.5, lineHeight: 1.5 }}>
                <svg
                  width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="var(--color-accent-2-700)" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"
                  style={{ flex: 'none', marginTop: 4 }} aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {t}
              </span>
            ))}
            {plan && (
              <span className="tag tag-accent" style={{ alignSelf: 'flex-start', marginTop: 8 }}>
                Sage {plan === 'sage_yearly' ? '$40 / year' : '$5 / month'} selected
              </span>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
