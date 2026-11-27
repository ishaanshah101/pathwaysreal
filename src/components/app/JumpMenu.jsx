import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { Search } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/kit/Icon';
import { GLOSSARY, termId } from '@/data/glossary';

// One box that gets you anywhere: a section of the app, an action, or the
// meaning of a word. Opens with Cmd/Ctrl+K, with "/", or from the top bar.
//
// Glossary terms only appear once you start typing, so the menu opens as a
// short list of places to go instead of seventy definitions.
export default function JumpMenu({ open, onOpenChange, destinations = [], actions = [] }) {
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  useEffect(() => { if (!open) setQ(''); }, [open]);

  const terms = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (needle.length < 2) return [];
    return GLOSSARY.filter((t) => [t.term, ...(t.aka || [])].join(' ').toLowerCase().includes(needle)).slice(0, 6);
  }, [q]);

  const go = (to) => { onOpenChange(false); navigate(to); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="jump-dialog" aria-describedby={undefined} style={{ padding: 0, gap: 0, maxWidth: 560, top: '18%', transform: 'translate(-50%, 0)' }}>
        <DialogTitle className="sr-only">Jump to</DialogTitle>
        <Command label="Jump to" shouldFilter loop>
          <div className="jump-input">
            <Icon as={Search} size={18} />
            <Command.Input value={q} onValueChange={setQ} placeholder="Go to a page, or look up a word…" autoFocus />
          </div>
          <Command.List className="jump-list">
            <Command.Empty className="jump-empty">Nothing by that name. Try a section, or a term like “FAFSA”.</Command.Empty>

            <Command.Group heading="Go to">
              {destinations.map((d) => (
                <Command.Item key={d.to} value={`${d.label} ${d.keywords || ''}`} onSelect={() => go(d.to)} className="jump-item">
                  <span className={`picto picto-${d.tone}`} style={{ width: 26, height: 26 }}><Icon as={d.glyph} size={15} /></span>
                  {d.label}
                </Command.Item>
              ))}
            </Command.Group>

            {actions.length > 0 && (
              <Command.Group heading="Do">
                {actions.map((a) => (
                  <Command.Item key={a.label} value={`${a.label} ${a.keywords || ''}`} onSelect={() => go(a.to)} className="jump-item">
                    <span className={`picto picto-${a.tone}`} style={{ width: 26, height: 26 }}><Icon as={a.glyph} size={15} /></span>
                    {a.label}
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {terms.length > 0 && (
              <Command.Group heading="Glossary">
                {terms.map((t) => (
                  <Command.Item key={t.term} value={`${t.term} ${(t.aka || []).join(' ')}`} onSelect={() => go(`/glossary#${termId(t.term)}`)} className="jump-item jump-term">
                    <span>
                      <b>{t.term}</b>
                      <span>{t.def}</span>
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
