import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendGmail, escapeHtml } from '../../shared/gmail.ts';
import { consumeRateLimit } from '../../shared/rateLimit.ts';

const ALERT_TO = 'pathways.admins@gmail.com';
const QUEUE_URL = 'https://pathways.uno/app/admin/moderation';

const REASON_LABELS: Record<string, string> = {
  inappropriate_contact: 'Inappropriate contact',
  sexual_content: 'Sexual content',
  harassment: 'Harassment',
  spam: 'Spam',
  impersonation: 'Impersonation',
  safety_concern: 'Safety concern',
  other: 'Other',
};

// Emails the safety inbox the moment a Report row appears, so an urgent report
// is not sitting unseen in the moderation queue.
//
// The endpoint has a public URL, so the caller is identified before anything
// happens: only the member who actually filed the report, or an admin, can ask
// for its alert. On top of that the recipient is a fixed address that never
// comes from the request, the report must exist and be recent, and each report
// can only ever generate one alert per day.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const reportId = String(payload?.report_id || '').trim();
    if (!reportId) {
      return Response.json({ ok: false, reason: 'no_report_id' }, { status: 400 });
    }

    const caller = await base44.auth.me().catch(() => null);
    if (!caller?.email) {
      return Response.json({ ok: false, reason: 'unauthorized' }, { status: 401 });
    }

    const report = await base44.asServiceRole.entities.Report.get(reportId).catch(() => null);
    if (!report) {
      return Response.json({ ok: false, reason: 'report_not_found' }, { status: 404 });
    }

    const isReporter =
      String(report.reporter_email || '').toLowerCase() === caller.email.toLowerCase();
    if (!isReporter && caller.role !== 'admin') {
      return Response.json({ ok: false, reason: 'not_authorized' }, { status: 403 });
    }

    const createdAt = report.created_date ? new Date(report.created_date).getTime() : 0;
    if (!createdAt || Date.now() - createdAt > 15 * 60 * 1000) {
      return Response.json({ ok: false, reason: 'report_not_recent' }, { status: 403 });
    }

    const limit = await consumeRateLimit(base44, reportId, 'report_alert', { day: 1 });
    if (!limit.ok) {
      return Response.json({ ok: false, reason: 'already_alerted' }, { status: 429 });
    }

    const reason = REASON_LABELS[report.reason] || report.reason || 'Safety concern';
    const filedAt = report.created_date ? new Date(report.created_date).toUTCString() : 'just now';
    const subject = `Pathways safety report: ${reason}`;

    const lines = [
      `A new report was filed on Pathways.`,
      ``,
      `Reason: ${reason}`,
      `Reported member: ${report.reported_email || 'unknown'}`,
      `Filed by: ${report.reporter_email || 'unknown'}`,
      `Where: ${report.context_type || 'profile'}`,
      `Filed at: ${filedAt}`,
      ``,
      `What they wrote:`,
      report.details ? report.details : '(no extra detail given)',
      ``,
      `Review it in the moderation queue:`,
      QUEUE_URL,
    ];

    const html = [
      `<div style="font-family:Figtree,Arial,sans-serif;color:#201e1d;max-width:560px;margin:0 auto">`,
      `<h1 style="font-size:20px;color:#b2622d;margin:0 0 12px">New safety report: ${escapeHtml(reason)}</h1>`,
      `<table style="font-size:14.5px;line-height:1.6;border-collapse:collapse">`,
      `<tr><td style="padding-right:12px;color:#82796a">Reported member</td><td><b>${escapeHtml(report.reported_email || 'unknown')}</b></td></tr>`,
      `<tr><td style="padding-right:12px;color:#82796a">Filed by</td><td>${escapeHtml(report.reporter_email || 'unknown')}</td></tr>`,
      `<tr><td style="padding-right:12px;color:#82796a">Where</td><td>${escapeHtml(report.context_type || 'profile')}</td></tr>`,
      `<tr><td style="padding-right:12px;color:#82796a">Filed at</td><td>${escapeHtml(filedAt)}</td></tr>`,
      `</table>`,
      `<p style="font-size:14.5px;line-height:1.6;margin-top:16px"><b>What they wrote</b><br/>${escapeHtml(report.details || '(no extra detail given)')}</p>`,
      `<p style="font-size:14.5px;line-height:1.6"><a href="${QUEUE_URL}" style="color:#b2622d"><b>Open the moderation queue</b></a></p>`,
      `<p style="font-size:12.5px;color:#82796a;margin-top:22px">Sent automatically by Pathways because a member filed a report.</p>`,
      `</div>`,
    ].join('');

    const sent = await sendGmail(base44, {
      to: ALERT_TO,
      subject,
      plain: lines.join('\r\n'),
      html,
      fromName: 'Pathways Safety',
    });

    if (!sent.ok) {
      return Response.json({ ok: false, ...sent }, { status: 502 });
    }
    return Response.json({ ok: true, id: sent.id, report_id: reportId });
  } catch (error: any) {
    return Response.json({ ok: false, error: error?.message }, { status: 500 });
  }
}