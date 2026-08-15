import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { Home, Compass, MessageCircle, Sparkles, User, LogOut } from 'lucide-react';
import Seo from '@/components/Seo';
import BrandMark from '@/components/BrandMark';
import UnreadBadge from '@/components/app/UnreadBadge';
import { useAuth } from '@/lib/AuthContext';
import { useProfile } from '@/lib/useProfile';
import { useMessages } from '@/lib/MessagesContext';

const TABS = [
  { to: '/app', end: true, label: 'Feed', Icon: Home },
  { to: '/app/explore', label: 'Explore', Icon: Compass },
  { to: '/app/messages', label: 'Messages', Icon: MessageCircle },
  { to: '/app/sage', label: 'Sage', Icon: Sparkles },
  { to: '/app/profile', label: 'Profile', Icon: User },
];

function TabLink({ to, end, label, Icon, badge = 0 }) {
  return (
    <NavLink to={to} end={end} className="no-underline" style={{ position: 'relative' }}>
      {({ isActive }) => (
        <span
          className="flex items-center gap-2 transition-colors"
          style={{
            position: 'relative',
            fontSize: 14,
            padding: '9px 15px',
            borderRadius: 999,
            color: isActive ? 'var(--color-bg)' : 'var(--color-text)',
            background: isActive ? 'var(--color-accent)' : 'transparent',
            fontWeight: isActive || badge > 0 ? 600 : 400,
          }}
        >
          <Icon size={16} strokeWidth={2.2} />
          {label}
          <UnreadBadge count={badge} />
        </span>
      )}
    </NavLink>
  );
}

export default function AppShell() {
  const { logout } = useAuth();
  const { profile } = useProfile();
  const { unreadTotal } = useMessages();
  const [menuOpen, setMenuOpen] = useState(false);
  const first = (profile?.full_name || 'there').split(' ')[0];

  // Mirror the count in the tab title, the way a mail client does, so an
  // unread message is visible even when the tab is in the background.
  useEffect(() => {
    const base = 'Pathways';
    document.title = unreadTotal > 0 ? `(${unreadTotal}) ${base}` : base;
  }, [unreadTotal]);

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Signed-in screens hold nothing a search engine should index. */}
      <Seo title="Pathways" noindex />
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          background: 'var(--color-bg)',
          borderBottom: '1px solid var(--color-divider)',
        }}
      >
        <div
          className="flex items-center gap-2 flex-wrap"
          style={{ maxWidth: 1080, margin: '0 auto', padding: '12px clamp(16px,4vw,40px)' }}
        >
          <Link to="/app" className="flex items-center gap-[9px] no-underline text-inherit" style={{ marginRight: 8 }}>
            <BrandMark size={36} />
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 18 }}>Pathways</span>
          </Link>

          <nav className="flex items-center gap-1 flex-wrap">
            {TABS.map((t) => (
              <TabLink
                key={t.to}
                {...t}
                badge={t.to === '/app/messages' ? unreadTotal : 0}
              />
            ))}
          </nav>

          <div className="relative" style={{ marginLeft: 'auto' }}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center justify-center"
              aria-label="Account menu"
              style={{
                width: 34, height: 34, borderRadius: 999, cursor: 'pointer',
                border: '1px solid var(--color-divider)', background: 'var(--color-accent-2-200)',
                fontFamily: 'var(--font-heading)', fontSize: 14,
              }}
            >
              {first.charAt(0).toUpperCase()}
            </button>
            {menuOpen && (
              <div
                className="card elev-lg anim-fade-swap"
                style={{ position: 'absolute', right: 0, top: 42, width: 210, padding: 10, gap: 4, borderRadius: 20 }}
              >
                <span style={{ fontSize: 12, color: 'var(--color-neutral-600)', padding: '4px 10px' }}>
                  Signed in as {first}
                </span>
                <Link
                  to="/app/profile"
                  className="no-underline text-inherit"
                  onClick={() => setMenuOpen(false)}
                  style={{ fontSize: 14, padding: '8px 10px', borderRadius: 14 }}
                >
                  Your profile
                </Link>
                <button
                  type="button"
                  onClick={() => logout(true)}
                  className="flex items-center gap-2 text-left"
                  style={{
                    fontSize: 14, padding: '8px 10px', borderRadius: 14, cursor: 'pointer',
                    background: 'transparent', border: 0, font: 'inherit', color: 'var(--color-accent-700)',
                  }}
                >
                  <LogOut size={15} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <main id="main" style={{ maxWidth: 1080, margin: '0 auto', padding: '24px clamp(16px,4vw,40px) 80px' }}>
        <Outlet />
      </main>
    </div>
  );
}