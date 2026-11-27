import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { threadKey } from '@/lib/useProfile';
import PageNotFound from '@/lib/PageNotFound';
import { Spinner } from '@/components/RequireAuth';
import Seo from '@/components/Seo';
import PageHead from '@/components/kit/PageHead';
import Icon from '@/components/kit/Icon';

// The moderation queue. Reports and blocked-content events are written to
// admin-only tables; without this page they were being collected and never
// read by anyone.
//
// Non-admins get the 404 page rather than a permission error, so the route
// does not advertise its own existence.

const REASON_LABEL = {
  inappropriate_contact: 'Inappropriate contact',
  sexual_content: 'Sexual content',
  harassment: 'Harassment',
  spam: 'Spam',
  impersonation: 'Impersonation',
  safety_concern: 'Safety concern',
  other: 'Other',
};

// Status reads the way a sign does: yellow needs attention, blue is being
// handled, green is done, grey was set aside.
const STATUS_BADGE = {
  open: 'badge-warning',
  reviewing: 'badge-blue',
  actioned: 'badge-success',
  dismissed: 'badge-neutral',
};

function StatusBadge({ status }) {
  return <span className={`badge ${STATUS_BADGE[status] || 'badge-neutral'}`}>{status}</span>;
}

function when(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleString(); } catch { return String(iso); }
}

