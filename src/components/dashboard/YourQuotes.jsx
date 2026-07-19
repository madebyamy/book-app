import React, { useState, useEffect, useCallback } from 'react';
import { USERS } from '../../constants.js';
import { loadQuotes, saveQuotes } from '../../lib/books.js';
import { addJournalEntry } from '../../lib/journal.js';

export function YourQuotes({ userId, book, theme }) {
  theme = theme || book.theme || {};
  const [quotes, setQuotes] = useState([]);
  const [text, setText] = useState("");
  const [page, setPage] = useState("");
  const [link, setLink] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editPage, setEditPage] = useState("");
  const [editLink, setEditLink] = useState("");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let active = true;
    setLoaded(false);
    loadQuotes(userId, book.id).then((items) => { if (active) { setQuotes(items); setLoaded(true); } });
    return () => { active = false; };
  }, [userId, book.id]);

  const handleAdd = useCallback(async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    const newItem = { id: Date.now().toString(36), text: trimmed, page: page.trim(), link: link.trim() };
    const updated = [...quotes, newItem];
    setQuotes(updated); setText(""); setPage(""); setLink("");
    await saveQuotes(userId, book.id, updated);
    addJournalEntry(userId, { type: 'quote', bookId: book.id, bookTitle: book.title, content: trimmed, bookPage: page.trim() || null });
  }, [userId, text, page, link, quotes, book.id]);

  const handleDelete = useCallback(async (id) => {
    const updated = quotes.filter((q) => q.id !== id);
    setQuotes(updated);
    await saveQuotes(userId, book.id, updated);
  }, [userId, quotes, book.id]);

  const startEdit = (q) => {
    setEditId(q.id);
    setEditText(q.text);
    setEditPage(q.page || "");
    setEditLink(q.link || "");
  };

  const cancelEdit = () => { setEditId(null); setEditText(""); setEditPage(""); setEditLink(""); };

  const saveEdit = useCallback(async (id) => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    const updated = quotes.map((q) => q.id === id ? { ...q, text: trimmed, page: editPage.trim(), link: editLink.trim() } : q);
    setQuotes(updated);
    cancelEdit();
    await saveQuotes(userId, book.id, updated);
  }, [userId, quotes, book.id, editText, editPage, editLink]);

  const btnStyle = { background: "none", border: "none", cursor: "pointer", fontFamily: theme.mono, fontSize: "0.7rem", color: theme.inkFaint, padding: "2px 6px", borderRadius: 3 };

  let filtered = quotes.filter((q) => !search || q.text.toLowerCase().includes(search.toLowerCase()) || (q.page && q.page.includes(search)));
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

  return (
    <div style={{ marginTop: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "0.8rem", marginBottom: "1.2rem" }}>
        <h3 style={{ fontFamily: theme.display, fontWeight: theme.displayWeight, fontSize: "1.3rem", margin: 0, color: theme.ink }}>
          {USERS[userId].name}'s Quotes
          {quotes.length > 0 && <span style={{ fontFamily: theme.mono, fontWeight: 400, fontSize: "0.75rem", color: theme.inkFaint, marginLeft: "0.6rem" }}>{quotes.length}</span>}
        </h3>
        <span style={{ fontFamily: theme.mono, fontSize: "0.7rem", color: theme.inkFaint }}>saved to {USERS[userId].name}'s book mind</span>
      </div>

      <form onSubmit={handleAdd} style={{ display: "grid", gridTemplateColumns: "1fr 130px 160px auto", gap: "0.6rem", marginBottom: "1.6rem" }} className="quote-form">
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste the quote here…" rows={1} style={{ background: theme.card, border: `1px solid ${theme.border}`, color: theme.ink, fontFamily: theme.display, fontSize: "0.88rem", padding: "0.6rem 0.8rem", borderRadius: 3, resize: "vertical", minHeight: 40 }} />
        <input value={page} onChange={(e) => setPage(e.target.value)} placeholder="Page (optional)" style={{ background: theme.card, border: `1px solid ${theme.border}`, color: theme.ink, fontFamily: theme.body, fontSize: "0.85rem", padding: "0.6rem 0.8rem", borderRadius: 3 }} />
        <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Link (optional)" type="url" style={{ background: theme.card, border: `1px solid ${theme.border}`, color: theme.ink, fontFamily: theme.body, fontSize: "0.85rem", padding: "0.6rem 0.8rem", borderRadius: 3 }} />
        <button type="submit" style={{ background: book.accent, border: "none", color: theme.headerInk, fontFamily: theme.mono, fontSize: "0.74rem", letterSpacing: "0.05em", textTransform: "uppercase", padding: "0.6rem 1rem", borderRadius: 3, cursor: "pointer", fontWeight: 600 }}>Save</button>
      </form>

      {!loaded ? (
        <div style={{ fontFamily: theme.mono, fontSize: "0.8rem", color: theme.inkFaint, padding: "1.2rem" }}>Loading your quotes…</div>
      ) : quotes.length === 0 ? (
        <div style={{ fontFamily: theme.mono, fontSize: "0.8rem", color: theme.inkFaint, padding: "1.4rem", border: `1px dashed ${theme.border}`, borderRadius: 3, textAlign: "center" }}>No quotes saved yet — add one above.</div>
      ) : (
        <>
          {/* Controls */}
          <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap", marginBottom: "0.9rem" }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search quotes…" style={{ flex: 1, minWidth: 140, background: theme.card, border: `1px solid ${theme.border}`, color: theme.ink, fontFamily: theme.body, fontSize: "0.8rem", padding: "0.4rem 0.7rem", borderRadius: 3, outline: "none" }} />
            <div style={{ display: "flex", gap: "0.3rem" }}>
              {["newest", "page"].map((s) => (
                <button key={s} onClick={() => setSort(s)} style={{ ...btnStyle, background: sort === s ? theme.border : "none", color: sort === s ? theme.ink : theme.inkFaint, padding: "4px 10px" }}>
                  {s === "newest" ? "Newest" : "By page"}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
            {visible.map((q) => (
              <div key={q.id} style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 3, padding: "1rem 1.2rem" }}>
                {editId === q.id ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} autoFocus style={{ background: theme.bg, border: `1px solid ${book.accent}`, color: theme.ink, fontFamily: theme.display, fontStyle: "italic", fontSize: "0.95rem", padding: "0.6rem 0.8rem", borderRadius: 3, resize: "vertical", outline: "none" }} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                      <input value={editPage} onChange={(e) => setEditPage(e.target.value)} placeholder="Page" style={{ background: theme.bg, border: `1px solid ${theme.border}`, color: theme.ink, fontFamily: theme.body, fontSize: "0.82rem", padding: "0.4rem 0.7rem", borderRadius: 3, outline: "none" }} />
                      <input value={editLink} onChange={(e) => setEditLink(e.target.value)} placeholder="Link (optional)" type="url" style={{ background: theme.bg, border: `1px solid ${theme.border}`, color: theme.ink, fontFamily: theme.body, fontSize: "0.82rem", padding: "0.4rem 0.7rem", borderRadius: 3, outline: "none" }} />
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button onClick={() => saveEdit(q.id)} style={{ background: book.accent, border: "none", color: theme.headerInk, fontFamily: theme.mono, fontSize: "0.72rem", letterSpacing: "0.05em", textTransform: "uppercase", padding: "5px 14px", borderRadius: 3, cursor: "pointer", fontWeight: 600 }}>Save</button>
                      <button onClick={cancelEdit} style={{ ...btnStyle, padding: "5px 10px" }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                    <div>
                      <p style={{ fontFamily: theme.display, fontStyle: "italic", fontSize: "0.95rem", lineHeight: 1.5, margin: "0 0 0.3rem", color: theme.ink }}>"{q.text}"</p>
                      <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
                        {q.page && <span style={{ fontFamily: theme.mono, fontSize: "0.72rem", color: theme.inkFaint }}>p. {q.page}</span>}
                        {q.link && <a href={q.link} target="_blank" rel="noopener noreferrer" style={{ fontFamily: theme.mono, fontSize: "0.72rem", color: book.accent, textDecoration: "none", borderBottom: `1px solid ${book.accent}` }}>source link ↗</a>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.2rem", flexShrink: 0 }}>
                      <button onClick={() => startEdit(q)} aria-label="Edit quote" style={{ ...btnStyle, fontSize: "0.85rem" }}>✎</button>
                      <button onClick={() => handleDelete(q.id)} aria-label="Delete quote" style={{ ...btnStyle, fontSize: "1.1rem" }}>×</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {display.length > LIMIT && (
            <button onClick={() => setShowAll(!showAll)} style={{ ...btnStyle, marginTop: "0.8rem", color: book.accent, fontSize: "0.78rem" }}>
              {showAll ? "Show less ↑" : `Show all ${display.length} quotes ↓`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
