import React, { useState, useEffect } from 'react';
import { BRAND, FONT } from '../../constants.js';
import { loadFriendSharedData } from '../../lib/books.js';
import { loadConnections } from '../../lib/users.js';
import { getConnectedUsers } from '../../lib/users.js';

const TAG_COLORS = {
  observation: "#5a7a9a",
  question:    "#9a6a3f",
  character:   "#3E7C57",
  theme:       "#7a5a9a",
  reaction:    "#BF755A",
  connection:  "#3a6ea5",
};

export function FriendsReadingThis({ userId, book }) {
  const [friendData, setFriendData] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState({});

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
      <div style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: BRAND.muted, marginBottom: "1.2rem" }}>Also in this book</div>
      {friendData.map(({ friend, data }) => {
        const pct = data.progress?.totalPages ? Math.round(((data.progress.currentPage || data.progress.pagesRead || 0) / data.progress.totalPages) * 100) : null;
        const dateFinished = data.progress?.dateFinished || data.progress?.finishDate;
        const isOpen = expanded[friend.id];
        const hasNotes = (data.quotes?.length > 0) || (data.notations?.length > 0);

        return (
          <div key={friend.id} style={{ background: BRAND.paper, border: `1px solid ${BRAND.line}`, borderRadius: 5, padding: "18px 20px", marginBottom: 14 }}>
            {/* Friend header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: friend.accent || BRAND.terracotta, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.display, fontWeight: 600, fontSize: 15, color: "#fff", flexShrink: 0 }}>{friend.name[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 14, color: BRAND.ink }}>{friend.name}</div>
                <div style={{ fontFamily: FONT.body, fontSize: 12, color: BRAND.muted, marginTop: 2 }}>
                  {dateFinished ? (
                    <>Finished {new Date(dateFinished).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</>
                  ) : pct !== null ? (
                    <>{pct}% through · p.{data.progress.currentPage || data.progress.pagesRead} of {data.progress.totalPages}</>
                  ) : null}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                {data.status && (
                  <div style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: BRAND.terracotta, background: "rgba(191,117,90,.1)", border: "1px solid rgba(191,117,90,.25)", borderRadius: 3, padding: "4px 9px" }}>{data.status.replace(/-/g, " ")}</div>
                )}
                {hasNotes && (
                  <button onClick={() => setExpanded((prev) => ({ ...prev, [friend.id]: !prev[friend.id] }))}
                    style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: ".06em", background: "none", border: `1px solid ${BRAND.line2}`, color: BRAND.muted, padding: "4px 10px", borderRadius: 3, cursor: "pointer", whiteSpace: "nowrap" }}>
                    {isOpen ? "Hide notes ↑" : `Notes (${(data.quotes?.length || 0) + (data.notations?.length || 0)}) ↓`}
                  </button>
                )}
              </div>
            </div>

            {/* Progress bar */}
            {pct !== null && !dateFinished && (
              <div style={{ height: 4, borderRadius: 2, background: BRAND.line, margin: "12px 0 0", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: BRAND.terracotta, borderRadius: 2, transition: "width .4s" }} />
              </div>
            )}

            {/* Tagline */}
            {data.book.tagline && (
              <div style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 14, lineHeight: 1.6, color: BRAND.ink, marginTop: 12 }}>{data.book.tagline}</div>
            )}

            {/* Shared notes (expanded) */}
            {isOpen && hasNotes && (
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                {data.quotes?.length > 0 && (
                  <>
                    <div style={{ fontFamily: FONT.body, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: BRAND.muted }}>Quotes</div>
                    {data.quotes.map((q) => (
                      <div key={q.id} style={{ borderLeft: `2px solid ${BRAND.terracotta}`, paddingLeft: 12 }}>
                        <div style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 13.5, lineHeight: 1.55, color: BRAND.ink }}>"{q.text}"</div>
                        {q.page && <div style={{ fontFamily: FONT.body, fontSize: 11, color: BRAND.muted, marginTop: 3 }}>p. {q.page}</div>}
                      </div>
                    ))}
                  </>
                )}
                {data.notations?.length > 0 && (
                  <>
                    <div style={{ fontFamily: FONT.body, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: BRAND.muted, marginTop: data.quotes?.length ? 6 : 0 }}>Notes</div>
                    {data.notations.map((n) => (
                      <div key={n.id} style={{ borderLeft: `2px solid ${n.tag ? TAG_COLORS[n.tag] || BRAND.line2 : BRAND.line2}`, paddingLeft: 12 }}>
                        <div style={{ fontFamily: FONT.read, fontSize: 13.5, lineHeight: 1.55, color: BRAND.ink }}>{n.text}</div>
                        <div style={{ display: "flex", gap: 8, marginTop: 3, alignItems: "center" }}>
                          {n.tag && <span style={{ fontFamily: FONT.body, fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase", color: TAG_COLORS[n.tag] || BRAND.muted }}>{n.tag}</span>}
                          {n.page && <span style={{ fontFamily: FONT.body, fontSize: 11, color: BRAND.muted }}>p. {n.page}</span>}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
