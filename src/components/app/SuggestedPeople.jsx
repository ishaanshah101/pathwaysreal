import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDirectory } from '@/lib/usePeople';
import { ROLE_LABELS } from '@/lib/useProfile';
import Plate from '@/components/kit/Plate';
import VerifiedBadge from '@/components/app/VerifiedBadge';

const HOW_MANY = 4;
const refOf = (m) => m.member_ref || m.user_email;

// A short list of people worth following, beside the feed. Verified educators
// and counselors come first. The list is chosen once and then left alone, so
// someone you just followed stays where they were and reads "Following",
// instead of vanishing from under the pointer.
export default function SuggestedPeople({ isFollowing, toggleFollow, followBusyEmail }) {
  const { people, loading } = useDirectory({ role: 'all' });
  const [picks, setPicks] = useState(null);

  useEffect(() => {
    if (picks || loading || people.length === 0) return;
    const fresh = people.filter((m) => refOf(m) && !isFollowing(refOf(m)));
    fresh.sort((a, b) => Number(b.verified === true) - Number(a.verified === true));
    setPicks(fresh.slice(0, HOW_MANY));
  }, [picks, loading, people, isFollowing]);

  if (!picks || picks.length === 0) return null;

  return (
    <section className="panel" aria-labelledby="who-head">
      <div className="panel-head" id="who-head">People to learn from</div>
      <ul className="who-list">
        {picks.map((m) => {
          const ref = refOf(m);
          const following = isFollowing(ref);
          const busy = followBusyEmail === String(ref || '').toLowerCase();
          return (
            <li key={ref} className="who">
              <Plate name={m.full_name} seed={m.key || ref} size={40} />
              <span className="who-text">
                <b>
                  <span>{m.full_name || 'A Pathways member'}</span>
                  <VerifiedBadge verified={m.verified} compact />
                </b>
                <small>{m.headline || ROLE_LABELS[m.role] || 'Member'}</small>
              </span>
              <button
                type="button"
                className="who-follow"
                aria-pressed={following}
                disabled={busy}
                onClick={() => toggleFollow(ref, m.full_name)}
              >
                {busy ? '…' : following ? 'Following' : 'Follow'}
                <span className="sr-only"> {m.full_name}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <Link to="/app/explore" className="who-more">See everyone</Link>
    </section>
  );
}
