import React, { useState, useEffect } from 'react';
import { BRAND, FONT } from '../../constants.js';
import { loadBooks, loadStatus } from '../../lib/books.js';
import { TooltipIcon } from '../common/TooltipIcon.jsx';

function FriendReadingCard({ friend, tooltipText }) {
  const [currentlyReading, setCurrentlyReading] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const unifiedBooks = await loadBooks(friend.id);
      const staticBooks = friend.books || [];
      const unifiedIds = new Set(unifiedBooks.map((b) => b.id));
      const allBooks = [...staticBooks.filter((b) => !unifiedIds.has(b.id)), ...unifiedBooks];
      const withStatus = await Promise.all(
        allBooks.map(async (b) => ({ ...b, status: await loadStatus(friend.id, b.id) }))
      );
      if (!active) return;
      const seen = new Set();
      setCurrentlyReading(withStatus.filter((b) => {
        if (b.status !== "reading" || seen.has(b.id)) return false;
        seen.add(b.id); return true;
      }));
      setLoaded(true);
    })();
    return () => { active = false; };
  }, [friend.id]);

  if (!loaded) return null;

  return (
    <div style={{ width: "100%", background: "rgba(255,255,255,.04)", border: `1px solid rgba(217,162,130,.18)`, borderLeft: `3px solid ${friend.accent}`, borderRadius: 4, padding: "clamp(16px,2vw,22px)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: friend.accent, display: "flex", alignItems: "center", gap: 6 }}>
          {friend.name} is reading <TooltipIcon text={tooltipText} color={friend.accent} />
        </div>
      </div>
      {currentlyReading.length === 0 ? (
        <p style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 15, color: "rgba(242,239,235,.55)", margin: 0 }}>
          {friend.name} hasn't started anything yet.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {currentlyReading.map((book) => (
            <div key={book.id} style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {book.cover
                ? <img src={book.cover} alt={book.title} style={{ width: 36, height: 52, objectFit: "cover", borderRadius: 2, flexShrink: 0, boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }} onError={(e) => { e.target.style.display = "none"; }} />
                : <div style={{ width: 36, height: 52, background: friend.accent, borderRadius: 2, flexShrink: 0, boxShadow: "inset -5px 0 0 rgba(0,0,0,.14)" }} />}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 17, color: BRAND.cream, lineHeight: 1.15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{book.title}</div>
                <div style={{ fontFamily: FONT.body, fontWeight: 300, fontSize: 13, color: BRAND.tan, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{book.author}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function FriendReading({ friends, tooltipText }) {
  if (!friends || friends.length === 0) return null;
  return (
    <>
      {friends.map((f) => <FriendReadingCard key={f.id} friend={f} tooltipText={tooltipText} />)}
    </>
  );
}
