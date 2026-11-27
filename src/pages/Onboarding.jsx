import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useProfile } from '@/lib/useProfile';
import BrandMark from '@/components/BrandMark';
import Seo from '@/components/Seo';
import AccountTypeChoice from '@/components/onboarding/AccountTypeChoice';
import ChipPicker from '@/components/app/ChipPicker';
import Sign from '@/components/kit/Sign';
import FieldSelect from '@/components/ui/FieldSelect';
import { INTEREST_OPTIONS, EXPERTISE_OPTIONS, ADULT_ROLES } from '@/components/app/profileFields';
import { isNativeApp } from '@/lib/platform';

const STOP_COUNT = 4;

// One stop on the way in: a line of small print saying which stop it is, the
// question, and the fields that answer it. Declared out here, not inside the
// page, so typing in a field never remounts it.
function Stop({ n, id, title, hint, current = false, children }) {
  return (
    <section className="ob-step" aria-labelledby={id}>
      <span className={`kicker${current ? ' kicker-sun' : ''}`}>Question {n} of {STOP_COUNT}</span>
      <h2 className="ob-q" id={id}>{title}</h2>
      {hint && <p className="ob-hint">{hint}</p>}
      <div className="ob-fields">{children}</div>
    </section>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { profile, isOnboarded, saveProfile } = useProfile();

  const [form, setForm] = useState({
    full_name: '',
    account_type: '',
    role: 'student',
    grade: '',
    school: '',
    goals: '',
    interests: [],
    institution: '',
    job_title: '',
    expertise: [],
    years_experience: '',
    help_with: '',
    plan: 'free',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isStudent = form.account_type === 'student';
  const isAdult = form.account_type === 'adult';

  // Anyone who already finished this goes straight into the app.
  useEffect(() => {
    if (isOnboarded) navigate('/app', { replace: true });
  }, [isOnboarded, navigate]);

  // Prefill from the Google account, plus a Signup row if they left one on the
  // landing page before creating an account.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const planFromUrl = new URLSearchParams(window.location.search).get('plan');
      const base = {
        full_name: profile?.full_name || user?.full_name || '',
        account_type: profile?.account_type || '',
        role: profile?.role || 'student',
        grade: profile?.grade || '',
        school: profile?.school || '',
        goals: profile?.goals || '',
        interests: profile?.interests || [],
        institution: profile?.institution || '',
        job_title: profile?.job_title || '',
        expertise: profile?.expertise || [],
        years_experience: profile?.years_experience ? String(profile.years_experience) : '',
        help_with: profile?.help_with || '',
        birth_year: profile?.birth_year ? String(profile.birth_year) : '',
        plan: profile?.plan || (['sage_monthly', 'sage_yearly'].includes(planFromUrl) ? planFromUrl : 'free'),
      };
      if (!profile && user?.email) {
        try {
          const prior = await base44.entities.Signup.filter({ email: user.email });
          const s = Array.isArray(prior) && prior.length ? prior[0] : null;
          if (s) {
            base.full_name = base.full_name || s.full_name || '';
            base.role = s.role || base.role;
            base.grade = base.grade || s.grade || '';
            base.goals = base.goals || s.goals || '';
            base.plan = s.plan_interest || base.plan;
          }
        } catch {
          // A missing or unreadable lead row must never block onboarding.
        }
      }
      if (!cancelled) setForm(base);
    })();
    return () => { cancelled = true; };
  }, [profile, user]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const toggleIn = (key) => (label) =>
    setForm((f) => ({
      ...f,
      [key]: (f[key] || []).includes(label)
        ? f[key].filter((i) => i !== label)
        : [...(f[key] || []), label],
    }));

  const toggleInterest = toggleIn('interests');
  const toggleExpertise = toggleIn('expertise');

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.account_type) {
      setError('Please choose whether you are joining as a student or as an adult.');
      return;
    }

    // Checked here as well as on the server, so someone who mistypes finds out
    // before a round trip. The server is still the one that decides.
    const year = Number(form.birth_year);
    const thisYear = new Date().getFullYear();
    if (!Number.isInteger(year) || year < 1900 || year > thisYear) {
      setError('Please enter the year you were born, as four digits.');
      return;
    }

    setSaving(true);
    try {
      // Only the fields belonging to the chosen track are sent, so an adult who
      // first clicked "student" does not leave a stray grade on their profile.
      const common = {
        full_name: form.full_name,
        account_type: form.account_type,
        plan: form.plan,
        birth_year: year,
        onboarded: true,
      };
      const payload = form.account_type === 'student'
        ? {
          ...common,
          role: 'student',
          grade: form.grade,
          school: form.school,
          goals: form.goals,
          interests: form.interests,
        }
        : {
          ...common,
          role: form.role === 'student' ? 'college_student' : form.role,
          institution: form.institution,
          job_title: form.job_title,
          expertise: form.expertise,
          years_experience: form.years_experience ? Number(form.years_experience) : undefined,
          help_with: form.help_with,
        };
      await saveProfile(payload);
      base44.analytics.track({
        eventName: 'user_signup_completed',
        properties: { account_type: form.account_type, plan: form.plan },
      });
      // The welcome email is sent from here, while the member is signed in, so
      // the endpoint can insist on a real session. It is once per address per
      // day on the server, and a mail failure must never block entry.
      base44.functions.invoke('sendWelcomeEmail', {
        email: user?.email,
        full_name: form.full_name,
      }).catch(() => {});
      // Someone who came in from a Sage pricing link lands on the Sage page so
      // they can finish the purchase they started, not on a feed they did not
      // ask for.
      const wantsSage = !isNativeApp() && ['sage_monthly', 'sage_yearly'].includes(form.plan);
      // Carry the chosen plan through so the Sage page can send them straight
      // to checkout now that the subscription has an account to belong to.
      navigate(wantsSage ? `/app/sage?plan=${form.plan}` : '/app', { replace: true });
    } catch (err) {
      setError(err?.message || 'Could not save your profile. Please try again.');
      setSaving(false);
    }
  };

  // Where the member is along the route. Read straight off the form, so it can
  // never disagree with what has been typed, and it decides nothing: the
  // checks that matter are the ones in submit() and on the server.
  const filled = (v) => Boolean(String(v || '').trim());
  const bornIn = Number(form.birth_year);
  const yearLooksRight = /^[0-9]{4}$/.test(String(form.birth_year || ''))
    && bornIn >= 1900 && bornIn <= new Date().getFullYear();
  const stopDone = [
    Boolean(form.account_type),
    Boolean(form.account_type) && filled(form.full_name) && yearLooksRight,
    isStudent ? filled(form.grade) && filled(form.school) : isAdult && filled(form.institution) && filled(form.job_title),
    isStudent
      ? (form.interests || []).length > 0 || filled(form.goals)
      : isAdult && ((form.expertise || []).length > 0 || filled(form.help_with)),
  ];
  const here = stopDone.indexOf(false);
  const stateOf = (i) => (stopDone[i] ? 'done' : i === here ? 'current' : 'todo');
  const stops = [
    { label: 'Who you are', note: 'Student or adult' },
    { label: 'The basics', note: 'Your name and the year you were born' },
    { label: 'Where you are', note: isAdult ? 'Where you work or study' : 'Your grade and school' },
    isAdult
      ? { label: 'What you know', note: 'Topics you can speak to' }
      : { label: 'What you need', note: 'Topics you want help with' },
  ];

  return (
    <div className="ob">
      <Seo title="Set Up Your Profile | Pathways" description="Tell Pathways your grade, school, and goals so we can match you with mentors who've been where you are." path="/onboarding" noindex />

      <div className="ob-side">
        <header className="ob-intro">
          <div className="ob-bar">
            <span className="brand">
              <BrandMark size={38} />
              <span className="brand-name">Pathways</span>
            </span>
            <button type="button" className="ob-signout" onClick={() => logout(true)}>
              Sign out
            </button>
          </div>

          <span className="kicker">Set up your profile</span>
          <h1 className="ob-title">Tell us who you are.</h1>
          <p className="ob-lede">
            Last step. This is how we match you with people who've been exactly where you are. You can
            edit all of it later from your profile, apart from whether you are a student or an adult.
          </p>
        </header>

        <div className="ob-route-wrap">
          <ol className="ob-route" aria-label="Your progress">
            {stops.map((s, i) => {
              const state = stateOf(i);
              return (
                <li key={s.label} className="ob-stop" data-state={state} aria-current={state === 'current' ? 'step' : undefined}>
                  <span className="mile" aria-hidden="true"><small>{state === 'done' ? 'DONE' : 'STOP'}</small>{i + 1}</span>
                  <span className="ob-stop-text">
                    <b>
                      <span className="sr-only">Question {i + 1}{state === 'done' ? ', done' : ''}: </span>
                      {s.label}
                      {state === 'current' && <Sign color="yellow">Up next</Sign>}
                    </b>
                    <small>{s.note}</small>
                  </span>
                </li>
              );
            })}
            <li className="ob-stop" data-state={here === -1 ? 'current' : 'todo'} aria-current={here === -1 ? 'step' : undefined}>
              <span className="ob-sun" aria-hidden="true" />
              <span className="ob-stop-text">
                <b>
                  Enter Pathways
                  {here === -1 && <Sign color="yellow">Up next</Sign>}
                </b>
                <small>Your feed opens next</small>
              </span>
            </li>
          </ol>
        </div>

        {user?.email && <p className="ob-who">Signed in as {user.email}</p>}
      </div>

      <main className="ob-main">
        <form onSubmit={submit} className="ob-form">
          <Stop
            n={1}
            id="ob-q-who"
            title="Which of these are you?"
            hint="Pick one and we will only ask for the details that apply to you."
            current={here === 0}
          >
            <AccountTypeChoice
              labelledBy="ob-q-who"
              value={form.account_type}
              onChange={(account_type) => setForm((f) => ({
                ...f,
                account_type,
                role: account_type === 'student'
                  ? 'student'
                  : (f.role === 'student' ? 'college_student' : f.role),
              }))}
            />
          </Stop>

          {form.account_type && (
          <>
          <Stop n={2} id="ob-q-basics" title="First, the basics." current={here === 1}>
            <div className="field">
              <label htmlFor="ob-name">Full name</label>
              <input id="ob-name" className="input" required value={form.full_name} onChange={set('full_name')} />
            </div>

            {isAdult && (
              <div className="field">
                <label htmlFor="ob-role">Which best describes you?</label>
                <FieldSelect
                  id="ob-role"
                  value={form.role}
                  onValueChange={(role) => setForm((f) => ({ ...f, role }))}
                  options={ADULT_ROLES}
                />
              </div>
            )}

            <div className="field">
              <label htmlFor="ob-birth-year">Year you were born</label>
              <input
                id="ob-birth-year"
                className="input ob-short num"
                required
                inputMode="numeric"
                pattern="[0-9]{4}"
                maxLength={4}
                placeholder="2008"
                value={form.birth_year}
                onChange={set('birth_year')}
              />
              <span className="field-hint" style={{ maxWidth: '60ch' }}>
                Pathways is for people 13 and older. We use this to keep younger kids off the platform and to
                protect members who are under 18. It is never shown on your profile.
              </span>
            </div>
          </Stop>

          {isStudent && (
            <>
              <Stop n={3} id="ob-q-where" title="Where are you in school?" current={here === 2}>
                <div className="ob-pair">
                  <div className="field">
                    <label htmlFor="ob-grade">Grade or year</label>
                    <input id="ob-grade" className="input" required placeholder="11th grade" value={form.grade} onChange={set('grade')} />
                  </div>

                  <div className="field">
                    <label htmlFor="ob-school">School</label>
                    <input id="ob-school" className="input" required placeholder="Lincoln High" value={form.school} onChange={set('school')} />
                  </div>
                </div>
              </Stop>

              <Stop
                n={4}
                id="ob-q-topics"
                title="What do you want help with?"
                hint="Pick any that fit. You can change them later."
                current={here === 3}
              >
                <div role="group" aria-labelledby="ob-q-topics">
                  <ChipPicker options={INTEREST_OPTIONS} selected={form.interests} onToggle={toggleInterest} />
                </div>

                <div className="field">
                  <label htmlFor="ob-goals">Anything specific on your mind?</label>
                  <textarea
                    id="ob-goals"
                    className="input"
                    value={form.goals}
                    onChange={set('goals')}
                    placeholder="Picking a major, essays, scholarships…"
                  />
                </div>
              </Stop>
            </>
          )}

          {isAdult && (
            <>
              <Stop n={3} id="ob-q-where" title="Where do you work or study?" current={here === 2}>
                <div className="field">
                  <label htmlFor="ob-institution">Where are you now?</label>
                  <input
                    id="ob-institution"
                    className="input"
                    required
                    placeholder="UC Berkeley, Lincoln High, Acme Admissions…"
                    value={form.institution}
                    onChange={set('institution')}
                  />
                </div>

                <div className="field">
                  <label htmlFor="ob-title">Your title or year</label>
                  <input
                    id="ob-title"
                    className="input"
                    required
                    placeholder="Associate Professor of Biology, or Junior studying CS"
                    value={form.job_title}
                    onChange={set('job_title')}
                  />
                </div>

                <div className="field">
                  <label htmlFor="ob-years">Years in your field</label>
                  <input
                    id="ob-years"
                    className="input ob-short num"
                    inputMode="numeric"
                    pattern="[0-9]{1,2}"
                    maxLength={2}
                    placeholder="6"
                    value={form.years_experience}
                    onChange={set('years_experience')}
                  />
                </div>
              </Stop>

              <Stop
                n={4}
                id="ob-q-topics"
                title="What can you speak to?"
                hint="Pick any that fit. You can change them later."
                current={here === 3}
              >
                <div role="group" aria-labelledby="ob-q-topics">
                  <ChipPicker options={EXPERTISE_OPTIONS} selected={form.expertise} onToggle={toggleExpertise} />
                </div>

                <div className="field">
                  <label htmlFor="ob-help">What are you happy for students to ask you about?</label>
                  <textarea
                    id="ob-help"
                    className="input"
                    value={form.help_with}
                    onChange={set('help_with')}
                    placeholder="What my major is actually like day to day, how research placements work, what I wish I had known applying…"
                  />
                </div>

                <div className="notice notice-info">
                  <strong>Two things worth knowing.</strong> Students always
                  send the first message, so you will not be able to open contact with a member who is
                  under 18. And your role shows as unverified until a person here has checked it, which
                  you can request from your profile once you are in.
                </div>
              </Stop>
            </>
          )}
          </>
          )}

          <div className="ob-end">
            {error && <div role="alert" className="notice notice-error">{error}</div>}

            <button
              type="submit"
              className={`btn btn-primary btn-lg btn-block${saving ? '' : ' btn-go'}`}
              disabled={saving || !form.account_type}
            >
              {saving ? 'Setting up your account…' : 'Enter Pathways'}
            </button>
            {!form.account_type && (
              <span className="field-hint" style={{ marginTop: 0, textAlign: 'center' }}>
                Choose student or adult above and the rest of the questions appear.
              </span>
            )}
            <span className="meta">
              13+ · COPPA and FERPA aligned · We never sell student data
            </span>
          </div>
        </form>
      </main>
    </div>
  );
}
