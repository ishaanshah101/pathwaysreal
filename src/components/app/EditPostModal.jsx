import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CATEGORY_LABELS } from '@/lib/useProfile';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Admin-only editing of any post. The Post entity's update rule already lets
// an admin write any row, so this saves directly.
export default function EditPostModal({ open, onOpenChange, post, onSaved }) {
  const [form, setForm] = useState({ title: '', body: '', category: 'general' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && post) {
      setForm({ title: post.title || '', body: post.body || '', category: post.category || 'general' });
      setError('');
    }
  }, [open, post]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    setSaving(true);
    setError('');
    try {
      await base44.entities.Post.update(post.id, {
        title: form.title.trim(),
        body: form.body.trim(),
        category: form.category,
      });
      onOpenChange(false);
      if (onSaved) await onSaved();
    } catch {
      setError('Could not save the changes. Please try again.');
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ background: 'var(--color-surface)', borderRadius: 24, maxWidth: 560 }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'var(--font-heading)', fontSize: 21 }}>Edit post</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col" style={{ gap: 14 }}>
          <div className="field">
            <label htmlFor="ep-title">Title</label>
            <input
              id="ep-title" className="input" required value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="ep-cat">Topic</label>
            <select
              id="ep-cat" className="input" value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="ep-body">Post</label>
            <textarea
              id="ep-body" className="input" style={{ minHeight: 160 }} required value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </div>
          {error && <span style={{ fontSize: 13, color: 'var(--color-accent-700)' }}>{error}</span>}
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => onOpenChange(false)}>Cancel</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}