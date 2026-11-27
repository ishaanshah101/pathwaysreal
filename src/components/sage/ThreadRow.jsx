import React, { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2, Folder, FolderMinus, Archive, ArchiveRestore, Check, X } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/kit/Icon';

// One chat in the sidebar. Rename stays inline; move and delete live behind a
// small menu so the row does not carry three separate icon buttons.
export default function ThreadRow({ thread, active, folders, onSelect, onRename, onDelete, onMove, onArchive }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const commit = () => { onRename(thread.id, draft); setEditing(false); };

  if (editing) {
    return (
      <div className="inline-edit">
        <input
          className="input"
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); commit(); }
            if (e.key === 'Escape') setEditing(false);
          }}
          aria-label="Chat name"
        />
        <button type="button" className="mini-tool" onClick={commit} aria-label="Save name">
          <Icon as={Check} size={16} />
        </button>
        <button type="button" className="mini-tool" onClick={() => setEditing(false)} aria-label="Cancel">
          <Icon as={X} size={16} />
        </button>
      </div>
    );
  }

  const otherFolders = folders.filter((f) => f.id !== thread.folder_id);

  return (
    <div className="chat-row" data-on={active ? 'true' : 'false'}>
      <button
        type="button"
        className="chat-row-open"
        onClick={() => onSelect(thread.id)}
        aria-current={active ? 'true' : undefined}
      >
        {thread.title || 'New chat'}
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="mini-tool" aria-label={`Options for ${thread.title || 'chat'}`}>
            <Icon as={MoreHorizontal} size={16} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="row-menu">
          <DropdownMenuItem className="row-menu-item" onClick={() => { setDraft(thread.title || ''); setEditing(true); }}>
            <Icon as={Pencil} size={15} /> Rename
          </DropdownMenuItem>
          {otherFolders.map((f) => (
            <DropdownMenuItem key={f.id} className="row-menu-item" onClick={() => onMove(thread.id, f.id)}>
              <Icon as={Folder} size={15} /> Move to {f.name}
            </DropdownMenuItem>
          ))}
          {thread.folder_id && (
            <DropdownMenuItem className="row-menu-item" onClick={() => onMove(thread.id, '')}>
              <Icon as={FolderMinus} size={15} /> Remove from folder
            </DropdownMenuItem>
          )}
          <DropdownMenuItem className="row-menu-item" onClick={() => onArchive(thread.id, !thread.archived)}>
            {thread.archived
              ? <><Icon as={ArchiveRestore} size={15} /> Unarchive</>
              : <><Icon as={Archive} size={15} /> Archive</>}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="row-menu-sep" />
          <DropdownMenuItem className="row-menu-item" data-danger="true" onClick={() => onDelete(thread.id)}>
            <Icon as={Trash2} size={15} /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
