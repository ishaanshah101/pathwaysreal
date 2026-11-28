import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useProfile } from '@/lib/useProfile';
import BrandMark from '@/components/BrandMark';

// The whole app, once the week to enter a real name has run out. Entering one
// is the only way back in, and the server is what decides whether it counts.
export default function NameLock() {
  const { logout } = useAuth();
  const { saveProfile } = useProfile();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (saving || !name.trim()) return;
    setSaving(true);
    setError('');
    try {
      await saveProfile({ full_name: name.trim() });
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  return (
    <main className="wrap" style={{ maxWidth: 540, paddingBlock: 56 }}>
      <div className="brand" style={{ marginBottom: 22 }}>
        <BrandMark size={34} />
        <span className="brand-name">Pathways</span>
      </div>
      <form onSubmit={submit} className="panel">
        <div className="panel-head">Your account is locked</div>
        <div className="panel-body" style={{ display: 'grid', gap: 16, padding: 18 }}>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55 }}>
            Everyone on Pathways goes by their real first and last name, and the week to change yours has passed.
            Enter your real name now to keep your account. If you don't, it will be deleted along with everything on it.
          </p>
          <div className="field">
            <label htmlFor="nl-name">Your first and last name</label>
            <input
              id="nl-name" className="input" autoFocus autoComplete="name" maxLength={120}
              value={name} onChange={(e) => setName(e.target.value)}
            />
          </div>
          {error && <span role="alert" className="msg msg-error">{error}</span>}
          <div className="flex gap-2 flex-wrap">
            <button type="submit" className="btn btn-primary" disabled={saving || !name.trim()}>
              {saving ? 'Saving…' : 'Save and continue'}
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => logout(true)}>Sign out</button>
          </div>
        </div>
      </form>
    </main>
  );
}