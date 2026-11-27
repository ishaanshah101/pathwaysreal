import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useProfile } from '@/lib/useProfile';
import BrandMark from '@/components/BrandMark';

// The full-screen wait: the mark with its lane dashes running, and a short
// piece of lane line under it. With motion turned off the dashes hold still
// and the word "Loading" shows instead.
function Spinner() {
  return (
    <div className="pw-loading" role="status">
      <BrandMark size={72} aria-hidden="true" />
      <span className="lane-load" aria-hidden="true" />
      <span className="pw-loading-word">Loading</span>
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
