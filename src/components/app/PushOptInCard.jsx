import React, { useState } from 'react';
import { Bell } from 'lucide-react';
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
    <div className="notice notice-info flex items-start gap-3 flex-wrap">
      <div style={{ flex: 1, minWidth: 240 }}>
        <p style={{ margin: 0, fontSize: 15.5, fontWeight: 800 }}>Get told when someone replies?</p>
        <p style={{ margin: '3px 0 0', fontSize: 14.5, lineHeight: 1.5, color: 'var(--ink-2)' }}>
          We will notify you about new messages and accepted connection requests. Nothing else, and you
          can turn it off any time from your profile.
        </p>
        {error && <span className="msg msg-error" style={{ marginTop: 6 }}>{error}</span>}
      </div>
      <div className="flex gap-2 items-center">
        <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={enable}>
          <Bell size={15} aria-hidden="true" /> {busy ? 'Turning on…' : 'Turn on'}
        </button>
        <button type="button" className="btn btn-quiet btn-sm" onClick={dismiss}>Not now</button>
      </div>
    </div>
  );
}
