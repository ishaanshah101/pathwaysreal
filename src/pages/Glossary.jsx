import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import Seo from '@/components/Seo';
import Sign from '@/components/kit/Sign';
import Icon from '@/components/kit/Icon';
import PageHead from '@/components/kit/PageHead';
import { GLOSSARY, GLOSSARY_GROUPS, termId } from '@/data/glossary';

// The college process runs on words nobody stops to explain. This page is a
// plain-English index of them, public and searchable, because the students who
// most need it are the ones with nobody at home to ask.
export default function Glossary({ embedded = false }) {
  const [q, setQ] = useState('');
  const [group, setGroup] = useState('all');

  const needle = q.trim().toLowerCase();
  const matches = useMemo(() => GLOSSARY.filter((t) => {
    if (group !== 'all' && t.group !== group) return false;
    if (!needle) return true;
    return [t.term, ...(t.aka || []), t.def].join(' ').toLowerCase().includes(needle);
  }), [needle, group]);

  const shownGroups = GLOSSARY_GROUPS
    .map((g) => ({ ...g, terms: matches.filter((t) => t.group === g.id).sort((a, b) => a.term.localeCompare(b.term)) }))
    .filter((g) => g.terms.length > 0);

  const body = (
    <>
      {embedded ? (
        <>
          <Seo title="Glossary | Pathways" path="/app/glossary" noindex />
          <PageHead
            kicker="Reference"
            title="Glossary"
            sub={`${GLOSSARY.length} terms from college admissions and financial aid, each explained in a couple of sentences.`}
          />
        </>
      ) : (
        <>
          <Seo
            title="College Glossary: FAFSA, Early Decision, SAI and More, in Plain English | Pathways"
            description="A plain-English glossary of college admissions and financial aid terms for high school students: FAFSA, CSS Profile, Early Decision, net price, and more."
            path="/glossary"
          />

          <section className="page-top gridded" style={{ paddingBottom: 'clamp(20px,3vh,32px)' }}>
            <div className="wrap">
              <span className="kicker kicker-sun">Glossary</span>
              <h1 className="title-1" style={{ maxWidth: '17ch' }}>The words everyone assumes you already know.</h1>
              <p className="lede">
                {GLOSSARY.length} terms from college admissions and financial aid, each explained in a
                couple of sentences. No account needed.
              </p>
            </div>
          </section>
        </>
      )}

      <div className={embedded ? 'gloss-bar gloss-bar-embedded' : 'gloss-bar'}>
        <div className={embedded ? 'gloss-bar-inner' : 'wrap gloss-bar-inner'}>
          <div className="gloss-search">
            <Icon as={Search} size={18} />
            <input
              className="input"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search: FAFSA, waitlist, net price…"
              aria-label="Search the glossary"
            />
          </div>
          <div className="flex flex-wrap" style={{ gap: 8 }} role="group" aria-label="Filter by section">
            <button type="button" className="sign sign-ink" aria-pressed={group === 'all'} onClick={() => setGroup('all')}>All</button>
            {GLOSSARY_GROUPS.map((g) => (
              <button key={g.id} type="button" className={`sign sign-${g.sign}`} aria-pressed={group === g.id} onClick={() => setGroup(g.id)}>
                {g.label}
              </button>
            ))}
          </div>
          <span className="meta" aria-live="polite" style={{ marginLeft: 'auto' }}>
            {matches.length} {matches.length === 1 ? 'term' : 'terms'}
          </span>
        </div>
      </div>

      <section style={{ paddingBottom: embedded ? 0 : 'clamp(48px,8vh,96px)' }}>
        <div className={embedded ? undefined : 'wrap'}>
          {shownGroups.length === 0 ? (
            <div className="empty" style={{ marginTop: 40 }}>
              <p className="empty-title">Nothing matches “{q}”.</p>
              <p className="empty-body">Try a shorter word, or the abbreviation. If a term is missing, a mentor on Pathways can explain it.</p>
              <button type="button" className="btn btn-secondary" style={{ marginTop: 6 }} onClick={() => { setQ(''); setGroup('all'); }}>Clear search</button>
            </div>
          ) : shownGroups.map((g) => (
            <div key={g.id} className="gloss-group">
              <div className="gloss-group-head">
                <Sign color={g.sign} size="lg">{g.label}</Sign>
                <span className="meta">{g.terms.length} {g.terms.length === 1 ? 'term' : 'terms'}</span>
              </div>
              <dl className="gloss-list">
                {g.terms.map((t) => (
                  <div key={t.term} id={termId(t.term)} className="gloss-term">
                    <dt>
                      {t.term}
                      {t.aka?.length > 0 && <small>{t.aka.join(' · ')}</small>}
                    </dt>
                    <dd>{t.def}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}

          <p className="meta" style={{ marginTop: 40, maxWidth: '70ch', lineHeight: 1.6 }}>
            Rules and dates differ from college to college and change from year to year. Treat this as
            a starting point and confirm anything with a deadline on the college's own site or at
            studentaid.gov.
          </p>
        </div>
      </section>

      {!embedded && (
        <section className="band band-road">
          <div className="wrap closer">
            <h2 className="title-2" style={{ maxWidth: '22ch' }}>Still not sure what something means? Ask a person who has done it.</h2>
            <Link to="/join" className="btn btn-sun btn-lg btn-go">Join free</Link>
          </div>
        </section>
      )}
    </>
  );

  return embedded ? <div className="page">{body}</div> : body;
}
