import React from 'react';
import { Plus, Check } from 'lucide-react';
import Icon from '@/components/kit/Icon';

// Following is a one-tap, reversible thing, so unlike Connect it asks for no
// confirmation: nothing is sent to the other person and nothing is unlocked.
export default function FollowButton({ targetEmail, targetName, following, busy = false, onToggle }) {
  return (
    <button
      type="button"
      className="btn btn-secondary btn-sm"
      style={following ? { background: 'var(--green-tint)', borderColor: 'var(--green)', color: 'var(--green-deep)' } : undefined}
      disabled={busy}
      aria-pressed={following}
      onClick={() => onToggle?.(targetEmail, targetName)}
    >
      <Icon as={following ? Check : Plus} size={15} weight={3} />
      {busy ? '…' : following ? 'Following' : 'Follow'}
    </button>
  );
}
