import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useProfile, threadKey } from '@/lib/useProfile';

function nameFor(msgs, me, other) {
  const fromThem = msgs.find((m) => m.from_email === other && m.from_name);
  return fromThem?.from_name || other;
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

  // Threads are derived from the messages this user can actually read, so the
  // list can never show a conversation they are not part of.
  const threads = useMemo(() => {
    const map = new Map();
    for (const m of messages) {
      const other = m.from_email === email ? m.to_email : m.from_email;
      if (!other) continue;
      const prev = map.get(other);
      if (!prev || new Date(m.created_date) > new Date(prev.created_date)) {
        map.set(other, m);
      }
    }
    const rows = [...map.entries()].map(([other, last]) => ({
      other,
      last,
      name: people.find((p) => p.user_email === other)?.full_name || nameFor(messages, email, other),
    }));
    if (activeWith && !rows.some((r) => r.other === activeWith)) {
      rows.unshift({
        other: activeWith,
        last: null,
        name: people.find((p) => p.user_email === activeWith)?.full_name || activeWith,
      });
    }
    return rows.sort((a, b) => {
      if (!a.last) return -1;
      if (!b.last) return 1;
      return new Date(b.last.created_date) - new Date(a.last.created_date);
    });
  }, [messages, people, email, activeWith]);

  const thread = useMemo(() => {
    if (!activeWith) return [];
    const key = threadKey(email, activeWith);
    return messages.filter((m) => m.thread_key === key);
  }, [messages, activeWith, email]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.length]);

  const send = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !activeWith) return;
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

  const activeName =
    threads.find((t) => t.other === activeWith)?.name || activeWith || '';

  return (
    <div className="flex flex-col" style={{ gap: 18 }}>
      <h1 style={{ fontSize: 'clamp(26px,3.2vw,36px)', margin: 0 }}>Messages</h1>

      <div
        className="grid app-split"
        style={{ gridTemplateColumns: 'minmax(0,4fr) minmax(0,8fr)', gap: 16, alignItems: 'start' }}
      >
        <div className="card elev-sm" style={{ padding: 12, gap: 4, borderRadius: 24 }}>
          {loading ? (
            <span style={{ fontSize: 13, color: 'var(--color-neutral-600)', padding: 10 }}>Loading…</span>
          ) : threads.length === 0 ? (
            <span style={{ fontSize: 13, color: 'var(--color-neutral-600)', padding: 10, lineHeight: 1.5 }}>
              No conversations yet. Find someone on Explore and say hello.
            </span>
          ) : (
            threads.map((t) => {
              const on = t.other === activeWith;
              return (
                <button
                  key={t.other}
                  type="button"
                  onClick={() => setParams({ to: t.other })}
                  className="flex flex-col text-left"
                  style={{
                    padding: '10px 12px', borderRadius: 18, cursor: 'pointer', border: 0, font: 'inherit',
                    background: on ? 'var(--color-accent-200)' : 'transparent', gap: 2,
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</span>
                  <span
                    style={{
                      fontSize: 12, color: 'var(--color-neutral-600)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}
                  >
                    {t.last?.body || 'Start the conversation'}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="card elev-sm" style={{ padding: 18, gap: 12, borderRadius: 24, minHeight: 420 }}>
          {!activeWith ? (
            <div className="flex items-center justify-center" style={{ flex: 1, color: 'var(--color-neutral-600)', fontSize: 14 }}>
              Pick a conversation, or start one from Explore.
            </div>
          ) : (
            <>
              <div style={{ borderBottom: '1px solid var(--color-divider)', paddingBottom: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{activeName}</span>
              </div>

              <div className="flex flex-col" style={{ gap: 8, flex: 1, overflowY: 'auto', maxHeight: 420, paddingRight: 4 }}>
                {thread.length === 0 ? (
                  <span style={{ fontSize: 13.5, color: 'var(--color-neutral-600)' }}>
                    No messages yet. Be direct about what you need help with, people respond to that.
                  </span>
                ) : (
                  thread.map((m) => {
                    const mine = m.from_email === email;
                    return (
                      <div
                        key={m.id}
                        style={{
                          alignSelf: mine ? 'flex-end' : 'flex-start',
                          maxWidth: '78%',
                          background: mine ? 'var(--color-accent)' : 'var(--color-bg)',
                          color: mine ? 'var(--color-bg)' : 'var(--color-text)',
                          padding: '9px 14px',
                          borderRadius: 20,
                          fontSize: 14,
                          lineHeight: 1.5,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {m.body}
                      </div>
                    );
                  })
                )}
                <div ref={endRef} />
              </div>

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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
