import React from 'react';
import { Link } from 'react-router-dom';
import { signInWithGoogle } from '@/lib/googleAuth';
import RoadScene from '@/components/site/RoadScene';

export default function Hero() {
  return (
    <header className="hero gridded">
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <span className="kicker kicker-sun">Free college and career guidance</span>
          <h1>
            Every student deserves someone who's been there.
          </h1>
          <p className="lede">
            Pathways is where high schoolers get straight answers about college and careers from
            the students, professors, and counselors who already made the trip. It is free for
            every student, and it stays free.
          </p>

          <div className="hero-cta">
            <Link to="/join" className="btn btn-sun btn-lg btn-go">Join free</Link>
            <Link to="/how-it-works" className="btn btn-secondary btn-lg">See how it works</Link>
          </div>

          <p className="hero-aside">
            Already a member?{' '}
            <button type="button" className="link-btn" style={{ fontWeight: 700 }} onClick={() => signInWithGoogle('/')}>
              Log in with Google
            </button>
          </p>
        </div>

        <RoadScene />
      </div>
    </header>
  );
}
