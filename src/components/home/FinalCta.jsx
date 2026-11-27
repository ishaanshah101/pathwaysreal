import React from 'react';
import { Link } from 'react-router-dom';

// The cover of a composition book, with the closing line written on its label.
export default function FinalCta() {
  return (
    <section className="band band-road">
      <div className="wrap">
        <div className="closer">
          <div>
            <span className="kicker">Name: you. Subject: what comes next.</span>
            <h2 className="title-1" style={{ maxWidth: '17ch' }}>
              The question isn't who gets in. It's who knows how to apply.
            </h2>
            <p className="lede" style={{ marginTop: 16 }}>
              Join the students, educators, and counselors who think guidance should not depend on
              your zip code.
            </p>
          </div>
          <Link to="/join" className="btn btn-sun btn-lg btn-go">Join Pathways free</Link>
        </div>
      </div>
    </section>
  );
}
