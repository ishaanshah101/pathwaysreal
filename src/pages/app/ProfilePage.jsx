import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useProfile } from '@/lib/useProfile';
import { useSubscription, openBillingPortal, SAGE_PRICES } from '@/lib/useSubscription';
import Seo from '@/components/Seo';
import { SkeletonLine, SkeletonTitle } from '@/components/ui/Skeletons';
import ChipPicker from '@/components/app/ChipPicker';
import VerificationCard from '@/components/app/VerificationCard';
import { useFollows } from '@/lib/useFollows';
import { useConnections } from '@/lib/useConnections';
import { INTEREST_OPTIONS, EXPERTISE_OPTIONS, ADULT_ROLES } from '@/components/app/profileFields';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { profile, email, saveProfile } = useProfile();
  const { subscription, hasSage, isPastDue, isCanceling } = useSubscription();
  const { followingCount, followerCount } = useFollows();
  const { respondToConnection } = useConnections();
  const [billingError, setBillingError] = useState('');

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [requests, setRequests] = useState([]);
  // The form is filled from the profile exactly once. A background refetch used
  // to re-run this and wipe whatever was typed, which is why the birth year
  // kept being asked for over and over.
  const seededFor = React.useRef(null);

  useEffect(() => {
    if (!profile) return;
    if (seededFor.current === profile.id) return;
    seededFor.current = profile.id;
    setForm({
      full_name: profile.full_name || '',
      account_type: profile.account_type || 'student',
      role: profile.role || 'student',
      grade: profile.grade || '',
      school: profile.school || '',
      headline: profile.headline || '',
      bio: profile.bio || '',
      goals: profile.goals || '',
      interests: profile.interests || [],
      institution: profile.institution || '',
      job_title: profile.job_title || '',
      expertise: profile.expertise || [],
      years_experience: profile.years_experience ? String(profile.years_experience) : '',
      help_with: profile.help_with || '',
      birth_year: profile.birth_year ? String(profile.birth_year) : '',
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

  // Answering goes through respond-connection, the same as the Requests page.
  //
  // This used to call Connection.update directly, which meant two things: the
  // requester was never notified that they had been accepted, because only the
  // function writes that notification as service role; and the entity rule that
  // permitted the write also permitted the SENDER of a request to accept it on
  // their own behalf. The entity now refuses direct writes outright, so this
  // path had to move regardless.
  const [respondError, setRespondError] = useState('');

  const respond = async (c, status) => {
    setRespondError('');
    const res = await respondToConnection(c.id, status);
    if (res?.ok === false) {
      setRespondError(res.error || 'That did not go through. Please try again.');
      return;
    }
    await loadRequests();
  };

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setSaved(false); };

  const toggleIn = (key) => (label) => {
    setSaved(false);
    setForm((f) => ({
      ...f,
      [key]: (f[key] || []).includes(label)
        ? f[key].filter((i) => i !== label)
        : [...(f[key] || []), label],
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    // Members who joined before we asked for a birth year supply it here.
    // Once one is on file it is immutable, so we only send it when missing.
    // Only the fields belonging to the chosen track are sent, so switching from
    // student to adult does not leave a stray grade behind.
    const isStudent = form.account_type === 'student';
    const payload = {
      full_name: form.full_name,
      headline: form.headline,
      bio: form.bio,
      onboarded: true,
      ...(isStudent
        ? {
          role: 'student',
          grade: form.grade,
          school: form.school,
          goals: form.goals,
          interests: form.interests,
        }
        : {
          role: form.role === 'student' ? 'college_student' : form.role,
          institution: form.institution,
          job_title: form.job_title,
          expertise: form.expertise,
          years_experience: form.years_experience ? Number(form.years_experience) : undefined,
          help_with: form.help_with,
        }),
    };
    if (!profile?.birth_year) {
      const year = Number(form.birth_year);
      const thisYear = new Date().getFullYear();
      if (!Number.isInteger(year) || year < 1900 || year > thisYear) {
        setError('Please enter the year you were born, as four digits.');
        return;
      }
      payload.birth_year = year;
    } else {
      delete payload.birth_year;
    }
    setSaving(true);
    try {
      await saveProfile(payload);
      setSaved(true);
    } catch (err) {
      setError(err?.message || 'Could not save. Please try again.');
    }
    setSaving(false);
  };

  if (!form) {
    return (
      <div className="card elev-sm" style={{ padding: 26, gap: 14, maxWidth: 620 }} aria-busy="true">
        <span className="sr-only">Loading your profile</span>
        <SkeletonTitle width="40%" />
        <SkeletonLine width="70%" />
        <SkeletonLine width="90%" />
        <SkeletonLine width="60%" />
      </div>
    );
  }

  return (
    // Was pinned to a 680px column hugging the left edge, which left a large
    // dead area on the right. Now it uses the full content width and splits
    // into two columns on desktop, collapsing to one on narrow screens.
    <div className="flex flex-col" style={{ gap: 20, width: '100%' }}>
      <Seo title="Your Profile | Pathways" description="Edit your Pathways profile, topics, and Sage subscription." path="/app/profile" noindex />
      <div>
        <h1 style={{ fontSize: 'clamp(26px,3.2vw,36px)', margin: '0 0 6px' }}>Your profile</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 15 }}>
          Signed in as {user?.email}. This is what other members see when they find you.
        </p>
      </div>

      {requests.length > 0 && (
        <div className="card elev-sm" style={{ padding: 20, gap: 12, borderLeft: '3px solid var(--color-accent)' }}>
          <span className="card-kicker">Connection requests</span>
          {requests.map((c) => (
            <div key={c.id} className="flex items-center gap-3 flex-wrap">
              <span style={{ fontSize: 14 }}>
                <b>{c.from_name || c.from_email}</b> wants to connect.
              </span>
              <div className="flex gap-2" style={{ marginLeft: 'auto' }}>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => respond(c, 'accepted')}>
                  Accept
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => respond(c, 'declined')}>
                  Decline
                </button>
              </div>
            </div>
          ))}
          {respondError && (
            <span role="alert" className="msg msg-error">{respondError}</span>
          )}
        </div>
      )}

      <form onSubmit={submit} className="flex flex-col" style={{ gap: 16 }}>
      <div className="grid app-split" style={{ gridTemplateColumns: 'minmax(0,7fr) minmax(0,5fr)', gap: 16, alignItems: 'start' }}>
        <div className="card elev-sm" style={{ padding: 26, gap: 16 }}>
        <div className="field">
          <label htmlFor="pf-name">Full name</label>
          <input id="pf-name" className="input" required value={form.full_name} onChange={set('full_name')} />
        </div>

        {/* Account type is fixed after sign-up on purpose. If an adult could
            relabel themselves as a student, the rule that students always send
            the first message would be trivial to get around. */}
        <div className="field">
          <label>Account type</label>
          <input
            className="input"
            value={form.account_type === 'adult' ? 'Adult' : 'Student'}
            readOnly
            aria-disabled="true"
          />
          <span className="field-hint">
            This is set when you create your account and cannot be changed here. If it is wrong,
            contact us and a person will look at it.
          </span>
        </div>

        {form.account_type === 'adult' && (
          <div className="field">
            <label htmlFor="pf-role">Which best describes you?</label>
            <select id="pf-role" className="input" value={form.role} onChange={set('role')}>
              {ADULT_ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        )}

        {/* Once a birth year is on file it is fixed, but it was previously not
            shown at all, so people could not tell we had it. */}
        {profile?.birth_year ? (
          <div className="field">
            <label>Year you were born</label>
            <input className="input" value={profile.birth_year} readOnly aria-disabled="true" />
            <span className="field-hint">
              Never shown on your profile. It cannot be changed here, because it decides which safety
              rules apply to your account.
            </span>
          </div>
        ) : (
          <div className="field">
            <label htmlFor="pf-birth-year">Year you were born</label>
            <input
              id="pf-birth-year"
              className="input"
              required
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              placeholder="2008"
              value={form.birth_year}
              onChange={set('birth_year')}
            />
            <span className="field-hint">
              You joined before we asked for this. Pathways is for people 13 and older, and we use it to
              protect members who are under 18. It is never shown on your profile.
            </span>
          </div>
        )}

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

        {form.account_type === 'student' ? (
          <>
            <div className="grid app-split" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label htmlFor="pf-grade">Grade or year</label>
                <input id="pf-grade" className="input" placeholder="11th grade" value={form.grade} onChange={set('grade')} />
              </div>
              <div className="field">
                <label htmlFor="pf-school">School</label>
                <input id="pf-school" className="input" placeholder="Lincoln High" value={form.school} onChange={set('school')} />
              </div>
            </div>

            <div className="field">
              <label htmlFor="pf-goals">Anything specific on your mind?</label>
              <textarea
                id="pf-goals"
                className="input"
                value={form.goals}
                onChange={set('goals')}
                placeholder="Picking a major, essays, scholarships…"
              />
            </div>
          </>
        ) : (
          <>
            <div className="field">
              <label htmlFor="pf-institution">Where are you now?</label>
              <input
                id="pf-institution"
                className="input"
                placeholder="UC Berkeley, Lincoln High, Acme Admissions…"
                value={form.institution}
                onChange={set('institution')}
              />
            </div>

            <div className="grid app-split" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label htmlFor="pf-title">Your title or year</label>
                <input
                  id="pf-title"
                  className="input"
                  placeholder="Associate Professor of Biology"
                  value={form.job_title}
                  onChange={set('job_title')}
                />
              </div>
              <div className="field">
                <label htmlFor="pf-years">Years in your field</label>
                <input
                  id="pf-years"
                  className="input"
                  inputMode="numeric"
                  pattern="[0-9]{1,2}"
                  maxLength={2}
                  placeholder="6"
                  value={form.years_experience}
                  onChange={set('years_experience')}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="pf-help">What are you happy for students to ask you about?</label>
              <textarea
                id="pf-help"
                className="input"
                value={form.help_with}
                onChange={set('help_with')}
                placeholder="What my major is actually like day to day, how research placements work…"
              />
            </div>
          </>
        )}

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

        <div className="card elev-sm" style={{ padding: 26, gap: 16 }}>
        <div className="field">
          {form.account_type === 'student' ? (
            <>
              <label>What do you want help with?</label>
              <ChipPicker options={INTEREST_OPTIONS} selected={form.interests} onToggle={toggleIn('interests')} />
            </>
          ) : (
            <>
              <label>What can you speak to?</label>
              <ChipPicker options={EXPERTISE_OPTIONS} selected={form.expertise} onToggle={toggleIn('expertise')} />
            </>
          )}
        </div>

        {/* Following is one-way, so these two numbers are not the same thing as
            connections and are shown separately. */}
        <div className="field">
          <label>Follows</label>
          <div style={{ background: 'var(--color-surface-2)', borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 32 }}>
            <Link to="/app/explore" className="no-underline" style={{ color: 'inherit' }}>
              <span style={{ display: 'block', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{followingCount}</span>
              <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Following</span>
            </Link>
            <span>
              <span style={{ display: 'block', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{followerCount}</span>
              <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Followers</span>
            </span>
          </div>
        </div>

        {form.account_type === 'adult' && <VerificationCard profile={profile} email={email} />}

        {/* Subscription state is read-only here on purpose. It is written only
            by the Stripe webhook, so picking a paid plan from a dropdown can
            never grant access. */}
        <div className="field">
          <label>Sage subscription</label>
          <div
            style={{
              background: 'var(--color-surface-2)', borderRadius: 12, padding: '14px 16px',
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
                  <span style={{ fontSize: 12.5, color: 'var(--text-subtle)' }}>
                    {isCanceling ? 'Ends' : 'Renews'}{' '}
                    {new Date(subscription.current_period_end).toLocaleDateString()}
                  </span>
                )}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm self-start"
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
                <span style={{ fontSize: 12.5, color: 'var(--text-subtle)', lineHeight: 1.5 }}>
                  {isPastDue
                    ? 'Sage is paused until a payment goes through.'
                    : 'Everything on Pathways is free. Sage is the one optional add-on.'}
                </span>
                <Link to="/app/sage" className="btn btn-primary btn-sm self-start no-underline">
                  {isPastDue ? 'Fix payment' : 'Get Sage'}
                </Link>
              </>
            )}
            {billingError && (
              <span className="msg msg-error" role="alert">{billingError}</span>
            )}
          </div>
        </div>

        </div>
      </div>

        {/* The save action sits under the whole form it saves, not tucked at
            the bottom of the sidebar. Sign out stays reachable but quiet: it
            is also in the account menu in the header. */}
        <div
          className="card elev-md flex items-center gap-3 flex-wrap"
          style={{ flexDirection: 'row', padding: '14px 18px', position: 'sticky', bottom: 16, zIndex: 5 }}
        >
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {saved && <span className="msg msg-success" role="status">Saved.</span>}
          {error && <span className="msg msg-error" role="alert">{error}</span>}
          <button
            type="button"
            className="btn btn-quiet"
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