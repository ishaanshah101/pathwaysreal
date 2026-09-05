import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useProfile, threadKey } from '@/lib/useProfile';
import { useMessages, deliveryStateOf } from '@/lib/MessagesContext';
import DeliveryTicks from '@/components/app/DeliveryTicks';
import UnreadBadge from '@/components/app/UnreadBadge';
import { authorAvatar, initialsOf } from '@/lib/avatar';
import SafetyActions from '@/components/safety/SafetyActions';
import ContactDetailsPanel from '@/components/app/ContactDetailsPanel';
import { useBlocks } from '@/lib/useBlocks';
import { useConnections } from '@/lib/useConnections';
import { useContactNotes } from '@/lib/useContactNotes';
import { usePeopleByEmail } from '@/lib/usePeople';
import Seo from '@/components/Seo';
import { SkeletonRows } from '@/components/ui/Skeletons';
import { ArrowLeft, MessageCircle, Search, Send } from 'lucide-react';

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
        maxWidth: '78%',
        background: mine ? 'var(--color-ink)' : 'var(--color-surface-2)',
        color: mine ? 'var(--color-bg)' : 'var(--color-text)',
        padding: '9px 14px 6px',
        borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        fontSize: 14.5,
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
  const { connections } = useConnections();
  const {
    messages, receiptByMessage, loading,
    unreadByThread, markThreadRead, sendMessage, setActiveThread,
  } = useMessages();

  const [params, setParams] = useSearchParams();
  const activeWith = params.get('to');


  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [archives, setArchives] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [archiveBusy, setArchiveBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [editingContact, setEditingContact] = useState(false);
  const endRef = useRef(null);

  const { noteFor, displayNameFor, saveNote, clearNote } = useContactNotes();

  // There is no sample content any more, so nothing here is fake. Every thread
  // in this list is a real conversation with a real person.
  const activeSample = null;

  // Names come from get-profile, resolved for exactly the people in these
  // threads. Profile.list() from the browser returned only your own row unless
  // you were an admin, so every conversation was headed by a raw email address
  // for normal members.
  const threadEmails = React.useMemo(
    () => [...new Set(
      messages.flatMap((m) => [m.from_email, m.to_email]).filter(Boolean),
    )],
    [messages],
  );
  const { people } = usePeopleByEmail(threadEmails);

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

    const real = [...map.entries()].map(([other, last]) => {
      const realName = people.find((p) => p.user_email === other)?.full_name || last.from_name || other;
      return {
        other,
        preview: last.body,
        at: last.created_date,
        realName,
        // A nickname I set replaces their name everywhere in my own view.
        name: displayNameFor(other, realName),
        unread: unreadByThread[other] || 0,
        is_sample: false,
      };
    });

    // Every accepted connection gets a conversation here, even before a single
    // message exists, so connecting with someone immediately opens up a chat.
    const me = String(email || '').toLowerCase();
    for (const c of connections) {
      if (c.status !== 'accepted') continue;
      const iSent = String(c.from_email || '').toLowerCase() === me;
      const other = iSent ? c.to_email : c.from_email;
      if (!other || String(other).toLowerCase() === me) continue;
      if (real.some((r) => String(r.other).toLowerCase() === String(other).toLowerCase())) continue;
      const realName = people.find((p) => p.user_email === other)?.full_name
        || (iSent ? c.to_name : c.from_name) || other;
      real.push({
        other,
        preview: 'Start the conversation',
        at: c.updated_date || c.created_date,
        realName,
        name: displayNameFor(other, realName),
        unread: 0,
        is_sample: false,
      });
    }

    real.sort((a, b) => new Date(b.at) - new Date(a.at));

    if (activeWith && !real.some((r) => r.other === activeWith)) {
      const realName = people.find((p) => p.user_email === activeWith)?.full_name || activeWith;
      real.unshift({
        other: activeWith,
        preview: 'Start the conversation',
        realName,
        name: displayNameFor(activeWith, realName),
        unread: 0,
        is_sample: false,
      });
    }

    // Conversations with anyone I have blocked drop out of the list.
    const visible = real.filter((r) => !blockedEmails.includes(r.other));

    // Archiving is one-sided, so this filter only ever applies to my own view.
    // The conversation the user currently has open always stays visible, so
    // archiving does not make the thread vanish from under them mid-read.
    const inTab = visible.filter((r) => (
      showArchived
        ? archivedEmails.includes(r.other)
        : !archivedEmails.includes(r.other) || r.other === activeWith
    ));

    // Search covers who the conversation is with and what was actually said in
    // it, so "scholarship" finds the thread where that came up rather than only
    // matching names. Notes and nicknames are searched too, since the whole
    // point of writing a note is being able to find that person again.
    const q = search.trim().toLowerCase();
    if (!q) return inTab;

    return inTab.filter((r) => {
      const note = noteFor(r.other);
      const haystack = [
        r.name, r.realName, r.other, r.preview,
        note?.nickname, note?.notes,
      ].filter(Boolean).join(' ').toLowerCase();
      if (haystack.includes(q)) return true;
      // Fall back to the full history of that conversation.
      const key = threadKey(email, r.other);
      return messages.some(
        (m) => m.thread_key === key && String(m.body || '').toLowerCase().includes(q),
      );
    });
  }, [messages, people, email, activeWith, unreadByThread, blockedEmails, archivedEmails, showArchived, search, displayNameFor, noteFor, connections]);

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
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 15 }}>
          One-on-one only, never group chats. Messages arrive instantly, no refresh needed.
        </p>
      </div>

      <div
        className="grid app-split msg-split"
        data-active={String(Boolean(activeWith))}
        style={{ gridTemplateColumns: 'minmax(0,4fr) minmax(0,8fr)', gap: 16, alignItems: 'stretch' }}
      >
        <div className="card elev-sm msg-list" style={{ padding: 12, gap: 4, maxHeight: 640, overflowY: 'auto', alignSelf: 'stretch' }}>
          <div className="seg" style={{ alignSelf: 'flex-start', marginBottom: 6 }} role="tablist" aria-label="Inbox or archived">
            {[[false, 'Inbox'], [true, `Archived${archivedEmails.length ? ` (${archivedEmails.length})` : ''}`]].map(([val, label]) => (
              <button
                key={label}
                type="button"
                role="tab"
                aria-selected={showArchived === val}
                className="seg-opt"
                data-on={String(showArchived === val)}
                onClick={() => setShowArchived(val)}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ padding: '0 0 8px', position: 'relative' }}>
            <Search size={15} aria-hidden="true" style={{ position: 'absolute', left: 12, top: 13, color: 'var(--color-neutral-500)' }} />
            <input
              className="input"
              style={{ fontSize: 13.5, minHeight: 38, paddingLeft: 34 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages and people…"
              aria-label="Search your messages"
            />
            {search.trim() && (
              <span
                className="flex items-center gap-2"
                style={{ fontSize: 12, color: 'var(--text-subtle)', padding: '6px 2px 0' }}
                aria-live="polite"
              >
                {threads.length} match{threads.length === 1 ? '' : 'es'}
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{ background: 'none', border: 0, cursor: 'pointer', font: 'inherit', color: 'var(--color-accent-700)' }}
                >
                  Clear
                </button>
              </span>
            )}
          </div>

          {loading ? (
            <SkeletonRows count={4} />
          ) : threads.length === 0 ? (
            <span className="field-hint" style={{ padding: '8px 4px 4px' }}>
              {search.trim()
                ? 'Nothing matches that search. Try a name, or a word from the conversation.'
                : showArchived
                  ? 'Nothing archived yet. Conversations you archive move here and stay searchable.'
                  : 'No conversations yet. Once a connection is accepted, it opens here.'}
            </span>
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
                  aria-current={on ? 'true' : undefined}
                  style={{
                    padding: '10px 12px', borderRadius: 10, cursor: 'pointer', border: 0, font: 'inherit',
                    background: on ? 'var(--color-surface-2)' : 'transparent',
                    boxShadow: on ? 'inset 3px 0 0 var(--color-accent)' : 'none',
                  }}
                >
                  <span className="avatar avatar-md" style={{ background: bg, color: fg }}>
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
                        color: t.unread ? 'var(--color-text)' : 'var(--text-subtle)',
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

        <div className="card elev-sm msg-pane" style={{ padding: 18, gap: 12, minHeight: 540 }}>
          {!activeWith ? (
            <div className="empty" style={{ flex: 1, justifyContent: 'center', border: 0 }}>
              <span className="empty-icon"><MessageCircle size={20} aria-hidden="true" /></span>
              <p className="empty-title">{showArchived ? 'Nothing archived' : 'Pick a conversation'}</p>
              <p className="empty-body">
                {showArchived
                  ? 'Conversations you archive move here and stay searchable.'
                  : 'Choose one on the left. To start a new one, find someone in Explore and send a connection request first.'}
              </p>
              {!showArchived && (
                <a href="/app/explore" className="btn btn-secondary no-underline" style={{ marginTop: 6 }}>Go to Explore</a>
              )}
            </div>
          ) : (
            <>
              <div
                className="flex items-center gap-3 flex-wrap"
                style={{ borderBottom: '1px solid var(--color-divider)', paddingBottom: 10, minHeight: 44 }}
              >
                <button
                  type="button"
                  className="btn btn-quiet btn-sm show-mobile"
                  onClick={() => setParams({})}
                  aria-label="Back to conversations"
                  style={{ paddingLeft: 6, paddingRight: 8 }}
                >
                  <ArrowLeft size={16} aria-hidden="true" /> Inbox
                </button>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>{activeMeta?.name || activeWith}</span>
                  {/* If a nickname is in use, their real name still shows here so
                      it is never possible to forget who you are actually
                      talking to. */}
                  {activeMeta?.realName && activeMeta.realName !== activeMeta.name && (
                    <div style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
                      {activeMeta.realName}
                    </div>
                  )}
                  {noteFor(activeWith)?.notes && (
                    <div
                      style={{
                        fontSize: 12, color: 'var(--text-muted)', marginTop: 4,
                        maxWidth: 420, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}
                      title={noteFor(activeWith).notes}
                    >
                      {noteFor(activeWith).notes}
                    </div>
                  )}
                </div>
                {!activeSample && (
                  <span className="flex gap-2 items-center flex-wrap" style={{ marginLeft: 'auto' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setEditingContact(true)}
                      title="Add a private nickname and notes about this person. Only you can see them."
                    >
                      {noteFor(activeWith) ? 'Edit notes' : 'Add notes'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={toggleArchive}
                      disabled={archiveBusy}
                      title={isArchived
                        ? 'Move this conversation back to your inbox'
                        : 'Hide this from your inbox. The other person is not told, and nothing is deleted.'}
                    >
                      {archiveBusy ? '…' : isArchived ? 'Unarchive' : 'Archive'}
                    </button>
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

              {/* role="log" + aria-live so a screen reader user is told when a
                  reply arrives. Messages stream in without a refresh, and
                  before this the arrival of a new message was completely
                  silent — the thread had to be re-read manually to discover it. */}
              <div
                role="log"
                aria-live="polite"
                aria-relevant="additions"
                aria-label="Conversation"
                className="flex flex-col"
                style={{ gap: 9, flex: 1, overflowY: 'auto', maxHeight: 420, paddingRight: 4 }}
              >
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
                  <span style={{ fontSize: 13.5, color: 'var(--text-subtle)' }}>
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
                <span className="notice notice-warning" role="status">{sendError}</span>
              )}

              {activeSample ? (
                <div
                  style={{
                    background: 'var(--color-surface-2)', borderRadius: 18, padding: '12px 16px',
                    fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5,
                  }}
                >
                  This is a sample conversation showing how mentoring works on Pathways. Find a real
                  member on Explore to start your own.
                </div>
              ) : (
                <form onSubmit={send} className="flex gap-2 items-end">
                  <textarea
                    className="input"
                    aria-label="Write a message"
                    maxLength={4000}
                    style={{ minHeight: 44, flex: 1 }}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Write a message…"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(e); }
                    }}
                  />
                  <button type="submit" className="btn btn-primary" disabled={sending || !draft.trim()} style={{ minHeight: 44 }}>
                    <Send size={15} aria-hidden="true" /> Send
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      {activeWith && (
        <ContactDetailsPanel
          open={editingContact}
          onOpenChange={setEditingContact}
          otherEmail={activeWith}
          realName={activeMeta?.realName || activeWith}
          note={noteFor(activeWith)}
          onSave={saveNote}
          onClear={clearNote}
        />
      )}
    </div>
  );
}