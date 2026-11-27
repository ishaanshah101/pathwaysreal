import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '@/components/Seo';
import Sign from '@/components/kit/Sign';
import CompareTable from '@/components/how/CompareTable';
import { CATEGORY_LABELS } from '@/lib/useProfile';
import { CATEGORY_SIGN } from '@/lib/categories';

// The six things the product does, laid out as stops along a road instead of
// a grid of cards, because that is the order a new member actually meets them.
const stops = [
  { title: 'A feed that respects your time', body: 'Real posts about campus visits, competitions, internships, and scholarships. Long-form and honest, with no short-form video and no reposts. You leave knowing more than when you arrived.' },
  { title: 'Follow or connect', body: 'Follow someone to see what they post. Connect, which both of you agree to, when you want to actually message and learn from them.' },
  { title: 'Verified mentors', body: 'Professors and counselors are checked by a person against their public faculty or staff page before they get the badge. You know who is answering you.' },
  { title: 'A safer inbox', body: 'One on one only, never group chats. Messages are permanent, and sharing contact details or arranging to meet up is blocked automatically.' },
  { title: 'Search that finds your future', body: 'People, high schools, colleges, summer programs, and majors in one search. Counselors can look for students like you, too, not only the other way around.' },
  { title: 'Sage, when you need an answer now', body: 'The optional AI advisor built into Pathways. It knows your grade, school, and goals, and you can hand it an essay draft to read. $5 a month, and the only thing here that costs anything.' },
];

export default function HowItWorks() {
  return (
    <>
      <Seo
        title="How Pathways Works — Free College Guidance from People Who've Been There"
        description="How Pathways works: a long-form feed, verified mentors, a safer one-on-one inbox, and search built for high school students. Free, with no counselor needed."
        path="/how-it-works"
      />

      {/* The definition leads. Someone landing here cold, and any AI answering
          "what is Pathways", gets the answer in the first paragraph. */}
      <section className="page-top gridded">
        <div className="wrap top-split">
          <div>
            <span className="kicker kicker-sun">How it works</span>
            <h1 className="title-1">How Pathways works</h1>
            <p className="lede" style={{ maxWidth: '60ch' }}>
              Pathways is a free platform that gives every high school student equal access to
              real, firsthand guidance on college and careers. Students, professors, and admissions
              counselors share experience, connect as mentors, and answer questions in one focused
              space, designed for reading and thinking rather than endless scrolling. It takes what
              works about a feed, a forum, and a professional network, and builds it for education
              only.
            </p>
          </div>

          <aside className="legend" aria-label="How posts are labelled">
            <div className="legend-title">Key: how posts are labelled</div>
            <ul className="legend-list">
              {Object.entries(CATEGORY_LABELS).filter(([k]) => k !== 'general').map(([key, label]) => (
                <li key={key}>
                  <Sign color={CATEGORY_SIGN[key]}>{label}</Sign>
                  <span>{LEGEND_NOTES[key]}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="band band-sheet" id="how">
        <div className="wrap">
          <span className="kicker">Six things</span>
          <h2 className="title-2" style={{ maxWidth: '20ch', marginBottom: 'clamp(20px,3vh,36px)' }}>
            Six things, built for students, by a student.
          </h2>
          <div className="route">
            {stops.map((s, i) => (
              <div key={s.title} className="stop">
                <span className="mile" aria-hidden="true">{i + 1}</span>
                <div className="stop-body">
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CompareTable />

      <section className="band band-road">
        <div className="wrap closer">
          <div>
            <h2 className="title-2" style={{ maxWidth: '20ch' }}>That is all of it. It costs nothing to join.</h2>
          </div>
          <Link to="/join" className="btn btn-sun btn-lg btn-go">Join free</Link>
        </div>
      </section>
    </>
  );
}

const LEGEND_NOTES = {
  applications: 'Lists, deadlines, how files get read',
  essays: 'Drafts, topics, what worked',
  scholarships: 'Aid, appeals, money you can find',
  majors: 'Choosing one, changing one',
  campus_life: 'Visits and what it is really like',
  internships: 'Getting the first one',
  careers: 'What the job is actually like',
  test_prep: 'SAT, ACT, and whether to send it',
};
