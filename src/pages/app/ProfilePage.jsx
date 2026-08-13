import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useProfile, ROLE_LABELS } from '@/lib/useProfile';
import { useSubscription, openBillingPortal, SAGE_PRICES } from '@/lib/useSubscription';

const INTEREST_OPTIONS = [
  'Applications', 'Essays', 'Scholarships', 'Choosing a major',
  'Campus life', 'Internships', 'Careers', 'Test prep',
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { profile, email, saveProfile } = useProfile();
  const { subscription, hasSage, isPastDue, isCanceling } = useSubscription();
  const [billingError, setBillingError] = useState('');

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
    // Was pinned to a 680px column hugging the left edge, which left a large
    // dead area on the right. Now it uses the full content width and splits
    // into two columns on desktop, collapsing to one on narrow screens.
    <div className="flex flex-col" style={{ gap: 20, width: '100%' }}>
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

      <form onSubmit={submit} className="grid app-split" style={{ gridTemplateColumns: 'minmax(0,7fr) minmax(0,5fr)', gap: 16, alignItems: 'start' }}>
        <div className="card elev-sm" style={{ padding: 26, gap: 16, borderRadius: 26 }}>
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

        <div className="grid app-split" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
        </div>

        <div className="card elev-sm" style={{ padding: 26, gap: 16, borderRadius: 26 }}>
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

        {/* Subscription state is read-only here on purpose. It is written only
            by the Stripe webhook, so picking a paid plan from a dropdown can
            never grant access. */}
        <div className="field">
          <label>Sage subscription</label>
          <div
            style={{
              background: 'var(--color-bg)', borderRadius: 18, padding: '14px 16px',
              display: 'flex', flexDirection: 'column', gap: 8,
            }}
          >
            {hasSage ? (
              <>
                <span style={{ fontSize: 14 }}>
                  <b>Active</b>
                  {subscription?.plan ? ` · ${SAGE_PRICES[subscription.plan]?.amount} ${SAGE_PRICES[subscription.plan]?.cadence}` : ''}
                </span>
                {subscription?.current_period_end && (
                  <span style={{ fontSize: 12.5, color: 'var(--color-neutral-600)' }}>
                    {isCanceling ? 'Ends' : 'Renews'}{' '}
                    {new Date(subscription.current_period_end).toLocaleDateString()}
                  </span>
                )}
                <button
                  type="button"
                  className="btn btn-secondary self-start"
                  style={{ fontSize: 13 }}
                  onClick={async () => {
                    setBillingError('');
                    try { await openBillingPortal(); } catch (err) { setBillingError(err.message); }
                  }}
                >
                  Manage or cancel
                </button>
              </>
            ) : (
              <>
                <span style={{ fontSize: 14 }}>
                  <b>{isPastDue ? 'Payment failed' : 'Free plan'}</b>
                </span>
                <span style={{ fontSize: 12.5, color: 'var(--color-neutral-600)', lineHeight: 1.5 }}>
                  {isPastDue
                    ? 'Sage is paused until a payment goes through.'
                    : 'Everything on Pathways is free. Sage is the one optional add-on.'}
                </span>
                <Link to="/app/sage" className="btn btn-primary self-start no-underline" style={{ fontSize: 13 }}>
                  {isPastDue ? 'Fix payment' : 'Get Sage'}
                </Link>
              </>
            )}
            {billingError && (
              <span style={{ fontSize: 12, color: 'var(--color-accent-700)' }}>{billingError}</span>
            )}
          </div>
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
        </div>
      </form>
    </div>
  );
}
