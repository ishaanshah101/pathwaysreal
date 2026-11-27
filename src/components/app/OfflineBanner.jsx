import React from 'react';
import { WifiOff } from 'lucide-react';
import Icon from '@/components/kit/Icon';

// Shown instead of a broken, empty feed when the device has no connection.
export default function OfflineBanner({ cached = 0 }) {
  return (
    <div className="notice notice-warning flex items-center gap-3" role="status">
      <Icon as={WifiOff} size={17} />
      <span>
        <b>No signal.</b>{' '}
        {cached > 0
          ? `Showing the ${cached} post${cached === 1 ? '' : 's'} you already read. New posts appear when you reconnect.`
          : 'Posts you have already read will show up here. Saved posts are always available.'}
      </span>
    </div>
  );
}
