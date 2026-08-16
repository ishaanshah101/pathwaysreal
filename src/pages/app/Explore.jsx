import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useProfile, ROLE_LABELS } from '@/lib/useProfile';
import { authorAvatar, initialsOf } from '@/lib/avatar';
import SafetyActions from '@/components/safety/SafetyActions';
import ConnectButton from '@/components/app/ConnectButton';
import { useBlocks } from '@/lib/useBlocks';
import { useConnections } from '@/lib/useConnections';
import Seo from '@/components/Seo';

const PAGE_SIZE = 12;

function MentorCard({ m, onConnect, connection, busy, onBlocked }) {
  const [bg, fg] = authorAvatar(m.key || m.user_email || m.full_name || '?');
  const isSample = Boolean(m.is_sample_profile);

  return (
    <div className="card elev-sm" style={{ padding: 22, gap: 12, borderRadius: 26 }}>
      <div className="flex items-center gap-3">
        <span
          className="flex items-center justify-center"
          style={{
            width: 46, height: 46, borderRadius: 999, flex: 'none',
            background: bg, color: fg, fontFamily: 'var(--font-heading)', fontSize: 17,
          }}
        >
          {initialsOf(m.full_name)}
        </span>
        <div className="flex flex-col" style={{ minWidth: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{m.full_name}</span>
          <span style={{ fontSize: 12.5, color: 'var(--color-neutral-600)', lineHeight: 1.35 }}>
            {m.headline || [m.grade, m.school].filter(Boolean).join(' · ') || ROLE_LABELS[m.role]}
          </span>
        </div>
      </div>

      {m.bio && (
        <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--color-neutral-800)', margin: 0 }}>{m.bio}</p>
      )}

      {Array.isArray(m.interests) && m.interests.length > 0 && (
        <div className="flex gap-[6px] flex-wrap">
          {m.interests.slice(0, 4).map((t) => (
            <span key={t} className="tag tag-accent-2">{t}</span>
          ))}
        </div>
      )}

      <div className="flex gap-2 flex-wrap items-center" style={{ marginTop: 2 }}>
        {isSample ? (
          <>
            {m.post_count > 0 && (
              <span style={{ fontSize: 12.5, color: 'var(--color-neutral-700)' }}>
                {m.post_count} post{m.post_count === 1 ? '' : 's'} in the feed
              </span>
            )}
            <span style={{ fontSize: 11.5, color: 'var(--color-neutral-600)', marginLeft: 'auto' }}>
              Sample profile
            </span>
          </>
        ) : (
          // The same control the feed uses, so connecting behaves identically
          // wherever you meet someone. It handles every state itself, including
          // confirming before a request is sent.
          <ConnectButton
            targetEmail={m.user_email}
            targetName={m.full_name}
            connection={connection}
            busy={busy}
            onConnect={onConnect}
          />
        )}
      </div>

      {/* Reporting and blocking are available on every real profile, not just
          once a conversation has already gone wrong. */}
      {!isSample && (
        <div className="flex gap-4 items-center" style={{ borderTop: '1px solid var(--color-divider)', paddingTop: 10 }}>
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
  const [people, setPeople] = useState([]);
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Connections are owned by one hook now, shared with the feed and the shell.
  // Explore used to keep its own copy and answer requests with a direct
  // Connection.update, which would have let the person who SENT a request mark
  // it accepted themselves and unlock messaging. Answering now goes through
  // respond-connection, which checks who is asking.
  const {
    connectionWith, requestConnection, busyEmail, connectionError, clearConnectionError,
  } = useConnections();

  const load = async () => {
    try {
      const profiles = await base44.entities.Profile.list('-created_date', 200).catch(() => []);
      setPeople(Array.isArray(profiles) ? profiles : []);
    } catch {
      setPeople([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Topics come from the people who are actually here, so the filter never
  // offers a topic that returns nobody.
  const allTopics = useMemo(() => {
    const set = new Set();
    for (const p of people) (p.interests || []).forEach((t) => set.add(t));
    return [...set].sort();
  }, [people]);

  const list = useMemo(() => {
    // Anyone I have blocked is gone from the directory entirely.
    const real = people.filter(
      (p) => p.user_email && p.user_email !== email && p.onboarded && !blockedEmails.includes(p.user_email),
    );
    const all = real;
    const needle = q.trim().toLowerCase();
    return all.filter((p) => {
      if (roleFilter !== 'all' && p.role !== roleFilter) return false;
      if (topicFilter !== 'all' && !(p.interests || []).includes(topicFilter)) return false;
      if (!needle) return true;
      return [p.full_name, p.headline, p.school, p.bio, ...(p.interests || [])]
        .filter(Boolean).join(' ').toLowerCase().includes(needle);
    });
  }, [people, q, roleFilter, topicFilter, email, blockedEmails]);

  useEffect(() => { setVisible(PAGE_SIZE); }, [q, roleFilter, topicFilter]);

  return (
    <div className="flex flex-col" style={{ gap: 20 }}>
      <Seo title="Find a Mentor | Pathways" description="Search and connect with students, professors, and counselors on Pathways. Connecting is always free." path="/app/explore" noindex />
      <div>
        <h1 style={{ fontSize: 'clamp(26px,3.2vw,36px)', margin: '0 0 6px' }}>Find someone who's been there.</h1>
        <p style={{ color: 'var(--color-neutral-800)', margin: 0 }}>
          {list.length} students, professors, and counselors. Connecting is always free.
        </p>
      </div>

      {connectionError && (
        <div
          className="card flex items-start gap-3"
          style={{
            padding: '12px 16px', fontSize: 14, lineHeight: 1.55,
            background: 'var(--color-accent-100)', color: 'var(--color-accent-800)',
          }}
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

      <div className="flex flex-col" style={{ gap: 10 }}>
        <input
          className="input"
          style={{ maxWidth: 420 }}
          placeholder="Search by name, school, or topic…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <div className="flex gap-2 flex-wrap items-center">
          {[['all', 'Everyone'], ...Object.entries(ROLE_LABELS)].map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => setRoleFilter(v)}
              className="btn"
              style={{
                fontFamily: 'var(--font-body)', fontSize: 13, padding: '6px 13px',
                background: roleFilter === v ? 'var(--color-accent-2-600)' : 'transparent',
                color: roleFilter === v ? 'var(--color-bg)' : 'var(--color-text)',
                borderColor: roleFilter === v ? 'transparent' : 'var(--color-divider)',
              }}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          {[['all', 'All topics'], ...allTopics.map((t) => [t, t])].map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => setTopicFilter(v)}
              className="btn"
              style={{
                fontFamily: 'var(--font-body)', fontSize: 12.5, padding: '5px 12px',
                background: topicFilter === v ? 'var(--color-accent)' : 'transparent',
                color: topicFilter === v ? 'var(--color-bg)' : 'var(--color-text)',
                borderColor: topicFilter === v ? 'transparent' : 'var(--color-divider)',
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-neutral-600)' }}>Finding people…</p>
      ) : list.length === 0 ? (
        <p style={{ color: 'var(--color-neutral-600)' }}>Nobody matches that search yet.</p>
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
              />
            ))}
          </div>

          {visible < list.length && (
            <button
              type="button"
              className="btn btn-secondary self-center"
              style={{ fontSize: 14, padding: '11px 26px' }}
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