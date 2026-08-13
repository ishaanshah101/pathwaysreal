import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useProfile, ROLE_LABELS, CATEGORY_LABELS } from '@/lib/useProfile';
import { SAMPLE_FEED, authorAvatar, initialsOf } from '@/data/sampleContent';
import CoverArt from '@/components/app/CoverArt';

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
        fontFamily: 'var(--font-heading)', fontSize: size * 0.4,
      }}
    >
      {initialsOf(name)}
    </span>
  );
}

function PostCard({ post }) {
  const v = post.variant || 'plain';
  const isLong = (post.body || '').length > 620;
  const [open, setOpen] = useState(false);

  return (
    <article className="card elev-sm" style={{ padding: 22, gap: 13, borderRadius: 26 }}>
      <div className="flex items-center gap-3">
        <Avatar name={post.author_name} authorKey={post.author_key} />
        <div className="flex flex-col" style={{ minWidth: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{post.author_name || 'A Pathways member'}</span>
          <span style={{ fontSize: 12, color: 'var(--color-neutral-600)' }}>
            {post.author_headline || ROLE_LABELS[post.author_role] || 'Member'}
            {post.created_date ? ` · ${timeAgo(post.created_date)}` : ''}
          </span>
        </div>
        <span className="tag tag-accent" style={{ marginLeft: 'auto', flex: 'none' }}>
          {CATEGORY_LABELS[post.category] || 'Advice'}
        </span>
      </div>

      {v === 'cover' && <CoverArt postId={post.id} category={post.category} />}

      <h3 style={{ fontSize: 19.5, margin: 0, textWrap: 'balance', lineHeight: 1.25 }}>{post.title}</h3>

      {v === 'quote' && post.quote && (
        <blockquote
          style={{
            margin: 0, padding: '14px 18px', borderRadius: 16,
            borderLeft: '4px solid var(--color-accent)',
            background: 'var(--color-bg)',
            fontSize: 15.5, lineHeight: 1.5, fontStyle: 'italic',
          }}
        >
          {post.quote}
        </blockquote>
      )}

      {v === 'stats' && Array.isArray(post.stats) && (
        <div className="grid" style={{ gridTemplateColumns: `repeat(${Math.min(post.stats.length, 3)}, 1fr)`, gap: 10 }}>
          {post.stats.map((s) => (
            <div key={s.label} style={{ background: 'var(--color-bg)', borderRadius: 16, padding: '12px 14px' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 24, color: 'var(--color-accent-700)', lineHeight: 1.1 }}>
                {s.n}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--color-neutral-700)', lineHeight: 1.35, marginTop: 2 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      <p
        style={{
          fontSize: 14.5, lineHeight: 1.65, color: 'var(--color-neutral-800)', margin: 0,
          whiteSpace: 'pre-wrap',
          display: isLong && !open ? '-webkit-box' : 'block',
          WebkitLineClamp: isLong && !open ? 6 : 'unset',
          WebkitBoxOrient: 'vertical',
          overflow: isLong && !open ? 'hidden' : 'visible',
        }}
      >
        {post.body}
      </p>

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
          <span style={{ fontSize: 11.5, color: 'var(--color-neutral-600)' }}>
            Sample post — real members' posts appear here as they join.
          </span>
        ) : post.author_email ? (
          <Link
            to={`/app/messages?to=${encodeURIComponent(post.author_email)}`}
            className="btn btn-secondary"
            style={{ fontSize: 13 }}
          >
            Message {String(post.author_name || '').split(' ')[0] || 'them'}
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export default function Feed() {
  const { profile, email } = useProfile();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState({ title: '', body: '', category: 'applications' });
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const rows = await base44.entities.Post.list('-created_date', 100);
      setPosts(Array.isArray(rows) ? rows : []);
    } catch {
      setPosts([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const publish = async (e) => {
    e.preventDefault();
    if (!draft.title.trim() || !draft.body.trim()) return;
    setPosting(true);
    setError('');
    try {
      await base44.entities.Post.create({
        ...draft,
        author_email: email,
        author_name: profile?.full_name || 'A Pathways member',
        author_role: profile?.role || 'student',
        author_headline: profile?.headline || [profile?.grade, profile?.school].filter(Boolean).join(' · '),
      });
      setDraft({ title: '', body: '', category: 'applications' });
      setComposing(false);
      await load();
    } catch (err) {
      setError(err?.message || 'Could not publish. Please try again.');
    }
    setPosting(false);
  };

  // Real posts always sit above the sample ones so a new member's post is the
  // first thing they see after publishing.
  const combined = useMemo(
    () => (loading ? [] : [...posts, ...SAMPLE_FEED]),
    [loading, posts],
  );

  const filtered = useMemo(
    () => (filter === 'all' ? combined : combined.filter((p) => p.category === filter)),
    [combined, filter],
  );

  useEffect(() => { setVisible(PAGE_SIZE); }, [filter]);

  const counts = useMemo(() => {
    const c = {};
    for (const p of combined) c[p.category] = (c[p.category] || 0) + 1;
    return c;
  }, [combined]);

  return (
    <div className="flex flex-col" style={{ gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 'clamp(26px,3.2vw,36px)', margin: '0 0 6px' }}>
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}.
        </h1>
        <p style={{ color: 'var(--color-neutral-800)', margin: 0 }}>
          {combined.length} posts from students, professors, and counselors who've been where you are.
        </p>
      </div>

      {composing ? (
        <form onSubmit={publish} className="card elev-sm" style={{ padding: 22, gap: 14, borderRadius: 26 }}>
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
          {error && <span style={{ fontSize: 13, color: 'var(--color-accent-700)' }}>{error}</span>}
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={posting}>
              {posting ? 'Posting…' : 'Post to the feed'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setComposing(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setComposing(true)}
          className="card elev-sm text-left"
          style={{ padding: '18px 22px', borderRadius: 26, cursor: 'pointer', border: 0, font: 'inherit', color: 'var(--color-neutral-600)' }}
        >
          Share something you learned…
        </button>
      )}

      <div className="flex gap-2 flex-wrap">
        {[['all', 'All'], ...Object.entries(CATEGORY_LABELS)].map(([v, l]) => (
          <button
            key={v}
            type="button"
            onClick={() => setFilter(v)}
            className="btn"
            style={{
              fontFamily: 'var(--font-body)', fontSize: 13, padding: '6px 13px',
              background: filter === v ? 'var(--color-accent-2-600)' : 'transparent',
              color: filter === v ? 'var(--color-bg)' : 'var(--color-text)',
              borderColor: filter === v ? 'transparent' : 'var(--color-divider)',
            }}
          >
            {l}
            {v !== 'all' && counts[v] ? (
              <span style={{ opacity: 0.65, marginLeft: 5, fontSize: 12 }}>{counts[v]}</span>
            ) : null}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-neutral-600)' }}>Loading the feed…</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--color-neutral-600)' }}>Nothing here yet under this topic. Be the first to post.</p>
      ) : (
        <>
          <div className="flex flex-col" style={{ gap: 16 }}>
            {filtered.slice(0, visible).map((p) => <PostCard key={p.id} post={p} />)}
          </div>

          {visible < filtered.length && (
            <button
              type="button"
              className="btn btn-secondary self-center"
              style={{ fontSize: 14, padding: '11px 26px' }}
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
