import { useEffect, useState } from 'react';

// True on phone-width screens. 860px is the same breakpoint the app's CSS uses
// to collapse its two-column layouts, so JS and CSS never disagree about
// whether a pane is on screen.
export function useNarrow(maxWidth = 859) {
  const query = `(max-width: ${maxWidth}px)`;
  const [narrow, setNarrow] = useState(
    () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false),
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setNarrow(e.matches);
    setNarrow(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return narrow;
}