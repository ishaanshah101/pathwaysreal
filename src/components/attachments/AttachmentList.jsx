import React from 'react';
import AttachmentItem from '@/components/attachments/AttachmentItem';

export default function AttachmentList({ files, postId }) {
  if (!Array.isArray(files) || !files.length) return null;
  return (
    <div className="mt-2 grid grid-cols-1 gap-2 whitespace-normal" aria-label="Attached files">
      {files.map((file, index) => <AttachmentItem key={file.id || file.url || index} file={file} postId={postId} />)}
    </div>
  );
}