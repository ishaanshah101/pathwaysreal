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
import SharePostButton from '@/components/app/SharePostButton';
import SavePostButton from '@/components/app/SavePostButton';
import VerifiedBadge from '@/components/app/VerifiedBadge';
import HelpfulButton from '@/components/app/HelpfulButton';

// One post in the feed. The top line is who wrote it, with Follow right beside
// the name the way a social app has it. Then a headline and the body in a
// reading face. Underneath is one row of actions: helpful, save, share, and
// connect. The topic label's colour tells you what kind of post it is before
// you read a word.
export default function PostArticle({
  post, connection = null, busy = false, onConnect, isMine = false, onBlocked, canEdit = false, onSaved,
  following = false, followBusy = false, onToggleFollow, saved = false, saveBusy = false, onToggleSave,
  verified = false, focused = false,
  helpfulCount = 0, reacted = false, reactBusy = false, onToggleHelpful,
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
  const followRef = post.author_ref || post.author_email;
  // Who the connect, report and block controls act on. Only people I am
  // already connected with come with an email; everyone else is a reference.
  const target = post.author_email || post.author_ref;
  const canFollow = !post.is_sample && !isMine && Boolean(followRef) && Boolean(onToggleFollow);

  return (
    <article ref={ref} className="post" data-focus={focused ? 'true' : undefined} id={`post-${post.id}`}>
      <div className="post-head">
        <Plate name={post.author_name} seed={post.author_key || post.author_email || post.author_ref || post.author_name} size={44} />
        <div style={{ minWidth: 0 }}>
          <div className="post-author">
            <span>{post.author_name || 'A Pathways member'}</span>
            <VerifiedBadge verified={verified} compact />
            {canFollow && (
              <button
                type="button"
                className="post-follow"
                aria-pressed={following}
                disabled={followBusy}
                onClick={() => onToggleFollow(followRef, post.author_name)}
              >
                {followBusy ? '…' : following ? 'Following' : 'Follow'}
                <span className="sr-only"> {post.author_name}</span>
              </button>
            )}
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
        <button type="button" className="link-btn post-more" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? 'See less' : 'See more'}
        </button>
      )}

      <AttachmentList files={post.attachments} postId={post.id} />

      {Array.isArray(post.tags) && post.tags.length > 0 && (
        <div className="post-tags">
          {post.tags.map((t) => <span key={t} className="tag">#{String(t).replace(/^#/, '')}</span>)}
        </div>
      )}

      <div className="post-actions post-bar">
        {post.is_sample ? (
          <span className="meta">Sample post. Real members' posts appear here as they join.</span>
        ) : (
          <>
            <HelpfulButton
              count={helpfulCount}
              reacted={reacted}
              busy={reactBusy}
              readOnly={isMine || !onToggleHelpful}
              onToggle={() => onToggleHelpful?.(post)}
            />
            <SavePostButton postId={post.id} saved={saved} busy={saveBusy} onToggle={onToggleSave} />
            <SharePostButton post={post} />
          </>
        )}

        {/* Following is the one-tap half and sits by the name. Connecting is
            mutual, unlocks messaging, and asks before it sends anything, so it
            is a real button down here. */}
        {!post.is_sample && !isMine && target && (
          <ConnectButton
            targetEmail={target}
            targetName={post.author_name}
            connection={connection}
            busy={busy}
            onConnect={onConnect}
          />
        )}
        {!post.is_sample && isMine && <span className="badge badge-neutral">Your post</span>}

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
        {!post.is_sample && !isMine && target && (
          <span className="post-actions-end">
            <SafetyActions
              targetEmail={target}
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