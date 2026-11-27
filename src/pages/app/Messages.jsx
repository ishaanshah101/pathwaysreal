import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import TabActivityContext from '@/components/app/TabActivityContext';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useProfile, threadKey, ROLE_LABELS } from '@/lib/useProfile';
import { useMessages, deliveryStateOf } from '@/lib/MessagesContext';
import DeliveryTicks from '@/components/app/DeliveryTicks';
import UnreadBadge from '@/components/app/UnreadBadge';
import VerifiedBadge from '@/components/app/VerifiedBadge';
import SafetyActions from '@/components/safety/SafetyActions';
import ContactDetailsPanel from '@/components/app/ContactDetailsPanel';
import { useBlocks } from '@/lib/useBlocks';
import { useConnections } from '@/lib/useConnections';
import { useContactNotes } from '@/lib/useContactNotes';
import { usePeopleByEmail } from '@/lib/usePeople';
import Seo from '@/components/Seo';
import PageHead from '@/components/kit/PageHead';
import Plate from '@/components/kit/Plate';
import Icon from '@/components/kit/Icon';
import { SkeletonRows } from '@/components/ui/Skeletons';
import { Archive, ArchiveRestore, ArrowLeft, MessageSquare, NotebookPen, Search } from 'lucide-react';

function clockTime(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch { return ''; }
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// The heading on the rule between two days of a conversation.
function dayLabel(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  if (sameDay(d, now)) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
    ...(d.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
  });
}

// When a conversation last moved, as short as it can be said: a time today, a
// weekday this week, a date before that.
function listTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  if (sameDay(d, now)) return clockTime(iso);
  if (now - d < 6 * 86400000) return d.toLocaleDateString(undefined, { weekday: 'short' });
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// One message. A squared block with the time and delivery state in small print
// underneath, never inside it.
function Said({ mine, state, children, meta }) {
  return (
    <div className="said" data-mine={mine ? 'true' : 'false'} data-state={state || undefined}>
      <div className="said-body">{children}</div>
      {meta && <div className="said-meta meta">{meta}</div>}
    </div>
  );
}

