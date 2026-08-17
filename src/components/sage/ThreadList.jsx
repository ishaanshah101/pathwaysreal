import React, { useState } from 'react';
import { Plus, FolderPlus, Check, X } from 'lucide-react';
import ThreadRow from '@/components/sage/ThreadRow';
import FolderSection from '@/components/sage/FolderSection';

// The conversation sidebar: start a new chat, switch between chats, rename one
// in place, delete it, and organise chats into folders so an essay project and
// a college list do not live in one undifferentiated pile.
export default function ThreadList({
  threads, folders, activeId, onSelect, onNew, onRename, onDelete, onMove,
  onCreateFolder, onRenameFolder, onDeleteFolder, loading,
}) {
  const [addingFolder, setAddingFolder] = useState(false);
  const [folderDraft, setFolderDraft] = useState('');

  const commitFolder = () => {
    const name = folderDraft.trim();
    if (name) onCreateFolder(name);
    setFolderDraft('');
    setAddingFolder(false);
  };

  const unfiled = threads.filter((t) => !t.folder_id || !folders.some((f) => f.id === t.folder_id));

  return (
    <aside
      className="card elev-sm"
      style={{ padding: 14, gap: 10, borderRadius: 24, alignSelf: 'start', position: 'sticky', top: 14 }}
    >
      <button type="button" className="btn btn-primary btn-block" style={{ fontSize: 13.5 }} onClick={onNew}>
        <Plus size={15} aria-hidden="true" /> New chat
      </button>

      <div className="flex items-center">
        <span className="card-kicker">Your chats</span>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ padding: 4, marginLeft: 'auto' }}
          onClick={() => setAddingFolder(true)}
          aria-label="New folder"
          title="New folder"
        >
          <FolderPlus size={15} />
        </button>
      </div>

      {addingFolder && (
        <div className="flex items-center gap-1">
          <input
            className="input"
            autoFocus
            placeholder="Folder name"
            value={folderDraft}
            onChange={(e) => setFolderDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); commitFolder(); }
              if (e.key === 'Escape') setAddingFolder(false);
            }}
            style={{ fontSize: 13, minHeight: 32, padding: '4px 12px' }}
            aria-label="New folder name"
          />
          <button type="button" className="btn btn-ghost" style={{ padding: 4 }} onClick={commitFolder} aria-label="Create folder">
            <Check size={15} />
          </button>
          <button type="button" className="btn btn-ghost" style={{ padding: 4 }} onClick={() => setAddingFolder(false)} aria-label="Cancel">
            <X size={15} />
          </button>
        </div>
      )}

      {loading ? (
        <span className="text-quiet" style={{ fontSize: 13 }}>Loading…</span>
      ) : threads.length === 0 && folders.length === 0 ? (
        <span className="text-quiet" style={{ fontSize: 13, lineHeight: 1.5 }}>
          Nothing yet. Your first question starts a chat, and it gets saved here.
        </span>
      ) : (
        <div className="flex flex-col" style={{ gap: 10 }}>
          {folders.map((f) => (
            <FolderSection
              key={f.id}
              folder={f}
              folders={folders}
              threads={threads.filter((t) => t.folder_id === f.id)}
              activeId={activeId}
              onSelect={onSelect}
              onRename={onRename}
              onDelete={onDelete}
              onMove={onMove}
              onRenameFolder={onRenameFolder}
              onDeleteFolder={onDeleteFolder}
            />
          ))}

          {unfiled.length > 0 && (
            <div className="flex flex-col" style={{ gap: 4 }}>
              {unfiled.map((t) => (
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
              ))}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}