import React from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';

// Save a post to read later, including offline.
export default function SavePostButton({ postId, saved, busy, onToggle }) {
  return (
    <button
      type="button"
      className="btn btn-secondary btn-sm"
      aria-pressed={saved}
      disabled={busy}
      onClick={() => onToggle(postId)}
      title={saved ? 'Remove from your saved posts' : 'Save this to read later, even offline'}
    >
      {saved
        ? <><BookmarkCheck size={14} aria-hidden="true" /> Saved</>
        : <><Bookmark size={14} aria-hidden="true" /> Save</>}
    </button>
  );
}