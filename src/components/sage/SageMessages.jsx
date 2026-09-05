import React, { useEffect, useRef } from 'react';
import { FileText } from 'lucide-react';

const STARTERS = [
  'How do I build a college list that actually fits me?',
  'What should I be doing this summer?',
  'Read my essay draft and tell me where it loses the reader.',
  'How do I ask a teacher for a recommendation letter?',
  'Which of my classes next year matter most for a bio major?',
];

// The transcript. Attachments are shown on the student's own bubble so it stays
// obvious what Sage was actually looking at.
export default function SageMessages({ messages, thinking, loading, onStarter }) {
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length, thinking]);

  return (
    <div className="flex flex-col" style={{ gap: 12, flex: 1, overflowY: 'auto', minHeight: 340, maxHeight: '58vh', paddingRight: 4 }}>
      {loading ? (
        <span className="text-quiet" style={{ fontSize: 13.5 }}>Loading this conversation…</span>
      ) : messages.length === 0 ? (
        <div className="flex flex-col" style={{ gap: 10 }}>
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Not sure where to start?</span>
          <div className="flex flex-col items-start" style={{ gap: 8 }}>
            {STARTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onStarter(s)}
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
                background: mine ? 'var(--color-ink)' : 'var(--color-surface-2)',
                color: mine ? 'var(--color-bg)' : 'var(--color-text)',
                padding: '11px 16px',
                borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                fontSize: 14.5,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}
            >
              {m.content}
              {Array.isArray(m.attachments) && m.attachments.length > 0 && (
                <span className="flex flex-wrap gap-2" style={{ marginTop: 8 }}>
                  {m.attachments.map((f) => (
                    <a
                      key={f.url}
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 no-underline"
                      style={{
                        fontSize: 12, padding: '4px 9px', borderRadius: 999,
                        background: 'rgba(255,255,255,.22)', color: 'inherit',
                      }}
                    >
                      <FileText size={12} aria-hidden="true" /> {f.name}
                    </a>
                  ))}
                </span>
              )}
            </div>
          );
        })
      )}
      {thinking && (
        <span className="text-quiet" style={{ fontSize: 13.5, alignSelf: 'flex-start' }}>Sage is reading and thinking…</span>
      )}
      <div ref={endRef} />
    </div>
  );
}