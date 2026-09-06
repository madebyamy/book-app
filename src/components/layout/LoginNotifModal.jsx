import React, { useState, useEffect } from 'react';
import { BRAND, FONT, USERS } from '../../constants.js';
import { storage } from '../../storage.js';
import { getUnreadCounts } from '../../lib/chat.js';

const SEEN_KEY = (uid) => `loginNotif:seen:${uid}`;
const RECS_SEEN_KEY = (uid) => `notif:recsSeen:${uid}`;

function getRecsSeen(uid) {
  try { return parseInt(localStorage.getItem(RECS_SEEN_KEY(uid)) || '0', 10); } catch { return 0; }
}
function saveRecsSeen(uid, ts) {
  try { localStorage.setItem(RECS_SEEN_KEY(uid), String(ts)); } catch {}
}

export function LoginNotifModal({ userId, friends, onClose }) {
  const [items, setItems] = useState(null); // null = loading

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const results = [];
      const recsSeen = getRecsSeen(userId);

      // Unread chats
      try {
        const unread = await getUnreadCounts(userId, friends);
        unread.forEach(({ label, unread: count }) => {
          results.push({ type: 'chat', icon: '💬', title: label === 'Group' ? 'Group chat' : `Chat with ${label}`, body: `${count} new message${count > 1 ? 's' : ''}` });
        });
      } catch {}

      // New recommendations
      try {
        for (const friend of (friends || [])) {
          const res = await storage.get(`${friend.id}:recommendations`);
          const recs = res ? JSON.parse(res.value) : [];
          const newRecs = recs.filter(r => r.to?.includes(userId) && r.sentAt > recsSeen);
          newRecs.forEach(r => {
            results.push({ type: 'rec', icon: '📚', title: `${USERS[friend.id]?.name || friend.name} recommended a book`, body: r.bookTitle });
          });
        }
      } catch {}

      if (!cancelled) setItems(results);
    }
    load();
    return () => { cancelled = true; };
  }, [userId, friends]);

  const handleDismiss = () => {
    saveRecsSeen(userId, Date.now());
    try { sessionStorage.setItem(SEEN_KEY(userId), '1'); } catch {}
    onClose();
  };

  // Don't render while loading or if nothing to show
  if (items === null) return null;
  if (items.length === 0) {
    // Nothing new — close silently
    handleDismiss();
    return null;
  }

  return (
    <div
      onClick={handleDismiss}
      style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(38,32,32,.55)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: 'min(460px,100%)', background: BRAND.espresso, borderRadius: 10, border: '1px solid rgba(217,162,130,.2)', boxShadow: '0 20px 60px rgba(0,0,0,.5)', overflow: 'hidden', animation: 'cc-pop .28s cubic-bezier(.16,1,.3,1)' }}
      >
        {/* Header */}
        <div style={{ padding: '22px 24px 16px', borderBottom: '1px solid rgba(217,162,130,.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: BRAND.tan, marginBottom: 4 }}>While you were away</div>
            <div style={{ fontFamily: FONT.display, fontSize: 22, fontWeight: 600, color: BRAND.cream, lineHeight: 1.1 }}>You have updates</div>
          </div>
          <button onClick={handleDismiss} aria-label="Dismiss" style={{ flexShrink: 0, width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(217,162,130,.2)', background: 'rgba(242,239,235,.06)', color: 'rgba(242,239,235,.6)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Items */}
        <div style={{ maxHeight: 340, overflowY: 'auto' }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 20px', borderBottom: i < items.length - 1 ? '1px solid rgba(217,162,130,.08)' : 'none' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: item.type === 'chat' ? 'rgba(122,154,106,.22)' : 'rgba(194,163,94,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                {item.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: FONT.body, fontSize: 14, fontWeight: 500, color: BRAND.cream, marginBottom: 2 }}>{item.title}</div>
                <div style={{ fontFamily: FONT.body, fontSize: 13, color: 'rgba(242,239,235,.55)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(217,162,130,.12)', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleDismiss} style={{ fontFamily: FONT.body, fontSize: 13, letterSpacing: '.04em', background: BRAND.coral, border: 'none', color: '#fff', padding: '10px 22px', borderRadius: 4, cursor: 'pointer', fontWeight: 500 }}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
