import { useEffect } from 'react';

const SITE = 'https://cac-pathways-d94b0ec7.base44.app';

function upsertMeta(selector, attr, name, content) {
  if (!content) return;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

// A single-page app keeps one <title> for every route unless something updates
// it. Search and AI crawlers that do render JS read the updated head, and it
// also fixes the browser tab and shared-link previews per page.
export default function Seo({ title, description, path, noindex = false }) {
  useEffect(() => {
    if (title) {
      document.title = title;
      upsertMeta('meta[property="og:title"]', 'property', 'og:title', title);
      upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    }
    if (description) {
      upsertMeta('meta[name="description"]', 'name', 'description', description);
      upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
      upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    }
    const url = SITE + (path || window.location.pathname);
    upsertCanonical(url);
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', url);
    upsertMeta(
      'meta[name="robots"]', 'name', 'robots',
      noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large',
    );
  }, [title, description, path, noindex]);

  return null;
}
