import React, { useEffect, useRef, useState } from 'react';
import { ROLE_LABELS, CATEGORY_LABELS } from '@/lib/useProfile';
import { signFor, readingMinutes } from '@/lib/categories';
import { timeAgo } from '@/lib/time';
import Sign from '@/components/kit/Sign';
import Plate from '@/components/kit/Plate';
import EditPostModal from '@/components/app/EditPostModal';
import AttachmentList from '@/components/attachments/AttachmentList';
import SafetyActions from '@/components/safety/SafetyActions';
import ConnectButton from '@/components/app/ConnectButton';
import FollowButton from '@/components/app/FollowButton';
import SharePostButton from '@/components/app/SharePostButton';
import SavePostButton from '@/components/app/SavePostButton';
import VerifiedBadge from '@/components/app/VerifiedBadge';

// One post in the feed. Set like an article: who wrote it, a headline, and the
// body in a reading face, with the actions underneath. The topic is a road
// sign so the colour tells you what kind of post it is before you read a word.
export default function PostArticle({
  post, connection, busy, onConnect, isMine, onBlocked, canEdit, onSaved,
  following, followBusy, onToggleFollow, saved, saveBusy, onToggleSave,
  verified = false, focused = false,
}) {
  const isLong = (post.body || '').length > 620;
  const [open, setOpen] = useState(focused);
  const [editing, setEditing] = useState(false);
  const ref = useRef(null);

  // A shared link lands on its post, opened, instead of on the top of the feed.
  useEffect(() => {
    if (focused && ref.current) {
      setOpen(true);
      ref.current.scrollIntoView({ block: 'start', behavior: 'auto' });
    }
  }, [focused]);

  const clamped = isLong && !open;

  return (
    <article ref={ref} className="post" data-focus={focused ? 'true' : undefined} id={`post-${post.id}`}>
      <div className="post-head">
        <Plate name={post.author_name} seed={post.author_key || post.author_email || post.author_name} size={44} />
        <div style={{ minWidth: 0 }}>
          <div className="post-author">
            <span>{post.author_name || 'A Pathways member'}</span>
            <VerifiedBadge verified={verified} />
          </div>
          <div className="post-meta">
            {post.author_headline || ROLE_LABELS[post.author_role] || 'Member'}
            {post.created_date ? ` · ${timeAgo(post.created_date)}` : ''}
            {` · ${readingMinutes(post.body)} min read`}
          </div>
        </div>
        <Sign color={signFor(post.category)}>{CATEGORY_LABELS[post.category] || 'Advice'}</Sign>
      </div>

      <h2 className="post-title">{post.title}</h2>

      <p className="prose post-body" data-clamped={clamped ? 'true' : undefined}>{post.body}</p>

      {isLong && (
        <button type="button" className="link-btn" style={{ marginTop: 10, fontWeight: 800, fontSize: 15 }} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? 'Show less' : 'Keep reading'}
        </button>
      )}

      <AttachmentList files={post.attachments} postId={post.id} />

      {Array.isArray(post.tags) && post.tags.length > 0 && (
        <div className="post-tags">
          {post.tags.map((t) => <span key={t} className="tag">#{String(t).replace(/^#/, '')}</span>)}
        </div>
      )}

      <div className="post-actions">
        {post.is_sample ? (
          <span className="meta">Sample post. Real members' posts appear here as they join.</span>
        ) : isMine ? (
          <span className="badge badge-neutral">Your post</span>
        ) : post.author_email ? (
          // Following is the lightweight half: one tap, nothing sent to the
          // author. Connecting is mutual, unlocks messaging, and asks before
          // it sends anything.
          <>
            <FollowButton
              targetEmail={post.author_ref || post.author_email}
              targetName={post.author_name}
              following={following}
              busy={followBusy}
              onToggle={onToggleFollow}
            />
            <ConnectButton
              targetEmail={post.author_email}
              targetName={post.author_name}
              connection={connection}
              busy={busy}
              onConnect={onConnect}
            />
          </>
        ) : null}

        {!post.is_sample && (
          <>
            <SavePostButton postId={post.id} saved={saved} busy={saveBusy} onToggle={onToggleSave} />
            <SharePostButton post={post} />
          </>
        )}

        {/* Only the app admin sees this. The server's rules on Post already
            restrict editing, so this button is convenience, not the protection. */}
        {canEdit && !post.is_sample && (
          <>
            <button type="button" className="tool-btn" onClick={() => setEditing(true)}>Edit</button>
            <EditPostModal open={editing} onOpenChange={setEditing} post={post} onSaved={onSaved} />
          </>
        )}

        {/* A post is often the first place something feels off, so report and
            block live right here rather than only on the profile. */}
        {!post.is_sample && !isMine && post.author_email && (
          <span className="post-actions-end">
            <SafetyActions
              targetEmail={post.author_email}
              targetName={post.author_name}
              contextType="post"
              contextId={post.id}
              onBlocked={onBlocked}
            />
          </span>
        )}
      </div>
    </article>
  );
}
