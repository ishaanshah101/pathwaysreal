import React from 'react';
import { Link } from 'react-router-dom';
import BrandMark from '@/components/BrandMark';
import ContactEmail from '@/components/ContactEmail';
import { COMPANY_NAME } from '@/lib/company';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="flex items-center gap-[10px]">
              <BrandMark size={34} />
              <span className="brand-name">Pathways</span>
            </span>
            <p>Free college and career guidance for high school students, from people who have already been there.</p>
          </div>

          <div className="footer-col">
            <h2>Contents</h2>
            <ul>
              <li><Link to="/how-it-works">How it works</Link></li>
              <li><Link to="/by-grade">By grade</Link></li>
              <li><Link to="/glossary">Glossary</Link></li>
              <li><Link to="/sage">Sage</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h2>The rules</h2>
            <ul>
              <li><Link to="/safety">Safety</Link></li>
              <li><Link to="/privacy">Privacy</Link></li>
              <li><Link to="/terms">Terms</Link></li>
              <li><Link to="/delete-account">Delete account</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h2>Sign up</h2>
            <ul>
              <li><Link to="/join">Join free</Link></li>
              <li><Link to="/login">Log in</Link></li>
              <li><ContactEmail /></li>
            </ul>
          </div>
        </div>

        <div className="footer-base">
          <span>13+ · COPPA and FERPA aligned · Student data is never sold</span>
          <span>© {new Date().getFullYear()} {COMPANY_NAME} · San Ramon, California</span>
        </div>
      </div>
    </footer>
  );
}
