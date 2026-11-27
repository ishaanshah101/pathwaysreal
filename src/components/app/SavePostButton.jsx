import React from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import Icon from '@/components/kit/Icon';

// Save a post to read later, including offline.
export default function SavePostButton({ postId, saved, busy, onToggle }) {
  return (
    <button
      type="button"
      className="tool-btn"
      aria-pressed={saved}
      disabled={busy}
      onClick={() => onToggle(postId)}
      title={saved ? 'Remove from your saved posts' : 'Save this to read later, even offline'}
    >
      <Icon as={saved ? BookmarkCheck : Bookmark} size={16} />
      <span className="act-label">{saved ? 'Saved' : 'Save'}</span>
    </button>
  );
}