export default function Messages() {
  const tabActive = useContext(TabActivityContext);
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
    setActiveThread(tabActive ? activeWith : null);
    return () => setActiveThread(null);
  }, [activeWith, setActiveThread, tabActive]);

  // Opening a conversation clears its unread count.
  useEffect(() => {
    if (tabActive && activeWith) markThreadRead(activeWith);
  }, [activeWith, markThreadRead, messages.length, tabActive]);

  const threads = useMemo(() => {
    const map = new Map();
    for (const m of messages) {
      const other = m.from_email === email ? m.to_email : m.from_email;
      if (!other) continue;
      const prev = map.get(other);
      if (!prev || new Date(m.created_date) > new Date(prev.created_date)) map.set(other, m);
    }

    const real = [...map.entries()].map(([other, last]) => {
      const realName = other.startsWith('deleted:') ? 'Deleted account' : people.find((p) => p.user_email === other)?.full_name || last.from_name || other;
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
      const realName = activeWith.startsWith('deleted:') ? 'Deleted account' : people.find((p) => p.user_email === activeWith)?.full_name || activeWith;
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
  const activePerson = people.find((p) => p.user_email === activeWith);
  const activeNote = activeWith ? noteFor(activeWith) : null;
  const activeLine = activeWith && !activeWith.startsWith('deleted:')
    ? activePerson?.headline || activePerson?.job_title || ROLE_LABELS[activePerson?.role] || ''
    : '';
  const usingNickname = Boolean(activeMeta?.realName && activeMeta.realName !== activeMeta.name);

  return (
    <div className="page fit-page" data-open={String(Boolean(activeWith))}>
      <Seo title="Messages | Pathways" description="One-on-one mentoring conversations on Pathways with students, professors, and counselors." path="/app/messages" noindex />

      <PageHead
        kicker="Messages"
        title="Your conversations."
        sub="One on one only, never group chats. Messages arrive as they are sent."
      />

      {/* One scroll region per pane. The frame is sized off the viewport, so on
          a phone the page and the pane never both scroll at once, which is
          what produced two scrollbars and a rubber-banding mess in a WebView. */}
      <div className="duo msg-split" data-active={String(Boolean(activeWith))}>
        <section className="duo-side msg-list" aria-label="Conversations">
          <div className="side-tabs" role="tablist" aria-label="Inbox or archived">
            {[[false, 'Inbox'], [true, `Archived${archivedEmails.length ? ` (${archivedEmails.length})` : ''}`]].map(([val, label]) => (
              <button
                key={label}
                type="button"
                role="tab"
                aria-selected={showArchived === val}
                className="side-tab"
                data-on={String(showArchived === val)}
                onClick={() => setShowArchived(val)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="side-search">
            <Icon as={Search} size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages and people"
              aria-label="Search your messages"
            />
          </div>
          {search.trim() && (
            <div className="side-count" aria-live="polite">
              <span className="meta">{threads.length} match{threads.length === 1 ? '' : 'es'}</span>
              <button type="button" className="link-btn" onClick={() => setSearch('')}>Clear</button>
            </div>
          )}

          <div className="side-scroll">
            {loading ? (
              <SkeletonRows count={4} />
            ) : threads.length === 0 ? (
              <p className="side-empty">
                {search.trim()
                  ? 'Nothing matches that search. Try a name, or a word from the conversation.'
                  : showArchived
                    ? 'Nothing archived yet. Conversations you archive move here and stay searchable.'
                    : 'No conversations yet. Once a connection is accepted, it opens here.'}
              </p>
            ) : (
              threads.map((t) => {
                const on = t.other === activeWith;
                return (
                  <button
                    key={t.other}
                    type="button"
                    onClick={() => setParams({ to: t.other })}
                    className="thread-row"
                    aria-current={on ? 'true' : undefined}
                    data-unread={t.unread > 0 ? 'true' : undefined}
                  >
                    <Plate name={t.name} seed={t.other} size={40} />
                    <span style={{ minWidth: 0 }}>
                      <span className="thread-top">
                        <span className="thread-name">{t.name}</span>
                        <span className="meta num">{listTime(t.at)}</span>
                      </span>
                      {t.subtitle && <span className="meta" style={{ display: 'block' }}>{t.subtitle}</span>}
                      <span className="thread-bottom">
                        <span className="thread-preview">{t.preview}</span>
                        <UnreadBadge count={t.unread} standalone />
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </section>

        <section className="duo-main msg-pane" aria-label={activeWith ? `Conversation with ${activeMeta?.name || activeWith}` : 'Conversation'}>
          {!activeWith ? (
            <div className="convo-log">
              <div className="empty convo-blank">
                <span className="empty-icon"><Icon as={MessageSquare} size={20} /></span>
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
            </div>
          ) : (
            <>
              <header className="convo-head">
                <button
                  type="button"
                  className="btn btn-quiet btn-sm show-mobile"
                  onClick={() => setParams({})}
                  aria-label="Back to conversations"
                  style={{ paddingInline: 6, marginLeft: -8 }}
                >
                  <Icon as={ArrowLeft} size={16} /> Inbox
                </button>
                <div className="convo-who">
                  <Plate name={activeMeta?.name || activeWith} seed={activeWith} size={40} />
                  <div>
                    <h2 className="convo-name">
                      <span>{activeMeta?.name || activeWith}</span>
                      <VerifiedBadge verified={activePerson?.verified} />
                    </h2>
                    {/* If a nickname is in use, their real name still shows here so
                        it is never possible to forget who you are actually
                        talking to. */}
                    {(usingNickname || activeLine) && (
                      <div className="meta convo-sub">
                        {[usingNickname ? activeMeta.realName : '', activeLine].filter(Boolean).join(' · ')}
                      </div>
                    )}
                  </div>
                </div>
                {!activeSample && (
                  <span className="convo-tools">
                    <button
                      type="button"
                      className="tool-btn"
                      onClick={() => setEditingContact(true)}
                      title="Add a private nickname and notes about this person. Only you can see them."
                    >
                      <Icon as={NotebookPen} size={15} /> {activeNote ? 'Edit notes' : 'Add notes'}
                    </button>
                    <button
                      type="button"
                      className="tool-btn"
                      onClick={toggleArchive}
                      disabled={archiveBusy}
                      title={isArchived
                        ? 'Move this conversation back to your inbox'
                        : 'Hide this from your inbox. The other person is not told, and nothing is deleted.'}
                    >
                      <Icon as={isArchived ? ArchiveRestore : Archive} size={15} />
                      {archiveBusy ? 'Working…' : isArchived ? 'Unarchive' : 'Archive'}
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
              </header>

              {activeNote?.notes && (
                <div className="convo-note" title={activeNote.notes}>
                  <span>Your note</span>
                  <span>{activeNote.notes}</span>
                </div>
              )}

              {/* role="log" + aria-live so a screen reader user is told when a
                  reply arrives. Messages stream in without a refresh, and
                  before this the arrival of a new message was completely
                  silent: the thread had to be re-read manually to discover it. */}
              <div
                role="log"
                aria-live="polite"
                aria-relevant="additions"
                aria-label="Conversation"
                className="convo-log"
              >
                {activeSample ? (
                  activeSample.messages.map((m, i) => (
                    <Said
                      key={i}
                      mine={m.me}
                      meta={m.me ? <DeliveryTicks state="read" /> : null}
                    >
                      {m.body}
                    </Said>
                  ))
                ) : thread.length === 0 ? (
                  <div className="empty convo-blank">
                    <p className="empty-title">No messages yet.</p>
                    <p className="empty-body">Be direct about what you need help with. People respond to that.</p>
                  </div>
                ) : (
                  thread.map((m, i) => {
                    const mine = m.from_email === email;
                    const state = deliveryStateOf(m, receiptByMessage.get(m.id));
                    const day = dayLabel(m.created_date);
                    const newDay = i === 0 || day !== dayLabel(thread[i - 1].created_date);
                    return (
                      <React.Fragment key={m.id}>
                        {newDay && day && <div className="day-sep">{day}</div>}
                        <Said
                          mine={mine}
                          state={mine ? state : undefined}
                          meta={
                            <>
                              <span className="num">{clockTime(m.created_date)}</span>
                              {mine && <DeliveryTicks state={state} />}
                            </>
                          }
                        >
                          {m.body}
                        </Said>
                      </React.Fragment>
                    );
                  })
                )}
                <div ref={endRef} />
              </div>

              <div className="convo-compose">
                {sendError && (
                  <span className="notice notice-warning" role="status">{sendError}</span>
                )}

                {activeSample ? (
                  <p className="notice">
                    This is a sample conversation showing how mentoring works on Pathways. Find a real
                    member on Explore to start your own.
                  </p>
                ) : activeWith.startsWith('deleted:') ? (
                  <p className="notice notice-info" role="status">This account has been deleted. You can still read this conversation.</p>
                ) : (
                  <>
                    <form onSubmit={send} className="compose-row">
                      <textarea
                        className="input"
                        aria-label="Write a message"
                        maxLength={4000}
                        rows={1}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Write a message"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(e); }
                        }}
                      />
                      <button type="submit" className="btn btn-primary btn-go" disabled={sending || !draft.trim()}>
                        Send
                      </button>
                    </form>
                    <p className="compose-foot">
                      Screened before delivery. Contact details, links, and requests to meet up are blocked.
                    </p>
                  </>
                )}
              </div>
            </>
          )}
        </section>
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
