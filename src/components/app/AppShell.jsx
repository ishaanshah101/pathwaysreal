import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LogOut, PenLine, Search, UserPlus } from 'lucide-react';
import RouteTransition from '@/components/app/RouteTransition';
import NativeTabOutlet from '@/components/app/NativeTabOutlet';
import { isNativeApp } from '@/lib/platform';
import Seo from '@/components/Seo';
import BrandMark from '@/components/BrandMark';
import NotificationBell from '@/components/app/NotificationBell';
import BottomTabBar from '@/components/app/BottomTabBar';
import JumpMenu from '@/components/app/JumpMenu';
import Icon from '@/components/kit/Icon';
import Plate from '@/components/kit/Plate';
import { useAuth } from '@/lib/AuthContext';
import { useProfile, ROLE_LABELS } from '@/lib/useProfile';
import { useMessages } from '@/lib/MessagesContext';
import { useConnections } from '@/lib/useConnections';
import { SECTIONS, REFERENCE, PROFILE, MODERATION, ACTIONS, PHONE_TABS } from '@/lib/sections';

function RailLink({ to, end, label, glyph, tone, count = 0, countLabel, quiet = false }) {
  return (
    <NavLink to={to} end={end} className={`rail-link${quiet ? ' rail-link-quiet' : ''}`}>
      <span className={`picto picto-${tone}`}><Icon as={glyph} size={17} /></span>
      <span>{label}</span>
      {count > 0 && <span className="count" aria-label={`${count} ${countLabel}`}>{count > 99 ? '99+' : count}</span>}
    </NavLink>
  );
}

export default function AppShell() {
  const { logout, user } = useAuth();
  const { profile, email } = useProfile();
  const { unreadTotal } = useMessages();
  const { incomingPending } = useConnections();
  const pendingCount = incomingPending.length;
  const isAdmin = user?.role === 'admin';
  const [menuOpen, setMenuOpen] = useState(false);
  const [jumpOpen, setJumpOpen] = useState(false);
  const menuRef = useRef(null);
  const name = profile?.full_name || '';
  const first = (name || 'there').split(' ')[0];
  const mac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '');

  const countFor = (to) => (to === '/app/messages' ? unreadTotal : to === '/app/requests' ? pendingCount : 0);
  const countLabelFor = (to) => (to === '/app/messages' ? 'unread messages' : 'requests waiting');

  // Clicking anywhere outside the menu closes it, and so does Escape.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onPointerDown = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
    };
    const onKeyDown = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  // Cmd/Ctrl+K anywhere, or "/" when you are not typing, opens the jump menu.
  useEffect(() => {
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target?.tagName) || e.target?.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setJumpOpen((o) => !o);
      } else if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setJumpOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Mirror the count in the tab title, the way a mail client does, so an
  // unread message is visible even when the tab is in the background.
  useEffect(() => {
    const base = 'Pathways';
    document.title = unreadTotal > 0 ? `(${unreadTotal}) ${base}` : base;
  }, [unreadTotal]);

  const destinations = [...SECTIONS, ...REFERENCE, PROFILE, ...(isAdmin ? [MODERATION] : [])];

  return (
    <div className="app-scroll-root shell">
      {/* Signed-in screens hold nothing a search engine should index. */}
      <Seo title="Pathways" noindex />
      <a href="#main" className="skip-link">Skip to content</a>

      <aside className="rail">
        <Link to="/app" className="brand" aria-label="Pathways, your feed">
          <BrandMark size={34} />
          <span className="brand-name">Pathways</span>
        </Link>

        <nav className="rail-nav" aria-label="App sections">
          {SECTIONS.map((s) => (
            <RailLink key={s.to} {...s} count={countFor(s.to)} countLabel={countLabelFor(s.to)} />
          ))}
        </nav>

        {/* The one big button in the rail, where every social app keeps it. */}
        <Link to="/app?compose=1" className="btn btn-sun rail-post">
          <Icon as={PenLine} size={17} /> Post
        </Link>

        <span className="rail-head" id="rail-ref">Reference</span>
        <nav style={{ display: 'grid', gap: 2 }} aria-labelledby="rail-ref">
          {REFERENCE.map((s) => <RailLink key={s.to} {...s} quiet />)}
          {isAdmin && <RailLink {...MODERATION} quiet />}
        </nav>

        <div className="rail-foot">
          <Link to="/app/profile" className="rail-user">
            <Plate name={name || first} seed={email} size={38} />
            <span style={{ minWidth: 0 }}>
              <b>{name || 'Your profile'}</b>
              <small>{profile?.grade || profile?.job_title || ROLE_LABELS[profile?.role] || 'Profile'}</small>
            </span>
          </Link>
        </div>
      </aside>

      <div className="road road-v shell-road" aria-hidden="true" />

      <div className="shell-main">
        <div className="topbar">
          <Link to="/app" className="brand" aria-label="Pathways, your feed">
            <BrandMark size={30} />
            <span className="brand-name">Pathways</span>
          </Link>

          <button type="button" className="jump" onClick={() => setJumpOpen(true)}>
            <Icon as={Search} size={16} />
            Go to a page, or look up a word
            <kbd>{mac ? '⌘K' : 'Ctrl K'}</kbd>
          </button>

          <span className="topbar-spacer" />

          <button type="button" className="icon-btn topbar-only-small" aria-label="Search and jump" onClick={() => setJumpOpen(true)}>
            <Icon as={Search} size={18} />
          </button>
          <Link to="/app/requests" className="icon-btn topbar-only-small" aria-label={pendingCount > 0 ? `Requests, ${pendingCount} waiting` : 'Requests'}>
            <Icon as={UserPlus} size={18} />
            {pendingCount > 0 && <span className="count" aria-hidden="true">{pendingCount > 9 ? '9+' : pendingCount}</span>}
          </Link>
          <NotificationBell />

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-label="Account menu"
              onClick={() => setMenuOpen((o) => !o)}
              style={{ display: 'block', padding: 0, border: 0, background: 'none', cursor: 'pointer', borderRadius: 9 }}
            >
              <Plate name={name || first} seed={email} size={40} />
            </button>
            {menuOpen && (
              <div className="popover" style={{ position: 'absolute', right: 0, top: 48, width: 232, zIndex: 40 }}>
                <div className="panel-head">Signed in as {first}</div>
                <div style={{ padding: 6 }} onClick={() => setMenuOpen(false)}>
                  <Link to="/app/profile" className="menu-item">Your profile</Link>
                  <Link to="/app/saved" className="menu-item">Saved posts</Link>
                  <Link to="/app/glossary" className="menu-item">Glossary</Link>
                  <Link to="/app/by-grade" className="menu-item">By grade</Link>
                  {isAdmin && <Link to="/app/admin/moderation" className="menu-item">Moderation</Link>}
                  <Link to="/safety" className="menu-item">Safety and reporting</Link>
                  <button type="button" onClick={() => logout(true)} className="menu-item" style={{ color: 'var(--red)' }}>
                    <Icon as={LogOut} size={16} /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="road topbar-road" aria-hidden="true" />

        <main id="main" className="app-main">
          {isNativeApp() ? <NativeTabOutlet tabs={PHONE_TABS} /> : <RouteTransition />}
        </main>
      </div>

      <BottomTabBar tabs={PHONE_TABS} badgeFor={countFor} />

      <JumpMenu open={jumpOpen} onOpenChange={setJumpOpen} destinations={destinations} actions={ACTIONS} />
    </div>
  );
}
