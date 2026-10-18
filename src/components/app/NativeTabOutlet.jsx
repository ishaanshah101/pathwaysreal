import React, { useContext, useLayoutEffect, useRef } from 'react';
import { UNSAFE_LocationContext as LocationContext, useLocation, useOutlet } from 'react-router-dom';
import NativeTabPane from '@/components/app/NativeTabPane';
import RouteTransition from '@/components/app/RouteTransition';

export default function NativeTabOutlet({ tabs }) {
  const { pathname } = useLocation();
  const locationContext = useContext(LocationContext);
  const outlet = useOutlet();
  const pages = useRef(new Map());
  const positions = useRef({});
  const isTab = tabs.some((tab) => tab.to === pathname);
  // Lazy mounting avoids loading tabs the member has never opened.
  if (isTab) pages.current.set(pathname, { outlet, locationContext });

  useLayoutEffect(() => {
    if (!isTab) return;
    const top = positions.current[pathname] || 0;
    const remember = () => { positions.current[pathname] = window.scrollY; };
    window.addEventListener('scroll', remember, { passive: true });
    // Run after the normal route scroll reset, which remains unchanged on web.
    const frame = requestAnimationFrame(() => window.scrollTo({ top, left: 0, behavior: 'instant' }));
    return () => {
      window.removeEventListener('scroll', remember);
      cancelAnimationFrame(frame);
    };
  }, [pathname, isTab]);

  return (
    <>
      {[...pages.current].map(([path, page]) => (
        <NativeTabPane key={path} active={path === pathname} locationContext={page.locationContext}>
          {page.outlet}
        </NativeTabPane>
      ))}
      {!isTab && <RouteTransition />}
    </>
  );
}