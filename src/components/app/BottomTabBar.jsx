import React, { useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { isNativeApp } from '@/lib/platform';
import UnreadBadge from '@/components/app/UnreadBadge';
import Icon from '@/components/kit/Icon';

// The tab bar a thumb can reach. Shown under 1000px by CSS (.bottom-tabs), so
// the desktop rail is untouched.
export default function BottomTabBar({ tabs, badgeFor }) {
  const location = useLocation();
  const destinations = useRef({});
  const native = isNativeApp();
  if (native && tabs.some((tab) => tab.to === location.pathname)) {
    destinations.current[location.pathname] = location.pathname + location.search + location.hash;
  }
  return (
    <nav className="bottom-tabs" aria-label="App sections">
      {tabs.map(({ to, end, label, glyph }) => (
        <NavLink key={to} to={native ? destinations.current[to] || to : to} end={end} className="bottom-tab">
          {({ isActive }) => (
            <span className="bottom-tab-inner" data-on={isActive ? 'true' : 'false'}>
              <span style={{ position: 'relative', display: 'inline-flex' }}>
                <Icon as={glyph} size={22} />
                <UnreadBadge count={badgeFor(to)} />
              </span>
              <span className="bottom-tab-label">{label}</span>
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
