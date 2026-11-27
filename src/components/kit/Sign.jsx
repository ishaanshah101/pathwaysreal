import React from 'react';

// A highlighter label: a few words with one colour swiped behind them. Each
// colour means one thing everywhere it appears, the way a student keeps one
// highlighter per subject.
export default function Sign({ color = 'green', size = 'md', as: Tag = 'span', className = '', children = null, ...rest }) {
  const cls = ['sign', `sign-${color}`, size === 'lg' ? 'sign-lg' : '', className].filter(Boolean).join(' ');
  return <Tag className={cls} {...rest}>{children}</Tag>;
}
