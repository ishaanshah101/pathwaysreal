import React from 'react';
import { Bookmark } from 'lucide-react';
import Seo from '@/components/Seo';
import { CATEGORY_LABELS } from '@/lib/useProfile';
import { useSavedPosts } from '@/lib/useSavedPosts';
import { useOnline } from '@/lib/useOnline';
import OfflineBanner from '@/components/app/OfflineBanner';

// Saved posts are stored with a snapshot of their text, and cached locally, so
// this page reads the same with or without a connection.
export default function SavedPosts() {
  const { saved, loadingSaved, toggleSave, busyPostId } = useSavedPosts();
  const online = useOnline();

  return (
    <div className="flex flex-col" style={{ gap: 20 }}>
      <Seo title="Saved Posts | Pathways" description="Posts you saved on Pathways to read later." path="/app/saved" noindex />
      <div>
        <h1 style={{ fontSize: 'clamp(26px,3.2vw,36px)', margin: '0 0 6px' }}>Saved posts</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 15 }}>
          Everything you saved, readable offline.
        </p>
      </div>

      {!online && <OfflineBanner cached={saved.length} />}

      {loadingSaved ? (
        <p role="status" style={{ color: 'var(--text-subtle)' }}>Loading your saved posts…</p>
      ) : saved.length === 0 ? (
        <div className="empty">
          <span className="empty-icon"><Bookmark size={20} aria-hidden="true" /></span>
          <p className="empty-title">Nothing saved yet</p>
          <p className="empty-body">Tap Save on any post in the feed and it will wait for you here, even with no connection.</p>
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap: 16 }}>
          {saved.map((s) => (
            <article key={s.id} className="card elev-sm" style={{ padding: 22, gap: 10 }}>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 13, color: 'var(--text-subtle)' }}>
                  {s.author_name || 'A Pathways member'}
                  {s.author_headline ? ` · ${s.author_headline}` : ''}
                </span>
                <span className="tag tag-accent" style={{ marginLeft: 'auto' }}>
                  {CATEGORY_LABELS[s.category] || 'Advice'}
                </span>
              </div>
              <h2 className="h-sans" style={{ fontSize: 19, margin: 0 }}>{s.title}</h2>
              <p style={{ fontSize: 15, lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap', color: 'var(--color-neutral-800)' }}>
                {s.body}
              </p>
              <button
                type="button"
                className="btn btn-secondary btn-sm self-start"
                disabled={busyPostId === s.post_id || !online}
                onClick={() => toggleSave(s.post_id)}
                title={online ? 'Remove from saved' : 'Reconnect to change your saved posts'}
              >
                Remove
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}