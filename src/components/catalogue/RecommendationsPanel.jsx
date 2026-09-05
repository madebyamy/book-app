import React, { useState, useEffect, useCallback } from 'react';
import { BRAND, FONT, USERS } from '../../constants.js';
import { storage } from '../../storage.js';
import { loadConnections, getConnectedUsers } from '../../lib/users.js';

const RECS_KEY = (userId) => `${userId}:recommendations`;
const RECEIVED_COLOR = "#C2A35E"; // brass/gold for received
const SENT_COLOR = "#7a9a6a";     // sage green for sent

async function loadRecs(userId) {
  try { const r = await storage.get(RECS_KEY(userId)); return r ? JSON.parse(r.value) : []; } catch { return []; }
}
async function saveRecs(userId, recs) {
  try { await storage.set(RECS_KEY(userId), JSON.stringify(recs)); } catch {}
}

function RecCard({ rec, type, fromName, fromAccent, onAdd }) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const accentColor = type === "received" ? (fromAccent || RECEIVED_COLOR) : SENT_COLOR;

  const handleAdd = async () => {
    if (!onAdd || added) return;
    setAdding(true);
    await onAdd(rec, fromName);
    setAdding(false);
    setAdded(true);
  };

  return (
    <div style={{ background: "rgba(0,0,0,.25)", border: "1px solid rgba(194,163,94,.18)", borderLeft: `3px solid ${accentColor}`, borderRadius: 3, padding: "14px 16px" }}>
      {/* Direction badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontFamily: FONT.body, fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: accentColor, background: `${accentColor}1a`, border: `1px solid ${accentColor}44`, padding: "2px 9px", borderRadius: 2 }}>
          {type === "received" ? `From ${fromName}` : `You → ${rec.to?.map((id) => USERS[id]?.name || id).join(", ")}`}
        </span>
        <span style={{ fontFamily: FONT.body, fontSize: 11, color: "rgba(251,246,232,.3)" }}>
          {new Date(rec.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        {rec.bookCover && <img src={rec.bookCover} alt={rec.bookTitle} style={{ width: 44, height: 62, objectFit: "cover", borderRadius: 2, flexShrink: 0 }} onError={(e) => e.target.style.display = "none"} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 15, color: "#FBF6E8", lineHeight: 1.2 }}>{rec.bookTitle}</div>
          <div style={{ fontFamily: FONT.body, fontSize: 12, color: "rgba(251,246,232,.5)", marginTop: 2 }}>{rec.bookAuthor}</div>
          {rec.note && (
            <div style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 13.5, color: "rgba(251,246,232,.75)", marginTop: 10, lineHeight: 1.6, padding: "8px 12px", background: "rgba(255,255,255,.04)", borderRadius: 2 }}>
              "{rec.note}"
            </div>
          )}
          {type === "received" && onAdd && (
            <button onClick={handleAdd} disabled={added || adding}
              style={{ marginTop: 10, fontFamily: FONT.body, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", background: added ? "rgba(111,207,151,.15)" : "rgba(194,163,94,.14)", border: `1px solid ${added ? "rgba(111,207,151,.4)" : "rgba(194,163,94,.35)"}`, color: added ? "#6fcf97" : "#E8CF93", padding: "5px 14px", borderRadius: 2, cursor: added ? "default" : "pointer", whiteSpace: "nowrap" }}>
              {added ? "✓ Added to shelf" : adding ? "Adding…" : "+ Add to shelf"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function RecommendationsPanel({ userId, onAddBook }) {
  const [friends, setFriends] = useState([]);
  const [allRecs, setAllRecs] = useState([]); // combined sent + received
  const [loaded, setLoaded] = useState(false);

  const [filter, setFilter] = useState("all"); // "all" | "received" | "sent"
  const [showSendForm, setShowSendForm] = useState(false);

  // send form state
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [fetching, setFetching] = useState(false);
  const [preview, setPreview] = useState(null);
  const [fetchError, setFetchError] = useState("");
  const [note, setNote] = useState("");
  const [toUsers, setToUsers] = useState([]);
  const [sending, setSending] = useState(false);
  const [justSent, setJustSent] = useState(false);

  const reload = useCallback(async () => {
    const connections = await loadConnections();
    const connected = getConnectedUsers(userId, connections);
    const sent = await loadRecs(userId);
    const fromFriends = (await Promise.all(
      connected.map(async (f) => {
        const their = await loadRecs(f.id);
        return their.filter((r) => r.to?.includes(userId)).map((r) => ({ ...r, type: "received", fromName: f.name, fromAccent: f.accent }));
      })
    )).flat();
    const combined = [
      ...fromFriends,
      ...sent.map((r) => ({ ...r, type: "sent" })),
    ].sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
    return { connected, combined };
  }, [userId]);

  useEffect(() => {
    let active = true;
    (async () => {
      const { connected, combined } = await reload();
      if (!active) return;
      setFriends(connected);
      setAllRecs(combined);
      setLoaded(true);
      const hasReceived = combined.some((r) => r.type === "received");
      if (hasReceived) setFilter("received");
    })();
    return () => { active = false; };
  }, [userId]);

  const lookup = useCallback(async () => {
    if (!title.trim()) return;
    setFetching(true); setFetchError(""); setPreview(null);
    try {
      const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(title.trim())}${author.trim() ? `&author=${encodeURIComponent(author.trim())}` : ""}&limit=3&fields=key,author_name,cover_i`;
      const res = await fetch(url);
      const data = await res.json();
      const doc = data.docs?.[0];
      if (!doc) { setFetchError("No book found — try adjusting the title or adding the author."); setFetching(false); return; }
      const cover = doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null;
      let desc = "";
      try {
        const workRes = await fetch(`https://openlibrary.org${doc.key}.json`);
        const workData = await workRes.json();
        const raw = workData.description;
        desc = (typeof raw === "string" ? raw : raw?.value || "").slice(0, 300);
      } catch {}
      setPreview({ title: title.trim(), author: doc.author_name?.[0] || author.trim(), cover, desc });
    } catch { setFetchError("Lookup failed — check your connection."); }
    setFetching(false);
  }, [title, author]);

  const toggleTo = (id) => setToUsers((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleSend = useCallback(async () => {
    if (!preview || toUsers.length === 0) return;
    setSending(true);
    const rec = {
      id: Date.now().toString(36),
      bookTitle: preview.title, bookAuthor: preview.author, bookCover: preview.cover || null, bookDesc: preview.desc,
      note: note.trim(), to: toUsers, sentAt: new Date().toISOString(),
    };
    const sent = allRecs.filter((r) => r.type === "sent").map(({ type, ...rest }) => rest);
    const updated = [rec, ...sent];
    await saveRecs(userId, updated);
    setAllRecs((prev) => [{ ...rec, type: "sent" }, ...prev]);
    setPreview(null); setTitle(""); setAuthor(""); setNote(""); setToUsers([]);
    setSending(false); setJustSent(true); setShowSendForm(false);
    setTimeout(() => setJustSent(false), 3000);
  }, [userId, preview, note, toUsers, allRecs]);

  const inputStyle = { background: "rgba(0,0,0,.35)", border: "1px solid rgba(194,163,94,.3)", color: "#FBF6E8", fontFamily: FONT.body, fontSize: 14, padding: "9px 12px", borderRadius: 2, outline: "none", width: "100%", boxSizing: "border-box" };

  const filterCounts = { all: allRecs.length, received: allRecs.filter((r) => r.type === "received").length, sent: allRecs.filter((r) => r.type === "sent").length };
  const visible = allRecs.filter((r) => filter === "all" || r.type === filter);

  const pillStyle = (active, color) => ({
    fontFamily: FONT.body, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase",
    background: active ? `${color}22` : "transparent",
    border: `1px solid ${active ? color : "rgba(194,163,94,.2)"}`,
    color: active ? color : "rgba(251,246,232,.45)",
    padding: "5px 14px", borderRadius: 2, cursor: "pointer", transition: "all .15s",
  });

  if (!loaded) return <div style={{ fontFamily: FONT.body, fontSize: 13, color: "rgba(251,246,232,.4)", padding: "32px 0", textAlign: "center" }}>Loading…</div>;

  return (
    <div>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button onClick={() => setFilter("all")} style={pillStyle(filter === "all", RECEIVED_COLOR)}>All ({filterCounts.all})</button>
          {filterCounts.received > 0 && <button onClick={() => setFilter("received")} style={pillStyle(filter === "received", RECEIVED_COLOR)}>Received ({filterCounts.received})</button>}
          {filterCounts.sent > 0 && <button onClick={() => setFilter("sent")} style={pillStyle(filter === "sent", SENT_COLOR)}>You sent ({filterCounts.sent})</button>}
        </div>
        <button onClick={() => setShowSendForm((v) => !v)}
          style={{ fontFamily: FONT.body, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", background: showSendForm ? "rgba(0,0,0,.4)" : BRAND.terracotta, border: "none", color: "#fff", padding: "8px 18px", borderRadius: 2, cursor: "pointer", transition: "all .2s" }}>
          {showSendForm ? "✕ Cancel" : "+ Recommend a book"}
        </button>
      </div>

      {justSent && (
        <div style={{ fontFamily: FONT.body, fontSize: 13, color: "#6fcf97", background: "rgba(111,207,151,.1)", border: "1px solid rgba(111,207,151,.3)", borderRadius: 3, padding: "10px 16px", marginBottom: 16 }}>
          ✓ Recommendation sent!
        </div>
      )}

      {/* ── SEND FORM ── */}
      {showSendForm && (
        <div style={{ background: "rgba(0,0,0,.3)", border: "1px solid rgba(194,163,94,.22)", borderRadius: 3, padding: "20px 20px 22px", marginBottom: 22 }}>
          <div style={{ fontFamily: FONT.body, fontSize: 9.5, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(232,207,147,.6)", marginBottom: 14 }}>Find the book</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Book title…" onKeyDown={(e) => e.key === "Enter" && lookup()}
              style={{ ...inputStyle, flex: "2 1 150px" }} />
            <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author (optional)" onKeyDown={(e) => e.key === "Enter" && lookup()}
              style={{ ...inputStyle, flex: "1 1 110px" }} />
            <button onClick={lookup} disabled={!title.trim() || fetching}
              style={{ fontFamily: FONT.body, fontSize: 12, letterSpacing: ".06em", background: "rgba(194,163,94,.18)", border: "1px solid rgba(194,163,94,.4)", color: "#E8CF93", padding: "9px 16px", borderRadius: 2, cursor: title.trim() && !fetching ? "pointer" : "not-allowed", opacity: title.trim() && !fetching ? 1 : 0.5, whiteSpace: "nowrap" }}>
              {fetching ? "Searching…" : "Look up"}
            </button>
          </div>

          {fetchError && <div style={{ fontFamily: FONT.body, fontSize: 13, color: BRAND.coral, marginBottom: 12 }}>{fetchError}</div>}

          {preview && (
            <>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 14px", background: "rgba(0,0,0,.25)", borderRadius: 3, marginBottom: 14 }}>
                {preview.cover && <img src={preview.cover} alt="" style={{ width: 44, height: 62, objectFit: "cover", borderRadius: 2, flexShrink: 0 }} onError={(e) => e.target.style.display = "none"} />}
                <div>
                  <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 15, color: "#FBF6E8" }}>{preview.title}</div>
                  <div style={{ fontFamily: FONT.body, fontSize: 12, color: "rgba(251,246,232,.5)", marginTop: 2 }}>by {preview.author}</div>
                  {preview.desc && <div style={{ fontFamily: FONT.read, fontSize: 12.5, color: "rgba(251,246,232,.55)", lineHeight: 1.5, marginTop: 8 }}>{preview.desc}{preview.desc.length >= 300 ? "…" : ""}</div>}
                  <button onClick={() => { setPreview(null); setTitle(""); setAuthor(""); }} style={{ fontFamily: FONT.body, fontSize: 11, background: "none", border: "none", color: "rgba(251,246,232,.3)", cursor: "pointer", padding: "4px 0 0", display: "block" }}>× Wrong book — search again</button>
                </div>
              </div>

              <div style={{ fontFamily: FONT.body, fontSize: 9.5, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(232,207,147,.6)", marginBottom: 8 }}>Your note (optional)</div>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why would they love this book?" rows={2}
                style={{ ...inputStyle, resize: "vertical", minHeight: 62, fontFamily: FONT.read, fontSize: 14, lineHeight: 1.55, marginBottom: 14 }} />

              <div style={{ fontFamily: FONT.body, fontSize: 9.5, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(232,207,147,.6)", marginBottom: 10 }}>Send to</div>
              {friends.length === 0 ? (
                <div style={{ fontFamily: FONT.body, fontSize: 13, color: "rgba(251,246,232,.35)", marginBottom: 14 }}>No connected readers yet.</div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                  {friends.map((f) => {
                    const sel = toUsers.includes(f.id);
                    return (
                      <button key={f.id} onClick={() => toggleTo(f.id)}
                        style={{ fontFamily: FONT.body, fontSize: 13, background: sel ? (f.accent || BRAND.terracotta) : "rgba(0,0,0,.3)", border: `1px solid ${sel ? (f.accent || BRAND.terracotta) : "rgba(194,163,94,.3)"}`, color: sel ? "#fff" : "rgba(251,246,232,.7)", padding: "8px 20px", borderRadius: 3, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, transition: "all .15s" }}>
                        <span style={{ width: 22, height: 22, borderRadius: "50%", background: f.accent || BRAND.terracotta, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.display, fontWeight: 700, fontSize: 12, color: "#fff" }}>{f.name[0]}</span>
                        {f.name}{sel && " ✓"}
                      </button>
                    );
                  })}
                  {friends.length > 1 && (
                    <button onClick={() => setToUsers(toUsers.length === friends.length ? [] : friends.map((f) => f.id))}
                      style={{ fontFamily: FONT.body, fontSize: 12, background: "transparent", border: "1px solid rgba(194,163,94,.2)", color: "rgba(251,246,232,.4)", padding: "8px 14px", borderRadius: 3, cursor: "pointer" }}>
                      {toUsers.length === friends.length ? "Deselect all" : "All"}
                    </button>
                  )}
                </div>
              )}

              <button onClick={handleSend} disabled={toUsers.length === 0 || sending}
                style={{ fontFamily: FONT.body, fontSize: 13, letterSpacing: ".08em", textTransform: "uppercase", background: toUsers.length > 0 ? BRAND.terracotta : "rgba(0,0,0,.3)", border: "none", color: "#fff", padding: "11px 26px", borderRadius: 2, cursor: toUsers.length > 0 ? "pointer" : "not-allowed", opacity: toUsers.length > 0 ? 1 : 0.45, transition: "all .2s" }}>
                {sending ? "Sending…" : `Send to ${toUsers.length === 0 ? "…" : toUsers.map((id) => USERS[id]?.name || id).join(", ")}`}
              </button>
            </>
          )}
        </div>
      )}

      {/* ── COMBINED LIST ── */}
      {visible.length === 0 ? (
        <div style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 15, color: "rgba(251,246,232,.3)", textAlign: "center", padding: "48px 0" }}>
          {filter === "all" ? "No recommendations yet — send the first one with the button above." : `No ${filter} recommendations.`}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Color legend */}
          <div style={{ display: "flex", gap: 16, marginBottom: 4, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: FONT.body, fontSize: 11, color: "rgba(251,246,232,.4)" }}>
              <div style={{ width: 12, height: 12, borderRadius: 1, background: RECEIVED_COLOR }} /> Recommended to you
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: FONT.body, fontSize: 11, color: "rgba(251,246,232,.4)" }}>
              <div style={{ width: 12, height: 12, borderRadius: 1, background: SENT_COLOR }} /> You recommended
            </div>
          </div>
          {visible.map((r) => (
            <RecCard key={`${r.type}-${r.id}`} rec={r} type={r.type} fromName={r.fromName} fromAccent={r.fromAccent}
              onAdd={r.type === "received" && onAddBook ? (rec, fromName) => onAddBook(rec, fromName) : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
