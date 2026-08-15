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
      className="flex items-center gap-4 sm:gap-[26px] flex-wrap"
      style={{ paddingTop: 20, paddingBottom: 20 }}
    >
      <Link to="/" className="flex items-center gap-[10px] mr-auto no-underline text-inherit">
        <BrandMark size={42} />
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 21 }}>Pathways</span>
      </Link>

      {tabs.map((t) => {
        const on = pathname === t.to;
        return (
          <Link
            key={t.to}
            to={t.to}
            aria-current={on ? 'page' : undefined}
            className="no-underline hover:!text-[var(--color-accent-600)]"
            style={{
              fontSize: 14.5,
              color: on ? 'var(--color-accent-700)' : 'var(--color-text)',
              fontWeight: on ? 600 : 400,
            }}
          >
            {t.label}
          </Link>
        );
      })}

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
    </nav>
  );
}