// The queue is a table on a wide screen and a list on a phone. The roles are
// spelled out so it is still announced as a table once the phone layout turns
// the cells into blocks.
function QueueTable({ label, columns, children }) {
  return (
    <div className="mod-scroll">
      <table className="table mod-table" role="table" aria-label={label}>
        <thead role="rowgroup">
          <tr role="row">
            {columns.map(([name, cls]) => (
              <th key={name} role="columnheader" scope="col" className={cls}>{name}</th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup">{children}</tbody>
      </table>
    </div>
  );
}

function QueueNote({ children }) {
  return <p className="notice" style={{ margin: 0 }}>{children}</p>;
}

export default function AdminModeration() {
  const { user, isLoadingAuth } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [reports, setReports] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState('reports');
  const [context, setContext] = useState({});

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      // No per-call .catch() here. Swallowing a failed Report.list() into an
      // empty array made the outer catch unreachable, so an outage rendered as
      // "0 open reports" under the heading "Nothing open. That is the good
      // outcome" while reports sat unread. A moderation queue must fail loudly.
      const [r, e] = await Promise.all([
        base44.entities.Report.list('-created_date', 200),
        base44.entities.ModerationEvent.list('-created_date', 200),
      ]);
      setReports(Array.isArray(r) ? r : []);
      setEvents(Array.isArray(e) ? e : []);
    } catch (err) {
      setReports([]);
      setEvents([]);
      setError('Could not load the queue. This is an error, not an empty queue. Refresh and try again.');
    }
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) load(); else setLoading(false); }, [isAdmin]);

  const openReports = useMemo(
    () => reports.filter((r) => r.status === 'open' || r.status === 'reviewing'),
    [reports],
  );
  const closedReports = useMemo(
    () => reports.filter((r) => r.status === 'actioned' || r.status === 'dismissed'),
    [reports],
  );
  const highEvents = useMemo(
    () => events.filter((e) => e.severity === 'high'),
    [events],
  );

  // Pull the surrounding conversation so a report can be judged in context
  // rather than from one line out of the middle of a thread.
  const loadContext = async (report) => {
    if (context[report.id]) {
      setContext((c) => ({ ...c, [report.id]: null }));
      return;
    }
    try {
      const rows = await base44.entities.Message.list('-created_date', 400);
      // Use the same threadKey() the messages themselves are written with.
      // Building the key by hand here skipped the lowercasing, so any report
      // involving an address with a capital letter matched nothing and this
      // screen told the moderator "No messages found between these two" for a
      // conversation that was sitting right there. Sorting differed too, since
      // uppercase sorts ahead of lowercase.
      const pair = threadKey(report.reporter_email, report.reported_email);
      const thread = (Array.isArray(rows) ? rows : [])
        .filter((m) => m.thread_key === pair)
        .slice(0, 30)
        .reverse();
      setContext((c) => ({ ...c, [report.id]: thread.length ? thread : 'none' }));
    } catch {
      setContext((c) => ({ ...c, [report.id]: 'none' }));
    }
  };

  const act = async (report, status, note) => {
    setBusyId(report.id);
    try {
      await base44.entities.Report.update(report.id, {
        status,
        admin_notes: note ? `${report.admin_notes ? report.admin_notes + ' | ' : ''}${note}` : report.admin_notes,
      });
      await load();
    } catch {
      setError('That action did not save. Try again.');
    }
    setBusyId('');
  };

  const suspend = async (report) => {
    if (!window.confirm(`Suspend ${report.reported_email}? They will not be able to message, post, or send connection requests.`)) return;
    setBusyId(report.id);
    try {
      const rows = await base44.entities.Profile.filter({ user_email: report.reported_email });
      const p = Array.isArray(rows) && rows.length ? rows[0] : null;
      // No profile means nobody was suspended. This used to fall through to
      // act(), which closed the report with the note "Suspended account" while
      // the account carried on untouched — the queue and the audit trail both
      // said the opposite of what had happened.
      if (!p) {
        setError(`${report.reported_email} has no profile yet, so there is nothing to suspend. The report has been left open.`);
        setBusyId('');
        return;
      }
      await base44.entities.Profile.update(p.id, { suspended: true });
      await act(report, 'actioned', 'Suspended account');
    } catch {
      setError('Could not suspend that account. It may not have a profile yet.');
      setBusyId('');
    }
  };

  if (isLoadingAuth || loading) return <Spinner />;
  if (!isAdmin) return <PageNotFound />;

  const queues = [
    ['reports', 'Open', openReports.length],
    ['blocked', 'Blocked content', highEvents.length],
    ['closed', 'Closed', closedReports.length],
  ];

  return (
    <div className="page">
      <Seo title="Moderation | Pathways" description="Admin moderation queue." path="/app/admin/moderation" noindex />

      <PageHead
        kicker="Admin"
        title="Moderation"
        sub={`${openReports.length} open report${openReports.length === 1 ? '' : 's'} and ${highEvents.length} high-severity blocked message${highEvents.length === 1 ? '' : 's'}.`}
      >
        <button type="button" className="btn btn-secondary btn-sm" onClick={load}>
          <Icon as={RefreshCw} size={15} /> Refresh
        </button>
      </PageHead>

      {error && (
        <p role="alert" className="notice notice-error" style={{ margin: '0 0 18px' }}>{error}</p>
      )}

      <div className="mod-bar">
        <div className="seg mod-seg" role="group" aria-label="Queue">
          {queues.map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              className="seg-opt"
              data-on={tab === key ? 'true' : 'false'}
              aria-pressed={tab === key}
              onClick={() => setTab(key)}
            >
              {label}
              <span className="num">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {tab === 'reports' && (
        openReports.length === 0 ? (
          // Only claim the queue is clear when we know it loaded. Otherwise
          // this reassuring line is exactly what a moderator should not see.
          <QueueNote>
            {error
              ? 'The queue could not be loaded, so we cannot say whether anything is open.'
              : 'Nothing open. That is the good outcome.'}
          </QueueNote>
        ) : (
          <QueueTable
            label="Open reports"
            columns={[['Status', 'mod-col-status'], ['Report'], ['Who'], ['Filed', 'mod-col-when']]}
          >
            {openReports.map((r) => (
              <React.Fragment key={r.id}>
                <tr role="row" className="mod-main">
                  <td role="cell" data-label="Status"><StatusBadge status={r.status} /></td>
                  <td role="cell" data-label="Report">
                    <span className="mod-reason">{REASON_LABEL[r.reason] || r.reason}</span>
                    {r.details && <p className="mod-details">{r.details}</p>}
                  </td>
                  <td role="cell" data-label="Who">
                    <dl className="mod-who">
                      <dt>Reported</dt>
                      <dd>{r.reported_email}</dd>
                      <dt>Reporter</dt>
                      <dd>{r.reporter_email}</dd>
                    </dl>
                  </td>
                  <td role="cell" data-label="Filed">
                    <span className="mod-when num">{when(r.created_date)}</span>
                    <span className="mod-when">{r.context_type}</span>
                  </td>
                </tr>
                <tr role="row" className="mod-acts">
                  <td role="cell" colSpan={4}>
                    <div className="mod-buttons">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        disabled={busyId === r.id}
                        aria-expanded={Boolean(context[r.id])}
                        onClick={() => loadContext(r)}
                      >
                        {context[r.id] ? 'Hide conversation' : 'View conversation'}
                      </button>
                      {r.status === 'open' && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          disabled={busyId === r.id}
                          onClick={() => act(r, 'reviewing', 'Picked up')}
                        >
                          Mark reviewing
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        disabled={busyId === r.id}
                        onClick={() => act(r, 'actioned', 'Warned user')}
                      >
                        Warn
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={busyId === r.id}
                        onClick={() => suspend(r)}
                      >
                        Suspend account
                      </button>
                      <button
                        type="button"
                        className="btn btn-quiet btn-sm"
                        disabled={busyId === r.id}
                        onClick={() => act(r, 'dismissed', 'Dismissed')}
                      >
                        Dismiss
                      </button>
                    </div>

                    {context[r.id] && context[r.id] !== 'none' && (
                      <ol className="mod-thread">
                        {context[r.id].map((m) => (
                          <li key={m.id} data-from={m.from_email === r.reported_email ? 'reported' : 'reporter'}>
                            <b>{m.from_email === r.reported_email ? 'Reported user' : 'Reporter'}</b>
                            <span>{m.body}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                    {context[r.id] === 'none' && (
                      <p className="mod-thread-none">No messages found between these two.</p>
                    )}
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </QueueTable>
        )
      )}

      {tab === 'blocked' && (
        highEvents.length === 0 ? (
          <QueueNote>No high-severity blocks recorded.</QueueNote>
        ) : (
          <QueueTable
            label="High-severity blocked content"
            columns={[['Severity', 'mod-col-status'], ['Rule'], ['Who'], ['When', 'mod-col-when']]}
          >
            {highEvents.map((e) => (
              <tr role="row" key={e.id}>
                <td role="cell" data-label="Severity"><span className="badge badge-red">{e.severity}</span></td>
                <td role="cell" data-label="Rule">
                  <span className="mod-reason">{e.rule}</span>
                  {e.detail && <p className="mod-detail">{e.detail}</p>}
                  {e.excerpt && <p className="mod-details">{e.excerpt}</p>}
                </td>
                <td role="cell" data-label="Who">
                  <dl className="mod-who">
                    <dt>From</dt>
                    <dd>{e.sender_email}</dd>
                    {e.recipient_email && (
                      <>
                        <dt>To</dt>
                        <dd>{e.recipient_email}</dd>
                      </>
                    )}
                  </dl>
                </td>
                <td role="cell" data-label="When">
                  <span className="mod-when num">{when(e.occurred_at || e.created_date)}</span>
                  <span className="mod-when">{e.surface}</span>
                </td>
              </tr>
            ))}
          </QueueTable>
        )
      )}

      {tab === 'closed' && (
        closedReports.length === 0 ? (
          <QueueNote>Nothing closed yet.</QueueNote>
        ) : (
          <QueueTable
            label="Closed reports"
            columns={[['Status', 'mod-col-status'], ['Report'], ['Reported'], ['Filed', 'mod-col-when']]}
          >
            {closedReports.map((r) => (
              <tr role="row" key={r.id}>
                <td role="cell" data-label="Status"><StatusBadge status={r.status} /></td>
                <td role="cell" data-label="Report">
                  <span className="mod-reason">{REASON_LABEL[r.reason] || r.reason}</span>
                  {r.admin_notes && <p className="mod-detail">{r.admin_notes}</p>}
                </td>
                <td role="cell" data-label="Reported">
                  <span className="mod-email">{r.reported_email}</span>
                </td>
                <td role="cell" data-label="Filed">
                  <span className="mod-when num">{when(r.created_date)}</span>
                </td>
              </tr>
            ))}
          </QueueTable>
        )
      )}
    </div>
  );
}
