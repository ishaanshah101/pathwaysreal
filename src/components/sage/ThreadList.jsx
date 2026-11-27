import React, { useState } from 'react';
import { Plus, FolderPlus, Archive, ChevronDown, ChevronRight, Check, X, Search } from 'lucide-react';
import ThreadRow from '@/components/sage/ThreadRow';
import FolderSection from '@/components/sage/FolderSection';
import Icon from '@/components/kit/Icon';

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

  const rowProps = { folders, onSelect, onRename, onDelete, onMove, onArchive };

  return (
    <aside className="duo-side" aria-label="Your chats with Sage">
      <div className="side-action">
        <button type="button" className="btn btn-primary btn-block" onClick={onNew}>
          <Icon as={Plus} size={16} /> New chat
        </button>
      </div>

      <div className="side-search">
        <Icon as={Search} size={16} />
        <input
          type="search"
          placeholder="Search chats"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape') setQuery(''); }}
          aria-label="Search chats by keyword"
        />
        {query && (
          <button type="button" className="mini-tool" onClick={() => setQuery('')} aria-label="Clear search">
            <Icon as={X} size={15} />
          </button>
        )}
      </div>

      <div className="side-scroll">
        <div className="side-label">
          <span>{q ? 'Search results' : 'Your chats'}</span>
          <button
            type="button"
            className="tool-btn"
            onClick={() => setAddingFolder(true)}
            aria-label="New folder"
            title="New folder"
          >
            <Icon as={FolderPlus} size={15} /> Folder
          </button>
        </div>

        {addingFolder && (
          <div className="inline-edit">
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
              aria-label="New folder name"
            />
            <button type="button" className="mini-tool" onClick={commitFolder} aria-label="Create folder">
              <Icon as={Check} size={16} />
            </button>
            <button type="button" className="mini-tool" onClick={() => setAddingFolder(false)} aria-label="Cancel">
              <Icon as={X} size={16} />
            </button>
          </div>
        )}

        {loading ? (
          <p className="side-empty" role="status">Loading your chats…</p>
        ) : q ? (
          results.length === 0 ? (
            <p className="side-empty">No chats match “{query.trim()}”. Search looks at chat names.</p>
          ) : (
            results.map((t) => (
              <ThreadRow key={t.id} thread={t} active={t.id === activeId} {...rowProps} />
            ))
          )
        ) : threads.length === 0 && folders.length === 0 ? (
          <p className="side-empty">
            Nothing yet. Your first question starts a chat, and it gets saved here.
          </p>
        ) : (
          <>
            {unfiled.map((t) => (
              <ThreadRow key={t.id} thread={t} active={t.id === activeId} {...rowProps} />
            ))}

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

            {archived.length > 0 && (
              <>
                <div className="side-label">
                  <button
                    type="button"
                    className="side-label-btn"
                    onClick={() => setShowArchived((s) => !s)}
                    aria-expanded={showArchived}
                  >
                    <Icon as={showArchived ? ChevronDown : ChevronRight} size={13} />
                    <Icon as={Archive} size={13} /> Archived ({archived.length})
                  </button>
                </div>
                {showArchived && archived.map((t) => (
                  <ThreadRow key={t.id} thread={t} active={t.id === activeId} {...rowProps} />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
