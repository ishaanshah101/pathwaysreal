import React from 'react';
import BrandMark from '@/components/BrandMark';
import ContactEmail from '@/components/ContactEmail';
import { COMPANY_NAME } from '@/lib/company';

export default function WhoIsBehind() {
  return (
    <section className="band" aria-labelledby="behind-title">
      <div className="wrap note-grid">
        <div className="note">
          <span className="note-stamp" aria-hidden="true"><BrandMark size={40} /></span>
          <p>
            I'm a high school student. I built Pathways because I went looking for honest advice
            about college and could not find it.
          </p>
          <p>
            So this is the place I wanted. People who have actually done it, answering the people
            who are about to.
          </p>
          <p className="note-sig">Ishaan, who made this</p>
        </div>

        <div>
          <span className="kicker">Who is behind this</span>
          <h2 id="behind-title" className="title-2" style={{ maxWidth: '18ch' }}>
            A student built it. People run it.
          </h2>
          <ul className="fact-list">
            <li><span className="k">Operated by</span><span>{COMPANY_NAME}, in San Ramon, California.</span></li>
            <li><span className="k">Mentors</span><span>Verified one by one by a person, not an algorithm.</span></li>
            <li><span className="k">Endorsed by</span><span>Ascend Rehab Services, Ascend Pediatrics, and the Ascend Giving Foundation.</span></li>
            <li><span className="k">Reach us</span><span><ContactEmail /></span></li>
          </ul>
        </div>
      </div>
    </section>
  );
}
