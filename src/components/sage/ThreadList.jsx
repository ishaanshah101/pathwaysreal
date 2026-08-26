import React, { useState } from 'react';
import { Plus, FolderPlus, Archive, ChevronDown, ChevronRight, Check, X, Search } from 'lucide-react';
import ThreadRow from '@/components/sage/ThreadRow';
import FolderSection from '@/components/sage/FolderSection';

// The conversation sidebar: start a new chat, switch between chats, rename one
// in place, delete it, and organise chats into folders so an essay project and
// a college list do not live in one undifferentiated pile.
export default function ThreadList({
  threads, folders, activeId, onSelect, onNew, onRename, onDelete, onMove, onArchive,
  onCreateFolder, onRenameFolder, onDeleteFolder, loading,
}) {
  const [addingFolder, setAddingFolder] = useState(false);
  const [folderDraft, setFolderDraft] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [query, setQuery] = useState('');

  const commitFolder = () => {
    const name = folderDraft.trim();
    if (name) onCreateFolder(name);
    setFolderDraft('');
    setAddingFolder(false);
  };

  const live = threads.filter((t) => !t.archived);
  const archived = threads.filter((t) => t.archived);
  const unfiled = live.filter((t) => !t.folder_id || !folders.some((f) => f.id === t.folder_id));

  // Search cuts across folders and the archive, so an older chat is findable
  // no matter where it was filed.
  const q = query.trim().toLowerCase();
  const results = q ? threads.filter((t) => (t.title || 'New chat').toLowerCase().includes(q)) : [];

  return (
    <aside
      className="card elev-sm"
      style={{ padding: 14, gap: 10, borderRadius: 24, alignSelf: 'start', position: 'sticky', top: 14 }}
    >
      <button type="button" className="btn btn-primary btn-block" style={{ fontSize: 13.5 }} onClick={onNew}>
        <Plus size={15} aria-hidden="true" /> New chat
      </button>

      <div className="flex items-center gap-1" style={{ position: 'relative' }}>
        <Search
          size={13}
          aria-hidden="true"
          style={{ position: 'absolute', left: 11, color: 'var(--text-subtle)', pointerEvents: 'none' }}
        />
        <input
          className="input"
          type="search"
          placeholder="Search chats"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape') setQuery(''); }}
          style={{ fontSize: 13, minHeight: 32, padding: '4px 10px 4px 30px' }}
          aria-label="Search chats by keyword"
        />
        {query && (
          <button type="button" className="btn btn-ghost" style={{ padding: 4 }} onClick={() => setQuery('')} aria-label="Clear search">
            <X size={14} />
          </button>
        )}
      </div>

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
      ) : q ? (
        results.length === 0 ? (
          <span className="text-quiet" style={{ fontSize: 13, lineHeight: 1.5 }}>
            No chats match "{query.trim()}".
          </span>
        ) : (
          <div className="flex flex-col" style={{ gap: 4 }}>
            {results.map((t) => (
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
            ))}
          </div>
        )
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
              threads={live.filter((t) => t.folder_id === f.id)}
              activeId={activeId}
              onSelect={onSelect}
              onRename={onRename}
              onDelete={onDelete}
              onMove={onMove}
              onArchive={onArchive}
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
                  onArchive={onArchive}
                />
              ))}
            </div>
          )}

          {archived.length > 0 && (
            <div className="flex flex-col" style={{ gap: 2 }}>
              <button
                type="button"
                onClick={() => setShowArchived((s) => !s)}
                aria-expanded={showArchived}
                className="flex items-center gap-[6px]"
                style={{
                  background: 'none', border: 0, cursor: 'pointer', font: 'inherit',
                  fontSize: 11.5, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase',
                  color: 'var(--text-subtle)', padding: '4px 2px', textAlign: 'left',
                }}
              >
                {showArchived ? <ChevronDown size={12} aria-hidden="true" /> : <ChevronRight size={12} aria-hidden="true" />}
                <Archive size={12} aria-hidden="true" /> Archived ({archived.length})
              </button>
              {showArchived && archived.map((t) => (
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
              ))}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}