import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, UserPlus, Check, X } from 'lucide-react';
import { useNotifications } from '@/lib/useNotifications';
import Icon from '@/components/kit/Icon';

const ICONS = {
  connection_request: [UserPlus, 'picto-blue'],
  connection_accepted: [Check, 'picto-green'],
  connection_declined: [X, 'picto-ink'],
};

function timeAgo(iso) {
  if (!iso) return '';
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString();
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // Clicking anywhere else closes it, which is what people expect from a bell
  // and stops the panel sitting open behind a navigation.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const openItem = (n) => {
    if (!n.read) markRead(n.id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        className="icon-btn"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
      >
        <Icon as={Bell} size={18} />
        {unreadCount > 0 && <span className="count" aria-hidden="true">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <div
          className="popover"
          style={{ position: 'absolute', right: 0, top: 48, width: 'min(340px, calc(100vw - 32px))', maxHeight: 420, overflowY: 'auto', zIndex: 40 }}
        >
          <div className="panel-head" style={{ justifyContent: 'space-between' }}>
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button type="button" className="link-btn" style={{ fontFamily: 'var(--font-sign)', fontSize: 13, fontWeight: 700, letterSpacing: 0, textTransform: 'none' }} onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p style={{ margin: 0, padding: '16px 14px 18px', fontSize: 14.5, lineHeight: 1.5, color: 'var(--ink-2)' }}>
              Nothing yet. Connection requests and acceptances show up here.
            </p>
          ) : (
            <div style={{ padding: 6 }}>
              {notifications.map((n) => {
                const [Glyph, tone] = ICONS[n.type] || [Bell, 'picto-ink'];
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => openItem(n)}
                    className="menu-item"
                    style={{ alignItems: 'flex-start', background: n.read ? undefined : 'var(--sun-wash)' }}
                  >
                    <span className={`picto ${tone}`} style={{ width: 28, height: 28 }}><Icon as={Glyph} size={15} /></span>
                    <span style={{ minWidth: 0, display: 'grid', gap: 3 }}>
                      <span style={{ fontSize: 14.5, lineHeight: 1.4, fontWeight: n.read ? 500 : 800 }}>{n.body}</span>
                      <span className="meta">{timeAgo(n.occurred_at || n.created_date)}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
