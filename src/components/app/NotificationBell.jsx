import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, UserPlus, Check, X } from 'lucide-react';
import { useNotifications } from '@/lib/useNotifications';

const ICONS = {
  connection_request: UserPlus,
  connection_accepted: Check,
  connection_declined: X,
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
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
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
        onClick={() => setOpen((o) => !o)}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        className="flex items-center justify-center"
        style={{
          width: 34, height: 34, borderRadius: 999, cursor: 'pointer', position: 'relative',
          border: '1px solid var(--color-border-strong)', background: 'var(--color-surface)',
        }}
      >
        <Bell size={16} strokeWidth={2.2} />
        {unreadCount > 0 && (
          <span
            className="flex items-center justify-center"
            style={{
              position: 'absolute', top: -4, right: -4, minWidth: 17, height: 17,
              padding: '0 4px', borderRadius: 999, background: '#e5484d', boxShadow: '0 0 0 2px var(--color-bg)',
              color: '#fff', fontSize: 10.5, fontWeight: 700, lineHeight: 1,
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="card elev-lg anim-fade-swap"
          style={{
            position: 'absolute', right: 0, top: 42, width: 320, maxHeight: 400,
            overflowY: 'auto', padding: 8, gap: 2, borderRadius: 16, zIndex: 40,
          }}
        >
          <div className="flex items-center gap-2" style={{ padding: '6px 10px 8px' }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                style={{
                  marginLeft: 'auto', background: 'none', border: 0, cursor: 'pointer',
                  font: 'inherit', fontSize: 12, color: 'var(--color-accent-700)',
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <span style={{ fontSize: 13, color: 'var(--text-subtle)', padding: '8px 10px 12px', lineHeight: 1.55 }}>
              Nothing yet. Connection requests and acceptances show up here.
            </span>
          ) : (
            notifications.map((n) => {
              const Icon = ICONS[n.type] || Bell;
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => openItem(n)}
                  className="flex items-start gap-[10px] text-left"
                  style={{
                    padding: '10px 10px', borderRadius: 14, cursor: 'pointer', border: 0,
                    font: 'inherit', width: '100%',
                    background: n.read ? 'transparent' : 'var(--color-accent-100)',
                  }}
                >
                  <span
                    className="flex items-center justify-center"
                    style={{
                      width: 26, height: 26, borderRadius: 999, flex: 'none', marginTop: 1,
                      background: 'var(--color-accent-2-200)', color: 'var(--color-accent-2-800)',
                    }}
                  >
                    <Icon size={14} strokeWidth={2.2} />
                  </span>
                  <span className="flex flex-col" style={{ gap: 2, minWidth: 0 }}>
                    <span style={{ fontSize: 13.5, lineHeight: 1.45, fontWeight: n.read ? 400 : 600 }}>
                      {n.body}
                    </span>
                    <span style={{ fontSize: 11.5, color: 'var(--text-subtle)' }}>
                      {timeAgo(n.occurred_at || n.created_date)}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
