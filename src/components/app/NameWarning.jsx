import React from 'react';
import { Link } from 'react-router-dom';

// Must match base44/shared/realName.ts: a real first name missing a proper
// last name gets a month, anything else gets a week. The server decides when
// the account is actually removed; this only shows the countdown.
const GRACE_DAYS = 7;
const LAST_NAME_GRACE_DAYS = 30;

function hasRealFirstName(value) {
  const first = String(value || '').trim().split(/\s+/)[0] || '';
  return /^\p{L}[\p{L}'’.-]*$/u.test(first) && first.replace(/[^\p{L}]/gu, '').length >= 2;
}

// Shown on every screen while a member's name is not a real first and last
// name. The date comes from the server, so it cannot be reset from here.
export default function NameWarning({ profile }) {
  const flaggedAt = Date.parse(profile?.name_flagged_at || '');
  if (!Number.isFinite(flaggedAt) || profile?.name_locked) return null;

  const lastNameOnly = hasRealFirstName(profile?.full_name);
  const graceDays = lastNameOnly ? LAST_NAME_GRACE_DAYS : GRACE_DAYS;
  const left = Math.max(0, Math.ceil((flaggedAt + graceDays * 86400000 - Date.now()) / 86400000));
  const when = left === 0 ? 'today' : left === 1 ? 'within 1 day' : `within ${left} days`;

  return (
    <div className="wrap" style={{ paddingTop: 14 }}>
      <div className="notice notice-warning flex items-start gap-3 flex-wrap" role="alert">
        <span style={{ flex: 1, minWidth: 220 }}>
          <b>{lastNameOnly ? 'Pathways needs your last name.' : 'Pathways needs your real name.'}</b>{' '}
          Everyone here goes by their real first and last name. {lastNameOnly ? 'Add yours' : 'Change yours'} {when}, or your account and everything on it will be deleted.
        </span>
        <Link to="/app/profile" style={{ fontWeight: 800 }}>{lastNameOnly ? 'Add my last name' : 'Change my name'}</Link>
      </div>
    </div>
  );
}
