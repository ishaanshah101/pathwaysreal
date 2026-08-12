import React from 'react';
import { Link } from 'react-router-dom';
import BrandMark from '@/components/BrandMark';

export default function Footer() {
  return (
    <footer
      className="flex items-center gap-[18px] pt-[22px] pb-[34px] flex-wrap"
      style={{ borderTop: '1px solid var(--color-divider)', fontSize: 12, color: 'var(--color-neutral-600)' }}
    >
      <span className="flex items-center gap-[7px] mr-auto">
        <BrandMark size={16} />
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 14, color: 'var(--color-text)' }}>Pathways</span>
      </span>
      <Link to="/privacy" className="no-underline" style={{ color: 'var(--color-neutral-700)' }}>Privacy</Link>
      <Link to="/terms" className="no-underline" style={{ color: 'var(--color-neutral-700)' }}>Terms</Link>
      <span>14+ · COPPA and FERPA aligned · We never sell student data</span>
    </footer>
  );
}
