import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { threadKey } from '@/lib/useProfile';
import PageNotFound from '@/lib/PageNotFound';
import { Spinner } from '@/components/RequireAuth';
import Seo from '@/components/Seo';

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

const STATUS_STYLE = {
  open: { bg: 'var(--color-accent-100)', fg: 'var(--color-accent-800)' },
  reviewing: { bg: 'var(--color-accent-2-200)', fg: 'var(--color-accent-2-800)' },
  actioned: { bg: '#d1f0d9', fg: '#1a5c2c' },
  dismissed: { bg: 'var(--color-neutral-200)', fg: 'var(--color-neutral-700)' },
};

function Pill({ children, tone }) {
  const s = STATUS_STYLE[tone] || STATUS_STYLE.dismissed;
  return (
    <span style={{
      background: s.bg, color: s.fg, borderRadius: 999, padding: '3px 10px',
      fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

function when(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleString(); } catch { return String(iso); }
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
      setError('Could not load the queue. This is an error, not an empty queue — refresh and try again.');
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

  return (
    <div style={{ paddingBottom: 40 }}>
      <Seo title="Moderation | Pathways" description="Admin moderation queue." path="/app/admin/moderation" noindex />

      <h1 style={{ fontSize: 'clamp(24px,3vw,32px)', margin: '0 0 4px' }}>Moderation</h1>
      <p style={{ color: 'var(--color-neutral-700)', fontSize: 14, marginBottom: 18 }}>
        {openReports.length} open report{openReports.length === 1 ? '' : 's'} · {highEvents.length} high-severity
        blocked message{highEvents.length === 1 ? '' : 's'}
      </p>

      {error && (
        <p style={{ color: 'var(--color-danger-700, #b42318)', fontSize: 14 }}>{error}</p>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {[
          ['reports', `Open (${openReports.length})`],
          ['blocked', `Blocked content (${highEvents.length})`],
          ['closed', `Closed (${closedReports.length})`],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`btn ${tab === key ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: 13 }}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
        <button type="button" className="btn btn-secondary" style={{ fontSize: 13, marginLeft: 'auto' }} onClick={load}>
          Refresh
        </button>
      </div>

      {tab === 'reports' && (
        openReports.length === 0 ? (
          <p style={{ color: 'var(--color-neutral-700)', fontSize: 14 }}>
            Nothing open. That is the good outcome.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {openReports.map((r) => (
              <div key={r.id} className="card elev-sm" style={{ padding: 18, gap: 10 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Pill tone={r.status}>{r.status}</Pill>
                  <b style={{ fontSize: 15 }}>{REASON_LABEL[r.reason] || r.reason}</b>
                  <span style={{ fontSize: 12.5, color: 'var(--color-neutral-600)' }}>
                    {r.context_type} · {when(r.created_date)}
                  </span>
                </div>

                <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                  <div><b>Reported:</b> {r.reported_email}</div>
                  <div><b>Reporter:</b> {r.reporter_email}</div>
                  {r.details && (
                    <div style={{ marginTop: 8, background: 'var(--color-bg)', borderRadius: 14, padding: 12 }}>
                      {r.details}
                    </div>
                  )}
                </div>

                {context[r.id] && context[r.id] !== 'none' && (
                  <div style={{ background: 'var(--color-bg)', borderRadius: 14, padding: 12, display: 'grid', gap: 8 }}>
                    {context[r.id].map((m) => (
                      <div key={m.id} style={{ fontSize: 13.5, lineHeight: 1.55 }}>
                        <b>{m.from_email === r.reported_email ? 'Reported user' : 'Reporter'}:</b> {m.body}
                      </div>
                    ))}
                  </div>
                )}
                {context[r.id] === 'none' && (
                  <p style={{ fontSize: 13, color: 'var(--color-neutral-600)', margin: 0 }}>
                    No messages found between these two.
                  </p>
                )}

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-secondary" style={{ fontSize: 13 }}
                    disabled={busyId === r.id} onClick={() => loadContext(r)}>
                    {context[r.id] ? 'Hide conversation' : 'View conversation'}
                  </button>
                  {r.status === 'open' && (
                    <button type="button" className="btn btn-secondary" style={{ fontSize: 13 }}
                      disabled={busyId === r.id} onClick={() => act(r, 'reviewing', 'Picked up')}>
                      Mark reviewing
                    </button>
                  )}
                  <button type="button" className="btn btn-secondary" style={{ fontSize: 13 }}
                    disabled={busyId === r.id} onClick={() => act(r, 'actioned', 'Warned user')}>
                    Warn
                  </button>
                  <button type="button" className="btn btn-primary" style={{ fontSize: 13 }}
                    disabled={busyId === r.id} onClick={() => suspend(r)}>
                    Suspend account
                  </button>
                  <button type="button" className="btn btn-secondary" style={{ fontSize: 13 }}
                    disabled={busyId === r.id} onClick={() => act(r, 'dismissed', 'Dismissed')}>
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'blocked' && (
        highEvents.length === 0 ? (
          <p style={{ color: 'var(--color-neutral-700)', fontSize: 14 }}>
            No high-severity blocks recorded.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {highEvents.map((e) => (
              <div key={e.id} className="card elev-sm" style={{ padding: 18, gap: 8 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Pill tone="open">{e.severity}</Pill>
                  <b style={{ fontSize: 15 }}>{e.rule}</b>
                  <span style={{ fontSize: 12.5, color: 'var(--color-neutral-600)' }}>
                    {e.surface} · {when(e.occurred_at || e.created_date)}
                  </span>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.6 }}>
                  <div><b>From:</b> {e.sender_email}</div>
                  {e.recipient_email && <div><b>To:</b> {e.recipient_email}</div>}
                  {e.detail && <div style={{ color: 'var(--color-neutral-700)' }}>{e.detail}</div>}
                  {e.excerpt && (
                    <div style={{ marginTop: 8, background: 'var(--color-bg)', borderRadius: 14, padding: 12, fontStyle: 'italic' }}>
                      {e.excerpt}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'closed' && (
        closedReports.length === 0 ? (
          <p style={{ color: 'var(--color-neutral-700)', fontSize: 14 }}>Nothing closed yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {closedReports.map((r) => (
              <div key={r.id} className="card elev-sm" style={{ padding: 14, gap: 6 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Pill tone={r.status}>{r.status}</Pill>
                  <b style={{ fontSize: 14 }}>{REASON_LABEL[r.reason] || r.reason}</b>
                  <span style={{ fontSize: 12.5, color: 'var(--color-neutral-600)' }}>{when(r.created_date)}</span>
                </div>
                <div style={{ fontSize: 13.5 }}>
                  {r.reported_email}
                  {r.admin_notes ? ` · ${r.admin_notes}` : ''}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
