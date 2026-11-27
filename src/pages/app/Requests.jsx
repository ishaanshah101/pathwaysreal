import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Inbox } from 'lucide-react';
import { ROLE_LABELS } from '@/lib/useProfile';
import { useConnections } from '@/lib/useConnections';
import { usePeopleByEmail } from '@/lib/usePeople';
import { useBlocks } from '@/lib/useBlocks';
import { timeAgo } from '@/lib/time';
import SafetyActions from '@/components/safety/SafetyActions';
import VerifiedBadge from '@/components/app/VerifiedBadge';
import Seo from '@/components/Seo';
import PageHead from '@/components/kit/PageHead';
import Plate from '@/components/kit/Plate';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonRows } from '@/components/ui/Skeletons';

// Where connection requests are answered.
//
// Requests used to be answerable only from an Explore card, which meant a
// request could sit unseen indefinitely. This screen is the one place that
// lists everything waiting on you, shows enough of the person to decide, and
// gives you accept, decline and their full profile side by side.

// One request, as a ruled row rather than a card: who, the note they wrote,
// and the answer buttons, with report and block at the far end.
function RequestRow({ conn, who, profile, busy, onAccept, onDecline, onBlocked, outgoing }) {
  const [showProfile, setShowProfile] = useState(false);
  const name = profile?.full_name || (outgoing ? conn.to_name : conn.from_name) || who;
  const interests = Array.isArray(profile?.interests) ? profile.interests : [];
  const expertise = Array.isArray(profile?.expertise) ? profile.expertise : [];
  // The preview used to open as an empty box for a member who had a profile
  // row but had written nothing in it. That case now says so, the same as for
  // someone with no profile at all.
  const hasDetails = Boolean(profile?.bio || profile?.help_with || profile?.goals || interests.length || expertise.length);

  return (
    <article className="req-row">
      <Plate name={name} seed={who || 'A'} size={48} />

      <div>
        <p className="req-line">
          {outgoing
            ? <>You asked to connect with <b>{name}</b></>
            : <><b>{name}</b> wants to connect with you</>}
        </p>
        <div className="req-meta">
          <VerifiedBadge verified={profile?.verified === true} />
          <span className="meta">
            {profile?.headline
              || [profile?.grade, profile?.school].filter(Boolean).join(' · ')
              || [profile?.job_title, profile?.institution].filter(Boolean).join(' · ')
              || ROLE_LABELS[profile?.role]
              || 'Pathways member'}
            {conn.created_date ? ` · ${timeAgo(conn.created_date)}` : ''}
          </span>
        </div>
      </div>

      {conn.note && <blockquote className="quote-note">{conn.note}</blockquote>}

      {showProfile && !hasDetails && (
        <p className="req-profile-none">They have not filled in a profile yet.</p>
      )}

      {showProfile && hasDetails && (
        <dl className="req-profile">
          {profile?.bio && (
            <>
              <dt>About</dt>
              <dd>{profile.bio}</dd>
            </>
          )}
          {profile?.help_with && (
            <>
              <dt>Helps with</dt>
              <dd>{profile.help_with}</dd>
            </>
          )}
          {profile?.goals && (
            <>
              <dt>Working on</dt>
              <dd>{profile.goals}</dd>
            </>
          )}
          {interests.length > 0 && (
            <>
              <dt>Interested in</dt>
              <dd className="dir-tags">
                {interests.map((i) => <span key={i} className="tag">{i}</span>)}
              </dd>
            </>
          )}
          {expertise.length > 0 && (
            <>
              <dt>Can speak to</dt>
              <dd className="dir-tags">
                {expertise.map((i) => <span key={i} className="tag">{i}</span>)}
              </dd>
            </>
          )}
        </dl>
      )}

      <div className="req-actions">
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
          <span className="req-actions-end">
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
    </article>
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
    <div className="page-read">
      <Seo title="Requests | Pathways" description="Connection requests waiting for you on Pathways." path="/app/requests" noindex />

      <PageHead
        kicker="Requests"
        title="Who wants to connect."
        sub="Nobody can message you until you accept."
      />

      {connectionError && (
        <div role="alert" className="notice notice-warning" style={{ marginBottom: 24 }}>{connectionError}</div>
      )}

      {loadingConnections ? (
        <div role="status" aria-label="Loading your requests">
          <SkeletonRows count={3} />
        </div>
      ) : (
        <>
          <section className="req-section" aria-labelledby="req-incoming">
            <h2 className="sub-head" id="req-incoming">
              Waiting on you
              {incoming.length > 0 && <span className="num">({incoming.length})</span>}
            </h2>
            {incoming.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No requests right now."
                body="When someone asks to connect, it appears here and you get a notification."
                action={<Link to="/app/explore" className="btn btn-secondary">Find people in Explore</Link>}
              />
            ) : (
              incoming.map((c) => (
                <RequestRow
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
            <section className="req-section" aria-labelledby="req-outgoing">
              <h2 className="sub-head" id="req-outgoing">
                Sent by you
                <span className="num">({outgoingPending.length})</span>
              </h2>
              {outgoingPending.map((c) => (
                <RequestRow
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
            <p className="req-foot">
              Looking for someone new? <Link to="/app/explore">Find people in Explore</Link>.
            </p>
          )}
        </>
      )}
    </div>
  );
}
