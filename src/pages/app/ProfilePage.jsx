import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useProfile, ROLE_LABELS } from '@/lib/useProfile';
import { useSubscription, openBillingPortal, SAGE_PRICES } from '@/lib/useSubscription';
import { isNativeApp } from '@/lib/platform';
import Seo from '@/components/Seo';
import { SkeletonLine, SkeletonTitle } from '@/components/ui/Skeletons';
import ChipPicker from '@/components/app/ChipPicker';
import FieldSelect from '@/components/ui/FieldSelect';
import VerificationCard from '@/components/app/VerificationCard';
import VerifiedBadge from '@/components/app/VerifiedBadge';
import DeleteAccountCard from '@/components/app/DeleteAccountCard';
import NotificationSettingsCard from '@/components/app/NotificationSettingsCard';
import PageHead from '@/components/kit/PageHead';
import Plate from '@/components/kit/Plate';
import Sign from '@/components/kit/Sign';
import Icon from '@/components/kit/Icon';
import { useFollows } from '@/lib/useFollows';
import { useConnections } from '@/lib/useConnections';
import { useBlocks } from '@/lib/useBlocks';
import { useSavedPosts } from '@/lib/useSavedPosts';
import { useReactions } from '@/lib/useReactions';
import PostArticle from '@/components/app/PostArticle';
import { INTEREST_OPTIONS, EXPERTISE_OPTIONS, ADULT_ROLES } from '@/components/app/profileFields';

// The label beside a member's name says which side of the conversation they
// are on. Students are highlighted in lime. The adults who answer them are
// highlighted in blue.
const ROLE_SIGN = {
  student: 'lime',
  college_student: 'lime',
  educator: 'blue',
  counselor: 'blue',
};

