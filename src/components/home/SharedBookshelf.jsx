import React, { useState, useEffect } from 'react';
import { BRAND, FONT, USERS } from '../../constants.js';
import { loadBooks, loadStatus } from '../../lib/books.js';
import { TooltipIcon } from '../common/TooltipIcon.jsx';

export function SharedBookshelf({ viewerId, friends, tooltipText }) {
  const [sharedBooks, setSharedBooks] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const friendIds = (friends || []).map((f) => f.id);

  useEffect(() => {
    if (!viewerId || friendIds.length === 0) { setLoaded(true); return; }
    let active = true;
    (async () => {
      const participantIds = [viewerId, ...friendIds];

      const allUserBooks = await Promise.all(participantIds.map(async (uid) => {
        const unifiedBooks = await loadBooks(uid);
        const staticBooks = USERS[uid]?.books || [];
        const unifiedIds = new Set(unifiedBooks.map((b) => b.id));
        const allBooks = [...staticBooks.filter((b) => !unifiedIds.has(b.id)), ...unifiedBooks];
        const withStatus = await Promise.all(
          allBooks.map(async (b) => ({ ...b, status: await loadStatus(uid, b.id) }))
        );
        const seen = new Set();
        return withStatus.filter((b) => {
          if (b.status !== "read" || seen.has(b.id)) return false;
          seen.add(b.id); return true;
        });
      }));

      if (!active) return;

      const normalize = (str) => (str || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "");
      const viewerBooks = allUserBooks[0];
      const friendBooks = allUserBooks.slice(1);

      const friendTitleSets = friendBooks.map((fb) => new Set(fb.map((b) => normalize(b.title))));
      const readByFriend = (title) => friendTitleSets.some((s) => s.has(normalize(title)));

      const shared = viewerBooks
        .filter((b) => readByFriend(b.title))
        .map((b) => {
          const readers = friends.filter((f, i) => friendTitleSets[i]?.has(normalize(b.title)));
          return { id: b.id, title: b.title, author: b.author, cover: b.cover || null, accent: b.accent || BRAND.terracotta, readers };
        });

      setSharedBooks(shared);
      setLoaded(true);
    })();
    return () => { active = false; };
  }, [viewerId, friendIds.join(",")]);

  if (!loaded) return null;

  return (
    <div style={{ width: "100%", background: "rgba(255,255,255,.04)", border: "1px solid rgba(217,162,130,.18)", borderLeft: `3px solid ${BRAND.tan}`, borderRadius: 4, padding: "clamp(16px,2vw,22px)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: BRAND.tan, display: "flex", alignItems: "center", gap: 6 }}>
          Books we've both read <TooltipIcon text={tooltipText} color={BRAND.tan} />
        </div>
      </div>

      {sharedBooks.length === 0 ? (
        <p style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 15, color: "rgba(242,239,235,.55)", margin: 0 }}>
          No shared reads yet — mark a book as "read" in both libraries to see it here.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {sharedBooks.map((book) => (
            <div key={book.id} style={{ display: "flex", gap: "0.9rem", alignItems: "center" }}>
              {book.cover ? (
                <img src={book.cover} alt={book.title} style={{ width: 36, height: 52, objectFit: "cover", borderRadius: 2, flexShrink: 0, boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }} onError={(e) => { e.target.style.display = "none"; }} />
              ) : (
                <div style={{ width: 36, height: 52, background: book.accent, borderRadius: 2, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "0.9rem" }}>📗</span>
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 17, color: BRAND.cream, lineHeight: 1.15, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{book.title}</div>
                <div style={{ fontFamily: FONT.body, fontWeight: 300, fontSize: 13, color: BRAND.tan, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{book.author}</div>
                <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.3rem" }}>
                  {(book.readers || []).map((u) => (
                    <span key={u.id} style={{ fontFamily: FONT.type, fontSize: "0.55rem", letterSpacing: "0.06em", textTransform: "uppercase", background: `${u.accent}33`, color: u.accent, padding: "0.15rem 0.45rem", borderRadius: 20 }}>{u.name} ✓</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
