import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useProfile, ROLE_LABELS } from '@/lib/useProfile';
import BrandMark from '@/components/BrandMark';

const INTEREST_OPTIONS = [
  'Applications', 'Essays', 'Scholarships', 'Choosing a major',
  'Campus life', 'Internships', 'Careers', 'Test prep',
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { profile, isOnboarded, saveProfile } = useProfile();

  const [form, setForm] = useState({
    full_name: '',
    role: 'student',
    grade: '',
    school: '',
    goals: '',
    interests: [],
    plan: 'free',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
        role: profile?.role || 'student',
        grade: profile?.grade || '',
        school: profile?.school || '',
        goals: profile?.goals || '',
        interests: profile?.interests || [],
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

  const toggleInterest = (label) =>
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(label)
        ? f.interests.filter((i) => i !== label)
        : [...f.interests, label],
    }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await saveProfile({ ...form, onboarded: true });
      // Someone who came in from a Sage pricing link lands on the Sage page so
      // they can finish the purchase they started, not on a feed they did not
      // ask for.
      const wantsSage = ['sage_monthly', 'sage_yearly'].includes(form.plan);
      navigate(wantsSage ? '/app/sage' : '/app', { replace: true });
    } catch (err) {
      setError(err?.message || 'Could not save your profile. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 660, margin: '0 auto', padding: '0 clamp(20px,4vw,48px) 60px' }}>
      <div className="flex items-center gap-[9px] py-[22px]">
        <BrandMark size={38} />
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 21 }}>Pathways</span>
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
        Last step. This is how we match you with people who've been exactly where you are, and you
        can change any of it later.
      </p>

      <form onSubmit={submit} className="card elev-sm" style={{ padding: 28, gap: 16 }}>
        <div className="field">
          <label htmlFor="ob-name">Full name</label>
          <input id="ob-name" className="input" required value={form.full_name} onChange={set('full_name')} />
        </div>

        <div className="field">
          <label htmlFor="ob-role">I'm a…</label>
          <select id="ob-role" className="input" value={form.role} onChange={set('role')}>
            {Object.entries(ROLE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="ob-grade">Grade or year</label>
          <input id="ob-grade" className="input" placeholder="11th grade" value={form.grade} onChange={set('grade')} />
        </div>

        <div className="field">
          <label htmlFor="ob-school">School</label>
          <input id="ob-school" className="input" placeholder="Lincoln High" value={form.school} onChange={set('school')} />
        </div>

        <div className="field">
          <label>What do you want help with?</label>
          <div className="flex flex-wrap gap-2" style={{ marginTop: 4 }}>
            {INTEREST_OPTIONS.map((label) => {
              const on = form.interests.includes(label);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleInterest(label)}
                  className="btn"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 13,
                    padding: '7px 14px',
                    background: on ? 'var(--color-accent)' : 'transparent',
                    color: on ? 'var(--color-bg)' : 'var(--color-text)',
                    borderColor: on ? 'transparent' : 'var(--color-divider)',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
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

        {error && <span style={{ fontSize: 13, color: 'var(--color-accent-700)' }}>{error}</span>}

        <button type="submit" className="btn btn-primary btn-block" style={{ minHeight: 46, fontSize: 15 }} disabled={saving}>
          {saving ? 'Setting up your account…' : 'Enter Pathways'}
        </button>
        <span style={{ fontSize: 11.5, color: 'var(--color-neutral-600)', textAlign: 'center' }}>
          14+ · COPPA and FERPA aligned · We never sell student data
        </span>
      </form>
    </div>
  );
}
