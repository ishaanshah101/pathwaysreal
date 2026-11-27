import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import Seo from '@/components/Seo';
import GoogleButton from '@/components/GoogleButton';
import { useAuth } from '@/lib/AuthContext';
import { useProfile } from '@/lib/useProfile';
import { Spinner } from '@/components/RequireAuth';
import { isNativeApp } from '@/lib/platform';
import Sign from '@/components/kit/Sign';

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
  const plan = !isNativeApp() && ['sage_monthly', 'sage_yearly'].includes(planFromUrl) ? planFromUrl : null;
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

      <section className="band gridded">
        <div className="wrap join-grid">
          <div>
            <span className="kicker kicker-sun">On-ramp</span>
            <h1 className="title-1" style={{ maxWidth: '12ch' }}>Start your path. It's free.</h1>
            <p className="lede" style={{ marginTop: 20 }}>
              Create your account and we'll match you with mentors who've been exactly where you
              are. Free for every student, forever.
            </p>
            <h2 className="kicker" style={{ margin: '34px 0 0' }}>What you get</h2>
            <ul className="checklist" style={{ marginTop: 14 }}>
              {perks.map((t) => <li key={t}>{t}</li>)}
            </ul>
            {plan && (
              <p style={{ marginTop: 22 }}>
                <Sign color="yellow">Sage {plan === 'sage_yearly' ? '$40 / year' : '$5 / month'} selected</Sign>
              </p>
            )}
          </div>

          <div className="join-card">
            {/* Google covers both cases: a returning member is signed straight
                back in, a new one goes on to set up a profile. */}
            <GoogleButton label="Continue with Google" returnTo={returnTo} block />

            <div className="or-rule">or</div>

            <Link to={`/register?returnTo=${encodeURIComponent(returnTo)}`} className="btn btn-secondary btn-lg btn-block">
              Sign up with email
            </Link>

            <p style={{ margin: 0, fontSize: 15, textAlign: 'center', color: 'var(--ink-2)' }}>
              Already have an account?{' '}
              <Link to={`/login?returnTo=${encodeURIComponent('/')}`} style={{ fontWeight: 800 }}>Log in</Link>
            </p>

            <p className="meta" style={{ margin: 0, textAlign: 'center', lineHeight: 1.6 }}>
              13+ · COPPA and FERPA aligned · We never sell student data
              <br />
              By joining you agree to our <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}