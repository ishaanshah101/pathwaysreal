import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

function cleanSage(text) {
  let t = String(text);
  t = t.replace(/^#{1,6}\s+/gm, '');        // markdown headings
  t = t.replace(/[*_`~]{1,3}/g, '');          // bold/italic/code markers
  t = t.replace(/^\s*[-•]\s+/gm, '');        // bullet dashes
  t = t.replace(/^-{3,}\s*$/gm, '');          // horizontal rules (---)
  t = t.replace(/—|–/g, ', ');               // em/en dashes -> commas
  t = t.replace(/\s{2,}/g, ' ').trim();      // collapse stray spaces
  return t;
}

export default function AskSage() {
  const [grade, setGrade] = useState('11th grade');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer('');
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are Sage, a warm, concrete college and career advisor for high school students on Pathways. The student is in ${grade}. Answer in plain text only, under 180 words, with specific, actionable next steps and no fluff. Do not use markdown, asterisks, hash signs, dashes as bullets, or horizontal rules. Use commas instead of em dashes.\n\nQuestion: ${question}`,
    });
    const raw = typeof res === 'string' ? res : JSON.stringify(res);
    setAnswer(cleanSage(raw));
    setLoading(false);
  };

  return (
    <section style={{ padding: 'clamp(20px,4vh,44px) 0' }}>
      <h2 style={{ fontSize: 'clamp(22px,2.6vw,28px)', margin: '0 0 8px' }}>Try Sage on one question, free</h2>
      <p style={{ maxWidth: '52ch', color: 'var(--color-neutral-800)', marginBottom: 20, fontSize: 15, lineHeight: 1.6 }}>
        Ask anything about applications, majors, essays, or scholarships. No account needed.
      </p>
      <div className="card elev-sm" style={{ padding: 24, gap: 14, maxWidth: 720 }}>
        <div className="field">
          <label htmlFor="sage-grade">Your grade</label>
          <select id="sage-grade" className="input" value={grade} onChange={(e) => setGrade(e.target.value)}>
            {['9th grade', '10th grade', '11th grade', '12th grade', 'College student'].map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="sage-q">Your question</label>
          <textarea
            id="sage-q"
            className="input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="How do I pick which colleges to apply to?"
          />
        </div>
        <button type="button" className="btn btn-primary self-start" onClick={ask} disabled={loading || !question.trim()}>
          {loading ? 'Sage is thinking…' : 'Ask Sage'}
        </button>
        {answer && (
          <div
            className="anim-fade-swap"
            style={{ background: 'var(--color-bg)', borderRadius: 22, padding: 18, fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}
          >
            {answer}
          </div>
        )}
      </div>
    </section>
  );
}