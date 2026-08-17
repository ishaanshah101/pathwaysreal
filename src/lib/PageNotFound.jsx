import { Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import Seo from '@/components/Seo';

/**
 * Pathways is a client-rendered SPA, so the host returns HTTP 200 for every
 * URL, including ones that do not exist. Google calls that a "soft 404", and
 * the documented fix when you cannot control the status code is to mark the
 * not-found view noindex. <Seo noindex> does that, and also points the
 * canonical at the requested URL so a missing page can never inherit the
 * homepage's canonical and get folded into it in the index.
 *
 * The page itself used to be Base44's stock scaffold: white-and-slate, off
 * brand, with no way back into the site except a Go Home button. A 404 is a
 * page real visitors land on from stale links, so it now looks like Pathways
 * and offers somewhere to go.
 */

const LINKS = [
  ['/', 'Home'],
  ['/how-it-works', 'How it works'],
  ['/sage', 'Sage'],
  ['/faq', 'FAQ'],
  ['/join', 'Join free'],
  ['/safety', 'Safety'],
];

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.substring(1);

  const { data: authData, isFetched } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        return { user, isAuthenticated: true };
      } catch {
        return { user: null, isAuthenticated: false };
      }
    },
  });

  return (
    <main
      className="flex items-center justify-center"
      style={{ minHeight: '100vh', padding: 24, background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <Seo title="Page not found | Pathways" noindex />
      <div className="flex flex-col" style={{ maxWidth: 460, width: '100%', gap: 20, textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 56, lineHeight: 1, color: 'var(--color-accent-700)', margin: 0 }}>
          404
        </p>

        <h1 style={{ fontSize: 'var(--text-2xl)', margin: 0 }}>This page isn't here</h1>

        <p style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-normal)', color: 'var(--color-neutral-700)', margin: 0 }}>
          {pageName
            ? <>We couldn't find <b style={{ color: 'var(--color-text)' }}>/{pageName}</b>. It may have moved, or the link may be mistyped.</>
            : <>We couldn't find that page. It may have moved, or the link may be mistyped.</>}
        </p>

        <nav className="flex flex-wrap justify-center" style={{ gap: 8, marginTop: 4 }} aria-label="Site">
          {LINKS.map(([to, label]) => (
            <Link
              key={to}
              to={to}
              className="btn btn-secondary no-underline"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <Link to="/" className="btn btn-primary btn-lg no-underline self-center" style={{ marginTop: 4 }}>
          Back to Pathways
        </Link>

        {isFetched && authData?.isAuthenticated && authData.user?.role === 'admin' && (
          <p
            className="card"
            style={{
              fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-normal)',
              color: 'var(--color-neutral-700)', textAlign: 'left', padding: '12px 16px',
              borderRadius: 'var(--radius-md)', marginTop: 12,
            }}
          >
            <b>Admin note.</b> This route has no page yet, or you are not allowed to see it.
          </p>
        )}
      </div>
    </main>
  );
}
