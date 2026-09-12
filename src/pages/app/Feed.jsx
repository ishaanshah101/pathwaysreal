import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useProfile, ROLE_LABELS, CATEGORY_LABELS } from '@/lib/useProfile';
import { useAuth } from '@/lib/AuthContext';
import EditPostModal from '@/components/app/EditPostModal';
import AttachmentList from '@/components/attachments/AttachmentList';
import AttachmentDropzone from '@/components/attachments/AttachmentDropzone';
import useAttachmentQueue from '@/components/attachments/useAttachmentQueue';
import { authorAvatar, initialsOf } from '@/lib/avatar';
import CoverArt from '@/components/app/CoverArt';
import SafetyActions from '@/components/safety/SafetyActions';
import ConnectButton from '@/components/app/ConnectButton';
import FollowButton from '@/components/app/FollowButton';
import { useFollows } from '@/lib/useFollows';
import { useBlocks } from '@/lib/useBlocks';
import { useConnections } from '@/lib/useConnections';
import Seo from '@/components/Seo';
import { PenLine, Users } from 'lucide-react';

const PAGE_SIZE = 12;

function timeAgo(iso) {
  if (!iso) return '';
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return new Date(iso).toLocaleDateString();
}

function Avatar({ name, authorKey, size = 40 }) {
  const [bg, fg] = authorAvatar(authorKey || name || '?');
  return (
    <span
      className="flex items-center justify-center"
      style={{
        width: size, height: size, borderRadius: 999, flex: 'none',
        background: bg, color: fg,
        fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: size * 0.36, letterSpacing: '.02em',
      }}
    >
      {initialsOf(name)}
    </span>
  );
}

