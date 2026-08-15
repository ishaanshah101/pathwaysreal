import React, { useState } from 'react';
import { Flag, Ban } from 'lucide-react';
import ReportModal from '@/components/safety/ReportModal';
import BlockModal from '@/components/safety/BlockModal';

// The pair of quiet actions that sit on every profile, post, and thread.
// Deliberately low-key so they are always available without dominating the UI.
export default function SafetyActions({
  targetEmail,
  targetName,
  contextType = 'profile',
  contextId,
  showBlock = true,
  onBlocked,
}) {
  const [reporting, setReporting] = useState(false);
  const [blocking, setBlocking] = useState(false);

  if (!targetEmail) return null;

  const linkStyle = {
    background: 'none', border: 0, padding: 0, font: 'inherit', cursor: 'pointer',
    fontSize: 12, color: 'var(--color-neutral-600)', display: 'inline-flex',
    alignItems: 'center', gap: 4,
  };

  return (
    <>
      <button type="button" style={linkStyle} onClick={() => setReporting(true)}>
        <Flag size={13} aria-hidden="true" /> Report
      </button>
      {showBlock && (
        <button type="button" style={linkStyle} onClick={() => setBlocking(true)}>
          <Ban size={13} aria-hidden="true" /> Block
        </button>
      )}

      <ReportModal
        open={reporting}
        onOpenChange={setReporting}
        reportedEmail={targetEmail}
        reportedName={targetName}
        contextType={contextType}
        contextId={contextId}
      />
      {showBlock && (
        <BlockModal
          open={blocking}
          onOpenChange={setBlocking}
          blockedEmail={targetEmail}
          blockedName={targetName}
          onBlocked={onBlocked}
        />
      )}
    </>
  );
}