import { useEffect, useState } from 'react';

// Whether the device currently has a connection. Used to swap a broken empty
// state for an honest "you are offline, this is what you read last" banner.
export function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine !== false);

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);

  return online;
}

export default useOnline;