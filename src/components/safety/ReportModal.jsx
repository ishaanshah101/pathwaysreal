import React, { useId, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

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
  const [reason, setReason] = useState('inappropriate_contact');
  const [details, setDetails] = useState('');
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');
  // Each open dialog gets its own radio group name.
  const group = useId();

  const submit = async (e) => {
    e.preventDefault();
    setState('sending');
    setError('');
    try {
      const { data: created } = await base44.functions.invoke('memberActions', {
        action: 'report', target: reportedEmail, reason, details: details.slice(0, 2000),
        context_type: contextType || 'profile', context_id: contextId,
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
      <DialogContent className="max-w-md">
        {state === 'done' ? (
          <div className="dlg">
            <div>
              <span className="kicker">Safety</span>
              <DialogTitle>Report received</DialogTitle>
            </div>
            <DialogDescription asChild>
              <p className="dlg-lede">
                Thank you for telling us. A real person on the Pathways safety team reviews every
                report, usually within one day. You will not be told who reported what, and the
                person you reported is never shown your report.
              </p>
            </DialogDescription>
            <p className="notice notice-warning">
              If you feel unsafe right now, you can also block them so they can never message you
              again. If someone is in danger, contact your local emergency number.
            </p>
            <div className="dlg-actions">
              <button type="button" className="btn btn-primary" onClick={close}>Done</button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="dlg">
            <div>
              <span className="kicker">Safety</span>
              <DialogTitle>Report {reportedName || reportedEmail}</DialogTitle>
            </div>

            <fieldset className="reason-set">
              <legend>What happened?</legend>
              <div className="reason-list">
                {REPORT_REASONS.map(([value, label]) => (
                  <label key={value} className="reason" data-on={String(reason === value)}>
                    <input
                      type="radio"
                      name={group}
                      value={value}
                      checked={reason === value}
                      onChange={() => setReason(value)}
                    />
                    <span className="reason-mark" aria-hidden="true" />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="field">
              <label htmlFor="report-details">Anything you want to add? (optional)</label>
              <textarea
                id="report-details"
                className="input"
                maxLength={2000}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="You do not have to explain, but details help us act faster."
              />
            </div>

            <DialogDescription asChild>
              <p className="dlg-small">
                A human on the safety team reads this. Reports are private. The person you report is
                never told who reported them.
              </p>
            </DialogDescription>

            {error && <span role="alert" className="msg msg-error">{error}</span>}

            <div className="dlg-actions">
              <button type="submit" className="btn btn-primary" disabled={state === 'sending'}>
                {state === 'sending' ? 'Sending…' : 'Send report'}
              </button>
              <button type="button" className="btn btn-quiet" onClick={close}>Cancel</button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
