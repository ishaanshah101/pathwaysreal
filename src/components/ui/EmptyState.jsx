import React from 'react';
import Icon from '@/components/kit/Icon';

// One empty/error state for the whole product. Every state says what happened,
// why, and what to do next, so no screen is ever an unexplained blank.
//
// It is drawn as a rest area: a dashed pull-off, a pictogram on a services
// plate, one short sentence, and a way back onto the road.
export default function EmptyState({ icon: Glyph, title, body, action, tone = 'neutral' }) {
  return (
    <div className={tone === 'error' ? 'empty empty-error' : 'empty'}>
      {Glyph && <span className="empty-icon"><Icon as={Glyph} size={20} /></span>}
      <p className="empty-title">{title}</p>
      {body && <p className="empty-body">{body}</p>}
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}
