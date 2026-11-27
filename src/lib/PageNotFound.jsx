import { Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import Seo from '@/components/Seo';
import BrandMark from '@/components/BrandMark';

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
  ['/how-it-works', 'How it works'],
  ['/by-grade', 'By grade'],
  ['/glossary', 'Glossary'],
  ['/sage', 'Sage'],
  ['/faq', 'FAQ'],
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
    <main className="lost">
      <Seo title="Page not found | Pathways" noindex />
      <div className="lost-inner">
        <div className="lost-sign" aria-hidden="true">
          <b>Wrong exit</b>
          <span>Error 404 · No such road</span>
        </div>

        <h1 className="title-2">This page isn't here.</h1>

        <p className="lede" style={{ marginTop: 14 }}>
          {pageName
            ? <>We couldn't find <b style={{ color: 'var(--ink)' }}>/{pageName}</b>. It may have moved, or the link may be mistyped.</>
            : <>We couldn't find that page. It may have moved, or the link may be mistyped.</>}
        </p>

        <div className="flex flex-wrap items-center" style={{ gap: 12, marginTop: 26 }}>
          <Link to="/" className="btn btn-primary btn-lg btn-go">Back to Pathways</Link>
          <BrandMark size={44} />
        </div>

        <nav className="flex flex-wrap" style={{ gap: '8px 22px', marginTop: 34, paddingTop: 20, borderTop: '1px solid var(--hairline)' }} aria-label="Site">
          {LINKS.map(([to, label]) => (
            <Link key={to} to={to} style={{ fontWeight: 800, fontSize: 16 }}>{label}</Link>
          ))}
        </nav>

        {isFetched && authData?.isAuthenticated && authData.user?.role === 'admin' && (
          <p className="notice notice-info" style={{ marginTop: 26 }}>
            <b>Admin note.</b> This route has no page yet, or you are not allowed to see it.
          </p>
        )}
      </div>
    </main>
  );
}
