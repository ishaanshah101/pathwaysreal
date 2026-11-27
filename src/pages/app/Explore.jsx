import React, { useEffect, useState } from 'react';
import { Search, UserSearch } from 'lucide-react';
import { ROLE_LABELS } from '@/lib/useProfile';
import SafetyActions from '@/components/safety/SafetyActions';
import ConnectButton from '@/components/app/ConnectButton';
import FollowButton from '@/components/app/FollowButton';
import VerifiedBadge from '@/components/app/VerifiedBadge';
import { useFollows } from '@/lib/useFollows';
import { useBlocks } from '@/lib/useBlocks';
import { useConnections } from '@/lib/useConnections';
import { useDirectory } from '@/lib/usePeople';
import Seo from '@/components/Seo';
import PullToRefresh from '@/components/app/PullToRefresh';
import PageHead from '@/components/kit/PageHead';
import Plate from '@/components/kit/Plate';
import Icon from '@/components/kit/Icon';
import EmptyState from '@/components/ui/EmptyState';

// One person in the directory. Set like an entry in the index at the back of
// an atlas: a rule, a name, one line on who they are, and what you can do.
function PersonEntry({ m, onConnect, connection, busy, onBlocked, following, followBusy, onToggleFollow }) {
  const isSample = Boolean(m.is_sample_profile);
  const topics = [...(Array.isArray(m.expertise) ? m.expertise : []), ...(Array.isArray(m.interests) ? m.interests : [])]
    .filter((t, i, a) => a.indexOf(t) === i).slice(0, 4);

  return (
    <article className="person">
      <div className="person-head">
        <Plate name={m.full_name} seed={m.key || m.user_email || m.full_name} size={52} />
        <div style={{ minWidth: 0 }}>
          <div className="person-name">
            <h2>{m.full_name}</h2>
            <VerifiedBadge verified={!isSample && m.verified} />
          </div>
          <div className="person-line">
            {m.headline || [m.job_title, m.institution].filter(Boolean).join(', ') || [m.grade, m.school].filter(Boolean).join(' · ') || ROLE_LABELS[m.role]}
          </div>
        </div>
      </div>

      {(m.bio || m.help_with) && (
        <p className="person-bio">{m.bio || m.help_with}</p>
      )}

      {topics.length > 0 && (
        <div className="dir-tags">
          {topics.map((t) => <span key={t} className="tag">{t}</span>)}
        </div>
      )}

      <div className="person-foot">
        {isSample ? (
          <>
            {m.post_count > 0 && (
              <span className="meta num">
                {m.post_count} post{m.post_count === 1 ? '' : 's'} in the feed
              </span>
            )}
            <span className="meta dir-sample">Sample profile</span>
          </>
        ) : (
          // The same control the feed uses, so connecting behaves identically
          // wherever you meet someone. It handles every state itself, including
          // confirming before a request is sent.
          <>
            {/* Follow is the no-permission-needed option: it only adds their
                posts to your feed. Connect is the mutual one that opens
                messaging. */}
            <div className="dir-acts">
              <FollowButton
                targetEmail={m.member_ref || m.user_email}
                targetName={m.full_name}
                following={following}
                busy={followBusy}
                onToggle={onToggleFollow}
              />
              <ConnectButton
                targetEmail={m.user_email || m.member_ref}
                targetName={m.full_name}
                connection={connection}
                busy={busy}
                onConnect={onConnect}
              />
            </div>

            {/* Reporting and blocking are available on every real profile, not
                just once a conversation has already gone wrong. */}
            <div className="dir-safety">
              <SafetyActions
                targetEmail={m.member_ref || m.user_email}
                targetName={m.full_name}
                contextType="profile"
                contextId={m.id}
                onBlocked={onBlocked}
              />
            </div>
          </>
        )}
      </div>
    </article>
  );
}

