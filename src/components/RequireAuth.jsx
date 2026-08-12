import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useProfile } from '@/lib/useProfile';

function Spinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
      <div
        className="rounded-full animate-spin"
        style={{ width: 34, height: 34, border: '4px solid var(--color-accent-200)', borderTopColor: 'var(--color-accent)' }}
      />
    </div>
  );
}

// Gate for everything behind sign-in. Sends real, unauthenticated visitors to
// Base44's login and everyone else onward, so a refresh mid-session lands back
// where the user was instead of bouncing to the marketing site.
export default function RequireAuth({ children, requireOnboarded = false }) {
  const { isAuthenticated, isLoadingAuth, isLoadingPublicSettings } = useAuth();
  const { isLoadingProfile, isOnboarded } = useProfile();
  const location = useLocation();

  const stillChecking = isLoadingPublicSettings || isLoadingAuth;

  useEffect(() => {
    if (!stillChecking && !isAuthenticated) {
      const returnTo = location.pathname + location.search;
      window.location.href = `/login?returnTo=${encodeURIComponent(returnTo)}`;
    }
  }, [stillChecking, isAuthenticated, location.pathname, location.search]);

  if (stillChecking) return <Spinner />;
  if (!isAuthenticated) return <Spinner />;
  if (isLoadingProfile) return <Spinner />;
  if (requireOnboarded && !isOnboarded) return <Navigate to="/onboarding" replace />;

  return children;
}

export { Spinner };
