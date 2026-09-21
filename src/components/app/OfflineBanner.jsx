import React from 'react';
import { WifiOff } from 'lucide-react';

// Shown instead of a broken, empty feed when the device has no connection.
export default function OfflineBanner({ cached = 0 }) {
  return (
    <div className="notice notice-warning flex items-center gap-2" role="status" style={{ flexDirection: 'row' }}>
      <WifiOff size={15} aria-hidden="true" />
      <span>
        You are offline.{' '}
        {cached > 0
          ? `Showing the ${cached} post${cached === 1 ? '' : 's'} you already read. New posts appear when you reconnect.`
          : 'Posts you have already read will show up here. Saved posts are always available.'}
      </span>
    </div>
  );
}