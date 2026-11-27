import React from 'react';
import { Bell, BellOff } from 'lucide-react';
import { usePushNotifications } from '@/lib/usePushNotifications';
import Icon from '@/components/kit/Icon';

// The permanent on/off switch for push notifications, so turning them on from
// the prompt is never a one-way door.
export default function NotificationSettingsCard() {
  const { supported, enabled, busy, error, enable, disable } = usePushNotifications();

  return (
    <section className="panel profile-panel" aria-labelledby="notif-head">
      <div className="panel-head" id="notif-head">Notifications</div>
      <div className="panel-body">
        {supported && (
          <span className="panel-lead">{enabled ? 'On' : 'Off'}</span>
        )}
        <p>
          {supported
            ? 'Get a notification on this device when you receive a new message or someone accepts your connection request. Nothing else is ever sent.'
            : 'This browser cannot show notifications. On iPhone, add Pathways to your home screen and open it from there.'}
        </p>
        {error && <span className="msg msg-error" role="alert">{error}</span>}
        {supported && (
          <button
            type="button"
            className={enabled ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}
            disabled={busy}
            onClick={enabled ? disable : enable}
          >
            <Icon as={enabled ? BellOff : Bell} size={15} />
            {busy ? 'Just a moment…' : enabled ? 'Turn notifications off' : 'Turn notifications on'}
          </button>
        )}
      </div>
    </section>
  );
}
