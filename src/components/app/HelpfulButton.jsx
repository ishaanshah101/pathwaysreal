import React from 'react';
import { ThumbsUp } from 'lucide-react';
import Icon from '@/components/kit/Icon';

// The one reaction a post can get. It says "this helped me", it is counted,
// and nobody can see who pressed it. You cannot mark your own post, so on
// those it shows the number and does nothing.
export default function HelpfulButton({ count = 0, reacted = false, busy = false, readOnly = false, onToggle }) {
  const label = count === 1 ? '1 person found this helpful' : `${count} people found this helpful`;

  if (readOnly) {
    return (
      <span className="tool-btn act-helpful" data-static="true" title={label}>
        <Icon as={ThumbsUp} size={16} />
        Helpful
        {count > 0 && <span className="act-count num">{count}</span>}
        <span className="sr-only">{label}</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      className="tool-btn act-helpful"
      aria-pressed={reacted}
      disabled={busy}
      onClick={onToggle}
      title={reacted ? 'You marked this helpful. Press to undo.' : 'Mark this post as helpful'}
    >
      <Icon as={ThumbsUp} size={16} weight={reacted ? 2.6 : 2} />
      Helpful
      {count > 0 && <span className="act-count num" aria-hidden="true">{count}</span>}
      {count > 0 && <span className="sr-only">{label}</span>}
    </button>
  );
}
