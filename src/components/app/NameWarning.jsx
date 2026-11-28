import React from 'react';
import { Link } from 'react-router-dom';

const GRACE_DAYS = 7;

// Shown on every screen while a member's name is not a real first and last
// name. The date comes from the server, so it cannot be reset from here.
export default function NameWarning({ profile }) {
  const flaggedAt = Date.parse(profile?.name_flagged_at || '');
  if (!Number.isFinite(flaggedAt) || profile?.name_locked) return null;

  const left = Math.max(0, Math.ceil((flaggedAt + GRACE_DAYS * 86400000 - Date.now()) / 86400000));
  const when = left === 0 ? 'today' : left === 1 ? 'within 1 day' : `within ${left} days`;

  return (
    <div className="wrap" style={{ paddingTop: 14 }}>
      <div className="notice notice-warning flex items-start gap-3 flex-wrap" role="alert">
        <span style={{ flex: 1, minWidth: 220 }}>
          <b>Pathways needs your real name.</b>{' '}
          Everyone here goes by their real first and last name. Change yours {when}, or your account will be locked.
        </span>
        <Link to="/app/profile" style={{ fontWeight: 800 }}>Change my name</Link>
      </div>
    </div>
  );
}