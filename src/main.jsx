import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Redirect legacy Base44 subdomain visitors to the canonical domain before
// React mounts. Preserves path, query, and hash; uses replace() so there's no
// back-button trap. Wrapped in try/catch so any failure just loads the app.
try {
  const host = window.location.hostname;
  const isLegacyBase44 = host === 'cac-pathways-d94b0ec7.base44.app' ||
    /^app--cac-pathways-d94b0ec7\.base44\.app$/.test(host) ||
    /^preview--cac-pathways-d94b0ec7\.base44\.app$/.test(host) ||
    /^share--cac-pathways-d94b0ec7\.base44\.app$/.test(host);

  if (isLegacyBase44) {
    const next = 'https://pathways.uno' + window.location.pathname + window.location.search + window.location.hash;
    window.location.replace(next);
  }
} catch (e) {
  // Swallow — let the app render normally.
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)