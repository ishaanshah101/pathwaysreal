import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import BrandMark from '@/components/BrandMark';
import GoogleButton from '@/components/GoogleButton';
import { useAuth } from '@/lib/AuthContext';
import { useProfile } from '@/lib/useProfile';

const tabs = [
  { to: '/how-it-works', label: 'How it works' },
  { to: '/sage', label: 'Sage' },
  { to: '/faq', label: 'FAQ' },
];

export default function Nav() {
  const { pathname } = useLocation();
  const { isAuthenticated, isLoadingAuth, isLoadingPublicSettings } = useAuth();
  const { isOnboarded, isLoadingProfile, profile } = useProfile();

  const checking = isLoadingPublicSettings || isLoadingAuth || (isAuthenticated && isLoadingProfile);
  const first = (profile?.full_name || '').split(' ')[0];

  return (
    <nav
      className="site-nav flex items-center flex-wrap"
      style={{ paddingTop: 18, paddingBottom: 18, gap: '10px 16px' }}
      aria-label="Primary"
    >
      <Link to="/" className="flex items-center gap-[10px] mr-auto no-underline text-inherit">
        <BrandMark size={34} />
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 20, letterSpacing: '-0.01em' }}>Pathways</span>
      </Link>

      <div className="nav-links flex items-center" style={{ gap: 24 }}>
      {tabs.map((t) => {
        const on = pathname === t.to;
        return (
          <Link
            key={t.to}
            to={t.to}
            aria-current={on ? 'page' : undefined}
            className="no-underline"
            style={{
              fontSize: 14.5,
              fontWeight: 500,
              color: on ? 'var(--color-text)' : 'var(--text-muted)',
              paddingBottom: 2,
              borderBottom: on ? '2px solid var(--color-accent)' : '2px solid transparent',
              transition: 'color .18s ease',
            }}
          >
            {t.label}
          </Link>
        );
      })}
      </div>

      <div className="nav-actions flex items-center" style={{ gap: 10 }}>
      {checking ? (
        <span style={{ width: 150, height: 38 }} aria-hidden="true" />
      ) : isAuthenticated ? (
        <Link to={isOnboarded ? '/app' : '/onboarding'} className="btn btn-primary">
          {first ? `Open Pathways, ${first}` : 'Open Pathways'}
        </Link>
      ) : (
        <>
          {/* One click signs an existing member back in and sends a new one to
              sign-up. Someone who lands back here by accident never has to
              re-enter anything. */}
          <GoogleButton label="Log in" variant="secondary" size="sm" returnTo="/" />
          <Link to="/join" className="btn btn-primary">Join free</Link>
        </>
      )}
      </div>
    </nav>
  );
}