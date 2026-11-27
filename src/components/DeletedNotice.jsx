import React, { useState } from 'react';

// Shown once, on the public landing page, right after an account is deleted.
export default function DeletedNotice() {
  const [shown, setShown] = useState(
    () => new URLSearchParams(window.location.search).get('deleted') === '1',
  );
  if (!shown) return null;
  return (
    <div className="wrap" style={{ paddingTop: 16 }}>
      <div className="notice notice-success flex items-center gap-3 flex-wrap" role="status">
        <span style={{ flex: 1, minWidth: 220 }}>
          Your account and its data have been deleted. Thanks for having been here.
        </span>
        <button type="button" className="btn btn-quiet btn-sm" onClick={() => setShown(false)}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
