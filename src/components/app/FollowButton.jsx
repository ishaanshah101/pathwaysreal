import React from 'react';
import { UserPlus, UserCheck } from 'lucide-react';

// Following is a one-tap, reversible thing, so unlike Connect it asks for no
// confirmation: nothing is sent to the other person and nothing is unlocked.
export default function FollowButton({
  targetEmail,
  targetName,
  following,
  busy = false,
  onToggle,
  size = 13,
}) {
  const Icon = following ? UserCheck : UserPlus;

  return (
    <button
      type="button"
      className="btn btn-secondary btn-sm"
      style={{
        fontSize: size,
        background: following ? 'var(--color-accent-2-200)' : undefined,
        borderColor: following ? 'var(--color-accent-2-300)' : undefined,
        color: following ? 'var(--color-accent-2-900)' : undefined,
      }}
      disabled={busy}
      aria-pressed={following}
      onClick={() => onToggle?.(targetEmail, targetName)}
    >
      <Icon size={14} strokeWidth={2.2} aria-hidden="true" />
      {busy ? '…' : following ? 'Following' : 'Follow'}
    </button>
  );
}