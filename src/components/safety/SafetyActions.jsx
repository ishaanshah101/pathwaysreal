import React, { useState } from 'react';
import { Flag, Ban } from 'lucide-react';
import ReportModal from '@/components/safety/ReportModal';
import BlockModal from '@/components/safety/BlockModal';
import Icon from '@/components/kit/Icon';

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

  // These stay visually quiet, but each keeps a full-size hit area: they are the
  // highest-stakes controls in the product and must never be hard to press.
  return (
    <>
      <button type="button" className="quiet-link" onClick={() => setReporting(true)}>
        <Icon as={Flag} size={14} /> Report
      </button>
      {showBlock && (
        <button type="button" className="quiet-link" onClick={() => setBlocking(true)}>
          <Icon as={Ban} size={14} /> Block
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