import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';

// The conversation sidebar: start a new chat, switch between chats, rename one
// in place, or delete it. Rename is inline because a modal for one text field
// is more ceremony than the action deserves.
export default function ThreadList({
  threads, activeId, onSelect, onNew, onRename, onDelete, loading,
}) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState('');

  const startEdit = (t) => { setEditingId(t.id); setDraft(t.title || ''); };
  const commit = () => { if (editingId) onRename(editingId, draft); setEditingId(null); };

  return (
    <aside
      className="card elev-sm"
      style={{ padding: 14, gap: 10, borderRadius: 24, alignSelf: 'start', position: 'sticky', top: 14 }}
    >
      <button type="button" className="btn btn-primary btn-block" style={{ fontSize: 13.5 }} onClick={onNew}>
        <Plus size={15} aria-hidden="true" /> New chat
      </button>

      <span className="card-kicker">Your chats</span>

      {loading ? (
        <span className="text-quiet" style={{ fontSize: 13 }}>Loading…</span>
      ) : threads.length === 0 ? (
        <span className="text-quiet" style={{ fontSize: 13, lineHeight: 1.5 }}>
          Nothing yet. Your first question starts a chat, and it gets saved here.
        </span>
      ) : (
        <div className="flex flex-col" style={{ gap: 4 }}>
          {threads.map((t) => {
            const on = t.id === activeId;
            if (editingId === t.id) {
              return (
                <div key={t.id} className="flex items-center gap-1">
                  <input
                    className="input"
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); commit(); }
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    style={{ fontSize: 13, minHeight: 32, padding: '4px 12px' }}
                    aria-label="Chat name"
                  />
                  <button type="button" className="btn btn-ghost" style={{ padding: 4 }} onClick={commit} aria-label="Save name">
                    <Check size={15} />
                  </button>
                  <button type="button" className="btn btn-ghost" style={{ padding: 4 }} onClick={() => setEditingId(null)} aria-label="Cancel">
                    <X size={15} />
                  </button>
                </div>
              );
            }
            return (
              <div
                key={t.id}
                className="flex items-center gap-1"
                style={{
                  borderRadius: 14,
                  background: on ? 'var(--color-accent-200)' : 'transparent',
                  padding: '2px 4px 2px 2px',
                }}
              >
                <button
                  type="button"
                  onClick={() => onSelect(t.id)}
                  aria-current={on ? 'true' : undefined}
                  style={{
                    flex: 1, textAlign: 'left', background: 'none', border: 0, cursor: 'pointer',
                    font: 'inherit', fontSize: 13.5, padding: '8px 10px', borderRadius: 12,
                    color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}
                >
                  {t.title || 'New chat'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ padding: 4 }}
                  onClick={() => startEdit(t)}
                  aria-label={`Rename ${t.title || 'chat'}`}
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ padding: 4, color: 'var(--color-danger)' }}
                  onClick={() => onDelete(t.id)}
                  aria-label={`Delete ${t.title || 'chat'}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}