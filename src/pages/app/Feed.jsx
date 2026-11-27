import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PenLine, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useProfile, CATEGORY_LABELS } from '@/lib/useProfile';
import { useAuth } from '@/lib/AuthContext';
import AttachmentDropzone from '@/components/attachments/AttachmentDropzone';
import useAttachmentQueue from '@/components/attachments/useAttachmentQueue';
import { useFollows } from '@/lib/useFollows';
import { useBlocks } from '@/lib/useBlocks';
import { useConnections } from '@/lib/useConnections';
import Seo from '@/components/Seo';
import OfflineBanner from '@/components/app/OfflineBanner';
import PullToRefresh from '@/components/app/PullToRefresh';
import PushOptInCard from '@/components/app/PushOptInCard';
import PostArticle from '@/components/app/PostArticle';
import FieldSelect from '@/components/ui/FieldSelect';
import PageHead from '@/components/kit/PageHead';
import Plate from '@/components/kit/Plate';
import Sign from '@/components/kit/Sign';
import Icon from '@/components/kit/Icon';
import { useSavedPosts } from '@/lib/useSavedPosts';
import { useOnline } from '@/lib/useOnline';
import { usePeopleByEmail } from '@/lib/usePeople';
import { signFor } from '@/lib/categories';
import { GLOSSARY, termId } from '@/data/glossary';

const PAGE_SIZE = 12;
// Posts already read are kept here so the feed still has something to show with
// no connection, instead of an empty state that looks like a bug.
const FEED_CACHE_KEY = 'pathways.feedCache';

function readFeedCache() {
  try { return JSON.parse(localStorage.getItem(FEED_CACHE_KEY) || '[]'); } catch { return []; }
}

function writeFeedCache(rows) {
  try { localStorage.setItem(FEED_CACHE_KEY, JSON.stringify(rows.slice(0, 40))); } catch { /* quota */ }
}

