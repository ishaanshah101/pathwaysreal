import React from 'react';
import { Bell } from 'lucide-react';
import { usePushNotifications } from '@/lib/usePushNotifications';

// The permanent on/off switch for push notifications, so turning them on from
// the prompt is never a one-way door.
export default function NotificationSettingsCard() {
  const { supported, enabled, busy, error, enable, disable } = usePushNotifications();

  return (
    <div className="card elev-sm" style={{ padding: 22, gap: 10, marginTop: 12 }}>
      <span className="card-kicker">Notifications</span>
      <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: 'var(--text-muted)' }}>
        {supported
          ? 'Get a notification on this device when you receive a new message or someone accepts your connection request. Nothing else is ever sent.'
          : 'This browser cannot show notifications. On iPhone, add Pathways to your home screen and open it from there.'}
      </p>
      {error && <span className="msg msg-error" role="alert">{error}</span>}
      {supported && (
        <button
          type="button"
          className={enabled ? 'btn btn-secondary self-start' : 'btn btn-primary self-start'}
          disabled={busy}
          onClick={enabled ? disable : enable}
        >
          <Bell size={15} aria-hidden="true" />
          {busy ? 'Just a moment…' : enabled ? 'Turn notifications off' : 'Turn notifications on'}
        </button>
      )}
    </div>
  );
}