function PostCard({
  post, connection, busy, onConnect, isMine, onBlocked, canEdit, onSaved,
  following, followBusy, onToggleFollow,
}) {
  const v = post.variant || 'plain';
  const isLong = (post.body || '').length > 620;
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  return (
    <article className="card elev-sm" style={{ padding: 22, gap: 12 }}>
      <div className="flex items-center gap-3">
        <Avatar name={post.author_name} authorKey={post.author_key} />
        <div className="flex flex-col" style={{ minWidth: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{post.author_name || 'A Pathways member'}</span>
          <span style={{ fontSize: 12.5, color: 'var(--text-subtle)' }}>
            {post.author_headline || ROLE_LABELS[post.author_role] || 'Member'}
            {post.created_date ? ` · ${timeAgo(post.created_date)}` : ''}
          </span>
        </div>
        <span className="tag tag-accent" style={{ marginLeft: 'auto', flex: 'none' }}>
          {CATEGORY_LABELS[post.category] || 'Advice'}
        </span>
      </div>

      {v === 'cover' && <CoverArt postId={post.id} category={post.category} />}

      <h2 className="h-sans" style={{ fontSize: 19, margin: '2px 0 0', textWrap: 'balance' }}>{post.title}</h2>

      {v === 'quote' && post.quote && (
        <blockquote
          style={{
            margin: 0, padding: '14px 18px', borderRadius: 12,
            borderLeft: '3px solid var(--color-accent)',
            background: 'var(--color-surface-2)',
            fontSize: 15.5, lineHeight: 1.5,
          }}
        >
          {post.quote}
        </blockquote>
      )}

      {v === 'stats' && Array.isArray(post.stats) && (
        <div className="grid" style={{ gridTemplateColumns: `repeat(${Math.min(post.stats.length, 3)}, 1fr)`, gap: 10 }}>
          {post.stats.map((s) => (
            <div key={s.label} style={{ background: 'var(--color-surface-2)', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 24, color: 'var(--color-text)', lineHeight: 1.1 }}>
                {s.n}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.35, marginTop: 2 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      <p
        style={{
          fontSize: 15, lineHeight: 1.65, color: 'var(--color-neutral-800)', margin: 0,
          whiteSpace: 'pre-wrap',
          display: isLong && !open ? '-webkit-box' : 'block',
          WebkitLineClamp: isLong && !open ? 6 : 'unset',
          WebkitBoxOrient: 'vertical',
          overflow: isLong && !open ? 'hidden' : 'visible',
        }}
      >
        {post.body}
      </p>
      <AttachmentList files={post.attachments} postId={post.id} />

      {isLong && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="self-start"
          style={{
            background: 'none', border: 0, padding: 0, font: 'inherit', cursor: 'pointer',
            fontSize: 13.5, fontWeight: 600, color: 'var(--color-accent-700)',
          }}
        >
          {open ? 'Show less' : 'Keep reading'}
        </button>
      )}

      {v === 'checklist' && Array.isArray(post.items) && (
        <div className="flex flex-col" style={{ gap: 9, marginTop: 2 }}>
          {post.items.map((t, i) => (
            <span key={t} className="flex gap-[10px] items-start" style={{ fontSize: 14, lineHeight: 1.5 }}>
              <span
                className="flex items-center justify-center"
                style={{
                  width: 20, height: 20, borderRadius: 999, flex: 'none', marginTop: 1,
                  background: 'var(--color-accent-2-200)', color: 'var(--color-accent-2-800)',
                  fontSize: 11, fontWeight: 700,
                }}
              >
                {i + 1}
              </span>
              {t}
            </span>
          ))}
        </div>
      )}

      {Array.isArray(post.tags) && post.tags.length > 0 && (
        <div className="flex gap-[6px] flex-wrap">
          {post.tags.map((t) => <span key={t} className="tag tag-accent-2">{t}</span>)}
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap" style={{ marginTop: 2 }}>
        {post.is_sample ? (
          <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
            Sample post. Real members' posts appear here as they join.
          </span>
        ) : isMine ? (
          <span className="badge badge-neutral">Your post</span>
        ) : post.author_email ? (
          // Messaging is unlocked by an accepted Connection. ConnectButton shows
          // the right control for wherever this pair currently stands, and asks
          // before it sends anything.
          <>
            {/* Following is the lightweight half: one tap, nothing sent to the
                author, it only decides whether their posts follow you around. */}
            <FollowButton
              targetEmail={post.author_email}
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

        {/* Only the app admin sees this. The server's rules on Post already
            restrict editing to admins, so this button is convenience, not the
            protection. */}
        {canEdit && !post.is_sample && (
          <>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
            <EditPostModal open={editing} onOpenChange={setEditing} post={post} onSaved={onSaved} />
          </>
        )}

        {/* A post is often the first place something feels off, so report and
            block live right here rather than only on the profile. */}
        {!post.is_sample && !isMine && post.author_email && (
          <span className="flex gap-4 items-center" style={{ marginLeft: 'auto' }}>
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

export default function Feed() {
  const { profile, email } = useProfile();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { blockedEmails, reloadBlocks } = useBlocks();
  const {
    connectionWith, requestConnection, busyEmail, connectionError, clearConnectionError,
  } = useConnections();
  const { isFollowing, toggleFollow, followBusyEmail, followingEmails } = useFollows();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState({ title: '', body: '', category: 'general' });
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const queue = useAttachmentQueue();

  const load = async () => {
    try {
      const rows = await base44.entities.Post.list('-created_date', 100);
      setPosts(Array.isArray(rows) ? rows : []);
    } catch {
      setPosts([]);
    }
    setLoading(false);
  };

  // Waits for the signed-in email so connections are matched against the real
  // user instead of null on the first pass.
  useEffect(() => { if (email) load(); }, [email]);

  const publish = async (e) => {
    e.preventDefault();
    if (posting || queue.blocked || !draft.title.trim() || !draft.body.trim()) return;
    setPosting(true);
    setError('');
    try {
      // Publishing runs through create-post, which sets the author from the
      // session and screens the content, so the draft is kept on screen if the
      // post is held back.
      const res = await base44.functions.invoke('create-post', { ...draft, attachments: queue.attachments });
      if (res?.data?.blocked) {
        setError(res.data.reason);
      } else {
        setDraft({ title: '', body: '', category: 'general' });
        queue.clear();
        setComposing(false);
        await load();
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not publish. Please try again.');
    }
    setPosting(false);
  };

  // Every post here is real. Posts from anyone I have blocked never reach me.
  const combined = useMemo(
    () => (loading
      ? []
      : posts.filter((p) => !p.author_email || !blockedEmails.includes(p.author_email))),
    [loading, posts, blockedEmails],
  );

  // "Following" is a view of the same feed narrowed to the people I follow, so
  // it lives alongside the topic filters rather than being a separate screen.
  const filtered = useMemo(() => {
    if (filter === 'all') return combined;
    if (filter === 'following') {
      return combined.filter(
        (p) => p.author_email && followingEmails.includes(String(p.author_email).toLowerCase()),
      );
    }
    return combined.filter((p) => p.category === filter);
  }, [combined, filter, followingEmails]);

  useEffect(() => { setVisible(PAGE_SIZE); }, [filter]);

  const counts = useMemo(() => {
    const c = {};
    for (const p of combined) c[p.category] = (c[p.category] || 0) + 1;
    return c;
  }, [combined]);

  return (
    <div className="flex flex-col" style={{ gap: 20 }}>
      <Seo title="Your Feed | Pathways" description="Long-form, firsthand college and career advice from students, professors, and counselors on Pathways." path="/app" noindex />
      <div>
        <h1 style={{ fontSize: 'clamp(26px,3.2vw,36px)', margin: '0 0 6px' }}>
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}.
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 15 }}>
          {combined.length === 0
            ? 'Nothing here yet. Be the first to write something someone else needs to read.'
            : `${combined.length} post${combined.length === 1 ? '' : 's'} from students, professors, and counselors who've been where you are.`}
        </p>
      </div>

      {connectionError && (
        <div
          role="alert"
          className="notice notice-warning flex items-start gap-3"
          style={{ flexDirection: 'row' }}
        >
          <span style={{ flex: 1 }}>{connectionError}</span>
          <button
            type="button"
            onClick={clearConnectionError}
            style={{ background: 'none', border: 0, cursor: 'pointer', font: 'inherit', color: 'inherit', opacity: 0.7 }}
          >
            Dismiss
          </button>
        </div>
      )}

      {composing ? (
        <form onSubmit={publish} className="card elev-md" style={{ padding: 22, gap: 14 }}>
          <div className="field">
            <label htmlFor="p-title">Title</label>
            <input
              id="p-title" className="input" autoFocus value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="What did you learn?"
            />
          </div>
          <div className="field">
            <label htmlFor="p-cat">Topic</label>
            <select
              id="p-cat" className="input" value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            >
              {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="p-body">Your post</label>
            <textarea
              id="p-body" className="input" style={{ minHeight: 150 }} value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              placeholder="Be specific and honest. What actually worked?"
            />
          </div>
          <AttachmentDropzone queue={queue} disabled={posting} />
          <p className="field-hint">Post attachments are shared with signed-in members. Non-image files are not content-scanned; do not share confidential student records.</p>
          {error && <span role="alert" className="msg msg-error">{error}</span>}
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={posting || queue.blocked}>
              {posting ? 'Posting…' : 'Post to the feed'}
            </button>
            <button type="button" className="btn btn-secondary" disabled={posting} onClick={() => setComposing(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        /* The composer entry point looks like a composer: your avatar, a
           field, and a button. It used to be a bare cream pill with a line of
           grey placeholder text, which read as a disabled input. */
        <div className="card elev-sm flex items-center gap-3" style={{ flexDirection: 'row', padding: '14px 16px' }}>
          <Avatar name={profile?.full_name} authorKey={email} size={38} />
          <button
            type="button"
            onClick={() => setComposing(true)}
            className="input text-left"
            style={{ flex: 1, minWidth: 0, cursor: 'text', color: 'var(--text-subtle)', background: 'var(--color-surface-2)', borderColor: 'transparent', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            Share something you learned…
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setComposing(true)}>
            <PenLine size={15} aria-hidden="true" /> <span className="hide-mobile">Write a post</span><span className="show-mobile">Post</span>
          </button>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {[['all', 'All'], ['following', 'Following'], ...Object.entries(CATEGORY_LABELS)].map(([v, l]) => (
          <button
            key={v}
            type="button"
            onClick={() => setFilter(v)}
            className="btn btn-chip"
            aria-pressed={filter === v}
          >
            {l}
            {v !== 'all' && counts[v] ? (
              <span style={{ opacity: 0.6, marginLeft: 2, fontSize: 12 }}>{counts[v]}</span>
            ) : null}
          </button>
        ))}
      </div>

      {loading ? (
        <p role="status" style={{ color: 'var(--text-subtle)' }}>Loading the feed…</p>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <span className="empty-icon"><Users size={20} aria-hidden="true" /></span>
          <p className="empty-title">{filter === 'following' ? 'Nothing from people you follow yet' : 'Nothing here yet'}</p>
          <p className="empty-body">
            {filter === 'following'
              ? 'Follow students and mentors from Explore and their posts will show up here.'
              : 'Be the first to write something someone else needs to read.'}
          </p>
          {filter === 'following'
            ? <a href="/app/explore" className="btn btn-secondary no-underline" style={{ marginTop: 6 }}>Find people to follow</a>
            : <button type="button" className="btn btn-primary" style={{ marginTop: 6 }} onClick={() => setComposing(true)}>Write the first post</button>}
        </div>
      ) : (
        <>
          <div className="flex flex-col" style={{ gap: 16 }}>
            {filtered.slice(0, visible).map((p) => (
              <PostCard
                key={p.id}
                post={p}
                connection={p.author_email ? connectionWith(p.author_email) : null}
                busy={busyEmail === p.author_email}
                onConnect={requestConnection}
                isMine={Boolean(email && p.author_email === email)}
                onBlocked={reloadBlocks}
                canEdit={isAdmin}
                onSaved={load}
                following={p.author_email ? isFollowing(p.author_email) : false}
                followBusy={followBusyEmail === String(p.author_email || '').toLowerCase()}
                onToggleFollow={toggleFollow}
              />
            ))}
          </div>

          {visible < filtered.length && (
            <button
              type="button"
              className="btn btn-secondary self-center"
              onClick={() => setVisible((n) => n + PAGE_SIZE)}
            >
              Show more ({filtered.length - visible} left)
            </button>
          )}
        </>
      )}
    </div>
  );
}