// The people this member has blocked, with a way to undo it. Undoing a block
// asks first, because it lets that person reach them again.
function BlockedPanel() {
  const { blocks, unblock } = useBlocks();
  const [asking, setAsking] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (blocks.length === 0) return null;

  const confirm = async (blockedEmail) => {
    setBusy(true);
    setError('');
    try {
      await unblock(blockedEmail);
      setAsking('');
    } catch {
      setError('Could not unblock them just now. Please try again.');
    }
    setBusy(false);
  };

  return (
    <section className="panel profile-panel" aria-labelledby="blocked-head">
      <div className="panel-head" id="blocked-head">Blocked people</div>
      <div className="panel-body">
        <p>They cannot message you, and they do not show up in your feed or in Explore. They are not told.</p>
        <ul className="profile-blocked">
          {blocks.map((b) => {
            const name = b.blocked_name || b.blocked_email;
            return (
              <li key={b.id}>
                {asking === b.blocked_email ? (
                  <>
                    <span>
                      Unblock <b>{name}</b>? They will show up in your feed and in Explore again, and
                      will be able to message you if you are connected.
                    </span>
                    <span className="profile-panel-acts">
                      <button type="button" className="btn btn-secondary btn-sm" disabled={busy} onClick={() => confirm(b.blocked_email)}>
                        {busy ? 'Unblocking…' : 'Yes, unblock'}
                      </button>
                      <button type="button" className="btn btn-quiet btn-sm" disabled={busy} onClick={() => { setAsking(''); setError(''); }}>
                        Keep blocked
                      </button>
                    </span>
                  </>
                ) : (
                  <>
                    <b>{name}</b>
                    <button type="button" className="quiet-link" onClick={() => { setAsking(b.blocked_email); setError(''); }}>
                      Unblock
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
        {error && <span className="msg msg-error" role="alert">{error}</span>}
      </div>
    </section>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { profile, email, saveProfile } = useProfile();
  const { subscription, hasSage, isPastDue, isCanceling, source } = useSubscription();
  const native = isNativeApp();
  const { followingCount, followerCount } = useFollows();
  const { isSaved, toggleSave, busyPostId } = useSavedPosts();
  const { countFor: helpfulFor } = useReactions();

  // The page is three tabs, the way a profile is on any social app: what
  // people see, what you have posted, and the account behind it. The tab is in
  // the address so a link can open the right one.
  const [params, setParams] = useSearchParams();
  const tab = ['posts', 'account'].includes(params.get('tab')) ? params.get('tab') : 'profile';
  const openTab = (next) => {
    const q = new URLSearchParams(params);
    if (next === 'profile') q.delete('tab'); else q.set('tab', next);
    setParams(q, { replace: true });
  };

  const [myPosts, setMyPosts] = useState(null);
  useEffect(() => {
    let cancelled = false;
    if (!email) return undefined;
    base44.entities.Post.filter({ author_email: email }, '-created_date', 50)
      .then((rows) => { if (!cancelled) setMyPosts(Array.isArray(rows) ? rows : []); })
      .catch(() => { if (!cancelled) setMyPosts([]); });
    return () => { cancelled = true; };
  }, [email]);
  const postCount = myPosts ? myPosts.length : 0;
  const { respondToConnection } = useConnections();
  const [billingError, setBillingError] = useState('');

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  // Display only: whether anything has been edited since the page loaded or
  // was last saved. It decides when the save bar follows you down the form.
  const [dirty, setDirty] = useState(false);
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

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setSaved(false); setDirty(true); };

  const toggleIn = (key) => (label) => {
    setSaved(false);
    setDirty(true);
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
      setDirty(false);
    } catch (err) {
      setError(err?.message || 'Could not save. Please try again.');
    }
    setSaving(false);
  };

  if (!form) {
    return (
      <div className="page" aria-busy="true">
        <span className="sr-only">Loading your profile</span>
        <div className="profile-top">
          <span className="kicker">Your profile</span>
          <span className="skeleton" style={{ width: 88, height: 88, borderRadius: '22%' }} />
          <div style={{ display: 'grid', gap: 12 }}>
            <SkeletonTitle width="40%" />
            <SkeletonLine width="60%" />
          </div>
        </div>
        <div style={{ display: 'grid', gap: 14, maxWidth: 620 }}>
          <SkeletonLine width="70%" />
          <SkeletonLine width="90%" />
          <SkeletonLine width="60%" />
        </div>
      </div>
    );
  }

  const isStudentForm = form.account_type === 'student';
  const roleLabel = ROLE_LABELS[profile?.role];
  // What other members read under the name. If nothing more specific has been
  // written, the role sign already says it, so the line is left out.
  const tagline = profile?.headline
    || [profile?.grade, profile?.school].filter(Boolean).join(' · ')
    || [profile?.job_title, profile?.institution].filter(Boolean).join(', ');

  return (
    <div className="page">
      <Seo title="Your Profile | Pathways" description="Edit your Pathways profile, topics, and Sage subscription." path="/app/profile" noindex />

      {/* The top of the page is the member as other people meet them: plate,
          name, the one line under it, and the signs that say who they are. */}
      <div className="profile-top">
        {/* A cover strip with the picture overlapping it, the way a profile
            opens on any social app. Decoration only. */}
        <div className="profile-cover" aria-hidden="true" />
        <span className="kicker">Your profile</span>
        <Plate name={profile?.full_name} seed={email} size={88} />
        <PageHead
          title={profile?.full_name || 'No name yet'}
          sub={(
            <>
              {tagline}
              <span className="profile-id">
                {roleLabel && <Sign color={ROLE_SIGN[profile?.role] || 'ink'}>{roleLabel}</Sign>}
                <VerifiedBadge verified={profile?.verified} />
              </span>
              {/* Following is one-way, so these numbers are not the same thing
                  as connections. */}
              <span className="stats">
                <button type="button" className="stat" onClick={() => openTab('posts')}>
                  <b className="num">{postCount}</b> {postCount === 1 ? 'post' : 'posts'}
                </button>
                <span className="stat"><b className="num">{followerCount}</b> {followerCount === 1 ? 'follower' : 'followers'}</span>
                <Link to="/app/explore" className="stat"><b className="num">{followingCount}</b> following</Link>
              </span>
            </>
          )}
        >
          {/* Sign out stays reachable but quiet: it is also in the account
              menu in the header. */}
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => logout(true)}>
            <Icon as={LogOut} size={15} /> Sign out
          </button>
        </PageHead>
      </div>

      {requests.length > 0 && (
        <section className="panel profile-requests" aria-labelledby="pr-head">
          <div className="panel-head" id="pr-head">
            Connection requests
            <span className="num">({requests.length})</span>
          </div>
          <div className="panel-body">
            {requests.map((c) => (
              <div key={c.id} className="profile-request">
                <span>
                  <b>{c.from_name || c.from_email}</b> wants to connect.
                </span>
                <div className="profile-request-acts">
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
        </section>
      )}

      <div className="tabs" role="tablist" aria-label="Sections of your profile">
        {[['profile', 'Profile'], ['posts', 'Posts', postCount], ['account', 'Account']].map(([v, l, n]) => (
          <button
            key={v} type="button" role="tab" id={`pf-tab-${v}`} className="tab"
            aria-selected={tab === v} aria-controls={`pf-panel-${v}`} onClick={() => openTab(v)}
          >
            {l}
            {typeof n === 'number' && <span className="num" aria-hidden="true">{n}</span>}
          </button>
        ))}
      </div>

      <div className="profile-layout">
        <form onSubmit={submit} className="profile-form" id="pf-panel-profile" role="tabpanel" aria-labelledby="pf-tab-profile" hidden={tab !== 'profile'}>
          <section className="profile-section" aria-labelledby="pf-sec-about">
            <h2 className="sub-head" id="pf-sec-about">About you</h2>
            <p className="profile-section-note">This is what other members see when they find you.</p>

            <div className="field">
              <label htmlFor="pf-name">Full name</label>
              <input id="pf-name" className="input" required value={form.full_name} onChange={set('full_name')} />
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
          </section>

          {isStudentForm ? (
            <section className="profile-section" aria-labelledby="pf-sec-school">
              <h2 className="sub-head" id="pf-sec-school">School</h2>
              <div className="profile-pair">
                <div className="field">
                  <label htmlFor="pf-grade">Grade or year</label>
                  <input id="pf-grade" className="input" placeholder="11th grade" value={form.grade} onChange={set('grade')} />
                </div>
                <div className="field">
                  <label htmlFor="pf-school">School</label>
                  <input id="pf-school" className="input" placeholder="Lincoln High" value={form.school} onChange={set('school')} />
                </div>
              </div>
            </section>
          ) : (
            <section className="profile-section" aria-labelledby="pf-sec-work">
              <h2 className="sub-head" id="pf-sec-work">Where you are</h2>
              <div className="field">
                <label htmlFor="pf-role">Which best describes you?</label>
                <FieldSelect
                  id="pf-role"
                  value={form.role}
                  onValueChange={(role) => { setForm((f) => ({ ...f, role })); setSaved(false); setDirty(true); }}
                  options={ADULT_ROLES}
                />
              </div>

              <div className="field">
                <label htmlFor="pf-institution">Where are you now?</label>
                <input
                  id="pf-institution"
                  className="input"
                  placeholder="UC Berkeley, Lincoln High, Acme Admissions"
                  value={form.institution}
                  onChange={set('institution')}
                />
              </div>

              <div className="profile-pair">
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
            </section>
          )}

          <section className="profile-section" aria-labelledby="pf-sec-topics">
            <h2 className="sub-head" id="pf-sec-topics">Topics</h2>
            {isStudentForm ? (
              <>
                <div className="field">
                  <label id="pf-topics-label">What do you want help with?</label>
                  <ChipPicker options={INTEREST_OPTIONS} selected={form.interests} onToggle={toggleIn('interests')} labelledBy="pf-topics-label" />
                </div>
                <div className="field">
                  <label htmlFor="pf-goals">Anything specific on your mind?</label>
                  <textarea
                    id="pf-goals"
                    className="input"
                    value={form.goals}
                    onChange={set('goals')}
                    placeholder="Picking a major, essays, scholarships"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="field">
                  <label id="pf-topics-label">What can you speak to?</label>
                  <ChipPicker options={EXPERTISE_OPTIONS} selected={form.expertise} onToggle={toggleIn('expertise')} labelledBy="pf-topics-label" />
                </div>
                <div className="field">
                  <label htmlFor="pf-help">What are you happy for students to ask you about?</label>
                  <textarea
                    id="pf-help"
                    className="input"
                    value={form.help_with}
                    onChange={set('help_with')}
                    placeholder="What my major is actually like day to day, how research placements work"
                  />
                </div>
              </>
            )}
          </section>

          <section className="profile-section" aria-labelledby="pf-sec-account">
            <h2 className="sub-head" id="pf-sec-account">Account</h2>
            <p className="profile-section-note">Signed in as {user?.email}.</p>

            <div className="profile-pair">
              {/* Account type is fixed after sign-up on purpose. If an adult could
                  relabel themselves as a student, the rule that students always send
                  the first message would be trivial to get around. */}
              <div className="field">
                <label htmlFor="pf-account-type">Account type</label>
                <input
                  id="pf-account-type"
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

              {/* Once a birth year is on file it is fixed, but it was previously not
                  shown at all, so people could not tell we had it. */}
              {profile?.birth_year ? (
                <div className="field">
                  <label htmlFor="pf-birth-year">Year you were born</label>
                  <input id="pf-birth-year" className="input" value={profile.birth_year} readOnly aria-disabled="true" />
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
            </div>
          </section>

          {/* The save action sits under the whole form it saves. Once a field
              has been changed it stays in reach while the form scrolls. */}
          <div className="profile-save" data-dirty={dirty ? 'true' : undefined}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            {dirty && !saving && !error && <span className="meta">Not saved yet</span>}
            {saved && (
              <span className="msg msg-success" role="status">
                <Icon as={Check} size={15} weight={3} /> Saved.
              </span>
            )}
            {error && <span className="msg msg-error" role="alert">{error}</span>}
          </div>
        </form>

        <section className="profile-posts" id="pf-panel-posts" role="tabpanel" aria-labelledby="pf-tab-posts" hidden={tab !== 'posts'}>
          {myPosts === null ? (
            <div role="status" aria-label="Loading your posts" style={{ display: 'grid', gap: 12 }}>
              <SkeletonTitle />
              <SkeletonLine />
              <SkeletonLine />
            </div>
          ) : myPosts.length === 0 ? (
            <div className="empty">
              <p className="empty-title">You have not posted yet.</p>
              <p className="empty-body">
                One thing you worked out the hard way is enough. Someone a year behind you is looking for it.
              </p>
              <Link to="/app?compose=1" className="btn btn-primary" style={{ marginTop: 6 }}>Write a post</Link>
            </div>
          ) : (
            <div className="feed-stream">
              {myPosts.map((p, i) => (
                <React.Fragment key={p.id}>
                  {i > 0 && <hr className="lane lane-soft" />}
                  <PostArticle
                    post={p}
                    isMine
                    saved={isSaved(p.id)}
                    saveBusy={busyPostId === p.id}
                    onToggleSave={toggleSave}
                    verified={profile?.verified === true}
                    helpfulCount={helpfulFor(p)}
                  />
                </React.Fragment>
              ))}
            </div>
          )}
        </section>

        <aside className="profile-aside" id="pf-panel-account" role="tabpanel" aria-labelledby="pf-tab-account" aria-label="Account settings" hidden={tab !== 'account'}>
          {form.account_type === 'adult' && <VerificationCard profile={profile} email={email} />}

          {/* Subscription state is read-only here on purpose. It is written only
              by the Stripe webhook, so picking a paid plan from a dropdown can
              never grant access. */}
          <section className="panel profile-panel" aria-labelledby="sage-head">
            <div className="panel-head" id="sage-head">Sage subscription</div>
            <div className="panel-body">
              {hasSage ? (
                <>
                  <span className="panel-lead">
                    Active
                    {!native && subscription?.plan && (
                      <span className="meta num">
                        {SAGE_PRICES[subscription.plan]?.amount} {SAGE_PRICES[subscription.plan]?.cadence}
                      </span>
                    )}
                  </span>
                  {subscription?.current_period_end && (
                    <p className="num">
                      {isCanceling ? 'Ends' : 'Renews'}{' '}
                      {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                  )}
                  {/* Inside a native wrapper we must not open an external
                      billing page, and an Apple-sourced subscription is managed
                      in the device's own settings, not by us. */}
                  {native ? null : source === 'apple' ? (
                    <p>Manage or cancel this subscription in your device settings.</p>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={async () => {
                        setBillingError('');
                        try { await openBillingPortal(); } catch (err) { setBillingError(err.message); }
                      }}
                    >
                      Manage or cancel
                    </button>
                  )}
                </>
              ) : (
                <>
                  <span className="panel-lead">{isPastDue ? 'Payment failed' : 'Free plan'}</span>
                  <p>
                    {isPastDue
                      ? 'Sage is paused until a payment goes through.'
                      : 'Everything on Pathways is free. Sage is the one optional add-on.'}
                  </p>
                  {!native && (
                    <Link to="/app/sage" className={isPastDue ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}>
                      {isPastDue ? 'Fix payment' : 'Get Sage'}
                    </Link>
                  )}
                </>
              )}
              {billingError && (
                <span className="msg msg-error" role="alert">{billingError}</span>
              )}
            </div>
          </section>

          <NotificationSettingsCard />

          <BlockedPanel />

          <DeleteAccountCard />
        </aside>
      </div>
    </div>
  );
}
