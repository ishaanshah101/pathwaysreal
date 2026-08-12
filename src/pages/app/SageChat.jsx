import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useProfile, ROLE_LABELS } from '@/lib/useProfile';

const STARTERS = [
  'How do I build a college list that actually fits me?',
  'What should I be doing this summer?',
  'Read my essay idea and tell me if it is any good.',
  'How do I ask a teacher for a recommendation letter?',
];

function cleanSage(text) {
  let t = String(text);
  t = t.replace(/^#{1,6}\s+/gm, '');
  t = t.replace(/[*_`~]{1,3}/g, '');
  t = t.replace(/^\s*[-•]\s+/gm, '');
  t = t.replace(/^-{3,}\s*$/gm, '');
  t = t.replace(/—|–/g, ', ');
  t = t.replace(/[ \t]{2,}/g, ' ').trim();
  return t;
}

export default function SageChat() {
  const { profile, email } = useProfile();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [loading, setLoading] = useState(true);
  const endRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const rows = await base44.entities.SageMessage.list('created_date', 200);
        setMessages(Array.isArray(rows) ? rows : []);
      } catch {
        setMessages([]);
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, thinking]);

  const ask = async (text) => {
    const question = (text ?? input).trim();
    if (!question || thinking) return;
    setInput('');
    setThinking(true);

    const optimistic = { id: `local-${Date.now()}`, role: 'user', content: question };
    setMessages((m) => [...m, optimistic]);

    try {
      base44.entities.SageMessage.create({ user_email: email, role: 'user', content: question }).catch(() => {});

      const history = [...messages, optimistic]
        .slice(-10)
        .map((m) => `${m.role === 'user' ? 'Student' : 'Sage'}: ${m.content}`)
        .join('\n');

      const who = [
        profile?.full_name ? `Their name is ${profile.full_name}.` : '',
        profile?.role ? `They are a ${ROLE_LABELS[profile.role] || profile.role}.` : '',
        profile?.grade ? `They are in ${profile.grade}.` : '',
        profile?.school ? `They attend ${profile.school}.` : '',
        profile?.goals ? `They said they want help with: ${profile.goals}.` : '',
        Array.isArray(profile?.interests) && profile.interests.length
          ? `Their interests: ${profile.interests.join(', ')}.` : '',
      ].filter(Boolean).join(' ');

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are Sage, a warm, concrete college and career advisor for students on Pathways. ${who}

Answer in plain text only, under 220 words, with specific, actionable next steps and no fluff. Do not use markdown, asterisks, hash signs, dashes as bullets, or horizontal rules. Use commas instead of em dashes. Refer back to what they already told you when it is relevant.

Conversation so far:
${history}

Sage:`,
      });

      const answer = cleanSage(typeof res === 'string' ? res : JSON.stringify(res));
      setMessages((m) => [...m, { id: `local-a-${Date.now()}`, role: 'assistant', content: answer }]);
      base44.entities.SageMessage.create({ user_email: email, role: 'assistant', content: answer }).catch(() => {});
    } catch {
      setMessages((m) => [
        ...m,
        { id: `err-${Date.now()}`, role: 'assistant', content: 'Sage could not answer that just now. Try asking again in a moment.' },
      ]);
    }
    setThinking(false);
  };

  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      <div>
        <span className="tag tag-accent-2">Sage · your AI advisor</span>
        <h1 style={{ fontSize: 'clamp(26px,3.2vw,36px)', margin: '12px 0 6px' }}>Ask Sage anything.</h1>
        <p style={{ color: 'var(--color-neutral-800)', margin: 0, maxWidth: '56ch' }}>
          Sage knows your grade, your school, and your goals, and answers like a mentor who has all the time in the world.
        </p>
      </div>

      <div className="card elev-sm" style={{ padding: 20, gap: 14, borderRadius: 26, minHeight: 420 }}>
        <div className="flex flex-col" style={{ gap: 12, flex: 1, overflowY: 'auto', maxHeight: 460, paddingRight: 4 }}>
          {loading ? (
            <span style={{ fontSize: 13.5, color: 'var(--color-neutral-600)' }}>Loading your conversation…</span>
          ) : messages.length === 0 ? (
            <div className="flex flex-col" style={{ gap: 10 }}>
              <span style={{ fontSize: 14, color: 'var(--color-neutral-700)' }}>Not sure where to start?</span>
              <div className="flex flex-col items-start" style={{ gap: 8 }}>
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => ask(s)}
                    className="btn btn-secondary text-left"
                    style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, borderRadius: 18, padding: '9px 16px' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => {
              const mine = m.role === 'user';
              return (
                <div
                  key={m.id}
                  style={{
                    alignSelf: mine ? 'flex-end' : 'flex-start',
                    maxWidth: mine ? '78%' : '92%',
                    background: mine ? 'var(--color-accent)' : 'var(--color-bg)',
                    color: mine ? 'var(--color-bg)' : 'var(--color-text)',
                    padding: '11px 16px',
                    borderRadius: 22,
                    fontSize: 14.5,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {m.content}
                </div>
              );
            })
          )}
          {thinking && (
            <span style={{ fontSize: 13.5, color: 'var(--color-neutral-600)', alignSelf: 'flex-start' }}>
              Sage is thinking…
            </span>
          )}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); ask(); }}
          className="flex gap-2 items-end"
        >
          <textarea
            className="input"
            style={{ minHeight: 46, flex: 1 }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about applications, majors, essays, or scholarships…"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(); }
            }}
          />
          <button type="submit" className="btn btn-primary" disabled={thinking || !input.trim()}>
            Ask Sage
          </button>
        </form>
      </div>
    </div>
  );
}
