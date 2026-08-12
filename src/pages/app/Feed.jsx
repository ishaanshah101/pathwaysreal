import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useProfile, ROLE_LABELS, CATEGORY_LABELS } from '@/lib/useProfile';

const SEED_POSTS = [
  {
    title: 'What I wish I knew before writing my Common App essay',
    body: "I rewrote mine four times. The version that worked was the one where I stopped trying to sound impressive and just described a Tuesday afternoon at my grandmother's shop. Admissions readers see thousands of essays about leadership. They see almost none about a kid who actually noticed something. Pick a small moment you can describe in detail, then explain what it changed about how you see things. That's the whole formula.",
    author_name: 'Sofia Reyes',
    author_role: 'college_student',
    author_headline: 'CMU first-year, Information Systems',
    category: 'essays',
    tags: ['common app', 'essays'],
  },
  {
    title: 'Scholarships nobody applies for are the ones you should apply for',
    body: "Everyone applies to the big national scholarships with 40,000 applicants. Meanwhile your county community foundation has a $2,500 award with eleven applicants and a two-paragraph essay. Search your state name plus community foundation scholarship, then check your school counselor's local list. I stacked six small local awards into more money than any single national one would have given me.",
    author_name: 'Marcus Webb',
    author_role: 'counselor',
    author_headline: 'School counselor, 12 years',
    category: 'scholarships',
    tags: ['scholarships', 'money'],
  },
  {
    title: 'You do not need to know your major',
    body: "I have advised undergraduates for nineteen years. The students who struggle most are not the undecided ones, they are the ones who locked in at seventeen and felt they could not change course. Roughly a third of students switch majors at least once. Pick a school with strength in two or three areas you find interesting rather than one that is elite in a single field you have never actually studied.",
    author_name: 'Dr. Alice Nkemdi',
    author_role: 'educator',
    author_headline: 'Professor of Biology, advising 19 years',
    category: 'majors',
    tags: ['majors', 'advice'],
  },
  {
    title: 'How I got a research internship with no connections',
    body: "I emailed 31 professors. Four replied, one said yes. The emails that got responses were the ones where I named a specific paper of theirs and asked a real question about it, then offered to do the boring work. The ones that got ignored said I am very passionate about science. Read one paper, ask one honest question, offer to do data entry. That is it.",
    author_name: 'Priya Raman',
    author_role: 'college_student',
    author_headline: 'UC Berkeley, Molecular Biology',
    category: 'internships',
    tags: ['research', 'internships', 'cold email'],
  },
];

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
  return new Date(iso).toLocaleDateString();
}

function PostCard({ post }) {
  const initial = (post.author_name || '?').charAt(0).toUpperCase();
  return (
    <article className="card elev-sm" style={{ padding: 22, gap: 12, borderRadius: 26 }}>
      <div className="flex items-center gap-3">
        <span
          className="flex items-center justify-center"
          style={{
            width: 38, height: 38, borderRadius: 999, flex: 'none',
            background: 'var(--color-accent-2-200)', fontFamily: 'var(--font-heading)', fontSize: 16,
          }}
        >
          {initial}
        </span>
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

      <h3 style={{ fontSize: 19, margin: 0, textWrap: 'balance' }}>{post.title}</h3>
      <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--color-neutral-800)', margin: 0, whiteSpace: 'pre-wrap' }}>
        {post.body}
      </p>

      {post.author_email && (
        <Link
          to={`/app/messages?to=${encodeURIComponent(post.author_email)}`}
          className="btn btn-secondary self-start"
          style={{ fontSize: 13 }}
        >
          Message {String(post.author_name || '').split(' ')[0] || 'them'}
        </Link>
      )}
    </article>
  );
}

export default function Feed() {
  const { profile, email } = useProfile();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState({ title: '', body: '', category: 'applications' });
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const rows = await base44.entities.Post.list('-created_date', 60);
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

  const combined = loading ? [] : [...posts, ...SEED_POSTS.map((p, i) => ({ ...p, id: `seed-${i}` }))];
  const visible = filter === 'all' ? combined : combined.filter((p) => p.category === filter);

  return (
    <div className="flex flex-col" style={{ gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 'clamp(26px,3.2vw,36px)', margin: '0 0 6px' }}>
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}.
        </h1>
        <p style={{ color: 'var(--color-neutral-800)', margin: 0 }}>
          Real posts from students, professors, and counselors who've been where you are.
        </p>
      </div>

      {composing ? (
        <form onSubmit={publish} className="card elev-sm" style={{ padding: 22, gap: 14, borderRadius: 26 }}>
          <div className="field">
            <label htmlFor="p-title">Title</label>
            <input
              id="p-title"
              className="input"
              autoFocus
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="What did you learn?"
            />
          </div>
          <div className="field">
            <label htmlFor="p-cat">Topic</label>
            <select
              id="p-cat"
              className="input"
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            >
              {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="p-body">Your post</label>
            <textarea
              id="p-body"
              className="input"
              style={{ minHeight: 130 }}
              value={draft.body}
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
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-neutral-600)' }}>Loading the feed…</p>
      ) : visible.length === 0 ? (
        <p style={{ color: 'var(--color-neutral-600)' }}>Nothing here yet under this topic. Be the first to post.</p>
      ) : (
        <div className="flex flex-col" style={{ gap: 16 }}>
          {visible.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      )}
    </div>
  );
}
