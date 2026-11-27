import React, { useState } from 'react';
import { Folder, Pencil, Trash2, Check, X } from 'lucide-react';
import ThreadRow from '@/components/sage/ThreadRow';
import Icon from '@/components/kit/Icon';

// One folder in the sidebar: its name, inline rename, delete, and the chats
// filed inside it. Deleting a folder keeps its chats, they just come unfiled.
export default function FolderSection({
  folder, threads, folders, activeId,
  onSelect, onRename, onDelete, onMove, onArchive, onRenameFolder, onDeleteFolder,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const commit = () => { onRenameFolder(folder.id, draft); setEditing(false); };

  return (
    <section aria-label={`Folder ${folder.name}`}>
      {editing ? (
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
            aria-label="Folder name"
          />
          <button type="button" className="mini-tool" onClick={commit} aria-label="Save folder name">
            <Icon as={Check} size={16} />
          </button>
          <button type="button" className="mini-tool" onClick={() => setEditing(false)} aria-label="Cancel">
            <Icon as={X} size={16} />
          </button>
        </div>
      ) : (
        <div className="side-label">
          <span><Icon as={Folder} size={13} /> {folder.name}</span>
          <button
            type="button"
            className="mini-tool"
            onClick={() => { setDraft(folder.name || ''); setEditing(true); }}
            aria-label={`Rename folder ${folder.name}`}
          >
            <Icon as={Pencil} size={14} />
          </button>
          <button
            type="button"
            className="mini-tool"
            onClick={() => onDeleteFolder(folder.id)}
            aria-label={`Delete folder ${folder.name}. Its chats are kept.`}
            title="Delete folder (chats are kept)"
          >
            <Icon as={Trash2} size={14} />
          </button>
        </div>
      )}

      <div className="folder-body">
        {threads.length === 0 ? (
          <span className="meta folder-empty">Empty. Move a chat here from its menu.</span>
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
              onArchive={onArchive}
            />
          ))
        )}
      </div>
    </section>
  );
}
