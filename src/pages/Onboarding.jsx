import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useProfile } from '@/lib/useProfile';
import BrandMark from '@/components/BrandMark';
import Seo from '@/components/Seo';
import AccountTypeChoice from '@/components/onboarding/AccountTypeChoice';
import { INTEREST_OPTIONS, EXPERTISE_OPTIONS, ADULT_ROLES } from '@/components/app/profileFields';

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

  const Chips = ({ options, selected, onToggle }) => (
    <div className="flex flex-wrap gap-2" style={{ marginTop: 4 }}>
      {options.map((label) => {
        const on = (selected || []).includes(label);
        return (
          <button
            key={label}
            type="button"
            onClick={() => onToggle(label)}
            className="btn"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              padding: '7px 14px',
              background: on ? 'var(--color-action)' : 'transparent',
              color: on ? 'var(--color-bg)' : 'var(--color-text)',
              borderColor: on ? 'transparent' : 'var(--color-divider)',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );

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
      // Someone who came in from a Sage pricing link lands on the Sage page so
      // they can finish the purchase they started, not on a feed they did not
      // ask for.
      const wantsSage = ['sage_monthly', 'sage_yearly'].includes(form.plan);
      // Carry the chosen plan through so the Sage page can send them straight
      // to checkout now that the subscription has an account to belong to.
      navigate(wantsSage ? `/app/sage?plan=${form.plan}` : '/app', { replace: true });
    } catch (err) {
      setError(err?.message || 'Could not save your profile. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 660, margin: '0 auto', padding: '0 clamp(20px,4vw,48px) 60px' }}>
      <Seo title="Set Up Your Profile | Pathways" description="Tell Pathways your grade, school, and goals so we can match you with mentors who've been where you are." path="/onboarding" noindex />
      <div className="flex items-center gap-[9px] py-[22px]">
        <BrandMark size={38} />
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: 24 }}>Pathways</span>
        <button
          type="button"
          className="btn btn-ghost ml-auto"
          style={{ fontSize: 13 }}
          onClick={() => logout(true)}
        >
          Sign out
        </button>
      </div>

      <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', maxWidth: '20ch', margin: '0 0 10px', textWrap: 'balance' }}>
        Tell us who you are.
      </h1>
      <p style={{ maxWidth: '52ch', color: 'var(--color-neutral-800)', marginBottom: 26, fontSize: 15.5, lineHeight: 1.6 }}>
        Last step. This is how we match you with people who've been exactly where you are. You can
        edit all of it later from your profile, apart from whether you are a student or an adult.
      </p>

      <form onSubmit={submit} className="card elev-sm" style={{ padding: 28, gap: 16 }}>
        <AccountTypeChoice
          value={form.account_type}
          onChange={(account_type) => setForm((f) => ({
            ...f,
            account_type,
            role: account_type === 'student'
              ? 'student'
              : (f.role === 'student' ? 'college_student' : f.role),
          }))}
        />

        {form.account_type && <hr className="divider" />}

        {form.account_type && (
        <>
        <div className="field">
          <label htmlFor="ob-name">Full name</label>
          <input id="ob-name" className="input" required value={form.full_name} onChange={set('full_name')} />
        </div>

        {isAdult && (
          <div className="field">
            <label htmlFor="ob-role">Which best describes you?</label>
            <select id="ob-role" className="input" value={form.role} onChange={set('role')}>
              {ADULT_ROLES.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        )}

        <div className="field">
          <label htmlFor="ob-birth-year">Year you were born</label>
          <input
            id="ob-birth-year"
            className="input"
            required
            inputMode="numeric"
            pattern="[0-9]{4}"
            maxLength={4}
            placeholder="2008"
            value={form.birth_year}
            onChange={set('birth_year')}
          />
          <span style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 4, display: 'block', lineHeight: 1.5 }}>
            Pathways is for people 13 and older. We use this to keep younger kids off the platform and to
            protect members who are under 18. It is never shown on your profile.
          </span>
        </div>

        {isStudent && (
          <>
            <div className="field">
              <label htmlFor="ob-grade">Grade or year</label>
              <input id="ob-grade" className="input" required placeholder="11th grade" value={form.grade} onChange={set('grade')} />
            </div>

            <div className="field">
              <label htmlFor="ob-school">School</label>
              <input id="ob-school" className="input" required placeholder="Lincoln High" value={form.school} onChange={set('school')} />
            </div>

            <div className="field">
              <label>What do you want help with?</label>
              <Chips options={INTEREST_OPTIONS} selected={form.interests} onToggle={toggleInterest} />
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
          </>
        )}

        {isAdult && (
          <>
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
                className="input"
                inputMode="numeric"
                pattern="[0-9]{1,2}"
                maxLength={2}
                placeholder="6"
                value={form.years_experience}
                onChange={set('years_experience')}
              />
            </div>

            <div className="field">
              <label>What can you speak to?</label>
              <Chips options={EXPERTISE_OPTIONS} selected={form.expertise} onToggle={toggleExpertise} />
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

            <div
              style={{
                fontSize: 13, lineHeight: 1.6, padding: '12px 14px', borderRadius: 16,
                background: 'var(--color-bg)', color: 'var(--color-neutral-800)',
              }}
            >
              <strong style={{ fontWeight: 600 }}>Two things worth knowing.</strong> Students always
              send the first message, so you will not be able to open contact with a member who is
              under 18. And your role shows as unverified until a person here has checked it, which
              you can request from your profile once you are in.
            </div>
          </>
        )}
        </>
        )}

        {error && <span style={{ fontSize: 13, color: 'var(--color-accent-700)' }}>{error}</span>}

        <button
          type="submit"
          className="btn btn-primary btn-block"
          style={{ minHeight: 46, fontSize: 15 }}
          disabled={saving || !form.account_type}
        >
          {saving ? 'Setting up your account…' : 'Enter Pathways'}
        </button>
        <span style={{ fontSize: 11.5, color: 'var(--text-subtle)', textAlign: 'center' }}>
          13+ · COPPA and FERPA aligned · We never sell student data
        </span>
      </form>
    </div>
  );
}