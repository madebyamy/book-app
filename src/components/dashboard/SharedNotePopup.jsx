import React from 'react';
import { BRAND, FONT } from '../../constants.js';
import { markNotesSeen } from '../../lib/sharedNotes.js';

const TAG_COLORS = {
  observation: "#5a7a9a", question: "#9a6a3f", character: "#3E7C57",
  theme: "#7a5a9a", reaction: "#BF755A", connection: "#3a6ea5",
};

export function SharedNotePopup({ userId, bookId, notes, onClose }) {
  const handleClose = () => {
    markNotesSeen(userId, bookId, notes.map(n => n.id));
    onClose();
  };

  if (!notes || notes.length === 0) return null;

  return (
    <div
      onClick={handleClose}
      style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(20,15,15,.6)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: 'min(480px,100%)', background: BRAND.paper, borderRadius: 8, border: `1px solid ${BRAND.line}`, boxShadow: '0 20px 50px rgba(20,30,50,.22)', overflow: 'hidden', animation: 'cc-pop .26s cubic-bezier(.16,1,.3,1)' }}
      >
        {/* Header */}
        <div style={{ background: BRAND.espresso, padding: '18px 22px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontFamily: FONT.body, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: BRAND.tan, marginBottom: 3 }}>
              {notes.length === 1 ? 'A reader left a note' : `${notes.length} reader notes unlocked`}
            </div>
            <div style={{ fontFamily: FONT.display, fontSize: 20, fontWeight: 600, color: BRAND.cream, lineHeight: 1.1 }}>
              📝 Notes from your reading circle
            </div>
          </div>
          <button onClick={handleClose} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(242,239,235,.2)', background: 'rgba(242,239,235,.07)', color: 'rgba(242,239,235,.5)', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
        </div>

        {/* Notes */}
        <div style={{ maxHeight: 380, overflowY: 'auto' }}>
          {notes.map((n, i) => (
            <div key={n.id} style={{ padding: '16px 22px', borderBottom: i < notes.length - 1 ? `1px solid ${BRAND.line}` : 'none', borderLeft: n.tag ? `3px solid ${TAG_COLORS[n.tag] || BRAND.line}` : `3px solid ${BRAND.line}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: BRAND.terracotta, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.body, fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                  {(n.authorName || '?')[0].toUpperCase()}
                </div>
                <div>
                  <span style={{ fontFamily: FONT.body, fontSize: 13, fontWeight: 500, color: BRAND.ink }}>{n.authorName}</span>
                  {n.page && <span style={{ fontFamily: FONT.body, fontSize: 11, color: BRAND.muted, marginLeft: 8 }}>· page {n.page}</span>}
                </div>
                {n.tag && (
                  <span style={{ marginLeft: 'auto', fontFamily: FONT.body, fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase', color: '#fff', background: TAG_COLORS[n.tag] || BRAND.muted, padding: '2px 8px', borderRadius: 99 }}>
                    {n.tag}
                  </span>
                )}
              </div>
              <p style={{ fontFamily: FONT.read, fontSize: 14, lineHeight: 1.65, color: BRAND.ink, margin: 0 }}>{n.text}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 22px', borderTop: `1px solid ${BRAND.line}`, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleClose} style={{ fontFamily: FONT.body, fontSize: 13, fontWeight: 500, background: BRAND.espresso, border: 'none', color: BRAND.cream, padding: '10px 22px', borderRadius: 4, cursor: 'pointer' }}>
            Continue reading
          </button>
        </div>
      </div>
    </div>
  );
}
