import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useProfile, ROLE_LABELS } from '@/lib/useProfile';
import { SAMPLE_MENTORS, authorAvatar, initialsOf } from '@/data/sampleContent';

const PAGE_SIZE = 12;

function MentorCard({ m, onConnect, connectionState, busy }) {
  const [bg, fg] = authorAvatar(m.key || m.user_email || m.full_name || '?');
  const isSample = Boolean(m.is_sample_profile);
  const label =
    connectionState === 'accepted' ? 'Connected'
      : connectionState === 'pending' ? 'Request sent'
        : 'Connect';

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
          <>
            <button
              type="button"
              className="btn btn-primary"
              style={{ fontSize: 13 }}
              disabled={busy || connectionState === 'accepted' || connectionState === 'pending'}
              onClick={() => onConnect(m)}
            >
              {label}
            </button>
            <Link
              to={`/app/messages?to=${encodeURIComponent(m.user_email)}`}
              className="btn btn-secondary"
              style={{ fontSize: 13 }}
            >
              Message
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function Explore() {
  const { profile, email } = useProfile();
  const [people, setPeople] = useState([]);
  const [connections, setConnections] = useState([]);
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [busyEmail, setBusyEmail] = useState(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const load = async () => {
    try {
      const [profiles, conns] = await Promise.all([
        base44.entities.Profile.list('-created_date', 200).catch(() => []),
        base44.entities.Connection.list('-created_date', 200).catch(() => []),
      ]);
      setPeople(Array.isArray(profiles) ? profiles : []);
      setConnections(Array.isArray(conns) ? conns : []);
    } catch {
      setPeople([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const connect = async (m) => {
    setBusyEmail(m.user_email);
    try {
      await base44.entities.Connection.create({
        from_email: email,
        from_name: profile?.full_name || '',
        to_email: m.user_email,
        to_name: m.full_name || '',
        status: 'pending',
      });
      await load();
    } catch { /* button simply stays on Connect */ }
    setBusyEmail(null);
  };

  const stateFor = (targetEmail) => {
    const c = connections.find(
      (x) =>
        (x.from_email === email && x.to_email === targetEmail) ||
        (x.to_email === email && x.from_email === targetEmail),
    );
    return c?.status || null;
  };

  const allTopics = useMemo(() => {
    const set = new Set();
    for (const m of SAMPLE_MENTORS) (m.interests || []).forEach((t) => set.add(t));
    return [...set].sort();
  }, []);

  const list = useMemo(() => {
    const real = people.filter((p) => p.user_email && p.user_email !== email && p.onboarded);
    const samples = SAMPLE_MENTORS.filter((s) => !real.some((r) => r.user_email === s.user_email));
    const all = [...real, ...samples];
    const needle = q.trim().toLowerCase();
    return all.filter((p) => {
      if (roleFilter !== 'all' && p.role !== roleFilter) return false;
      if (topicFilter !== 'all' && !(p.interests || []).includes(topicFilter)) return false;
      if (!needle) return true;
      return [p.full_name, p.headline, p.school, p.bio, ...(p.interests || [])]
        .filter(Boolean).join(' ').toLowerCase().includes(needle);
    });
  }, [people, q, roleFilter, topicFilter, email]);

  useEffect(() => { setVisible(PAGE_SIZE); }, [q, roleFilter, topicFilter]);

  return (
    <div className="flex flex-col" style={{ gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 'clamp(26px,3.2vw,36px)', margin: '0 0 6px' }}>Find someone who's been there.</h1>
        <p style={{ color: 'var(--color-neutral-800)', margin: 0 }}>
          {list.length} students, professors, and counselors. Connecting is always free.
        </p>
      </div>

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
                onConnect={connect}
                connectionState={stateFor(m.user_email)}
                busy={busyEmail === m.user_email}
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
