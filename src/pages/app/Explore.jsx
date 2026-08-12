import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useProfile, ROLE_LABELS } from '@/lib/useProfile';

const SEED_MENTORS = [
  { user_email: 'sofia@example.pathways', full_name: 'Sofia Reyes', role: 'college_student', headline: 'CMU first-year, Information Systems', school: 'Carnegie Mellon', interests: ['Essays', 'Applications', 'Campus life'], bio: 'First-gen. Applied to 14 schools on fee waivers. Happy to read a draft essay and tell you the truth about it.' },
  { user_email: 'marcus@example.pathways', full_name: 'Marcus Webb', role: 'counselor', headline: 'School counselor, 12 years', school: 'Oakwood High', interests: ['Scholarships', 'Applications'], bio: 'I have helped about 1,400 students through applications. Ask me about financial aid, I will not sugarcoat it.' },
  { user_email: 'alice@example.pathways', full_name: 'Dr. Alice Nkemdi', role: 'educator', headline: 'Professor of Biology, advising 19 years', school: 'State University', interests: ['Choosing a major', 'Careers'], bio: 'If you are agonizing over declaring a major, talk to me before you decide anything.' },
  { user_email: 'priya@example.pathways', full_name: 'Priya Raman', role: 'college_student', headline: 'UC Berkeley, Molecular Biology', school: 'UC Berkeley', interests: ['Internships', 'Test prep'], bio: 'Cold-emailed my way into a lab at seventeen. I will show you the exact email template.' },
  { user_email: 'james@example.pathways', full_name: 'James Okafor', role: 'college_student', headline: 'Stanford, Mechanical Engineering', school: 'Stanford', interests: ['Applications', 'Careers', 'Internships'], bio: 'Community college transfer. If you think transferring closes doors, it does not. Ask me.' },
  { user_email: 'hana@example.pathways', full_name: 'Hana Kim', role: 'counselor', headline: 'Former admissions reader', school: 'Independent', interests: ['Essays', 'Applications'], bio: 'I read applications for four years. I can tell you what actually gets flagged and what nobody notices.' },
];

function MentorCard({ m, onConnect, connectionState, busy }) {
  const initial = (m.full_name || '?').charAt(0).toUpperCase();
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
            width: 44, height: 44, borderRadius: 999, flex: 'none',
            background: 'var(--color-accent-200)', fontFamily: 'var(--font-heading)', fontSize: 18,
          }}
        >
          {initial}
        </span>
        <div className="flex flex-col" style={{ minWidth: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{m.full_name}</span>
          <span style={{ fontSize: 12.5, color: 'var(--color-neutral-600)' }}>
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

      <div className="flex gap-2 flex-wrap" style={{ marginTop: 2 }}>
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
  const [loading, setLoading] = useState(true);
  const [busyEmail, setBusyEmail] = useState(null);

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
    } catch {
      // Surfaced by the button simply staying on "Connect".
    }
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

  const list = useMemo(() => {
    const real = people.filter((p) => p.user_email && p.user_email !== email && p.onboarded);
    const seedsToShow = SEED_MENTORS.filter((s) => !real.some((r) => r.user_email === s.user_email));
    const all = [...real, ...seedsToShow];
    const needle = q.trim().toLowerCase();
    return all.filter((p) => {
      if (roleFilter !== 'all' && p.role !== roleFilter) return false;
      if (!needle) return true;
      return [p.full_name, p.headline, p.school, p.bio, ...(p.interests || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(needle);
    });
  }, [people, q, roleFilter, email]);

  return (
    <div className="flex flex-col" style={{ gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 'clamp(26px,3.2vw,36px)', margin: '0 0 6px' }}>Find someone who's been there.</h1>
        <p style={{ color: 'var(--color-neutral-800)', margin: 0 }}>
          Students, professors, and counselors who volunteered to help. Connecting is always free.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <input
          className="input"
          style={{ maxWidth: 360 }}
          placeholder="Search by name, school, or topic…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
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

      {loading ? (
        <p style={{ color: 'var(--color-neutral-600)' }}>Finding people…</p>
      ) : list.length === 0 ? (
        <p style={{ color: 'var(--color-neutral-600)' }}>Nobody matches that search yet.</p>
      ) : (
        <div
          className="grid"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}
        >
          {list.map((m) => (
            <MentorCard
              key={m.user_email}
              m={m}
              onConnect={connect}
              connectionState={stateFor(m.user_email)}
              busy={busyEmail === m.user_email}
            />
          ))}
        </div>
      )}
    </div>
  );
}
