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
  const small = size === 'sm';
  const chip = small ? 20 : 24;

  return (
    <button
      type="button"
      onClick={() => signInWithGoogle(returnTo)}
      className={`btn btn-${variant} ${small ? '' : 'btn-lg'} ${block ? 'btn-block' : ''} ${className}`}
      style={{ gap: 10, ...style }}
    >
      {/* Google's mark always sits on white, whatever the button colour. */}
      <span
        className="flex items-center justify-center"
        style={{ width: chip, height: chip, borderRadius: '50%', background: '#fff', flex: 'none' }}
      >
        <GoogleIcon style={{ width: chip - 6, height: chip - 6 }} />
      </span>
      {label}
    </button>
  );
}
