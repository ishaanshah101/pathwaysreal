import React from "react";
import { Link } from "react-router-dom";
import BrandMark from "@/components/BrandMark";

// The frame around Log in, Register, and the password pages.
//
// This used to be the stock scaffold: a generic icon in a square, a bold sans
// title, and primitives whose colour tokens were never defined, so it rendered
// with black borders and an invisible primary button on an otherwise cream
// site. It now uses the brand mark, the display face for the title, and the
// same card as everything else. The `icon` prop is still accepted so callers
// do not have to change, but the brand mark is what we show.
export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: 'var(--color-bg)', padding: '40px 20px' }}
    >
      <div className="w-full" style={{ maxWidth: 420 }}>
        <div className="text-center" style={{ marginBottom: 28 }}>
          <Link
            to="/"
            className="inline-flex items-center gap-[10px] no-underline text-inherit"
            style={{ marginBottom: 22 }}
            aria-label="Pathways home"
          >
            <BrandMark size={40} />
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 22, letterSpacing: '-0.01em' }}>Pathways</span>
          </Link>
          <h1 style={{ fontSize: 'clamp(28px,4vw,34px)', margin: '0 0 6px' }}>{title}</h1>
          {subtitle && (
            <p style={{ margin: 0, fontSize: 15, color: 'var(--text-muted)' }}>{subtitle}</p>
          )}
        </div>

        <div className="card elev-md" style={{ padding: 28, gap: 0, display: 'block' }}>
          {children}
        </div>

        {footer && (
          <p className="text-center" style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 22 }}>{footer}</p>
        )}
      </div>
    </div>
  );
}
