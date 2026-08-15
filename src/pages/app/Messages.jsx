import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useProfile, threadKey } from '@/lib/useProfile';
import { useMessages, deliveryStateOf } from '@/lib/MessagesContext';
import DeliveryTicks from '@/components/app/DeliveryTicks';
import UnreadBadge from '@/components/app/UnreadBadge';
import { authorAvatar, initialsOf } from '@/lib/avatar';
import SafetyActions from '@/components/safety/SafetyActions';
import { useBlocks } from '@/lib/useBlocks';
import Seo from '@/components/Seo';

function clockTime(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch { return ''; }
}

function Bubble({ mine, children, meta }) {
  return (
    <div
      style={{
        alignSelf: mine ? 'flex-end' : 'flex-start',
        maxWidth: '80%',
        background: mine ? 'var(--color-accent)' : 'var(--color-bg)',
        color: mine ? 'var(--color-bg)' : 'var(--color-text)',
        padding: '9px 14px 6px',
        borderRadius: 20,
        fontSize: 14,
        lineHeight: 1.55,
        whiteSpace: 'pre-wrap',
      }}
    >
      {children}
      {meta && (
        <span
          className="flex items-center justify-end gap-[5px]"
          style={{ marginTop: 3, fontSize: 10.5, opacity: 0.85, lineHeight: 1 }}
        >
          {meta}
        </span>
      )}
    </div>
  );
}

