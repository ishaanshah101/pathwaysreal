import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';

// The free sample. The model call itself lives in the sage-trial backend
// function, which enforces the one-question limit and the topic rules. This
// component only renders, so there is nothing here worth bypassing.

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
  const [spent, setSpent] = useState(false);
  const [error, setError] = useState('');

  const ask = async () => {
    if (!question.trim() || loading || spent) return;
    setLoading(true);
    setAnswer('');
    setError('');
    try {
      const res = await base44.functions.invoke('sage-trial', { question, grade });
      setAnswer(cleanSage(res?.data?.answer || ''));
      // A refusal does not burn the free question, so only lock the form when
      // the backend actually spent it.
      if (!res?.data?.refused) setSpent(true);
    } catch (err) {
      const data = err?.response?.data;
      setError(data?.error || err?.message || 'Sage could not answer just now. Try again in a moment.');
      if (data?.code === 'trial_used' || data?.code === 'trial_closed') setSpent(true);
    }
    setLoading(false);
  };

  return (
    <section style={{ padding: 'clamp(20px,4vh,44px) 0' }}>
      <h2 style={{ fontSize: 'clamp(22px,2.6vw,28px)', margin: '0 0 8px' }}>Try Sage on one question, free</h2>
      <p style={{ maxWidth: '52ch', color: 'var(--color-neutral-800)', marginBottom: 20, fontSize: 15, lineHeight: 1.6 }}>
        Ask anything about applications, majors, essays, or scholarships. No account needed. One question per day,
        then it is $5 a month for as many as you like.
      </p>
      <div className="card elev-sm" style={{ padding: 24, gap: 14, maxWidth: 720 }}>
        <div className="field">
          <label htmlFor="sage-grade">Your grade</label>
          <select
            id="sage-grade"
            className="input"
            value={grade}
            disabled={spent}
            onChange={(e) => setGrade(e.target.value)}
          >
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
            disabled={spent}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="How do I pick which colleges to apply to?"
          />
        </div>

        {!spent && (
          <button
            type="button"
            className="btn btn-primary self-start"
            onClick={ask}
            disabled={loading || !question.trim()}
          >
            {loading ? 'Sage is thinking…' : 'Ask Sage'}
          </button>
        )}

        {error && (
          <p style={{ color: 'var(--color-danger-700, #b42318)', fontSize: 14, margin: 0 }}>{error}</p>
        )}

        {answer && (
          <div
            className="anim-fade-swap"
            style={{ background: 'var(--color-bg)', borderRadius: 22, padding: 18, fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}
          >
            {answer}
          </div>
        )}

        {spent && (
          <div style={{ borderTop: '1px solid var(--color-neutral-200)', paddingTop: 14, display: 'grid', gap: 10 }}>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--color-neutral-800)' }}>
              That was your free question. Sage remembers your grade, your school, and your goals, and you can ask it
              anything, as often as you want, for $5 a month.
            </p>
            <Link to="/join?plan=sage_monthly" className="btn btn-primary self-start no-underline">
              Get Sage
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
