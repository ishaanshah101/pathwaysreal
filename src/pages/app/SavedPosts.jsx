import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, BookmarkMinus } from 'lucide-react';
import Seo from '@/components/Seo';
import { CATEGORY_LABELS } from '@/lib/useProfile';
import { signFor, readingMinutes } from '@/lib/categories';
import { timeAgo } from '@/lib/time';
import { useSavedPosts } from '@/lib/useSavedPosts';
import { useOnline } from '@/lib/useOnline';
import OfflineBanner from '@/components/app/OfflineBanner';
import PageHead from '@/components/kit/PageHead';
import Plate from '@/components/kit/Plate';
import Sign from '@/components/kit/Sign';
import Icon from '@/components/kit/Icon';
import EmptyState from '@/components/ui/EmptyState';

// Saved posts are stored with a snapshot of their text, and cached locally, so
// this page reads the same with or without a connection.
export default function SavedPosts() {
  const { saved, loadingSaved, toggleSave, busyPostId } = useSavedPosts();
  const online = useOnline();

  return (
    <div className="page-read">
      <Seo title="Saved Posts | Pathways" description="Posts you saved on Pathways to read later." path="/app/saved" noindex />

      <PageHead
        kicker="Saved"
        title="Kept for later."
        sub="Everything you saved, readable offline."
      />

      {!online && (
        <div style={{ marginBottom: 20 }}>
          <OfflineBanner cached={saved.length} />
        </div>
      )}

      {loadingSaved ? (
        <div role="status" aria-label="Loading your saved posts" style={{ display: 'grid', gap: 14, paddingTop: 8 }}>
          <span className="skeleton skeleton-title" style={{ width: '70%' }} />
          <span className="skeleton skeleton-line" />
          <span className="skeleton skeleton-line" style={{ width: '92%' }} />
          <span className="skeleton skeleton-line" style={{ width: '64%' }} />
        </div>
      ) : saved.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Nothing saved yet."
          body="Press Save on any post in the feed and it will wait for you here, even with no connection."
          action={<Link to="/app" className="btn btn-secondary">Go to the feed</Link>}
        />
      ) : (
        <div className="saved-list">
          {saved.map((s, i) => (
            <React.Fragment key={s.id}>
              {i > 0 && <hr className="lane lane-soft" />}
              <article className="post">
                <div className="post-head">
                  {/* The saved copy has the author's name but not their address,
                      so it cannot reproduce the colour of their plate. A blank
                      plate is better than the wrong colour. */}
                  <Plate name={s.author_name} size={44} style={{ background: 'var(--paper-3)', color: 'var(--ink)' }} />
                  <div style={{ minWidth: 0 }}>
                    <div className="post-author">
                      <span>{s.author_name || 'A Pathways member'}</span>
                    </div>
                    <div className="post-meta">
                      {s.author_headline ? `${s.author_headline} · ` : ''}
                      {s.saved_at ? `saved ${timeAgo(s.saved_at)} · ` : ''}
                      {`${readingMinutes(s.body)} min read`}
                    </div>
                  </div>
                  <Sign color={signFor(s.category)}>{CATEGORY_LABELS[s.category] || 'Advice'}</Sign>
                </div>

                <h2 className="post-title">{s.title}</h2>

                <p className="prose post-body">{s.body}</p>

                <div className="post-actions">
                  <button
                    type="button"
                    className="tool-btn"
                    disabled={busyPostId === s.post_id || !online}
                    onClick={() => toggleSave(s.post_id)}
                    title={online ? 'Remove from saved' : 'Reconnect to change your saved posts'}
                  >
                    <Icon as={BookmarkMinus} size={16} />
                    Remove from saved
                  </button>
                </div>
              </article>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