export default function Messages() {
  const { profile, email } = useProfile();
  const { blockedEmails, reloadBlocks } = useBlocks();
  const {
    messages, receiptByMessage, loading,
    unreadByThread, markThreadRead, sendMessage, setActiveThread,
  } = useMessages();

  const [params, setParams] = useSearchParams();
  const activeWith = params.get('to');

  const [people, setPeople] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [archives, setArchives] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [archiveBusy, setArchiveBusy] = useState(false);
  const endRef = useRef(null);

  // There is no sample content any more, so nothing here is fake. Every thread
  // in this list is a real conversation with a real person.
  const activeSample = null;

  useEffect(() => {
    base44.entities.Profile.list('-created_date', 200)
      .then((r) => setPeople(Array.isArray(r) ? r : []))
      .catch(() => setPeople([]));
  }, []);

  const loadArchives = React.useCallback(() => {
    if (!email) return;
    base44.entities.ThreadArchive.filter({ user_email: email })
      .then((r) => setArchives(Array.isArray(r) ? r : []))
      .catch(() => setArchives([]));
  }, [email]);

  useEffect(() => { loadArchives(); }, [loadArchives]);

  const archivedEmails = useMemo(() => archives.map((a) => a.other_email), [archives]);
  const isArchived = Boolean(activeWith && archivedEmails.includes(activeWith));

  // Archiving is per-person and reversible. The other side is never told, and
  // nothing is deleted: an archived conversation reappears the moment it is
  // unarchived, with its whole history intact.
  const toggleArchive = async () => {
    if (!activeWith || !email || archiveBusy) return;
    setArchiveBusy(true);
    try {
      if (isArchived) {
        const row = archives.find((a) => a.other_email === activeWith);
        if (row) await base44.entities.ThreadArchive.delete(row.id);
      } else {
        await base44.entities.ThreadArchive.create({
          user_email: email,
          other_email: activeWith,
          archived_at: new Date().toISOString(),
        });
        setParams({});
      }
      loadArchives();
    } catch {
      /* A failed archive is not worth interrupting the conversation over. */
    }
    setArchiveBusy(false);
  };

  // Tell the provider which conversation is open so an arriving message in
  // this thread is marked read instead of bumping the badge.
  useEffect(() => {
    setActiveThread(activeWith);
    return () => setActiveThread(null);
  }, [activeWith, setActiveThread]);

  // Opening a conversation clears its unread count.
  useEffect(() => {
    if (activeWith) markThreadRead(activeWith);
  }, [activeWith, markThreadRead, messages.length]);

  const threads = useMemo(() => {
    const map = new Map();
    for (const m of messages) {
      const other = m.from_email === email ? m.to_email : m.from_email;
      if (!other) continue;
      const prev = map.get(other);
      if (!prev || new Date(m.created_date) > new Date(prev.created_date)) map.set(other, m);
    }

    const real = [...map.entries()].map(([other, last]) => ({
      other,
      preview: last.body,
      at: last.created_date,
      name: people.find((p) => p.user_email === other)?.full_name || last.from_name || other,
      unread: unreadByThread[other] || 0,
      is_sample: false,
    })).sort((a, b) => new Date(b.at) - new Date(a.at));

    if (activeWith && !real.some((r) => r.other === activeWith) && !sampleByEmail.has(activeWith)) {
      real.unshift({
        other: activeWith,
        preview: 'Start the conversation',
        name: people.find((p) => p.user_email === activeWith)?.full_name || activeWith,
        unread: 0,
        is_sample: false,
      });
    }

    // Conversations with anyone I have blocked drop out of the list.
    const visible = real.filter((r) => !blockedEmails.includes(r.other));

    // Archiving is one-sided, so this filter only ever applies to my own view.
    // The conversation the user currently has open always stays visible, so
    // archiving does not make the thread vanish from under them mid-read.
    return visible.filter((r) => (
      showArchived
        ? archivedEmails.includes(r.other)
        : !archivedEmails.includes(r.other) || r.other === activeWith
    ));
  }, [messages, people, email, activeWith, sampleByEmail, unreadByThread, blockedEmails, archivedEmails, showArchived]);

  const thread = useMemo(() => {
    if (!activeWith || activeSample) return [];
    const key = threadKey(email, activeWith);
    return messages
      .filter((m) => m.thread_key === key)
      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  }, [messages, activeWith, email, activeSample]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.length, activeWith]);

  const send = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !activeWith || activeSample) return;
    const body = draft.trim();
    setDraft('');
    setSending(true);
    setSendError('');
    // sendMessage now returns a reason instead of throwing, so a message held
    // back by the safety filters, by a block, or by a missing connection is
    // explained in place rather than surfacing as an error.
    const res = await sendMessage({
      toEmail: activeWith,
      threadKey: threadKey(email, activeWith),
      body,
      fromName: profile?.full_name || '',
    });
    if (res?.blocked) setSendError(res.notice);
    setSending(false);
  };

  const activeMeta = threads.find((t) => t.other === activeWith);

  return (
    <div className="flex flex-col" style={{ gap: 18 }}>
      <Seo title="Messages | Pathways" description="One-on-one mentoring conversations on Pathways with students, professors, and counselors." path="/app/messages" noindex />
      <div>
        <h1 style={{ fontSize: 'clamp(26px,3.2vw,36px)', margin: '0 0 6px' }}>Messages</h1>
        <p style={{ color: 'var(--color-neutral-800)', margin: 0 }}>
          One-on-one only, never group chats. Messages arrive instantly, no refresh needed.
        </p>
      </div>

      <div
        className="grid app-split"
        style={{ gridTemplateColumns: 'minmax(0,4fr) minmax(0,8fr)', gap: 16, alignItems: 'start' }}
      >
        <div className="card elev-sm" style={{ padding: 12, gap: 4, borderRadius: 24, maxHeight: 560, overflowY: 'auto' }}>
          {loading ? (
            <span style={{ fontSize: 13, color: 'var(--color-neutral-600)', padding: 10 }}>Loading…</span>
          ) : (
            threads.map((t) => {
              const on = t.other === activeWith;
              const [bg, fg] = authorAvatar(t.other);
              return (
                <button
                  key={t.other}
                  type="button"
                  onClick={() => setParams({ to: t.other })}
                  className="flex items-start gap-[10px] text-left"
                  style={{
                    padding: '10px 12px', borderRadius: 18, cursor: 'pointer', border: 0, font: 'inherit',
                    background: on ? 'var(--color-accent-200)' : 'transparent',
                  }}
                >
                  <span
                    className="flex items-center justify-center"
                    style={{
                      width: 34, height: 34, borderRadius: 999, flex: 'none',
                      background: bg, color: fg, fontFamily: 'var(--font-heading)', fontSize: 13,
                    }}
                  >
                    {initialsOf(t.name)}
                  </span>
                  <span className="flex flex-col" style={{ minWidth: 0, gap: 1, flex: 1 }}>
                    <span className="flex items-center gap-2">
                      <span style={{ fontSize: 14, fontWeight: t.unread ? 700 : 600 }}>{t.name}</span>
                      {t.unread > 0 && (
                        <span style={{ marginLeft: 'auto' }}>
                          <UnreadBadge count={t.unread} standalone />
                        </span>
                      )}
                    </span>
                    {t.subtitle && (
                      <span style={{ fontSize: 11.5, color: 'var(--color-accent-700)' }}>{t.subtitle}</span>
                    )}
                    <span
                      style={{
                        fontSize: 12,
                        color: t.unread ? 'var(--color-text)' : 'var(--color-neutral-600)',
                        fontWeight: t.unread ? 600 : 400,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%',
                      }}
                    >
                      {t.preview}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="card elev-sm" style={{ padding: 18, gap: 12, borderRadius: 24, minHeight: 440 }}>
          {!activeWith ? (
            <div className="flex items-center justify-center text-center" style={{ flex: 1, color: 'var(--color-neutral-600)', fontSize: 14, padding: 20, lineHeight: 1.6 }}>
              Pick a conversation on the left. The sample threads show real mentoring exchanges,
              from essay edits to financial aid appeals.
            </div>
          ) : (
            <>
              <div
                className="flex items-start gap-3 flex-wrap"
                style={{ borderBottom: '1px solid var(--color-divider)', paddingBottom: 10 }}
              >
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{activeMeta?.name || activeWith}</span>
                  {activeSample?.headline && (
                    <div style={{ fontSize: 12, color: 'var(--color-neutral-600)' }}>{activeSample.headline}</div>
                  )}
                </div>
                {!activeSample && (
                  <span className="flex gap-4 items-center" style={{ marginLeft: 'auto' }}>
                    <SafetyActions
                      targetEmail={activeWith}
                      targetName={activeMeta?.name}
                      contextType="message"
                      contextId={thread[thread.length - 1]?.id || activeWith}
                      onBlocked={() => { reloadBlocks(); setParams({}); }}
                    />
                  </span>
                )}
              </div>

              <div className="flex flex-col" style={{ gap: 9, flex: 1, overflowY: 'auto', maxHeight: 420, paddingRight: 4 }}>
                {activeSample ? (
                  activeSample.messages.map((m, i) => (
                    <Bubble
                      key={i}
                      mine={m.me}
                      meta={m.me ? <DeliveryTicks state="read" /> : null}
                    >
                      {m.body}
                    </Bubble>
                  ))
                ) : thread.length === 0 ? (
                  <span style={{ fontSize: 13.5, color: 'var(--color-neutral-600)' }}>
                    No messages yet. Be direct about what you need help with, people respond to that.
                  </span>
                ) : (
                  thread.map((m) => {
                    const mine = m.from_email === email;
                    const state = deliveryStateOf(m, receiptByMessage.get(m.id));
                    return (
                      <Bubble
                        key={m.id}
                        mine={mine}
                        meta={
                          <>
                            <span>{clockTime(m.created_date)}</span>
                            {mine && <DeliveryTicks state={state} />}
                          </>
                        }
                      >
                        {m.body}
                      </Bubble>
                    );
                  })
                )}
                <div ref={endRef} />
              </div>

              {sendError && (
                <span style={{ fontSize: 12.5, color: 'var(--color-accent-700)' }}>{sendError}</span>
              )}

              {activeSample ? (
                <div
                  style={{
                    background: 'var(--color-bg)', borderRadius: 18, padding: '12px 16px',
                    fontSize: 12.5, color: 'var(--color-neutral-700)', lineHeight: 1.5,
                  }}
                >
                  This is a sample conversation showing how mentoring works on Pathways. Find a real
                  member on Explore to start your own.
                </div>
              ) : (
                <form onSubmit={send} className="flex gap-2 items-end">
                  <textarea
                    className="input"
                    style={{ minHeight: 44, flex: 1 }}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Write a message…"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(e); }
                    }}
                  />
                  <button type="submit" className="btn btn-primary" disabled={sending || !draft.trim()}>
                    Send
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}