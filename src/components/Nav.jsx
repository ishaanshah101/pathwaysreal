import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import BrandMark from '@/components/BrandMark';
import GoogleButton from '@/components/GoogleButton';
import Icon from '@/components/kit/Icon';
import { useAuth } from '@/lib/AuthContext';
import { useProfile } from '@/lib/useProfile';

const links = [
  { to: '/how-it-works', label: 'How it works' },
  { to: '/by-grade', label: 'By grade' },
  { to: '/glossary', label: 'Glossary' },
  { to: '/sage', label: 'Sage' },
  { to: '/faq', label: 'FAQ' },
];

export default function Nav() {
  const { pathname } = useLocation();
  const { isAuthenticated, isLoadingAuth, isLoadingPublicSettings } = useAuth();
  const { isOnboarded, isLoadingProfile, profile } = useProfile();
  const [open, setOpen] = useState(false);

  // The sheet belongs to the page it was opened on.
  useEffect(() => { setOpen(false); }, [pathname]);

  const checking = isLoadingPublicSettings || isLoadingAuth || (isAuthenticated && isLoadingProfile);
  const first = (profile?.full_name || '').split(' ')[0];

  return (
    <header className="site-nav">
      <nav className="wrap site-nav-inner" aria-label="Primary">
        <Link to="/" className="brand" aria-label="Pathways home">
          <BrandMark size={38} />
          <span className="brand-name">Pathways</span>
        </Link>

        <div className="site-links">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="site-link" aria-current={pathname === l.to ? 'page' : undefined}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="site-actions">
          {checking ? (
            <span style={{ width: 150, height: 44 }} aria-hidden="true" />
          ) : isAuthenticated ? (
            <Link to={isOnboarded ? '/app' : '/onboarding'} className="btn btn-primary btn-go">
              {first ? `Open Pathways, ${first}` : 'Open Pathways'}
            </Link>
          ) : (
            <>
              {/* One click signs an existing member back in and sends a new
                  one to sign-up, so nobody who lands here by accident has to
                  re-enter anything. */}
              <span className="site-login">
                <GoogleButton label="Log in" variant="secondary" size="sm" returnTo="/" />
              </span>
              <Link to="/join" className="btn btn-primary">Join free</Link>
            </>
          )}
          <button
            type="button"
            className="btn btn-icon site-menu-btn"
            aria-expanded={open}
            aria-controls="site-sheet"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <Icon as={open ? X : Menu} size={20} />
          </button>
        </div>
      </nav>

      <div id="site-sheet" className="site-sheet" data-open={String(open)}>
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="site-sheet-link">{l.label}</Link>
        ))}
        <Link to="/safety" className="site-sheet-link">Safety</Link>
        {!checking && !isAuthenticated && (
          <div style={{ paddingTop: 18 }}>
            <GoogleButton label="Log in with Google" variant="secondary" returnTo="/" block />
          </div>
        )}
      </div>
    </header>
  );
}
