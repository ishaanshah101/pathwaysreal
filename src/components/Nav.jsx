import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import BrandMark from '@/components/BrandMark';

const tabs = [
  { to: '/how-it-works', label: 'How it works' },
  { to: '/sage', label: 'Sage' },
  { to: '/faq', label: 'FAQ' },
];

export default function Nav() {
  const { pathname } = useLocation();
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
      <Link to="/join" className="btn btn-primary">Join free</Link>
    </nav>
  );
}