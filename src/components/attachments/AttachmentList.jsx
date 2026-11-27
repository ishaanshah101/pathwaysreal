import React from 'react';
import AttachmentItem from '@/components/attachments/AttachmentItem';

// Files on a post or a Sage question: a short ruled list, one row per file.
export default function AttachmentList({ files, postId }) {
  if (!Array.isArray(files) || !files.length) return null;
  return (
    <div className="attach-list" aria-label="Attached files">
      {files.map((file, index) => <AttachmentItem key={file.id || file.url || index} file={file} postId={postId} />)}
    </div>
  );
}
