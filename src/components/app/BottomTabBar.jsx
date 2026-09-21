import React from 'react';
import { NavLink } from 'react-router-dom';
import UnreadBadge from '@/components/app/UnreadBadge';

// The native-feeling tab bar. Rendered only under 768px by CSS (.bottom-tabs),
// so the desktop header tabs are untouched.
export default function BottomTabBar({ tabs, badgeFor }) {
  return (
    <nav className="bottom-tabs" aria-label="App sections">
      {tabs.map(({ to, end, label, Icon }) => (
        <NavLink key={to} to={to} end={end} className="bottom-tab no-underline">
          {({ isActive }) => (
            <span className="bottom-tab-inner" data-on={isActive ? 'true' : 'false'}>
              <span style={{ position: 'relative', display: 'inline-flex' }}>
                <Icon size={21} strokeWidth={2.1} />
                <span style={{ position: 'absolute', top: -6, left: 13 }}>
                  <UnreadBadge count={badgeFor(to)} />
                </span>
              </span>
              <span className="bottom-tab-label">{label}</span>
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
}