// A different glossary term each day, the same one for everybody that day.
function wordOfTheDay() {
  const day = Math.floor(Date.now() / 86400000);
  return GLOSSARY[day % GLOSSARY.length];
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
  const { isSaved, toggleSave, busyPostId } = useSavedPosts();
  const online = useOnline();
  const [offlineCached, setOfflineCached] = useState(false);
  const [posts, setPosts] = useState([]);
  const { profileFor } = usePeopleByEmail(posts.map((p) => p.author_email));
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState({ title: '', body: '', category: 'general' });
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [params, setParams] = useSearchParams();
  const focusId = params.get('post');
  const queue = useAttachmentQueue();

  // The jump menu's "Write a post" lands here with ?compose=1.
  useEffect(() => {
    if (params.get('compose') === '1') {
      setComposing(true);
      const next = new URLSearchParams(params);
      next.delete('compose');
      setParams(next, { replace: true });
    }
  }, [params, setParams]);

  const load = async () => {
    try {
      const rows = await base44.entities.Post.list('-created_date', 100);
      const list = Array.isArray(rows) ? rows : [];
      setPosts(list);
      setOfflineCached(false);
      writeFeedCache(list);
    } catch {
      // Offline, or the request failed: fall back to what was read last rather
      // than showing an empty feed.
      const cached = readFeedCache();
      setPosts(cached);
      setOfflineCached(cached.length > 0);
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
      : posts.map((p) => ({ ...p, author_ref: profileFor(p.author_email)?.member_ref }))
        .filter((p) => !blockedEmails.includes(p.author_email) && !blockedEmails.includes(p.author_ref))),
    [loading, posts, blockedEmails, profileFor],
  );

  // "Following" is a view of the same feed narrowed to the people I follow, so
  // it lives alongside the topic filters rather than being a separate screen.
  const filtered = useMemo(() => {
    let rows = combined;
    if (filter === 'following') {
      rows = rows.filter(
        (p) => followingEmails.includes(String(p.author_ref || p.author_email || '').toLowerCase()),
      );
    } else if (filter !== 'all') {
      rows = rows.filter((p) => p.category === filter);
    }
    const needle = query.trim().toLowerCase();
    if (needle) {
      rows = rows.filter((p) => [p.title, p.body, p.author_name, p.author_headline, ...(p.tags || [])]
        .join(' ').toLowerCase().includes(needle));
    }
    // A shared link puts its post first, so it is on screen without scrolling.
    if (focusId) {
      const hit = combined.find((p) => p.id === focusId);
      if (hit) rows = [hit, ...rows.filter((p) => p.id !== focusId)];
    }
    return rows;
  }, [combined, filter, followingEmails, query, focusId]);

  useEffect(() => { setVisible(PAGE_SIZE); }, [filter, query]);

  const counts = useMemo(() => {
    const c = {};
    for (const p of combined) c[p.category] = (c[p.category] || 0) + 1;
    return c;
  }, [combined]);

  const word = wordOfTheDay();
  const first = profile?.full_name ? profile.full_name.split(' ')[0] : '';
  const filters = [['all', 'All posts'], ['following', 'Following'], ...Object.entries(CATEGORY_LABELS)];
  const followingCount = combined.filter(
    (p) => followingEmails.includes(String(p.author_ref || p.author_email || '').toLowerCase()),
  ).length;
  const countFor = (v) => (v === 'all' ? combined.length : v === 'following' ? followingCount : counts[v] || 0);

  return (
    // Swipe down at the top of the feed to reload it, the way a native app does.
    <PullToRefresh onRefresh={load}>
      <div className="page">
        <Seo title="Your Feed | Pathways" description="Long-form, firsthand college and career advice from students, professors, and counselors on Pathways." path="/app" noindex />

        <PageHead
          kicker="Feed"
          title={first ? `Welcome back, ${first}.` : 'Welcome back.'}
          sub={combined.length === 0
            ? 'Nothing here yet. Be the first to write something someone else needs to read.'
            : `${combined.length} post${combined.length === 1 ? '' : 's'} from students, professors, and counselors who've been where you are.`}
        >
          {!composing && (
            <button type="button" className="btn btn-primary hide-mobile" onClick={() => setComposing(true)}>
              <Icon as={PenLine} size={16} /> Write a post
            </button>
          )}
        </PageHead>

        <div className="feed-layout">
          <div style={{ display: 'grid', gap: 18, minWidth: 0 }}>
            {(!online || offlineCached) && <OfflineBanner cached={posts.length} />}

            {/* Asked here, inside the app, after onboarding, and only when the
                member presses the button. Never a permission prompt on load. */}
            <PushOptInCard />

            {connectionError && (
              <div role="alert" className="notice notice-warning flex items-start gap-3">
                <span style={{ flex: 1 }}>{connectionError}</span>
                <button type="button" className="link-btn" style={{ fontWeight: 700 }} onClick={clearConnectionError}>Dismiss</button>
              </div>
            )}

            {composing ? (
              <form onSubmit={publish} className="panel">
                <div className="panel-head">New post</div>
                <div className="panel-body" style={{ display: 'grid', gap: 16, padding: 18 }}>
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
                    <FieldSelect
                      id="p-cat"
                      value={draft.category}
                      onValueChange={(category) => setDraft({ ...draft, category })}
                      options={Object.entries(CATEGORY_LABELS)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="p-body">Your post</label>
                    <textarea
                      id="p-body" className="input" style={{ minHeight: 180, fontFamily: 'var(--font-read)', fontSize: 17, lineHeight: 1.6 }} value={draft.body}
                      onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                      placeholder="Be specific and honest. What actually worked?"
                    />
                  </div>
                  <AttachmentDropzone queue={queue} disabled={posting} />
                  <p className="field-hint" style={{ margin: 0 }}>Post attachments are shared with signed-in members. Non-image files are not content-scanned; do not share confidential student records.</p>
                  {error && <span role="alert" className="msg msg-error">{error}</span>}
                  <div className="flex gap-2 flex-wrap">
                    <button type="submit" className="btn btn-primary" disabled={posting || queue.blocked}>
                      {posting ? 'Posting…' : 'Post to the feed'}
                    </button>
                    <button type="button" className="btn btn-quiet" disabled={posting} onClick={() => setComposing(false)}>Cancel</button>
                  </div>
                </div>
              </form>
            ) : (
              /* The composer entry point looks like a composer: your plate, a
                 field, and a button. */
              <div className="composer-bar">
                <Plate name={profile?.full_name} seed={email} size={40} />
                <button type="button" className="composer-field" onClick={() => setComposing(true)}>
                  Share something you learned…
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setComposing(true)}>Post</button>
              </div>
            )}

            <div className="searchbox">
              <Icon as={Search} size={17} />
              <input
                className="input"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts by word, person, or tag"
                aria-label="Search posts"
              />
            </div>

            {/* On narrower screens the legend becomes a row of signs. */}
            <div className="feed-chips" role="group" aria-label="Filter posts">
              {filters.map(([v, l]) => (
                <button key={v} type="button" className={`sign sign-${v === 'all' || v === 'following' ? 'ink' : signFor(v)}`} aria-pressed={filter === v} onClick={() => setFilter(v)}>
                  {l}
                </button>
              ))}
            </div>

            {loading ? (
              <div role="status" aria-label="Loading the feed" style={{ display: 'grid', gap: 14, paddingTop: 8 }}>
                <span className="skeleton skeleton-title" style={{ width: '70%' }} />
                <span className="skeleton skeleton-line" />
                <span className="skeleton skeleton-line" style={{ width: '92%' }} />
                <span className="skeleton skeleton-line" style={{ width: '64%' }} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty">
                <p className="empty-title">
                  {query ? `No posts match “${query}”.` : filter === 'following' ? 'Nothing from people you follow yet.' : 'Nothing here yet.'}
                </p>
                <p className="empty-body">
                  {query
                    ? 'Try one word instead of a phrase, or clear the topic filter.'
                    : filter === 'following'
                      ? 'Follow students and mentors from Explore and their posts will show up here.'
                      : 'Be the first to write something someone else needs to read.'}
                </p>
                {query
                  ? <button type="button" className="btn btn-secondary" style={{ marginTop: 6 }} onClick={() => { setQuery(''); setFilter('all'); }}>Clear search</button>
                  : filter === 'following'
                    ? <Link to="/app/explore" className="btn btn-secondary" style={{ marginTop: 6 }}>Find people to follow</Link>
                    : <button type="button" className="btn btn-primary" style={{ marginTop: 6 }} onClick={() => setComposing(true)}>Write the first post</button>}
              </div>
            ) : (
              <>
                <div>
                  {filtered.slice(0, visible).map((p, i) => (
                    <React.Fragment key={p.id}>
                      {i > 0 && <hr className="lane lane-soft" />}
                      <PostArticle
                        post={p}
                        connection={p.author_email ? connectionWith(p.author_email) : null}
                        busy={busyEmail === p.author_email}
                        onConnect={requestConnection}
                        isMine={Boolean(email && p.author_email === email)}
                        onBlocked={reloadBlocks}
                        canEdit={isAdmin}
                        onSaved={load}
                        following={isFollowing(p.author_ref || p.author_email)}
                        followBusy={followBusyEmail === String(p.author_ref || p.author_email || '').toLowerCase()}
                        onToggleFollow={toggleFollow}
                        saved={isSaved(p.id)}
                        saveBusy={busyPostId === p.id}
                        onToggleSave={toggleSave}
                        verified={profileFor(p.author_email)?.verified === true}
                        focused={focusId === p.id}
                      />
                    </React.Fragment>
                  ))}
                </div>

                {visible < filtered.length && (
                  <button type="button" className="btn btn-secondary" style={{ justifySelf: 'center' }} onClick={() => setVisible((n) => n + PAGE_SIZE)}>
                    Show more ({filtered.length - visible} left)
                  </button>
                )}
              </>
            )}
          </div>

          <aside className="feed-aside" aria-label="Filter and reference">
            <div className="panel">
              <div className="panel-head">Legend · filter by topic</div>
              <ul className="legend-filter">
                {filters.map(([v, l]) => (
                  <li key={v}>
                    <button type="button" className="legend-row" aria-pressed={filter === v} onClick={() => setFilter(v)}>
                      {v === 'all' || v === 'following'
                        ? <span style={{ fontWeight: 800 }}>{l}</span>
                        : <Sign color={signFor(v)}>{l}</Sign>}
                      <span className="meta num">{countFor(v)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel aside-word">
              <div className="panel-head">Word of the day</div>
              <div className="panel-body">
                <b>{word.term}</b>
                <p>{word.def}</p>
                <Link to={`/app/glossary#${termId(word.term)}`} style={{ fontWeight: 800, fontSize: 14.5 }}>Open the glossary</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PullToRefresh>
  );
}
