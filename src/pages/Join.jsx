import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useProfile } from '@/lib/useProfile';
import { Spinner } from '@/components/RequireAuth';
import GoogleIcon from '@/components/GoogleIcon';

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

  // Where sign-in should drop the user: straight into onboarding, which then
  // hands off to the real app. This is the step that used to be missing, which
  // is why finishing signup bounced people back to the landing page.
  const returnTo = `/onboarding${plan ? `?plan=${plan}` : ''}`;

  if (isLoadingPublicSettings || isLoadingAuth) return <Spinner />;

  // Someone already signed in should never be shown a signup form.
  if (isAuthenticated) {
    if (isLoadingProfile) return <Spinner />;
    return <Navigate to={isOnboarded ? '/app' : returnTo} replace />;
  }

  const continueWithGoogle = () => {
    base44.auth.loginWithProvider('google', returnTo);
  };

  return (
    <section style={{ padding: 'clamp(32px,6vh,72px) 0' }}>
      <span className="tag tag-accent-2">Free for every student, forever</span>
      <h1 style={{ fontSize: 'clamp(30px,4vw,48px)', maxWidth: '20ch', margin: '14px 0 10px', textWrap: 'balance' }}>
        Start your path, it's free.
      </h1>
      <p style={{ maxWidth: '52ch', color: 'var(--color-neutral-800)', marginBottom: 26 }}>
        Create your account and we'll match you with mentors who've been exactly where you are.
      </p>

      <div
        className="grid items-start"
        style={{ gridTemplateColumns: 'minmax(0,6fr) minmax(0,5fr)', gap: 'clamp(20px,4vw,48px)', maxWidth: 900 }}
      >
        <div className="card elev-sm" style={{ padding: 28, gap: 16 }}>
          <button
            type="button"
            onClick={continueWithGoogle}
            className="btn btn-primary btn-block"
            style={{ minHeight: 48, fontSize: 15, gap: 10 }}
          >
            <span
              className="flex items-center justify-center"
              style={{ width: 22, height: 22, borderRadius: 999, background: '#fff', flex: 'none' }}
            >
              <GoogleIcon className="w-4 h-4" />
            </span>
            Continue with Google
          </button>

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
            <Link to={`/login?returnTo=${encodeURIComponent(returnTo)}`} style={{ color: 'var(--color-accent-700)' }}>
              Log in
            </Link>
          </span>

          <span style={{ fontSize: 11.5, color: 'var(--color-neutral-600)', textAlign: 'center', lineHeight: 1.5 }}>
            14+ · COPPA and FERPA aligned · We never sell student data
            <br />
            By joining you agree to our{' '}
            <Link to="/terms" style={{ color: 'var(--color-accent-700)' }}>Terms</Link> and{' '}
            <Link to="/privacy" style={{ color: 'var(--color-accent-700)' }}>Privacy Policy</Link>.
          </span>
        </div>

        <div className="flex flex-col" style={{ gap: 12, paddingTop: 6 }}>
          <span className="card-kicker">What you get</span>
          {perks.map((t) => (
            <span key={t} className="flex gap-[9px] items-start" style={{ fontSize: 14.5, lineHeight: 1.5 }}>
              <svg
                width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="var(--color-accent-2-700)" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"
                style={{ flex: 'none', marginTop: 4 }}
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              {t}
            </span>
          ))}
          {plan && (
            <span className="tag tag-accent" style={{ alignSelf: 'flex-start', marginTop: 6 }}>
              Sage {plan === 'sage_yearly' ? '$40 / year' : '$5 / month'} selected
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
