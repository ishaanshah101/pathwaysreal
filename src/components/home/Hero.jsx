import React from 'react';
import { Link } from 'react-router-dom';
import { signInWithGoogle } from '@/lib/googleAuth';

// The first page of the notebook: the pitch written out on lined paper, with
// the important part highlighted and a note in the margin. Beside it, the mark
// as a sticker and a sticky note with the sums on it.
const sums = [
  { num: '$200', unit: '/hr', label: 'what a private college counselor can cost' },
  { num: '16 million', label: 'US high schoolers deciding right now' },
  { num: '$0', label: 'what Pathways costs every one of them' },
];

export default function Hero() {
  return (
    <header className="hero">
      <div className="wrap hero-grid">
        <div className="ruled hero-sheet">
          <span className="kicker">Free college and career guidance</span>

          <h1>
            Every student deserves <span className="hl">someone who's been there.</span>
          </h1>

          <p className="lede">
            Pathways is where high schoolers get straight answers about college and careers from
            the students, professors, and counselors who already made the trip. It is free for
            every student, and it stays free.
          </p>

          <div className="hero-cta">
            <Link to="/join" className="btn btn-sun btn-lg btn-go">Join free</Link>
            <Link to="/how-it-works" className="btn btn-secondary btn-lg">See how it works</Link>
            <span className="scribble hero-note" aria-hidden="true">
              <svg width="46" height="26" viewBox="0 0 46 26" fill="none">
                <path d="M44 6C32 18 18 20 4 15" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
                <path d="M13 7 3 15l11 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              free. actually free.
            </span>
          </div>

          <p className="hero-aside">
            Already a member?{' '}
            <button type="button" className="link-btn" style={{ fontWeight: 700 }} onClick={() => signInWithGoogle('/')}>
              Log in with Google
            </button>
          </p>
        </div>

        <aside className="hero-side" aria-label="Why Pathways exists">
          <div className="sticker" aria-hidden="true">
            <svg viewBox="0 0 100 100" width="104" height="104" fill="none">
              <circle cx="50" cy="31" r="27" fill="#e05e12" />
              <path d="M47.8 55 L42 97 L1 97 Z" fill="#26231f" />
              <path d="M52.2 55 L58 97 L99 97 Z" fill="#26231f" />
              <path className="dash" d="M45.6 62 L28 93" stroke="#fbf6ee" strokeWidth="4" strokeDasharray="7 7" />
              <path className="dash" d="M54.4 62 L72 93" stroke="#fbf6ee" strokeWidth="4" strokeDasharray="7 7" />
            </svg>
          </div>

          <div className="sticky">
            <div className="sticky-title">Do the math</div>
            <ul className="sums">
              {sums.map((s) => (
                <li key={s.label}>
                  <b className="num">{s.num}{s.unit ? <small>{s.unit}</small> : null}</b>
                  {s.label}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </header>
  );
}
