import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ROLE_LABELS } from '@/lib/useProfile';
import { useConnections } from '@/lib/useConnections';
import { useBlocks } from '@/lib/useBlocks';
import { authorAvatar, initialsOf } from '@/lib/avatar';
import SafetyActions from '@/components/safety/SafetyActions';
import Seo from '@/components/Seo';

// Where connection requests are answered.
//
// Requests used to be answerable only from an Explore card, which meant a
// request could sit unseen indefinitely. This screen is the one place that
// lists everything waiting on you, shows enough of the person to decide, and
// gives you accept, decline and their full profile side by side.

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

function PersonCard({ conn, who, profile, busy, onAccept, onDecline, onBlocked, outgoing }) {
  const [bg, fg] = authorAvatar(who || 'A');
  const [showProfile, setShowProfile] = useState(false);
  const name = profile?.full_name || (outgoing ? conn.to_name : conn.from_name) || who;

  return (
    <div className="card elev-sm" style={{ padding: 20, gap: 12, borderRadius: 24 }}>
      <div className="flex items-start gap-3">
        <span
          className="flex items-center justify-center"
          style={{
            width: 46, height: 46, borderRadius: 999, flex: 'none',
            background: bg, color: fg, fontFamily: 'var(--font-heading)', fontSize: 17,
          }}
        >
          {initialsOf(name)}
        </span>
        <div className="flex flex-col" style={{ minWidth: 0, flex: 1 }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>
            {outgoing
              ? `You requested to connect with ${name}`
              : `${name} requested to connect with you`}
          </span>
          <span style={{ fontSize: 12.5, color: 'var(--color-neutral-600)', lineHeight: 1.4 }}>
            {profile?.headline
              || [profile?.grade, profile?.school].filter(Boolean).join(' · ')
              || [profile?.job_title, profile?.institution].filter(Boolean).join(' · ')
              || ROLE_LABELS[profile?.role]
              || 'Pathways member'}
            {conn.created_date ? ` · ${timeAgo(conn.created_date)}` : ''}
          </span>
        </div>
      </div>

      {conn.note && (
        <p
          style={{
            fontSize: 14, lineHeight: 1.55, margin: 0, padding: '10px 14px',
            borderRadius: 14, background: 'var(--color-bg)', color: 'var(--color-neutral-800)',
          }}
        >
          {conn.note}
        </p>
      )}

      {showProfile && (
        <div
          className="flex flex-col"
          style={{ gap: 8, padding: '12px 14px', borderRadius: 16, background: 'var(--color-bg)' }}
        >
          {profile?.bio && (
            <p style={{ fontSize: 14, lineHeight: 1.55, margin: 0 }}>{profile.bio}</p>
          )}
          {profile?.help_with && (
            <p style={{ fontSize: 13.5, lineHeight: 1.55, margin: 0, color: 'var(--color-neutral-800)' }}>
              <strong style={{ fontWeight: 600 }}>Happy to help with:</strong> {profile.help_with}
            </p>
          )}
          {profile?.goals && (
            <p style={{ fontSize: 13.5, lineHeight: 1.55, margin: 0, color: 'var(--color-neutral-800)' }}>
              <strong style={{ fontWeight: 600 }}>Working on:</strong> {profile.goals}
            </p>
          )}
          {Array.isArray(profile?.interests) && profile.interests.length > 0 && (
            <div className="flex gap-[6px] flex-wrap">
              {profile.interests.map((i) => <span key={i} className="tag tag-accent-2">{i}</span>)}
            </div>
          )}
          {Array.isArray(profile?.expertise) && profile.expertise.length > 0 && (
            <div className="flex gap-[6px] flex-wrap">
              {profile.expertise.map((i) => <span key={i} className="tag tag-accent">{i}</span>)}
            </div>
          )}
          {!profile && (
            <span style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>
              They have not filled in a profile yet.
            </span>
          )}
        </div>
      )}

      <div className="flex gap-2 flex-wrap items-center">
        {outgoing ? (
          <span style={{ fontSize: 13, color: 'var(--color-neutral-700)' }}>
            Waiting for them to answer. We will tell you as soon as they do.
          </span>
        ) : (
          <>
            <button
              type="button"
              className="btn btn-primary"
              style={{ fontSize: 13 }}
              disabled={busy}
              onClick={() => onAccept(conn)}
            >
              {busy ? 'Working…' : 'Accept'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: 13 }}
              disabled={busy}
              onClick={() => onDecline(conn)}
            >
              Decline
            </button>
          </>
        )}
        <button
          type="button"
          className="btn btn-secondary"
          style={{ fontSize: 13 }}
          onClick={() => setShowProfile((s) => !s)}
        >
          {showProfile ? 'Hide profile' : 'View profile'}
        </button>

        {!outgoing && (
          <span className="flex gap-4 items-center" style={{ marginLeft: 'auto' }}>
            <SafetyActions
              targetEmail={who}
              targetName={name}
              contextType="profile"
              contextId={who}
              onBlocked={onBlocked}
            />
          </span>
        )}
      </div>
    </div>
  );
}

