import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useProfile, ROLE_LABELS } from '@/lib/useProfile';
import { authorAvatar, initialsOf } from '@/lib/avatar';
import SafetyActions from '@/components/safety/SafetyActions';
import ConnectButton from '@/components/app/ConnectButton';
import FollowButton from '@/components/app/FollowButton';
import { useFollows } from '@/lib/useFollows';
import { useBlocks } from '@/lib/useBlocks';
import { useConnections } from '@/lib/useConnections';
import { useDirectory } from '@/lib/usePeople';
import Seo from '@/components/Seo';
import { Search, UserSearch } from 'lucide-react';

const PAGE_SIZE = 12;

function MentorCard({ m, onConnect, connection, busy, onBlocked, following, followBusy, onToggleFollow }) {
  const [bg, fg] = authorAvatar(m.key || m.user_email || m.full_name || '?');
  const isSample = Boolean(m.is_sample_profile);

  return (
    <div className="card elev-sm" style={{ padding: 22, gap: 12 }}>
      <div className="flex items-center gap-3">
        <span className="avatar" style={{ width: 46, height: 46, fontSize: 15, background: bg, color: fg }}>
          {initialsOf(m.full_name)}
        </span>
        <div className="flex flex-col" style={{ minWidth: 0, gap: 1 }}>
          <span className="flex items-center gap-[7px]" style={{ minWidth: 0 }}>
            <h2 className="h-sans" style={{ fontSize: 15.5, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.full_name}</h2>
            {m.verified && <span className="badge badge-verified">Verified</span>}
          </span>
          <span style={{ fontSize: 12.5, color: 'var(--text-subtle)', lineHeight: 1.35 }}>
            {m.headline || [m.job_title, m.institution].filter(Boolean).join(', ') || [m.grade, m.school].filter(Boolean).join(' · ') || ROLE_LABELS[m.role]}
          </span>
        </div>
      </div>

      {(m.bio || m.help_with) && (
        <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--text-muted)', margin: 0 }}>{m.bio || m.help_with}</p>
      )}

      {(() => {
        const topics = [...(Array.isArray(m.expertise) ? m.expertise : []), ...(Array.isArray(m.interests) ? m.interests : [])]
          .filter((t, i, a) => a.indexOf(t) === i).slice(0, 4);
        return topics.length > 0 ? (
          <div className="flex gap-[6px] flex-wrap">
            {topics.map((t) => <span key={t} className="tag tag-accent-2">{t}</span>)}
          </div>
        ) : null;
      })()}

      <div className="flex gap-2 flex-wrap items-center" style={{ marginTop: 2 }}>
        {isSample ? (
          <>
            {m.post_count > 0 && (
              <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                {m.post_count} post{m.post_count === 1 ? '' : 's'} in the feed
              </span>
            )}
            <span style={{ fontSize: 11.5, color: 'var(--text-subtle)', marginLeft: 'auto' }}>
              Sample profile
            </span>
          </>
        ) : (
          // The same control the feed uses, so connecting behaves identically
          // wherever you meet someone. It handles every state itself, including
          // confirming before a request is sent.
          <>
            {/* Follow is the no-permission-needed option: it only adds their
                posts to your feed. Connect is the mutual one that opens
                messaging. */}
            <FollowButton
              targetEmail={m.user_email}
              targetName={m.full_name}
              following={following}
              busy={followBusy}
              onToggle={onToggleFollow}
            />
            <ConnectButton
              targetEmail={m.user_email}
              targetName={m.full_name}
              connection={connection}
              busy={busy}
              onConnect={onConnect}
            />
          </>
        )}
      </div>

      {/* Reporting and blocking are available on every real profile, not just
          once a conversation has already gone wrong. */}
      {!isSample && (
        <div className="flex gap-4 items-center" style={{ borderTop: '1px solid var(--color-divider)', paddingTop: 10, marginTop: 'auto' }}>
          <SafetyActions
            targetEmail={m.user_email}
            targetName={m.full_name}
            contextType="profile"
            contextId={m.user_email}
            onBlocked={onBlocked}
          />
        </div>
      )}
    </div>
  );
}

