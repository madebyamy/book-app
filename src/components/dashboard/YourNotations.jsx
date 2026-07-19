import React, { useState, useEffect, useCallback } from 'react';
import { USERS } from '../../constants.js';
import { loadNotations, saveNotations } from '../../lib/books.js';
import { addJournalEntry } from '../../lib/journal.js';

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

export function YourNotations({ userId, book, theme }) {
  theme = theme || book.theme || {};
  const [items, setItems] = useState([]);
  const [text, setText] = useState("");
  const [page, setPage] = useState("");
  const [tag, setTag] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editPage, setEditPage] = useState("");
  const [editTag, setEditTag] = useState("");
  const [sort, setSort] = useState("newest");
  const [filterTag, setFilterTag] = useState("");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

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
    const newItem = { id: Date.now().toString(36), text: trimmed, page: page.trim(), tag: tag || "", addedAt: new Date().toISOString() };
    const updated = [...items, newItem];
    setItems(updated); setText(""); setPage(""); setTag("");
    await saveNotations(userId, book.id, updated);
    addJournalEntry(userId, { type: 'note', bookId: book.id, bookTitle: book.title, content: trimmed, bookPage: page.trim() || null });
  }, [userId, text, page, tag, items, book.id]);

  const handleDelete = useCallback(async (id) => {
    const updated = items.filter((n) => n.id !== id);
    setItems(updated);
    await saveNotations(userId, book.id, updated);
  }, [userId, items, book.id]);

  const startEdit = (n) => { setEditId(n.id); setEditText(n.text); setEditPage(n.page || ""); setEditTag(n.tag || ""); };
  const cancelEdit = () => { setEditId(null); setEditText(""); setEditPage(""); setEditTag(""); };

  const saveEdit = useCallback(async (id) => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    const updated = items.map((n) => n.id === id ? { ...n, text: trimmed, page: editPage.trim(), tag: editTag } : n);
    setItems(updated);
    cancelEdit();
    await saveNotations(userId, book.id, updated);
  }, [userId, items, book.id, editText, editPage, editTag]);

  const btnStyle = { background: "none", border: "none", cursor: "pointer", fontFamily: theme.mono, fontSize: "0.7rem", color: theme.inkFaint, padding: "2px 6px", borderRadius: 3 };

  let filtered = items
    .filter((n) => !filterTag || n.tag === filterTag)
    .filter((n) => !search || n.text.toLowerCase().includes(search.toLowerCase()) || (n.page && n.page.includes(search)));

  const sorted = filtered.slice().sort((a, b) => {
    if (sort === "page") {
      const ap = parseInt(a.page) || 0, bp = parseInt(b.page) || 0;
      return ap !== bp ? ap - bp : 0;
    }
    return 0;
  });
  const display = sort === "newest" ? sorted.reverse() : sorted;
  const LIMIT = 6;
  const visible = showAll ? display : display.slice(0, LIMIT);

  const tagCounts = items.reduce((acc, n) => { if (n.tag) acc[n.tag] = (acc[n.tag] || 0) + 1; return acc; }, {});

  return (
    <div style={{ marginTop: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "0.8rem", marginBottom: "1.2rem" }}>
        <h3 style={{ fontFamily: theme.display, fontWeight: theme.displayWeight, fontSize: "1.3rem", margin: 0, color: theme.ink }}>
          {USERS[userId].name}'s Notations
          {items.length > 0 && <span style={{ fontFamily: theme.mono, fontWeight: 400, fontSize: "0.75rem", color: theme.inkFaint, marginLeft: "0.6rem" }}>{items.length}</span>}
        </h3>
        <span style={{ fontFamily: theme.mono, fontSize: "0.7rem", color: theme.inkFaint }}>annotations & reactions</span>
      </div>

      <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.6rem" }}>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a note, reaction, or annotation…" rows={2}
          style={{ background: theme.card, border: `1px solid ${theme.border}`, color: theme.ink, fontFamily: theme.display, fontSize: "0.88rem", padding: "0.6rem 0.8rem", borderRadius: 3, resize: "vertical", minHeight: 52 }} />
        <div style={{ display: "grid", gridTemplateColumns: "120px 1fr auto", gap: "0.6rem", alignItems: "center" }}>
          <input value={page} onChange={(e) => setPage(e.target.value)} placeholder="Page (opt.)"
            style={{ background: theme.card, border: `1px solid ${theme.border}`, color: theme.ink, fontFamily: theme.body, fontSize: "0.85rem", padding: "0.6rem 0.8rem", borderRadius: 3 }} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {TAGS.map((t) => (
              <button key={t.id} type="button" onClick={() => setTag(tag === t.id ? "" : t.id)}
                style={{ fontFamily: theme.mono, fontSize: "0.68rem", letterSpacing: "0.04em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 99, border: `1px solid ${tag === t.id ? TAG_COLORS[t.id] : theme.border}`, background: tag === t.id ? TAG_COLORS[t.id] : "transparent", color: tag === t.id ? "#fff" : theme.inkFaint, cursor: "pointer", transition: "all .15s" }}>
                {t.label}
              </button>
            ))}
          </div>
          <button type="submit" style={{ background: book.accent, border: "none", color: theme.headerInk, fontFamily: theme.mono, fontSize: "0.74rem", letterSpacing: "0.05em", textTransform: "uppercase", padding: "0.6rem 1rem", borderRadius: 3, cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>Save</button>
        </div>
      </form>

      {!loaded ? (
        <div style={{ fontFamily: theme.mono, fontSize: "0.8rem", color: theme.inkFaint, padding: "1.2rem" }}>Loading notations…</div>
      ) : items.length === 0 ? (
        <div style={{ fontFamily: theme.mono, fontSize: "0.8rem", color: theme.inkFaint, padding: "1.4rem", border: `1px dashed ${theme.border}`, borderRadius: 3, textAlign: "center" }}>No notations yet — add a reaction, question, or observation above.</div>
      ) : (
        <>
          {/* Controls */}
          <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap", marginBottom: "0.9rem" }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes…"
              style={{ flex: 1, minWidth: 140, background: theme.card, border: `1px solid ${theme.border}`, color: theme.ink, fontFamily: theme.body, fontSize: "0.8rem", padding: "0.4rem 0.7rem", borderRadius: 3, outline: "none" }} />
            <div style={{ display: "flex", gap: "0.3rem" }}>
              {["newest", "page"].map((s) => (
                <button key={s} onClick={() => setSort(s)} style={{ ...btnStyle, background: sort === s ? theme.border : "none", color: sort === s ? theme.ink : theme.inkFaint, padding: "4px 10px" }}>
                  {s === "newest" ? "Newest" : "By page"}
                </button>
              ))}
            </div>
          </div>

          {/* Tag filter pills */}
          {Object.keys(tagCounts).length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.9rem" }}>
              <button onClick={() => setFilterTag("")} style={{ fontFamily: theme.mono, fontSize: "0.65rem", letterSpacing: "0.04em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 99, border: `1px solid ${filterTag === "" ? theme.ink : theme.border}`, background: filterTag === "" ? theme.ink : "transparent", color: filterTag === "" ? theme.bg : theme.inkFaint, cursor: "pointer" }}>
                All ({items.length})
              </button>
              {TAGS.filter((t) => tagCounts[t.id]).map((t) => (
                <button key={t.id} onClick={() => setFilterTag(filterTag === t.id ? "" : t.id)}
                  style={{ fontFamily: theme.mono, fontSize: "0.65rem", letterSpacing: "0.04em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 99, border: `1px solid ${filterTag === t.id ? TAG_COLORS[t.id] : theme.border}`, background: filterTag === t.id ? TAG_COLORS[t.id] : "transparent", color: filterTag === t.id ? "#fff" : theme.inkFaint, cursor: "pointer" }}>
                  {t.label} ({tagCounts[t.id]})
                </button>
              ))}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {visible.map((n) => (
              <div key={n.id} style={{ background: theme.card, border: `1px solid ${theme.border}`, borderLeft: n.tag ? `3px solid ${TAG_COLORS[n.tag] || theme.border}` : `1px solid ${theme.border}`, borderRadius: 3, padding: "0.9rem 1.1rem" }}>
                {editId === n.id ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} autoFocus
                      style={{ background: theme.bg, border: `1px solid ${book.accent}`, color: theme.ink, fontFamily: theme.display, fontSize: "0.93rem", padding: "0.6rem 0.8rem", borderRadius: 3, resize: "vertical", outline: "none" }} />
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                      <input value={editPage} onChange={(e) => setEditPage(e.target.value)} placeholder="Page"
                        style={{ width: 100, background: theme.bg, border: `1px solid ${theme.border}`, color: theme.ink, fontFamily: theme.body, fontSize: "0.82rem", padding: "0.4rem 0.7rem", borderRadius: 3, outline: "none" }} />
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                        {TAGS.map((t) => (
                          <button key={t.id} type="button" onClick={() => setEditTag(editTag === t.id ? "" : t.id)}
                            style={{ fontFamily: theme.mono, fontSize: "0.65rem", letterSpacing: "0.04em", textTransform: "uppercase", padding: "3px 9px", borderRadius: 99, border: `1px solid ${editTag === t.id ? TAG_COLORS[t.id] : theme.border}`, background: editTag === t.id ? TAG_COLORS[t.id] : "transparent", color: editTag === t.id ? "#fff" : theme.inkFaint, cursor: "pointer" }}>
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button onClick={() => saveEdit(n.id)} style={{ background: book.accent, border: "none", color: theme.headerInk, fontFamily: theme.mono, fontSize: "0.72rem", letterSpacing: "0.05em", textTransform: "uppercase", padding: "5px 14px", borderRadius: 3, cursor: "pointer", fontWeight: 600 }}>Save</button>
                      <button onClick={cancelEdit} style={{ ...btnStyle, padding: "5px 10px" }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
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
                    <div style={{ display: "flex", gap: "0.2rem", flexShrink: 0 }}>
                      <button onClick={() => startEdit(n)} aria-label="Edit notation" style={{ ...btnStyle, fontSize: "0.85rem" }}>✎</button>
                      <button onClick={() => handleDelete(n.id)} aria-label="Delete notation" style={{ ...btnStyle, fontSize: "1.1rem" }}>×</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {display.length > LIMIT && (
            <button onClick={() => setShowAll(!showAll)} style={{ ...btnStyle, marginTop: "0.8rem", color: book.accent, fontSize: "0.78rem" }}>
              {showAll ? "Show less ↑" : `Show all ${display.length} notes ↓`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
