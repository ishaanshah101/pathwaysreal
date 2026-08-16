import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { BadgeCheck, Clock } from 'lucide-react';

// Onboarding tells adults they can ask to have their role verified "from your
// profile once you are in", and until now there was nowhere to do it. A person
// reviews each request and sets Profile.verified, so this only ever creates the
// request; it never grants the badge.
export default function VerificationCard({ profile, email }) {
  const [request, setRequest] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    claimed_role: profile?.role && profile.role !== 'student' ? profile.role : 'college_student',
    institution: profile?.institution || '',
    institutional_email: '',
    evidence_url: '',
    note: '',
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await base44.entities.VerificationRequest.filter({ user_email: email }, '-created_date', 1);
        if (!cancelled) setRequest(Array.isArray(rows) && rows.length ? rows[0] : null);
      } catch {
        if (!cancelled) setRequest(null);
      }
    })();
    return () => { cancelled = true; };
  }, [email]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setError('');
    if (!form.institution.trim() || !form.evidence_url.trim()) {
      setError('Please give us your institution and a link a person can open.');
      return;
    }
    setSending(true);
    try {
      const row = await base44.entities.VerificationRequest.create({
        user_email: email,
        full_name: profile?.full_name || '',
        claimed_role: form.claimed_role,
        institution: form.institution,
        institutional_email: form.institutional_email,
        evidence_url: form.evidence_url,
        note: form.note,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      });
      setRequest(row);
      setOpen(false);
    } catch {
      setError('Could not send that request. Please try again in a moment.');
    }
    setSending(false);
  };

  return (
    <div className="field">
      <label>Verification</label>
      <div style={{ background: 'var(--color-bg)', borderRadius: 18, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {profile?.verified ? (
          <>
            <span className="badge badge-verified self-start">
              <BadgeCheck size={12} aria-hidden="true" /> Verified
            </span>
            <span style={{ fontSize: 12.5, color: 'var(--color-neutral-700)', lineHeight: 1.5 }}>
              Someone here has checked your role. Students see this on your profile.
            </span>
          </>
        ) : request?.status === 'pending' ? (
          <>
            <span className="badge badge-warning self-start">
              <Clock size={12} aria-hidden="true" /> Under review
            </span>
            <span style={{ fontSize: 12.5, color: 'var(--color-neutral-700)', lineHeight: 1.5 }}>
              We have your request. A person checks these by hand, so it can take a few days.
            </span>
          </>
        ) : open ? (
          <>
            <div className="field">
              <label htmlFor="vr-role">What are you asking us to verify?</label>
              <select id="vr-role" className="input" value={form.claimed_role} onChange={set('claimed_role')}>
                <option value="college_student">College student</option>
                <option value="educator">Educator / professor</option>
                <option value="counselor">Admissions counselor</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="vr-inst">Institution</label>
              <input id="vr-inst" className="input" value={form.institution} onChange={set('institution')} placeholder="UC Berkeley" />
            </div>
            <div className="field">
              <label htmlFor="vr-email">Work or school email</label>
              <input id="vr-email" className="input" value={form.institutional_email} onChange={set('institutional_email')} placeholder="you@berkeley.edu" />
            </div>
            <div className="field">
              <label htmlFor="vr-url">A link we can open</label>
              <input id="vr-url" className="input" value={form.evidence_url} onChange={set('evidence_url')} placeholder="Faculty page, staff directory, LinkedIn…" />
            </div>
            <div className="field">
              <label htmlFor="vr-note">Anything else?</label>
              <textarea id="vr-note" className="input" value={form.note} onChange={set('note')} />
            </div>
            {error && <span className="msg msg-error" role="alert">{error}</span>}
            <div className="flex gap-2">
              <button type="button" className="btn btn-primary" style={{ fontSize: 13 }} onClick={submit} disabled={sending}>
                {sending ? 'Sending…' : 'Send request'}
              </button>
              <button type="button" className="btn btn-secondary" style={{ fontSize: 13 }} onClick={() => setOpen(false)}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <span style={{ fontSize: 14 }}>
              <b>{request?.status === 'rejected' ? 'Not verified' : 'Unverified'}</b>
            </span>
            <span style={{ fontSize: 12.5, color: 'var(--color-neutral-700)', lineHeight: 1.5 }}>
              Your role shows as unverified until a person here has checked it. Verified members are
              easier for students to trust.
            </span>
            <button type="button" className="btn btn-secondary self-start" style={{ fontSize: 13 }} onClick={() => setOpen(true)}>
              Ask to be verified
            </button>
          </>
        )}
      </div>
    </div>
  );
}