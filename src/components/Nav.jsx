import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import BrandMark from '@/components/BrandMark';
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
    <nav className="flex items-center gap-4 sm:gap-[26px] py-[22px] flex-wrap">
      <Link to="/" className="flex items-center gap-[9px] mr-auto no-underline text-inherit">
        <BrandMark size={38} />
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 21 }}>Pathways</span>
      </Link>
      {tabs.map((t) => {
        const on = pathname === t.to;
        return (
          <Link
            key={t.to}
            to={t.to}
            className="no-underline pb-[3px] hover:!text-[var(--color-accent-600)]"
            style={{
              fontSize: 14,
              color: on ? 'var(--color-accent-700)' : 'var(--color-text)',
              fontWeight: on ? 700 : 400,
              borderBottom: `2px solid ${on ? 'var(--color-accent)' : 'transparent'}`,
            }}
          >
            {t.label}
          </Link>
        );
      })}

      {/* Reflect real auth state. Showing a permanent "Join free" to someone who
          is already signed in is what makes an app feel stuck in a login loop. */}
      {checking ? (
        <span style={{ width: 92, height: 34 }} aria-hidden="true" />
      ) : isAuthenticated ? (
        <Link to={isOnboarded ? '/app' : '/onboarding'} className="btn btn-primary">
          {first ? `Open Pathways, ${first}` : 'Open Pathways'}
        </Link>
      ) : (
        <>
          <Link to="/login" className="no-underline pb-[3px]" style={{ fontSize: 14, color: 'var(--color-text)' }}>
            Log in
          </Link>
          <Link to="/join" className="btn btn-primary">Join free</Link>
        </>
      )}
    </nav>
  );
}
