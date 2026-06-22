import React, { useState, useEffect, useCallback } from 'react';
import { USERS } from '../../constants.js';
import { loadNotations, saveNotations } from '../../lib/books.js';

const TAGS = [
  { id: "observation", label: "Observation" },
  { id: "question",    label: "Question" },
  { id: "character",   label: "Character" },
  { id: "theme",       label: "Theme" },
  { id: "reaction",    label: "Reaction" },
  { id: "connection",  label: "Connection" },
];

const TAG_COLORS = {
  observation: "#5a7a9a",
  question:    "#9a6a3f",
  character:   "#3E7C57",
  theme:       "#7a5a9a",
  reaction:    "#BF755A",
  connection:  "#3a6ea5",
};

export function YourNotations({ userId, book }) {
  const theme = book.theme;
  const [items, setItems] = useState([]);
  const [text, setText] = useState("");
  const [page, setPage] = useState("");
  const [tag, setTag] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    setLoaded(false);
    loadNotations(userId, book.id).then((rows) => { if (active) { setItems(rows); setLoaded(true); } });
    return () => { active = false; };
  }, [userId, book.id]);

  const handleAdd = useCallback(async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    const newItem = {
      id: Date.now().toString(36),
      text: trimmed,
      page: page.trim(),
      tag: tag || "",
      addedAt: new Date().toISOString(),
    };
    const updated = [...items, newItem];
    setItems(updated); setText(""); setPage(""); setTag("");
    await saveNotations(userId, book.id, updated);
  }, [userId, text, page, tag, items, book.id]);

  const handleDelete = useCallback(async (id) => {
    const updated = items.filter((n) => n.id !== id);
    setItems(updated);
    await saveNotations(userId, book.id, updated);
  }, [userId, items, book.id]);

  return (
    <div style={{ marginTop: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "0.8rem", marginBottom: "1.2rem" }}>
        <h3 style={{ fontFamily: theme.display, fontWeight: theme.displayWeight, fontSize: "1.3rem", margin: 0, color: theme.ink }}>{USERS[userId].name}'s Notations</h3>
        <span style={{ fontFamily: theme.mono, fontSize: "0.7rem", color: theme.inkFaint }}>annotations & reactions</span>
      </div>

      <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.6rem" }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a note, reaction, or annotation…"
          rows={2}
          style={{ background: theme.card, border: `1px solid ${theme.border}`, color: theme.ink, fontFamily: theme.display, fontSize: "0.88rem", padding: "0.6rem 0.8rem", borderRadius: 3, resize: "vertical", minHeight: 52 }}
        />
        <div style={{ display: "grid", gridTemplateColumns: "120px 1fr auto", gap: "0.6rem", alignItems: "center" }}>
          <input
            value={page}
            onChange={(e) => setPage(e.target.value)}
            placeholder="Page (opt.)"
            style={{ background: theme.card, border: `1px solid ${theme.border}`, color: theme.ink, fontFamily: theme.body, fontSize: "0.85rem", padding: "0.6rem 0.8rem", borderRadius: 3 }}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {TAGS.map((t) => (
              <button key={t.id} type="button" onClick={() => setTag(tag === t.id ? "" : t.id)}
                style={{ fontFamily: theme.mono, fontSize: "0.68rem", letterSpacing: "0.04em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 99, border: `1px solid ${tag === t.id ? TAG_COLORS[t.id] : theme.border}`, background: tag === t.id ? TAG_COLORS[t.id] : "transparent", color: tag === t.id ? "#fff" : theme.inkFaint, cursor: "pointer", transition: "all .15s" }}>
                {t.label}
              </button>
            ))}
          </div>
          <button type="submit"
            style={{ background: book.accent, border: "none", color: theme.headerInk, fontFamily: theme.mono, fontSize: "0.74rem", letterSpacing: "0.05em", textTransform: "uppercase", padding: "0.6rem 1rem", borderRadius: 3, cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>
            Save
          </button>
        </div>
      </form>

      {!loaded ? (
        <div style={{ fontFamily: theme.mono, fontSize: "0.8rem", color: theme.inkFaint, padding: "1.2rem" }}>Loading notations…</div>
      ) : items.length === 0 ? (
        <div style={{ fontFamily: theme.mono, fontSize: "0.8rem", color: theme.inkFaint, padding: "1.4rem", border: `1px dashed ${theme.border}`, borderRadius: 3, textAlign: "center" }}>No notations yet — add a reaction, question, or observation above.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {items.slice().reverse().map((n) => (
            <div key={n.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", background: theme.card, border: `1px solid ${theme.border}`, borderLeft: n.tag ? `3px solid ${TAG_COLORS[n.tag] || theme.border}` : `1px solid ${theme.border}`, borderRadius: 3, padding: "0.9rem 1.1rem" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: theme.display, fontSize: "0.93rem", lineHeight: 1.55, margin: "0 0 0.4rem", color: theme.ink }}>{n.text}</p>
                <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap", alignItems: "center" }}>
                  {n.tag && (
                    <span style={{ fontFamily: theme.mono, fontSize: "0.65rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "#fff", background: TAG_COLORS[n.tag] || theme.inkFaint, padding: "2px 7px", borderRadius: 99 }}>
                      {TAGS.find((t) => t.id === n.tag)?.label || n.tag}
                    </span>
                  )}
                  {n.page && <span style={{ fontFamily: theme.mono, fontSize: "0.72rem", color: theme.inkFaint }}>p. {n.page}</span>}
                  {n.addedAt && <span style={{ fontFamily: theme.mono, fontSize: "0.68rem", color: theme.inkFaint }}>{new Date(n.addedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>}
                </div>
              </div>
              <button onClick={() => handleDelete(n.id)} aria-label="Delete notation"
                style={{ background: "none", border: "none", color: theme.inkFaint, cursor: "pointer", fontSize: "1.1rem", lineHeight: 1, flexShrink: 0 }}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
