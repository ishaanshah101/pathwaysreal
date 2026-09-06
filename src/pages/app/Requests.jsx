import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROLE_LABELS } from '@/lib/useProfile';
import { useConnections } from '@/lib/useConnections';
import { usePeopleByEmail } from '@/lib/usePeople';
import { useBlocks } from '@/lib/useBlocks';
import { authorAvatar, initialsOf } from '@/lib/avatar';
import SafetyActions from '@/components/safety/SafetyActions';
import Seo from '@/components/Seo';
import { Inbox } from 'lucide-react';

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
    <div className="card elev-sm" style={{ padding: 20, gap: 12 }}>
      <div className="flex items-start gap-3">
        <span className="avatar" style={{ width: 46, height: 46, fontSize: 15, background: bg, color: fg }}>
          {initialsOf(name)}
        </span>
        <div className="flex flex-col" style={{ minWidth: 0, flex: 1, gap: 2 }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>
            {outgoing
              ? <>You asked to connect with <b>{name}</b></>
              : <><b>{name}</b> wants to connect with you</>}
          </span>
          <span style={{ fontSize: 12.5, color: 'var(--text-subtle)', lineHeight: 1.4 }}>
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
            borderRadius: 12, background: 'var(--color-surface-2)', color: 'var(--color-neutral-800)',
            borderLeft: '3px solid var(--color-accent)',
          }}
        >
          {conn.note}
        </p>
      )}

      {showProfile && (
        <div
          className="flex flex-col"
          style={{ gap: 8, padding: '12px 14px', borderRadius: 12, background: 'var(--color-surface-2)' }}
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
            <span style={{ fontSize: 13, color: 'var(--text-subtle)' }}>
              They have not filled in a profile yet.
            </span>
          )}
        </div>
      )}

      <div className="flex gap-2 flex-wrap items-center">
        {outgoing ? (
          <span className="badge badge-neutral">Waiting for their answer</span>
        ) : (
          <>
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy}
              onClick={() => onAccept(conn)}
            >
              {busy ? 'Working…' : 'Accept'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={busy}
              onClick={() => onDecline(conn)}
            >
              Decline
            </button>
          </>
        )}
        <button
          type="button"
          className="btn btn-quiet"
          aria-expanded={showProfile}
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

  // Resolve only the people actually involved in these requests, through
  // get-profile. Profile.list() from the browser could never work here: the
  // entity's read rule matches your own row or an admin, so every request
  // rendered as a bare email address with no name, headline or school for
  // anyone who was not an admin.
  const involved = useMemo(
    () => [
      ...incomingPending.map((c) => c.from_email),
      ...outgoingPending.map((c) => c.to_email),
    ].filter(Boolean),
    [incomingPending, outgoingPending],
  );

  const { profileFor } = usePeopleByEmail(involved);

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
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 15 }}>
          People who want to connect with you. Nobody can message you until you accept.
        </p>
      </div>

      {connectionError && (
        <div role="alert" className="notice notice-warning">{connectionError}</div>
      )}

      {loadingConnections ? (
        <p role="status" style={{ color: 'var(--text-subtle)' }}>Loading your requests…</p>
      ) : (
        <>
          <section className="flex flex-col" style={{ gap: 12 }}>
            <h2 className="h-sans" style={{ fontSize: 16, margin: 0, color: 'var(--text-muted)' }}>
              Waiting on you{incoming.length > 0 ? ` (${incoming.length})` : ''}
            </h2>
            {incoming.length === 0 ? (
              <div className="empty">
                <span className="empty-icon"><Inbox size={20} aria-hidden="true" /></span>
                <p className="empty-title">No requests right now</p>
                <p className="empty-body">When someone asks to connect, it appears here and you get a notification.</p>
                <Link to="/app/explore" className="btn btn-secondary no-underline" style={{ marginTop: 6 }}>Find people in Explore</Link>
              </div>
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
              <h2 className="h-sans" style={{ fontSize: 16, margin: '10px 0 0', color: 'var(--text-muted)' }}>
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

          {incoming.length > 0 && (
            <p style={{ fontSize: 13.5, color: 'var(--text-subtle)', margin: 0 }}>
              Looking for someone new? <Link to="/app/explore">Find people in Explore</Link>.
            </p>
          )}
        </>
      )}
    </div>
  );
}
