import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const roles = [
  { v: 'student', l: 'High school student' },
  { v: 'college_student', l: 'College student' },
  { v: 'educator', l: 'Educator / professor' },
  { v: 'counselor', l: 'Admissions counselor' },
];

export default function Join() {
  const params = new URLSearchParams(window.location.search);
  const planFromUrl = params.get('plan');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    role: 'student',
    grade: '',
    goals: '',
    plan_interest: ['sage_monthly', 'sage_yearly'].includes(planFromUrl) ? planFromUrl : 'free',
  });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await base44.entities.Signup.create(form);
      setDone(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    setSaving(false);
  };

  if (done) {
    return (
      <section style={{ padding: 'clamp(40px,8vh,90px) 0' }} className="anim-fade-up">
        <span className="tag tag-accent-2">You're in</span>
        <h1 style={{ fontSize: 'clamp(30px,4vw,48px)', maxWidth: '22ch', margin: '14px 0 12px', textWrap: 'balance' }}>
          Welcome to Pathways, {form.full_name.split(' ')[0]}.
        </h1>
        <p style={{ maxWidth: '52ch', color: 'var(--color-neutral-800)', marginBottom: 24 }}>
          We saved your spot at {form.email}. Next: see how Pathways works, or ask Sage your first question.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Link to="/how-it-works" className="btn btn-primary" style={{ fontSize: 15, padding: '12px 26px' }}>See how it works</Link>
          <Link to="/sage" className="btn btn-secondary" style={{ fontSize: 15, padding: '12px 26px' }}>Meet Sage</Link>
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: 'clamp(32px,6vh,72px) 0' }}>
      <span className="tag tag-accent-2">Free for every student, forever</span>
      <h1 style={{ fontSize: 'clamp(30px,4vw,48px)', maxWidth: '20ch', margin: '14px 0 10px', textWrap: 'balance' }}>
        Start your path, it's free.
      </h1>
      <p style={{ maxWidth: '52ch', color: 'var(--color-neutral-800)', marginBottom: 26 }}>
        Tell us a little about you so we can match you with mentors who've been exactly where you are.
      </p>
      <form onSubmit={submit} className="card elev-sm" style={{ padding: 28, gap: 16, maxWidth: 560 }}>
        <div className="field">
          <label htmlFor="name">Full name</label>
          <input id="name" className="input" required value={form.full_name} onChange={set('full_name')} />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" className="input" required value={form.email} onChange={set('email')} />
        </div>
        <div className="field">
          <label htmlFor="role">I'm a…</label>
          <select id="role" className="input" value={form.role} onChange={set('role')}>
            {roles.map((r) => <option key={r.v} value={r.v}>{r.l}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="grade">Grade or institution</label>
          <input id="grade" className="input" placeholder="11th grade · Lincoln High" value={form.grade} onChange={set('grade')} />
        </div>
        <div className="field">
          <label htmlFor="goals">What do you want help with?</label>
          <textarea id="goals" className="input" value={form.goals} onChange={set('goals')} placeholder="Picking a major, essays, scholarships…" />
        </div>
        <div className="field">
          <label htmlFor="plan">Sage, the optional AI advisor</label>
          <select id="plan" className="input" value={form.plan_interest} onChange={set('plan_interest')}>
            <option value="free">Just the free app for now</option>
            <option value="sage_monthly">Add Sage — $5 per month</option>
            <option value="sage_yearly">Add Sage — $40 per year</option>
          </select>
        </div>
        {error && <span style={{ fontSize: 13, color: 'var(--color-accent-700)' }}>{error}</span>}
        <button type="submit" className="btn btn-primary btn-block" style={{ minHeight: 46, fontSize: 15 }} disabled={saving}>
          {saving ? 'Creating your account…' : 'Join Pathways free'}
        </button>
        <span style={{ fontSize: 11.5, color: 'var(--color-neutral-600)', textAlign: 'center' }}>
          14+ · COPPA and FERPA aligned · We never sell student data
        </span>
      </form>
    </section>
  );
}