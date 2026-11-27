import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Seo from '@/components/Seo';
import { GRADES, gradeById } from '@/data/gradeGuide';
import { useAuth } from '@/lib/AuthContext';
import PageHead from '@/components/kit/PageHead';

// What to do, and when, from ninth grade to twelfth. Public, because a student
// should not need an account to find out what junior year is for.
export default function ByGrade({ embedded = false }) {
  const [params, setParams] = useSearchParams();
  const [active, setActive] = useState(() => gradeById(params.get('grade') || '11').id);
  const { isAuthenticated } = useAuth();
  const grade = gradeById(active);

  const pick = (id) => {
    setActive(id);
    setParams({ grade: id }, { replace: true, preventScrollReset: true });
  };

  const tabs = (
    <div className="grade-tabs" role="tablist" aria-label="Choose a grade">
      {GRADES.map((g) => (
        <button
          key={g.id}
          type="button"
          role="tab"
          id={`grade-tab-${g.id}`}
          aria-selected={active === g.id}
          aria-controls="grade-panel"
          className="grade-tab"
          onClick={() => pick(g.id)}
        >
          <span>Grade</span>
          <b>{g.short}</b>
        </button>
      ))}
    </div>
  );

  const route = (
    <>
      <h2 className="title-2" style={{ maxWidth: '20ch' }}>{grade.headline}</h2>
      <p className="lede" style={{ margin: '16px 0 clamp(16px,3vh,28px)' }}>{grade.intro}</p>

      <div className="route">
        {grade.seasons.map((s) => (
          <div key={s.when} className="season">
            <span className="season-dot" aria-hidden="true" />
            <div>
              <h3>{s.when}</h3>
              <ul>
                {s.steps.map((st) => <li key={st.text}>{st.text}</li>)}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <p className="meta" style={{ marginTop: 28, maxWidth: '70ch', lineHeight: 1.6 }}>
        Dates here are typical, not universal. Every college sets its own deadlines, so confirm
        each one on that college's site. Words you do not recognise are in
        the <Link to={embedded ? '/app/glossary' : '/glossary'}>glossary</Link>.
      </p>
    </>
  );

  // Inside the app: no marketing bands, and the next step is the planner.
  if (embedded) {
    return (
      <div className="page">
        <Seo title="By Grade | Pathways" path="/app/by-grade" noindex />
        <PageHead kicker="Reference" title="By grade" sub="What actually matters each year, in the order it comes up.">
          <Link to="/app/plan?starter=1" className="btn btn-sun btn-go">Add these to my plan</Link>
        </PageHead>
        <div style={{ marginBottom: 28 }}>{tabs}</div>
        <div id="grade-panel" role="tabpanel" aria-labelledby={`grade-tab-${grade.id}`}>{route}</div>
      </div>
    );
  }

  return (
    <>
      <Seo
        title="What to Do in 9th, 10th, 11th and 12th Grade for College | Pathways"
        description="A season-by-season guide to getting ready for college, from 9th grade to 12th: classes, testing, the college list, financial aid, and deadlines."
        path="/by-grade"
      />

      <section className="page-top gridded">
        <div className="wrap">
          <span className="kicker kicker-sun">By grade</span>
          <h1 className="title-1" style={{ maxWidth: '15ch' }}>Four years, one season at a time.</h1>
          <p className="lede">
            Nobody hands you the schedule for this. Here it is: what actually matters each year, in
            the order it comes up.
          </p>
          <div style={{ marginTop: 28 }}>{tabs}</div>
        </div>
      </section>

      <section className="band band-sheet" id="grade-panel" role="tabpanel" aria-labelledby={`grade-tab-${grade.id}`}>
        <div className="wrap">{route}</div>
      </section>

      <section className="band band-road">
        <div className="wrap closer">
          <div>
            <h2 className="title-2" style={{ maxWidth: '22ch' }}>Put these on a plan with real dates.</h2>
            <p className="lede" style={{ marginTop: 16 }}>
              The planner inside Pathways starts from this list for your grade and lets you add your
              own colleges and deadlines.
            </p>
          </div>
          <Link to={isAuthenticated ? '/app/plan?starter=1' : '/join'} className="btn btn-sun btn-lg btn-go">
            {isAuthenticated ? 'Open my plan' : 'Join free'}
          </Link>
        </div>
      </section>
    </>
  );
}