export default function Explore() {
  const { email } = useProfile();
  const { blockedEmails, reloadBlocks } = useBlocks();
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const [visible, setVisible] = useState(PAGE_SIZE);
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
  const { people, loading, error: directoryError, reload: load } = useDirectory();

  // Topics come from the people who are actually here, so the filter never
  // offers a topic that returns nobody.
  const allTopics = useMemo(() => {
    const set = new Set();
    for (const p of people) (p.interests || []).forEach((t) => set.add(t));
    return [...set].sort();
  }, [people]);

  const list = useMemo(() => {
    // Blocks, suspended accounts and un-onboarded rows are already excluded
    // server-side, and the server filters blocks in BOTH directions — the
    // client only ever knew about people it had blocked itself, so anyone who
    // had blocked this member still showed up here. The blockedEmails pass is
    // kept as a belt-and-braces filter for rows already in state when a block
    // is made, so the person disappears without waiting for a refetch.
    const real = people.filter(
      (p) => p.user_email && p.user_email !== email && p.onboarded && !blockedEmails.includes(p.user_email),
    );
    const all = real;
    const needle = q.trim().toLowerCase();
    return all.filter((p) => {
      if (followingOnly && !followingEmails.includes(String(p.user_email).toLowerCase())) return false;
      if (roleFilter !== 'all' && p.role !== roleFilter) return false;
      if (topicFilter !== 'all' && !(p.interests || []).includes(topicFilter)) return false;
      if (!needle) return true;
      return [p.full_name, p.headline, p.school, p.bio, ...(p.interests || [])]
        .filter(Boolean).join(' ').toLowerCase().includes(needle);
    });
  }, [people, q, roleFilter, topicFilter, email, blockedEmails, followingOnly, followingEmails]);

  useEffect(() => { setVisible(PAGE_SIZE); }, [q, roleFilter, topicFilter, followingOnly]);

  return (
    <div className="flex flex-col" style={{ gap: 20 }}>
      <Seo title="Find a Mentor | Pathways" description="Search and connect with students, professors, and counselors on Pathways. Connecting is always free." path="/app/explore" noindex />
      <div>
        <h1 style={{ fontSize: 'clamp(26px,3.2vw,36px)', margin: '0 0 6px' }}>Find someone who's been there.</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 15 }} aria-live="polite">
          {list.length} {list.length === 1 ? 'person' : 'people'} you can learn from. Connecting is always free.
        </p>
      </div>

      {/* A failed load must not read as an empty directory. Before this, any
          error resolved to an empty array and the page cheerfully announced
          "0 students, professors, and counselors". */}
      {directoryError && (
        <div className="notice notice-error flex items-center gap-3" role="alert" style={{ flexDirection: 'row' }}>
          <span style={{ flex: 1 }}>{directoryError}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={load}>
            Try again
          </button>
        </div>
      )}

      {connectionError && (
        <div role="alert" className="notice notice-warning flex items-start gap-3" style={{ flexDirection: 'row' }}>
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

      <div className="card elev-sm" style={{ padding: 16, gap: 12 }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} aria-hidden="true" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-500)' }} />
          <input
            aria-label="Search by name, school, or topic"
            className="input"
            style={{ paddingLeft: 38 }}
            placeholder="Search by name, school, or topic…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-subtle)', marginRight: 2, minWidth: 44 }}>Who</span>
          {[['all', 'Everyone'], ...Object.entries(ROLE_LABELS)].map(([v, l]) => (
            <button key={v} type="button" onClick={() => setRoleFilter(v)} className="btn btn-chip" aria-pressed={roleFilter === v}>
              {l}
            </button>
          ))}
          {/* Following is one-way, so this list is yours alone. */}
          <button
            type="button"
            onClick={() => setFollowingOnly((v) => !v)}
            className="btn btn-chip"
            aria-pressed={followingOnly}
          >
            Following
            <span style={{ opacity: 0.6, marginLeft: 2, fontSize: 12 }}>{followingCount}</span>
          </button>
          {followerCount > 0 && (
            <span style={{ fontSize: 12.5, color: 'var(--text-subtle)', marginLeft: 4 }}>
              {followerCount} {followerCount === 1 ? 'person follows' : 'people follow'} you
            </span>
          )}
        </div>

        {allTopics.length > 0 && (
          <div className="flex gap-2 flex-wrap items-center">
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-subtle)', marginRight: 2, minWidth: 44 }}>Topic</span>
            {[['all', 'All topics'], ...allTopics.map((t) => [t, t])].map(([v, l]) => (
              <button key={v} type="button" onClick={() => setTopicFilter(v)} className="btn btn-chip" aria-pressed={topicFilter === v}>
                {l}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <p role="status" style={{ color: 'var(--text-subtle)' }}>Finding people…</p>
      ) : list.length === 0 ? (
        <div className="empty">
          <span className="empty-icon"><UserSearch size={20} aria-hidden="true" /></span>
          <p className="empty-title">Nobody matches that search yet</p>
          <p className="empty-body">Try a broader topic or clear the filters. New students and mentors join every week.</p>
          {(q || roleFilter !== 'all' || topicFilter !== 'all' || followingOnly) && (
            <button type="button" className="btn btn-secondary" style={{ marginTop: 6 }} onClick={() => { setQ(''); setRoleFilter('all'); setTopicFilter('all'); setFollowingOnly(false); }}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {list.slice(0, visible).map((m) => (
              <MentorCard
                key={m.user_email}
                m={m}
                onConnect={requestConnection}
                connection={connectionWith(m.user_email)}
                busy={busyEmail === m.user_email}
                onBlocked={reloadBlocks}
                following={isFollowing(m.user_email)}
                followBusy={followBusyEmail === String(m.user_email || '').toLowerCase()}
                onToggleFollow={toggleFollow}
              />
            ))}
          </div>

          {visible < list.length && (
            <button
              type="button"
              className="btn btn-secondary self-center"
              onClick={() => setVisible((n) => n + PAGE_SIZE)}
            >
              Show more ({list.length - visible} left)
            </button>
          )}
        </>
      )}
    </div>
  );
}