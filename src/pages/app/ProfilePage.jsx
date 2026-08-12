import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useProfile, ROLE_LABELS } from '@/lib/useProfile';

const INTEREST_OPTIONS = [
  'Applications', 'Essays', 'Scholarships', 'Choosing a major',
  'Campus life', 'Internships', 'Careers', 'Test prep',
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { profile, email, saveProfile } = useProfile();

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name || '',
      role: profile.role || 'student',
      grade: profile.grade || '',
      school: profile.school || '',
      headline: profile.headline || '',
      bio: profile.bio || '',
      goals: profile.goals || '',
      interests: profile.interests || [],
      plan: profile.plan || 'free',
    });
  }, [profile]);

  const loadRequests = async () => {
    try {
      const rows = await base44.entities.Connection.list('-created_date', 100);
      setRequests((Array.isArray(rows) ? rows : []).filter((c) => c.to_email === email && c.status === 'pending'));
    } catch {
      setRequests([]);
    }
  };

  useEffect(() => { if (email) loadRequests(); }, [email]);

  const respond = async (c, status) => {
    try {
      await base44.entities.Connection.update(c.id, { status });
      await loadRequests();
    } catch { /* leave the row in place so it can be retried */ }
  };

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setSaved(false); };

  const toggleInterest = (label) => {
    setSaved(false);
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(label) ? f.interests.filter((i) => i !== label) : [...f.interests, label],
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await saveProfile({ ...form, onboarded: true });
      setSaved(true);
    } catch (err) {
      setError(err?.message || 'Could not save. Please try again.');
    }
    setSaving(false);
  };

  if (!form) return <p style={{ color: 'var(--color-neutral-600)' }}>Loading your profile…</p>;

  return (
    <div className="flex flex-col" style={{ gap: 20, maxWidth: 680 }}>
      <div>
        <h1 style={{ fontSize: 'clamp(26px,3.2vw,36px)', margin: '0 0 6px' }}>Your profile</h1>
        <p style={{ color: 'var(--color-neutral-800)', margin: 0 }}>
          Signed in as {user?.email}. This is what other members see when they find you.
        </p>
      </div>

      {requests.length > 0 && (
        <div className="card elev-sm" style={{ padding: 20, gap: 12, borderRadius: 24, background: 'var(--color-accent-2-100)' }}>
          <span className="card-kicker">Connection requests</span>
          {requests.map((c) => (
            <div key={c.id} className="flex items-center gap-3 flex-wrap">
              <span style={{ fontSize: 14 }}>
                <b>{c.from_name || c.from_email}</b> wants to connect.
              </span>
              <div className="flex gap-2" style={{ marginLeft: 'auto' }}>
                <button type="button" className="btn btn-primary" style={{ fontSize: 13 }} onClick={() => respond(c, 'accepted')}>
                  Accept
                </button>
                <button type="button" className="btn btn-secondary" style={{ fontSize: 13 }} onClick={() => respond(c, 'declined')}>
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="card elev-sm" style={{ padding: 26, gap: 16, borderRadius: 26 }}>
        <div className="field">
          <label htmlFor="pf-name">Full name</label>
          <input id="pf-name" className="input" required value={form.full_name} onChange={set('full_name')} />
        </div>

        <div className="field">
          <label htmlFor="pf-role">I'm a…</label>
          <select id="pf-role" className="input" value={form.role} onChange={set('role')}>
            {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>

        <div className="field">
          <label htmlFor="pf-headline">Headline</label>
          <input
            id="pf-headline"
            className="input"
            placeholder="CMU first-year, Information Systems"
            value={form.headline}
            onChange={set('headline')}
          />
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="field">
            <label htmlFor="pf-grade">Grade or year</label>
            <input id="pf-grade" className="input" value={form.grade} onChange={set('grade')} />
          </div>
          <div className="field">
            <label htmlFor="pf-school">School</label>
            <input id="pf-school" className="input" value={form.school} onChange={set('school')} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="pf-bio">Short bio</label>
          <textarea
            id="pf-bio"
            className="input"
            value={form.bio}
            onChange={set('bio')}
            placeholder="What can people ask you about?"
          />
        </div>

        <div className="field">
          <label>Topics</label>
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
                    fontFamily: 'var(--font-body)', fontSize: 13, padding: '7px 14px',
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
          <label htmlFor="pf-plan">Sage plan</label>
          <select id="pf-plan" className="input" value={form.plan} onChange={set('plan')}>
            <option value="free">Free app only</option>
            <option value="sage_monthly">Sage — $5 per month</option>
            <option value="sage_yearly">Sage — $40 per year</option>
          </select>
        </div>

        {error && <span style={{ fontSize: 13, color: 'var(--color-accent-700)' }}>{error}</span>}

        <div className="flex gap-3 items-center flex-wrap">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {saved && <span style={{ fontSize: 13, color: 'var(--color-accent-2-700)' }}>Saved.</span>}
          <button
            type="button"
            className="btn btn-ghost"
            style={{ marginLeft: 'auto' }}
            onClick={() => logout(true)}
          >
            Sign out
          </button>
        </div>
      </form>
    </div>
  );
}
