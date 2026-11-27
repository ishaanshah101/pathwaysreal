import React, { useEffect, useRef } from 'react';
import AttachmentList from '@/components/attachments/AttachmentList';

const STARTERS = [
  'How do I build a college list that actually fits me?',
  'What should I be doing this summer?',
  'Read my essay draft and tell me where it loses the reader.',
  'How do I ask a teacher for a recommendation letter?',
  'Which of my classes next year matter most for a bio major?',
];

// The transcript, set like a printed interview rather than a chat: the
// student's question on a paper block, Sage's answer in the reading face behind
// a sign-green rule. Attachments stay on the question so it is obvious what
// Sage was actually looking at.
export default function SageMessages({ messages, thinking, loading, onStarter }) {
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length, thinking]);

  return (
    <div className="sage-log">
      {loading ? (
        <p className="meta" role="status">Loading this conversation…</p>
      ) : messages.length === 0 ? (
        <div className="sage-starters">
          <span className="kicker">Not sure where to start?</span>
          <ul className="sage-starter-list">
            {STARTERS.map((s) => (
              <li key={s}>
                <button type="button" className="sage-starter" onClick={() => onStarter(s)}>{s}</button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        messages.map((m, i) => {
          const mine = m.role === 'user';
          return (
            <React.Fragment key={m.id}>
              {mine && i > 0 && <hr className="lane lane-soft" />}
              <div className="turn">
                <span className="turn-label" data-who={mine ? 'you' : 'sage'}>{mine ? 'You asked' : 'Sage'}</span>
                {mine ? (
                  <div className="turn-q">
                    {m.content}
                    <AttachmentList files={m.attachments} />
                  </div>
                ) : (
                  <div className="prose turn-a">
                    {m.content}
                    <AttachmentList files={m.attachments} />
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })
      )}
      {thinking && (
        <div className="turn" role="status">
          <span className="turn-label" data-who="sage">Sage</span>
          <div className="turn-thinking">
            <span className="lane-run" aria-hidden="true" />
            <span>Sage is reading and thinking…</span>
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}
