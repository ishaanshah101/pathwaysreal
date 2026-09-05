import React from 'react';

// One shared header for the public section pages so the eyebrow, title, and
// intro land in the same place at the same size every time.
export default function SectionHeader({ eyebrow, title, intro, titleMaxWidth = '24ch', as: Tag = 'h2' }) {
  return (
    <div style={{ marginBottom: 28 }}>
      {eyebrow && (
        <span className="card-kicker" style={{ display: 'block', marginBottom: 12 }}>{eyebrow}</span>
      )}
      <Tag style={{ fontSize: 'clamp(26px,3.2vw,38px)', maxWidth: titleMaxWidth, margin: 0, textWrap: 'balance' }}>
        {title}
      </Tag>
      {intro && (
        <p style={{ maxWidth: '58ch', fontSize: 16, lineHeight: 1.6, color: 'var(--color-neutral-800)', margin: '12px 0 0' }}>
          {intro}
        </p>
      )}
    </div>
  );
}