import React from 'react';
import { Link } from 'react-router-dom';

export default function FinalCta() {
  return (
    <section className="band band-road">
      <div className="wrap closer">
        <div>
          <h2 className="title-1" style={{ maxWidth: '17ch' }}>
            The question isn't who gets in. It's who knows how to apply.
          </h2>
          <p className="lede" style={{ marginTop: 20 }}>
            Join the students, educators, and counselors who think guidance should not depend on
            your zip code.
          </p>
        </div>
        <Link to="/join" className="btn btn-sun btn-lg btn-go">Join Pathways free</Link>
      </div>
    </section>
  );
}
