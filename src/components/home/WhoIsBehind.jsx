import React from 'react';
import ContactEmail from '@/components/ContactEmail';
import { COMPANY_NAME } from '@/lib/company';

// A note torn out of the notebook, in the founder's hand, next to the facts a
// careful reader would want to check.
export default function WhoIsBehind() {
  return (
    <section className="band" aria-labelledby="behind-title">
      <div className="wrap note-grid">
        <div className="ruled note">
          <p>
            I'm a high school student. I went looking for honest advice about college and could
            not find it.
          </p>
          <p>So this is the place I wanted.</p>
          <p className="note-sig">Ishaan, who made this</p>
        </div>

        <div>
          <span className="kicker">Who is behind this</span>
          <h2 id="behind-title" className="title-2" style={{ maxWidth: '18ch' }}>
            A student built it. <span className="hl" style={{ '--hl': 'var(--hl-green)' }}>People run it.</span>
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
