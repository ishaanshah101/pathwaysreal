import React from "react";
import { Link } from "react-router-dom";
import { OTPInput } from "input-otp";
import BrandMark from "@/components/BrandMark";

// The frame around Log in, Register, the password pages, and two-step sign-in.
//
// Wide, it is an open notebook: the form is the page you are writing on, and
// beside it is the marbled cover with its label filled in. On a phone there is
// only the page. The cover is decoration, so it is hidden from assistive tech;
// the headline says what the page is.
export function AuthFrame({ children }) {
  return (
    <div className="auth">
      <div className="auth-main">
        <header className="auth-top">
          <Link to="/" className="brand" aria-label="Pathways home">
            <BrandMark size={38} />
            <span className="brand-name">Pathways</span>
          </Link>
        </header>
        <main className="auth-body">{children}</main>
      </div>

      <aside className="auth-side band-road" aria-hidden="true">
        <div className="cover-label auth-cover">
          <BrandMark size={92} className="auth-cover-mark" />
          <span className="auth-cover-title">Pathways</span>
          <span className="auth-cover-sub">College and career notebook</span>
          <dl className="auth-cover-lines">
            <div><dt>Name</dt><dd>you</dd></div>
            <div><dt>Subject</dt><dd>what comes after high school</dd></div>
            <div><dt>Price</dt><dd>free. actually free.</dd></div>
          </dl>
          <span className="auth-cover-fine">13+ · COPPA and FERPA aligned · Student data is never sold</span>
        </div>
      </aside>
    </div>
  );
}

// The `icon` prop is still accepted so callers do not have to change, but the
// brand mark is what we show. `kicker` is the line of small print above the
// title.
export default function AuthLayout({ title, subtitle, footer, kicker, children }) {
  return (
    <AuthFrame>
      <div className="auth-head">
        {kicker && <span className="kicker kicker-sun">{kicker}</span>}
        <h1 className="auth-title">{title}</h1>
        {subtitle && <p className="auth-sub">{subtitle}</p>}
      </div>

      {children && <div className="auth-stack">{children}</div>}

      {footer && <p className="auth-foot">{footer}</p>}
    </AuthFrame>
  );
}

// A one-time code as six separate boxes. Every prop goes straight through to
// the underlying input (value, onChange, onKeyDown, autoFocus and so on), so a
// caller decides what a finished code does. `invalid` turns the boxes red.
export function CodeBoxes({ invalid = false, ...props }) {
  return (
    <OTPInput
      maxLength={6}
      containerClassName="otp"
      {...props}
      render={({ slots }) => slots.map((slot, index) => (
        <span key={index} className="otp-slot" data-active={slot.isActive} data-invalid={invalid}>
          {slot.char}
          {slot.hasFakeCaret && <span className="otp-caret" />}
        </span>
      ))}
    />
  );
}
