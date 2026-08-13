import React from 'react';
import GoogleIcon from '@/components/GoogleIcon';
import { signInWithGoogle } from '@/lib/googleAuth';

export default function GoogleButton({
  label = 'Continue with Google',
  returnTo = '/',
  variant = 'primary',
  size = 'md',
  block = false,
  className = '',
  style = {},
}) {
  const sizes = {
    sm: { fontSize: 13.5, padding: '8px 16px', icon: 16, chip: 19 },
    md: { fontSize: 15, minHeight: 48, padding: '12px 26px', icon: 18, chip: 22 },
  };
  const s = sizes[size] || sizes.md;

  return (
    <button
      type="button"
      onClick={() => signInWithGoogle(returnTo)}
      className={`btn btn-${variant} ${block ? 'btn-block' : ''} ${className}`}
      style={{ gap: 9, fontSize: s.fontSize, minHeight: s.minHeight, padding: s.padding, ...style }}
    >
      <span
        className="flex items-center justify-center"
        style={{ width: s.chip, height: s.chip, borderRadius: 999, background: '#fff', flex: 'none' }}
      >
        <GoogleIcon style={{ width: s.icon, height: s.icon }} />
      </span>
      {label}
    </button>
  );
}
