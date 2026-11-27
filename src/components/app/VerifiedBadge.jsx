import React from 'react';
import { Check } from 'lucide-react';
import Icon from '@/components/kit/Icon';

// Use only the admin-controlled Profile.verified value, never an email domain
// or the status of a member-submitted verification request.
export default function VerifiedBadge({ verified }) {
  if (verified !== true) return null;
  const description = 'Verified: institutional email or role confirmed by a Pathways admin.';
  return (
    <span className="badge badge-verified shrink-0" title={description} aria-label={description}>
      <Icon as={Check} size={11} weight={3.4} />
      Verified
    </span>
  );
}
