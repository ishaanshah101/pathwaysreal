import React from 'react';
import { Link } from 'react-router-dom';
import { ROLE_LABELS } from '@/lib/useProfile';
import Plate from '@/components/kit/Plate';
import VerifiedBadge from '@/components/app/VerifiedBadge';

// You, as a small card beside the feed: a cover strip, your picture, your
// name, and your numbers. The same thing most social apps keep in the corner,
// so your own profile is always one tap away.
export default function MiniProfile({ profile, email, followerCount = 0, followingCount = 0 }) {
  const name = profile?.full_name || 'Your profile';
  const line = profile?.headline || profile?.grade || profile?.job_title || ROLE_LABELS[profile?.role] || '';

  return (
    <section className="panel mini" aria-label="Your profile">
      <div className="mini-cover" aria-hidden="true" />
      <Link to="/app/profile" className="mini-who">
        <Plate name={profile?.full_name} seed={email} size={64} />
        <b>
          <span>{name}</span>
          <VerifiedBadge verified={profile?.verified} compact />
        </b>
        {line && <small>{line}</small>}
      </Link>
      <div className="mini-stats">
        <span><b className="num">{followerCount}</b> {followerCount === 1 ? 'follower' : 'followers'}</span>
        <Link to="/app/explore"><b className="num">{followingCount}</b> following</Link>
      </div>
      <nav className="mini-links" aria-label="Your things">
        <Link to="/app/profile?tab=posts">Your posts</Link>
        <Link to="/app/saved">Saved</Link>
        <Link to="/app/plan">Plan</Link>
      </nav>
    </section>
  );
}
