import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import FieldSelect from '@/components/ui/FieldSelect';
import { isNativeApp } from '@/lib/platform';
import { useAuth } from '@/lib/AuthContext';

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
  const native = isNativeApp();
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const [grade, setGrade] = useState('11th grade');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [spent, setSpent] = useState(false);
  const [error, setError] = useState('');

  const ask = async () => {
    if (!question.trim() || loading || spent || isLoadingAuth) return;
    if (!isAuthenticated) {
      window.location.href = '/login?returnTo=%2Fsage';
      return;
    }
    setLoading(true);
    setAnswer('');
    setError('');
    try {
      const res = await base44.functions.invoke('sage-trial', { question, grade });
      if (!res?.data?.refused) {
        base44.analytics.track({ eventName: 'sage_trial_started', properties: { grade } });
      }
      setAnswer(cleanSage(res?.data?.answer || ''));
      // A refusal does not burn the free question, so only lock the form when
      // the backend actually spent it.
      if (!res?.data?.refused) setSpent(true);
    } catch (err) {
      const data = err?.response?.data;
      if ((err?.response?.status ?? err?.status) === 401) {
        window.location.href = '/login?returnTo=%2Fsage';
      }
      setError(data?.error || err?.message || 'Sage could not answer just now. Try again in a moment.');
      if (data?.code === 'trial_used' || data?.code === 'trial_closed') setSpent(true);
    }
    setLoading(false);
  };

  return (
    <section id="sage-free-sample" className="page-section" style={{ paddingBottom: 'clamp(40px,6vh,72px)' }}>
      <span className="card-kicker" style={{ display: 'block', marginBottom: 12 }}>Try it</span>
      <h2 style={{ fontSize: 'clamp(24px,2.8vw,32px)', margin: '0 0 10px' }}>Ask Sage one question, free</h2>
      <p style={{ maxWidth: '52ch', color: 'var(--color-neutral-800)', marginBottom: 20, fontSize: 15.5, lineHeight: 1.6 }}>
        {native
          ? 'Ask anything about applications, majors, essays, or scholarships. Sign in for one free question per account each day.'
          : 'Ask anything about applications, majors, essays, or scholarships. Sign in for one free question per account each day, then it is $5 a month for as many as you like.'}
      </p>
      <div className="card elev-sm" style={{ padding: 24, gap: 14, maxWidth: 720 }}>
        <div className="field">
          <label htmlFor="sage-grade">Your grade</label>
          <FieldSelect
            id="sage-grade"
            value={grade}
            disabled={spent || isLoadingAuth || !isAuthenticated}
            onValueChange={setGrade}
            options={['9th grade', '10th grade', '11th grade', '12th grade', 'College student'].map((g) => [g, g])}
          />
        </div>
        <div className="field">
          <label htmlFor="sage-q">Your question</label>
          <textarea
            id="sage-q"
            className="input"
            value={question}
            disabled={spent || isLoadingAuth || !isAuthenticated}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="How do I pick which colleges to apply to?"
          />
        </div>

        {!spent && (!isLoadingAuth && !isAuthenticated ? (
          <Link to="/login?returnTo=%2Fsage" className="btn btn-primary self-start no-underline">
            Sign in to ask Sage
          </Link>
        ) : (
          <button
            type="button"
            className="btn btn-primary self-start"
            onClick={ask}
            disabled={isLoadingAuth || loading || !question.trim()}
          >
            {isLoadingAuth ? 'Checking sign-in…' : loading ? 'Sage is thinking…' : 'Ask Sage'}
          </button>
        ))}

        {error && (
          <p role="alert" className="msg msg-error" style={{ margin: 0 }}>{error}</p>
        )}

        {answer && (
          <div
            className="anim-fade-swap"
            role="status"
            aria-live="polite"
            style={{ background: 'var(--color-surface-2)', borderRadius: 12, padding: 18, fontSize: 14.5, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}
          >
            {answer}
          </div>
        )}

        {spent && native && <p role="status">That was your free question. Come back tomorrow for another.</p>}
        {spent && !native && (
          <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: 14, display: 'grid', gap: 10 }}>
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