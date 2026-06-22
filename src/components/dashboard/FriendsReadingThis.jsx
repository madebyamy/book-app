import React, { useState, useEffect } from 'react';
import { BRAND, FONT } from '../../constants.js';
import { loadFriendSharedData } from '../../lib/books.js';
import { loadConnections } from '../../lib/users.js';
import { getConnectedUsers } from '../../lib/users.js';

export function FriendsReadingThis({ userId, book }) {
  const [friendData, setFriendData] = useState([]); // [{friend, data}]
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const connections = await loadConnections();
      const friends = getConnectedUsers(userId, connections);
      const results = await Promise.all(friends.map(async (friend) => {
        const data = await loadFriendSharedData(friend.id, book);
        return data ? { friend, data } : null;
      }));
      if (active) { setFriendData(results.filter(Boolean)); setLoaded(true); }
    })();
    return () => { active = false; };
  }, [userId, book.id, book.shared]);

  if (!loaded || friendData.length === 0) return null;

  return (
    <div style={{ marginTop: "2.4rem", borderTop: `1px solid ${BRAND.line}`, paddingTop: "2rem" }}>
      <div style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: BRAND.muted, marginBottom: "1.2rem" }}>Also reading this</div>
      {friendData.map(({ friend, data }) => {
        const pct = data.progress?.totalPages ? Math.round((data.progress.currentPage / data.progress.totalPages) * 100) : null;
        return (
          <div key={friend.id} style={{ background: BRAND.paper, border: `1px solid ${BRAND.line}`, borderRadius: 5, padding: "18px 20px", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: friend.accent || BRAND.terracotta, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.display, fontWeight: 600, fontSize: 15, color: "#fff", flexShrink: 0 }}>{friend.name[0]}</div>
              <div>
                <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 14, color: BRAND.ink }}>{friend.name}</div>
                {pct !== null && (
                  <div style={{ fontFamily: FONT.body, fontSize: 12, color: BRAND.muted, marginTop: 2 }}>{pct}% through · p.{data.progress.currentPage} of {data.progress.totalPages}</div>
                )}
              </div>
              {data.status && (
                <div style={{ marginLeft: "auto", fontFamily: FONT.body, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: BRAND.terracotta, background: "rgba(191,117,90,.1)", border: "1px solid rgba(191,117,90,.25)", borderRadius: 3, padding: "4px 9px" }}>{data.status.replace(/-/g, " ")}</div>
              )}
            </div>
            {pct !== null && (
              <div style={{ height: 4, borderRadius: 2, background: BRAND.line, marginBottom: 12, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: BRAND.terracotta, borderRadius: 2, transition: "width .4s" }} />
              </div>
            )}
            {data.book.tagline && (
              <div style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 14, lineHeight: 1.6, color: BRAND.ink, marginBottom: data.quotes?.length ? 12 : 0 }}>{data.book.tagline}</div>
            )}
            {data.quotes?.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontFamily: FONT.body, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: BRAND.muted }}>Highlights</div>
                {data.quotes.slice(0, 3).map((q) => (
                  <div key={q.id} style={{ borderLeft: `2px solid ${BRAND.terracotta}`, paddingLeft: 12 }}>
                    <div style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 13.5, lineHeight: 1.55, color: BRAND.ink }}>"{q.text}"</div>
                    {q.page && <div style={{ fontFamily: FONT.body, fontSize: 11, color: BRAND.muted, marginTop: 3 }}>p. {q.page}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
