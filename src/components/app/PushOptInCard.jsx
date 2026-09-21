import React, { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { usePushNotifications } from '@/lib/usePushNotifications';

const DISMISS_KEY = 'pathways.pushPromptDismissed';

// The opt-in prompt, shown once inside the app after onboarding, never on first
// load and never as an automatic browser permission pop-up.
export default function PushOptInCard() {
  const { supported, enabled, busy, error, enable } = usePushNotifications();
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === '1',
  );

  if (!supported || enabled || dismissed) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  return (
    <div className="card elev-sm flex items-start gap-3" style={{ flexDirection: 'row', padding: 16 }}>
      <span className="empty-icon" style={{ width: 36, height: 36, flex: 'none' }}>
        <Bell size={17} aria-hidden="true" />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600 }}>Get told when someone replies?</p>
        <p style={{ margin: '2px 0 0', fontSize: 13.5, lineHeight: 1.55, color: 'var(--text-muted)' }}>
          We will notify you about new messages and accepted connection requests. Nothing else, and you
          can turn it off any time from your profile.
        </p>
        {error && <span className="msg msg-error" style={{ marginTop: 6 }}>{error}</span>}
        <div className="flex gap-2" style={{ marginTop: 10 }}>
          <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={enable}>
            {busy ? 'Turning on…' : 'Turn on notifications'}
          </button>
          <button type="button" className="btn btn-quiet btn-sm" onClick={dismiss}>
            <BellOff size={14} aria-hidden="true" /> Not now
          </button>
        </div>
      </div>
    </div>
  );
}