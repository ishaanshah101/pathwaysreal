import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useProfile } from '@/lib/useProfile';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const REPORT_REASONS = [
  ['inappropriate_contact', 'Asked for contact details or to meet up'],
  ['sexual_content', 'Sexual or romantic content'],
  ['harassment', 'Harassment or bullying'],
  ['impersonation', 'Pretending to be someone they are not'],
  ['spam', 'Spam or advertising'],
  ['safety_concern', 'Something else that felt unsafe'],
  ['other', 'Other'],
];

// Filing a report is deliberately one short form. A student who feels unsafe
// should not have to write an essay to be heard.
export default function ReportModal({ open, onOpenChange, reportedEmail, reportedName, contextType, contextId }) {
  const { email } = useProfile();
  const [reason, setReason] = useState('inappropriate_contact');
  const [details, setDetails] = useState('');
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setState('sending');
    setError('');
    try {
      const created = await base44.entities.Report.create({
        reporter_email: email,
        reported_email: reportedEmail,
        context_type: contextType || 'profile',
        context_id: contextId || reportedEmail,
        reason,
        details: details.slice(0, 2000),
        status: 'open',
        occurred_at: new Date().toISOString(),
      });
      // The safety inbox is emailed from here, as the signed-in reporter, so the
      // alert endpoint can verify who is asking for it. A failed email must
      // never make a student think their report did not go through.
      if (created?.id) {
        base44.functions.invoke('notifyReportFiled', { report_id: created.id }).catch(() => {});
      }
      setState('done');
    } catch {
      setState('idle');
      setError('That report did not go through. Please try again, or use the Safety page to reach us directly.');
    }
  };

  const close = () => {
    onOpenChange(false);
    setState('idle');
    setDetails('');
    setReason('inappropriate_contact');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(true) : close())}>
      <DialogContent style={{ background: 'var(--color-surface)', borderRadius: 24, maxWidth: 460 }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'var(--font-heading)', fontSize: 21 }}>
            {state === 'done' ? 'Report received' : `Report ${reportedName || reportedEmail}`}
          </DialogTitle>
        </DialogHeader>

        {state === 'done' ? (
          <div className="flex flex-col" style={{ gap: 14 }}>
            <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, color: 'var(--color-neutral-800)' }}>
              Thank you for telling us. A real person on the Pathways safety team reviews every
              report, usually within one day. You will not be told who reported what, and the
              person you reported is never shown your report.
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, color: 'var(--color-neutral-800)' }}>
              If you feel unsafe right now, you can also block them so they can never message you
              again. If someone is in danger, contact your local emergency number.
            </p>
            <button type="button" className="btn btn-primary self-start" onClick={close}>Done</button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col" style={{ gap: 14 }}>
            <div className="field">
              <label htmlFor="report-reason">What happened?</label>
              <select
                id="report-reason"
                className="input"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                {REPORT_REASONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>

            <div className="field">
              <label htmlFor="report-details">Anything you want to add? (optional)</label>
              <textarea
                id="report-details"
                className="input"
                style={{ minHeight: 100 }}
                maxLength={2000}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="You do not have to explain, but details help us act faster."
              />
            </div>

            <p style={{ fontSize: 12.5, lineHeight: 1.55, margin: 0, color: 'var(--color-neutral-700)' }}>
              A human on the safety team reads this. Reports are private, the person you report is
              never told who reported them.
            </p>

            {error && <span style={{ fontSize: 12.5, color: 'var(--color-accent-700)' }}>{error}</span>}

            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={state === 'sending'}>
                {state === 'sending' ? 'Sending…' : 'Send report'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={close}>Cancel</button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}