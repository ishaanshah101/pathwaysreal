import React from 'react';

// A stylised window showing what the inside of Pathways looks like: one feed
// post and one mentor card, built from the real components' styles rather than
// a screenshot, so it never goes stale and always matches the current theme.
// It is illustrative and labelled as such below.

const Avatar = ({ initials, bg, fg, size = 32 }) => (
  <span
    className="avatar"
    style={{ width: size, height: size, fontSize: size * 0.36, background: bg, color: fg }}
    aria-hidden="true"
  >
    {initials}
  </span>
);

export default function ProductFrame({ style }) {
  return (
    <div style={{ position: 'relative', marginLeft: 12, ...style }} aria-hidden="true">
      <div className="frame">
        <div className="frame-bar">
          <span className="frame-dot" /><span className="frame-dot" /><span className="frame-dot" />
          <span style={{ marginLeft: 10, fontSize: 11.5, color: 'var(--text-subtle)', fontWeight: 500 }}>pathways.uno/app</span>
        </div>

        <div style={{ padding: 16, display: 'grid', gap: 12, background: 'var(--color-bg)' }}>
          {/* Filter row */}
          <div className="flex gap-[6px]" style={{ flexWrap: 'wrap' }}>
            {['All', 'Essays', 'Scholarships', 'Majors'].map((t, i) => (
              <span
                key={t}
                className="btn btn-chip"
                data-on={String(i === 1)}
                style={{ minHeight: 26, padding: '3px 10px', fontSize: 11.5, pointerEvents: 'none' }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* A post */}
          <div className="card elev-sm" style={{ padding: 16, gap: 8 }}>
            <div className="flex items-center gap-[10px]">
              <Avatar initials="SN" bg="var(--color-accent-2-200)" fg="var(--color-accent-2-800)" />
              <div style={{ lineHeight: 1.25 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Sofia Nguyen</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-subtle)' }}>First-year, Carnegie Mellon · Essays</div>
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 14.5, lineHeight: 1.3 }}>The essay you write in September is not the one you submit</div>
            <div style={{ fontSize: 12.5, lineHeight: 1.55, color: 'var(--text-muted)' }}>
              Start it early, throw the first version out, and write about one specific afternoon instead of your whole life…
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-accent-700)' }}>Keep reading</div>
          </div>

          {/* A mentor card */}
          <div className="card elev-sm" style={{ padding: 14, gap: 10 }}>
            <div className="flex items-center gap-[10px]">
              <Avatar initials="MW" bg="var(--color-accent-200)" fg="var(--color-accent-800)" />
              <div style={{ lineHeight: 1.25, flex: 1 }}>
                <div className="flex items-center gap-[6px]">
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Marcus Webb</span>
                  <span className="badge badge-verified" style={{ fontSize: 10, padding: '1px 7px' }}>Verified</span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-subtle)' }}>Admissions counselor, Kenyon College</div>
              </div>
              <span className="btn btn-primary" style={{ minHeight: 30, padding: '4px 12px', fontSize: 12, pointerEvents: 'none' }}>
                Connect
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* One small notification, the way it looks in the product. */}
      <div
        className="card elev-lg"
        style={{ position: 'absolute', left: -18, bottom: -22, width: 212, padding: '10px 14px', gap: 4 }}
      >
        <span className="card-kicker" style={{ fontSize: 10 }}>New message</span>
        <span style={{ fontSize: 12.5, lineHeight: 1.4 }}>
          <b>Marcus Webb</b> accepted your request. Ask him anything.
        </span>
      </div>
    </div>
  );
}
