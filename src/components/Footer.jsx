import React from 'react';
import { Link } from 'react-router-dom';
import BrandMark from '@/components/BrandMark';
import { COMPANY_NAME } from '@/lib/company';

export default function Footer() {
  return (
    <footer
      className="flex items-center gap-x-[22px] gap-y-[10px] pt-[24px] pb-[36px] flex-wrap"
      style={{ borderTop: '1px solid var(--color-divider)', marginTop: 24, fontSize: 13, color: 'var(--text-muted)' }}
    >
      <span className="flex items-center gap-[8px] mr-auto">
        <BrandMark size={22} />
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 15, color: 'var(--color-text)' }}>Pathways</span>
      </span>
      <Link to="/how-it-works" className="no-underline" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>How it works</Link>
      <Link to="/safety" className="no-underline" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Safety</Link>
      <Link to="/privacy" className="no-underline" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Privacy</Link>
      <Link to="/terms" className="no-underline" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Terms</Link>
      <span style={{ color: 'var(--text-subtle)' }}>13+ · COPPA and FERPA aligned · Student data is never sold</span>
      <span style={{ color: 'var(--text-subtle)' }}>© {new Date().getFullYear()} {COMPANY_NAME}</span>
    </footer>
  );
}