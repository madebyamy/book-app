import React, { useState, useEffect, useRef } from 'react';
import { BRAND, FONT, USERS } from '../../constants.js';
import { storage } from '../../storage.js';
import { getUnreadCounts } from '../../lib/chat.js';

const DISMISSED_KEY = (uid) => `notif:dismissed:${uid}`;
const RECS_SEEN_KEY = (uid) => `notif:recsSeen:${uid}`;

function getDismissed(uid) {
  try { return new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY(uid)) || '[]')); } catch { return new Set(); }
}
function saveDismissed(uid, set) {
  try { localStorage.setItem(DISMISSED_KEY(uid), JSON.stringify([...set])); } catch {}
}
function getRecsSeen(uid) {
  try { return parseInt(localStorage.getItem(RECS_SEEN_KEY(uid)) || '0', 10); } catch { return 0; }
}
function saveRecsSeen(uid, ts) {
  try { localStorage.setItem(RECS_SEEN_KEY(uid), String(ts)); } catch {}
}

export function NotificationCenter({ userId, friends }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [dismissed, setDismissed] = useState(() => getDismissed(userId));
  const panelRef = useRef(null);

  const buildNotifications = async () => {
    const notifs = [];

    // 1. Unread chat messages
    try {
      const unreadConvs = await getUnreadCounts(userId, friends);
      unreadConvs.forEach(({ key, label, unread }) => {
        notifs.push({
          id: `chat:${key}`,
          type: 'chat',
          icon: '💬',
          title: label === 'Group' ? 'Group chat' : label,
          body: `${unread} unread message${unread > 1 ? 's' : ''}`,
          ts: Date.now(),
        });
      });
    } catch {}

    // 2. New received recommendations
    try {
      const recsSeen = getRecsSeen(userId);
      for (const friend of (friends || [])) {
        const res = await storage.get(`${friend.id}:recommendations`);
        const recs = res ? JSON.parse(res.value) : [];
        const newRecs = recs.filter(r => r.to?.includes(userId) && r.sentAt > recsSeen);
        newRecs.forEach(r => {
          notifs.push({
            id: `rec:${r.id}`,
            type: 'rec',
            icon: '📚',
            title: `${USERS[friend.id]?.name || friend.name} recommended a book`,
            body: r.bookTitle,
            ts: r.sentAt,
          });
        });
      }
    } catch {}

    setNotifications(notifs);
  };

  useEffect(() => {
    buildNotifications();
    const interval = setInterval(buildNotifications, 15000);
    return () => clearInterval(interval);
  }, [userId, friends]);

  // Close panel on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const visible = notifications.filter(n => !dismissed.has(n.id));
  const count = visible.length;

  const dismiss = (id) => {
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    saveDismissed(userId, next);
    // If it's a rec, mark recs as seen up to now
    if (id.startsWith('rec:')) saveRecsSeen(userId, Date.now());
  };

  const dismissAll = () => {
    const next = new Set([...dismissed, ...notifications.map(n => n.id)]);
    setDismissed(next);
    saveDismissed(userId, next);
    saveRecsSeen(userId, Date.now());
    setOpen(false);
  };

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
        style={{ background: open ? 'rgba(242,92,92,.15)' : 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', transition: 'background .15s' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={count > 0 ? BRAND.coral : 'rgba(242,239,235,.55)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {count > 0 && (
          <span style={{ position: 'absolute', top: 2, right: 2, background: BRAND.coral, color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.body }}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'fixed', top: 58, right: 12, zIndex: 200, width: 310,
          background: BRAND.espresso, border: '1px solid rgba(217,162,130,.2)',
          borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,.4)',
          overflow: 'hidden',
        }}>
          {/* Panel header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(217,162,130,.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: FONT.body, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: BRAND.tan }}>Notifications</span>
            {visible.length > 0 && (
              <button onClick={dismissAll} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT.body, fontSize: 11, color: 'rgba(242,239,235,.4)', letterSpacing: '0.04em' }}>
                Clear all
              </button>
            )}
          </div>

          {/* Notification list */}
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {visible.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', fontFamily: FONT.body, fontSize: 13, color: 'rgba(242,239,235,.3)', fontStyle: 'italic' }}>
                You're all caught up
              </div>
            ) : (
              visible.map(n => (
                <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderBottom: '1px solid rgba(217,162,130,.08)', background: 'rgba(242,239,235,.03)' }}>
                  {/* Icon */}
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: n.type === 'chat' ? 'rgba(122,154,106,.2)' : 'rgba(194,163,94,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                    {n.icon}
                  </div>
                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: FONT.body, fontSize: 13, fontWeight: 500, color: BRAND.cream, marginBottom: 2 }}>{n.title}</div>
                    <div style={{ fontFamily: FONT.body, fontSize: 12, color: 'rgba(242,239,235,.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.body}</div>
                  </div>
                  {/* Dismiss */}
                  <button onClick={() => dismiss(n.id)} aria-label="Dismiss" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(242,239,235,.3)', fontSize: 16, padding: '0 2px', lineHeight: 1, flexShrink: 0, transition: 'color .15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = BRAND.coral}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(242,239,235,.3)'}>
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
