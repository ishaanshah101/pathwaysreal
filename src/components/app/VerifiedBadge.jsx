import React from 'react';
import { BadgeCheck } from 'lucide-react';

// Use only the admin-controlled Profile.verified value, never an email domain
// or the status of a member-submitted verification request.
export default function VerifiedBadge({ verified }) {
  if (verified !== true) return null;
  const description = 'Verified: institutional email or role confirmed by a Pathways admin.';
  return (
    <span className="badge badge-verified shrink-0 self-start" title={description} aria-label={description}>
      <BadgeCheck size={14} aria-hidden="true" />
      Verified
    </span>
  );
}