import React from 'react';
import { Check } from 'lucide-react';
import Icon from '@/components/kit/Icon';

// Use only the admin-controlled Profile.verified value, never an email domain
// or the status of a member-submitted verification request.
//
// `compact` is the small tick used beside a name where there is no room for
// the word, the way social apps show it. The meaning is the same and is still
// read out.
export default function VerifiedBadge({ verified, compact = false }) {
  if (verified !== true) return null;
  const description = 'Verified: institutional email or role confirmed by a Pathways admin.';
  if (compact) {
    return (
      <span className="verified-tick shrink-0" title={description} aria-label={description} role="img">
        <Icon as={Check} size={10} weight={3.6} />
      </span>
    );
  }
  return (
    <span className="badge badge-verified shrink-0" title={description} aria-label={description}>
      <Icon as={Check} size={11} weight={3.4} />
      Verified
    </span>
  );
}
