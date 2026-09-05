import React, { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2, Folder, FolderMinus, Archive, ArchiveRestore, Check, X } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

// One chat in the sidebar. Rename stays inline; move and delete live behind a
// small menu so the row does not carry three separate icon buttons.
export default function ThreadRow({ thread, active, folders, onSelect, onRename, onDelete, onMove, onArchive }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const commit = () => { onRename(thread.id, draft); setEditing(false); };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          className="input"
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); commit(); }
            if (e.key === 'Escape') setEditing(false);
          }}
          style={{ fontSize: 13, minHeight: 32, padding: '4px 12px' }}
          aria-label="Chat name"
        />
        <button type="button" className="btn btn-ghost" style={{ padding: 4 }} onClick={commit} aria-label="Save name">
          <Check size={15} />
        </button>
        <button type="button" className="btn btn-ghost" style={{ padding: 4 }} onClick={() => setEditing(false)} aria-label="Cancel">
          <X size={15} />
        </button>
      </div>
    );
  }

  const otherFolders = folders.filter((f) => f.id !== thread.folder_id);

  return (
    <div
      className="flex items-center gap-1"
      style={{
        borderRadius: 10,
        background: active ? 'var(--color-surface-2)' : 'transparent',
        boxShadow: active ? 'inset 3px 0 0 var(--color-accent)' : 'none',
        padding: '2px 4px 2px 2px',
      }}
    >
      <button
        type="button"
        onClick={() => onSelect(thread.id)}
        aria-current={active ? 'true' : undefined}
        style={{
          flex: 1, textAlign: 'left', background: 'none', border: 0, cursor: 'pointer',
          font: 'inherit', fontSize: 13.5, fontWeight: active ? 600 : 500, padding: '8px 10px', borderRadius: 8,
          color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}
      >
        {thread.title || 'New chat'}
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="btn btn-ghost" style={{ padding: 4 }} aria-label={`Options for ${thread.title || 'chat'}`}>
            <MoreHorizontal size={14} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => { setDraft(thread.title || ''); setEditing(true); }}>
            <Pencil size={13} style={{ marginRight: 6 }} /> Rename
          </DropdownMenuItem>
          {otherFolders.map((f) => (
            <DropdownMenuItem key={f.id} onClick={() => onMove(thread.id, f.id)}>
              <Folder size={13} style={{ marginRight: 6 }} /> Move to {f.name}
            </DropdownMenuItem>
          ))}
          {thread.folder_id && (
            <DropdownMenuItem onClick={() => onMove(thread.id, '')}>
              <FolderMinus size={13} style={{ marginRight: 6 }} /> Remove from folder
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => onArchive(thread.id, !thread.archived)}>
            {thread.archived
              ? <><ArchiveRestore size={13} style={{ marginRight: 6 }} /> Unarchive</>
              : <><Archive size={13} style={{ marginRight: 6 }} /> Archive</>}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onDelete(thread.id)} style={{ color: 'var(--color-danger)' }}>
            <Trash2 size={13} style={{ marginRight: 6 }} /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}