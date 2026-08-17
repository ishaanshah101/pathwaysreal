import React, { useState } from 'react';
import { Folder, Pencil, Trash2, Check, X } from 'lucide-react';
import ThreadRow from '@/components/sage/ThreadRow';

// One folder in the sidebar: its name, inline rename, delete, and the chats
// filed inside it. Deleting a folder keeps its chats, they just come unfiled.
export default function FolderSection({
  folder, threads, folders, activeId,
  onSelect, onRename, onDelete, onMove, onRenameFolder, onDeleteFolder,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const commit = () => { onRenameFolder(folder.id, draft); setEditing(false); };

  return (
    <div className="flex flex-col" style={{ gap: 2 }}>
      {editing ? (
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
            style={{ fontSize: 12.5, minHeight: 30, padding: '4px 12px' }}
            aria-label="Folder name"
          />
          <button type="button" className="btn btn-ghost" style={{ padding: 4 }} onClick={commit} aria-label="Save folder name">
            <Check size={14} />
          </button>
          <button type="button" className="btn btn-ghost" style={{ padding: 4 }} onClick={() => setEditing(false)} aria-label="Cancel">
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1" style={{ padding: '2px 2px 0' }}>
          <span
            className="flex items-center gap-[6px]"
            style={{
              flex: 1, fontSize: 11.5, fontWeight: 600, letterSpacing: '.04em',
              textTransform: 'uppercase', color: 'var(--text-muted)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            <Folder size={12} aria-hidden="true" style={{ flex: 'none' }} /> {folder.name}
          </span>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ padding: 3 }}
            onClick={() => { setDraft(folder.name || ''); setEditing(true); }}
            aria-label={`Rename folder ${folder.name}`}
          >
            <Pencil size={12} />
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ padding: 3 }}
            onClick={() => onDeleteFolder(folder.id)}
            aria-label={`Delete folder ${folder.name}. Its chats are kept.`}
            title="Delete folder (chats are kept)"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}

      {threads.length === 0 ? (
        <span className="text-quiet" style={{ fontSize: 12, padding: '2px 10px 4px' }}>Empty</span>
      ) : (
        threads.map((t) => (
          <ThreadRow
            key={t.id}
            thread={t}
            active={t.id === activeId}
            folders={folders}
            onSelect={onSelect}
            onRename={onRename}
            onDelete={onDelete}
            onMove={onMove}
          />
        ))
      )}
    </div>
  );
}