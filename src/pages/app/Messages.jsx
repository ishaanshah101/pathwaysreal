import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useProfile, threadKey } from '@/lib/useProfile';
import { SAMPLE_MESSAGE_THREADS, authorAvatar, initialsOf } from '@/data/sampleContent';

function nameFor(msgs, other) {
  const fromThem = msgs.find((m) => m.from_email === other && m.from_name);
  return fromThem?.from_name || other;
}

function Bubble({ mine, children }) {
  return (
    <div
      style={{
        alignSelf: mine ? 'flex-end' : 'flex-start',
        maxWidth: '80%',
        background: mine ? 'var(--color-accent)' : 'var(--color-bg)',
        color: mine ? 'var(--color-bg)' : 'var(--color-text)',
        padding: '10px 15px',
        borderRadius: 20,
        fontSize: 14,
        lineHeight: 1.55,
        whiteSpace: 'pre-wrap',
      }}
    >
      {children}
    </div>
  );
}

export default function Messages() {
  const { profile, email } = useProfile();
  const [params, setParams] = useSearchParams();
  const activeWith = params.get('to');

  const [messages, setMessages] = useState([]);
  const [people, setPeople] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  const load = async () => {
    try {
      const [msgs, profs] = await Promise.all([
        base44.entities.Message.list('-created_date', 400).catch(() => []),
        base44.entities.Profile.list('-created_date', 200).catch(() => []),
      ]);
      setMessages(Array.isArray(msgs) ? msgs.slice().reverse() : []);
      setPeople(Array.isArray(profs) ? profs : []);
    } catch {
      setMessages([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const sampleByEmail = useMemo(() => {
    const m = new Map();
    for (const t of SAMPLE_MESSAGE_THREADS) m.set(t.other, t);
    return m;
  }, []);

  // Real conversations first, then the sample ones, so a member's own threads
  // are never pushed below demo content.
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
      name: people.find((p) => p.user_email === other)?.full_name || nameFor(messages, other),
      is_sample: false,
    }));

    if (activeWith && !real.some((r) => r.other === activeWith) && !sampleByEmail.has(activeWith)) {
      real.unshift({
        other: activeWith,
        preview: 'Start the conversation',
        name: people.find((p) => p.user_email === activeWith)?.full_name || activeWith,
        is_sample: false,
      });
    }

    const samples = SAMPLE_MESSAGE_THREADS.map((t) => ({
      other: t.other,
      preview: t.last.body,
      name: t.name,
      subtitle: t.subtitle,
      is_sample: true,
    }));

    return [...real, ...samples];
  }, [messages, people, email, activeWith, sampleByEmail]);

  const activeSample = activeWith ? sampleByEmail.get(activeWith) : null;

  const thread = useMemo(() => {
    if (!activeWith || activeSample) return [];
    const key = threadKey(email, activeWith);
    return messages.filter((m) => m.thread_key === key);
  }, [messages, activeWith, email, activeSample]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.length, activeWith]);

  const send = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !activeWith || activeSample) return;
    setSending(true);
    const body = draft.trim();
    setDraft('');
    try {
      await base44.entities.Message.create({
        thread_key: threadKey(email, activeWith),
        from_email: email,
        from_name: profile?.full_name || '',
        to_email: activeWith,
        body,
      });
      await load();
    } catch {
      setDraft(body);
    }
    setSending(false);
  };

  const activeMeta = threads.find((t) => t.other === activeWith);

  return (
    <div className="flex flex-col" style={{ gap: 18 }}>
      <div>
        <h1 style={{ fontSize: 'clamp(26px,3.2vw,36px)', margin: '0 0 6px' }}>Messages</h1>
        <p style={{ color: 'var(--color-neutral-800)', margin: 0 }}>
          One-on-one only, never group chats. Open a sample conversation to see how mentoring works here.
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
                  <span className="flex flex-col" style={{ minWidth: 0, gap: 1 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</span>
                    {t.subtitle && (
                      <span style={{ fontSize: 11.5, color: 'var(--color-accent-700)' }}>{t.subtitle}</span>
                    )}
                    <span
                      style={{
                        fontSize: 12, color: 'var(--color-neutral-600)',
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
              <div style={{ borderBottom: '1px solid var(--color-divider)', paddingBottom: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{activeMeta?.name || activeWith}</span>
                {activeSample?.headline && (
                  <div style={{ fontSize: 12, color: 'var(--color-neutral-600)' }}>{activeSample.headline}</div>
                )}
              </div>

              <div className="flex flex-col" style={{ gap: 9, flex: 1, overflowY: 'auto', maxHeight: 420, paddingRight: 4 }}>
                {activeSample ? (
                  activeSample.messages.map((m, i) => (
                    <Bubble key={i} mine={m.me}>{m.body}</Bubble>
                  ))
                ) : thread.length === 0 ? (
                  <span style={{ fontSize: 13.5, color: 'var(--color-neutral-600)' }}>
                    No messages yet. Be direct about what you need help with, people respond to that.
                  </span>
                ) : (
                  thread.map((m) => (
                    <Bubble key={m.id} mine={m.from_email === email}>{m.body}</Bubble>
                  ))
                )}
                <div ref={endRef} />
              </div>

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
