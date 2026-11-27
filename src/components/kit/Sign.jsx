import React from 'react';

// A road sign. The colour carries meaning the way it does on a highway:
// green for where things are, blue for help, yellow for attention, brown for
// somewhere worth a detour, orange for work.
export default function Sign({ color = 'green', size, as: Tag = 'span', className = '', children, ...rest }) {
  const cls = ['sign', `sign-${color}`, size === 'lg' ? 'sign-lg' : '', className].filter(Boolean).join(' ');
  return <Tag className={cls} {...rest}>{children}</Tag>;
}