// Holds the shape of the directory while it loads, so nothing jumps when the
// people arrive.
function DirectorySkeleton() {
  return (
    <div className="people-grid dir-loading" role="status" aria-label="Finding people">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="person" aria-hidden="true">
          <div className="person-head">
            <span className="skeleton" style={{ width: 52, height: 52, borderRadius: '22%' }} />
            <div className="person-line">
              <span className="skeleton skeleton-title" style={{ width: '58%' }} />
              <span className="skeleton skeleton-line" style={{ width: '82%' }} />
            </div>
          </div>
          <div className="person-bio">
            <span className="skeleton skeleton-line" />
            <span className="skeleton skeleton-line" style={{ width: '70%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Explore() {
  const { reloadBlocks } = useBlocks();
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const [search, setSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearch(q.trim()), 300);
    return () => clearTimeout(timer);
  }, [q]);
  const [followingOnly, setFollowingOnly] = useState(false);

  // Follows are their own thing, entirely separate from connections: one-way,
  // no request, no messaging.
  const {
    isFollowing, toggleFollow, followBusyEmail, followingEmails, followingCount, followerCount,
  } = useFollows();

  // Connections are owned by one hook now, shared with the feed and the shell.
  // Explore used to keep its own copy and answer requests with a direct
  // Connection.update, which would have let the person who SENT a request mark
  // it accepted themselves and unlock messaging. Answering now goes through
  // respond-connection, which checks who is asking.
  const {
    connectionWith, requestConnection, busyEmail, connectionError, clearConnectionError,
  } = useConnections();

  // The directory comes from the get-profile function, not from
  // Profile.list(). The entity's read rule only ever matched your own row or an
  // admin, so listing from the browser returned a directory of one for every
  // normal member — and everything for the admin testing it, which is why this
  // looked fine. get-profile reads as service role and shapes each row for the
  // person asking, so a student who is not connected to someone never receives
  // that person's school, grade or goals in the first place.
  const {
    people: list, loading, total, topics: allTopics, error: directoryError,
    reload: load, hasMore, loadMore, loadingMore,
  } = useDirectory({ search, role: roleFilter, topic: topicFilter, followingOnly, followingRefs: followingEmails });

  const filtered = Boolean(q || roleFilter !== 'all' || topicFilter !== 'all' || followingOnly);
  const clearFilters = () => { setQ(''); setRoleFilter('all'); setTopicFilter('all'); setFollowingOnly(false); };

  // The count is only stated once it is known. While the directory is loading,
  // or if it failed to load, the head does not claim there are 0 people.
  const sub = loading
    ? 'Looking for people. Connecting is always free.'
    : directoryError
      ? 'Connecting is always free.'
      : total === 0
        ? `${filtered ? 'Nobody matches those filters.' : 'Nobody else is here yet.'} Connecting is always free.`
        : `${total} ${total === 1 ? 'person' : 'people'} you can learn from. Connecting is always free.`;

  const page = (
    <div className="page">
      <Seo title="Find a Mentor | Pathways" description="Search and connect with students, professors, and counselors on Pathways. Connecting is always free." path="/app/explore" noindex />

      <PageHead kicker="Explore" title="Find someone who's been there." sub={sub} live />

      <div className="dir-controls">
        {/* A failed load must not read as an empty directory. Before this, any
            error resolved to an empty array and the page cheerfully announced
            "0 students, professors, and counselors". */}
        {directoryError && (
          <div className="notice notice-error flex items-center gap-3" role="alert">
            <span style={{ flex: 1 }}>{directoryError}</span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={load}>
              Try again
            </button>
          </div>
        )}

        {connectionError && (
          <div role="alert" className="notice notice-warning flex items-start gap-3">
            <span style={{ flex: 1 }}>{connectionError}</span>
            <button type="button" className="link-btn" style={{ fontWeight: 700 }} onClick={clearConnectionError}>
              Dismiss
            </button>
          </div>
        )}

        <div className="searchbox dir-search">
          <Icon as={Search} size={17} />
          <input
            aria-label="Search by name, school, or topic"
            maxLength={100}
            className="input"
            type="search"
            placeholder="Search by name, school, or topic"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="filter-block dir-filters">
          <div className="filter-row" role="group" aria-label="Filter by who they are">
            <span className="filter-label">Who</span>
            <div className="dir-chips">
              {[['all', 'Everyone'], ...Object.entries(ROLE_LABELS)].map(([v, l]) => (
                <button key={v} type="button" onClick={() => setRoleFilter(v)} className="btn btn-chip" aria-pressed={roleFilter === v}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {allTopics.length > 0 && (
            <div className="filter-row" role="group" aria-label="Filter by topic">
              <span className="filter-label">Topic</span>
              <div className="dir-chips">
                {[['all', 'All topics'], ...allTopics.map((t) => [t, t])].map(([v, l]) => (
                  <button key={v} type="button" onClick={() => setTopicFilter(v)} className="btn btn-chip" aria-pressed={topicFilter === v}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="filter-row">
            <span className="filter-label">Follows</span>
            <div className="dir-chips">
              {/* Following is one-way, so this list is yours alone. */}
              <button
                type="button"
                onClick={() => setFollowingOnly((v) => !v)}
                className="btn btn-chip"
                aria-pressed={followingOnly}
              >
                Only people you follow
                <span className="num">{followingCount}</span>
              </button>
              {followerCount > 0 && (
                <span className="meta num">
                  {followerCount} {followerCount === 1 ? 'person follows' : 'people follow'} you
                </span>
              )}
              {filtered && (
                <button type="button" className="quiet-link" onClick={clearFilters}>Clear filters</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <DirectorySkeleton />
      ) : list.length === 0 ? (
        <EmptyState
          icon={UserSearch}
          title="Nobody matches that search yet."
          body="Try a broader topic or clear the filters. New students and mentors join every week."
          action={filtered && (
            <button type="button" className="btn btn-secondary" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        />
      ) : (
        <>
          <div className="people-grid">
            {list.map((m) => (
              <PersonEntry
                key={m.id}
                m={m}
                onConnect={async (target) => { const result = await requestConnection(target); if (result?.ok) await load(); return result; }}
                connection={connectionWith(m.user_email) || m.connection}
                busy={busyEmail === (m.user_email || m.member_ref)}
                onBlocked={async () => { await reloadBlocks(); await load(); }}
                following={isFollowing(m.member_ref || m.user_email)}
                followBusy={followBusyEmail === String(m.member_ref || m.user_email || '').toLowerCase()}
                onToggleFollow={toggleFollow}
              />
            ))}
          </div>

          {hasMore && (
            <div className="dir-more">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={loadingMore}
                onClick={loadMore}
              >
                {loadingMore ? 'Loading…' : 'Show more people'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  // Swipe down at the top of the directory to reload it.
  return <PullToRefresh onRefresh={load}>{page}</PullToRefresh>;
}
