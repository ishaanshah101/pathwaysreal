import React, { useState } from 'react';

// Shown once, on the public landing page, right after an account is deleted.
export default function DeletedNotice() {
  const [shown, setShown] = useState(
    () => new URLSearchParams(window.location.search).get('deleted') === '1',
  );
  if (!shown) return null;
  return (
    <div className="notice notice-success" role="status" style={{ marginTop: 16 }}>
      Your account and its data have been deleted. Thanks for having been here.{' '}
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => setShown(false)}
      >
        Dismiss
      </button>
    </div>
  );
}