export default function Requests() {
  const navigate = useNavigate();
  const { reloadBlocks, blockedEmails } = useBlocks();
  const {
    incomingPending, outgoingPending, loadingConnections,
    respondToConnection, busyEmail, connectionError, reloadConnections,
  } = useConnections();

  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    base44.entities.Profile.list('-created_date', 300)
      .then((rows) => setProfiles(Array.isArray(rows) ? rows : []))
      .catch(() => setProfiles([]));
  }, []);

  const profileFor = (addr) => profiles.find(
    (p) => String(p.user_email || '').toLowerCase() === String(addr || '').toLowerCase(),
  ) || null;

  // Someone I have blocked should not be able to sit in my requests list.
  const incoming = useMemo(
    () => incomingPending.filter((c) => !blockedEmails.includes(String(c.from_email || '').toLowerCase())),
    [incomingPending, blockedEmails],
  );

  const accept = async (conn) => {
    const res = await respondToConnection(conn.id, 'accepted');
    // Accepting is a decision to talk to someone, so land in the conversation
    // rather than back on an emptier list.
    if (res.ok) navigate(`/app/messages?to=${encodeURIComponent(conn.from_email)}`);
  };

  const decline = async (conn) => { await respondToConnection(conn.id, 'declined'); };

  return (
    <div className="flex flex-col" style={{ gap: 20 }}>
      <Seo title="Requests | Pathways" description="Connection requests waiting for you on Pathways." path="/app/requests" noindex />

      <div>
        <h1 style={{ fontSize: 'clamp(26px,3.2vw,36px)', margin: '0 0 6px' }}>Requests</h1>
        <p style={{ color: 'var(--color-neutral-800)', margin: 0 }}>
          People who want to connect with you. Nobody can message you until you accept.
        </p>
      </div>

      {connectionError && (
        <div
          className="card"
          style={{
            padding: '12px 16px', fontSize: 14, lineHeight: 1.55,
            background: 'var(--color-accent-100)', color: 'var(--color-accent-800)',
          }}
        >
          {connectionError}
        </div>
      )}

      {loadingConnections ? (
        <p style={{ color: 'var(--color-neutral-600)' }}>Loading your requests…</p>
      ) : (
        <>
          <section className="flex flex-col" style={{ gap: 12 }}>
            <h2 style={{ fontSize: 17, margin: 0 }}>
              Waiting on you{incoming.length > 0 ? ` (${incoming.length})` : ''}
            </h2>
            {incoming.length === 0 ? (
              <p style={{ color: 'var(--color-neutral-600)', fontSize: 14, margin: 0 }}>
                No requests right now. When someone asks to connect, it appears here and you get a
                notification.
              </p>
            ) : (
              incoming.map((c) => (
                <PersonCard
                  key={c.id}
                  conn={c}
                  who={c.from_email}
                  profile={profileFor(c.from_email)}
                  busy={busyEmail === c.id}
                  onAccept={accept}
                  onDecline={decline}
                  onBlocked={() => { reloadBlocks(); reloadConnections(); }}
                />
              ))
            )}
          </section>

          {outgoingPending.length > 0 && (
            <section className="flex flex-col" style={{ gap: 12 }}>
              <h2 style={{ fontSize: 17, margin: '10px 0 0' }}>
                Sent by you ({outgoingPending.length})
              </h2>
              {outgoingPending.map((c) => (
                <PersonCard
                  key={c.id}
                  conn={c}
                  who={c.to_email}
                  profile={profileFor(c.to_email)}
                  outgoing
                  busy={false}
                  onAccept={() => {}}
                  onDecline={() => {}}
                  onBlocked={reloadBlocks}
                />
              ))}
            </section>
          )}

          <p style={{ fontSize: 13, color: 'var(--color-neutral-600)', margin: 0 }}>
            Looking for someone new? <Link to="/app/explore">Find people in Explore</Link>.
          </p>
        </>
      )}
    </div>
  );
}
