import React, { useState, useEffect, useCallback } from 'react';
import { USERS } from '../../constants.js';
import { loadQuotes, saveQuotes } from '../../lib/books.js';

export function YourQuotes({ userId, book, theme }) {
  theme = theme || book.theme || {};
  const [quotes, setQuotes] = useState([]);
  const [text, setText] = useState("");
  const [page, setPage] = useState("");
  const [link, setLink] = useState("");
  const [loaded, setLoaded] = useState(false);

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
  }, [userId, text, page, link, quotes, book.id]);

  const handleDelete = useCallback(async (id) => {
    const updated = quotes.filter((q) => q.id !== id);
    setQuotes(updated);
    await saveQuotes(userId, book.id, updated);
  }, [userId, quotes, book.id]);

  return (
    <div style={{ marginTop: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "0.8rem", marginBottom: "1.2rem" }}>
        <h3 style={{ fontFamily: theme.display, fontWeight: theme.displayWeight, fontSize: "1.3rem", margin: 0, color: theme.ink }}>{USERS[userId].name}'s Quotes</h3>
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
        <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
          {quotes.slice().reverse().map((q) => (
            <div key={q.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 3, padding: "1rem 1.2rem" }}>
              <div>
                <p style={{ fontFamily: theme.display, fontStyle: "italic", fontSize: "0.95rem", lineHeight: 1.5, margin: "0 0 0.3rem", color: theme.ink }}>"{q.text}"</p>
                <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
                  {q.page && <span style={{ fontFamily: theme.mono, fontSize: "0.72rem", color: theme.inkFaint }}>{q.page}</span>}
                  {q.link && <a href={q.link} target="_blank" rel="noopener noreferrer" style={{ fontFamily: theme.mono, fontSize: "0.72rem", color: book.accent, textDecoration: "none", borderBottom: `1px solid ${book.accent}` }}>source link ↗</a>}
                </div>
              </div>
              <button onClick={() => handleDelete(q.id)} aria-label="Delete quote" style={{ background: "none", border: "none", color: theme.inkFaint, cursor: "pointer", fontSize: "1.1rem", lineHeight: 1, flexShrink: 0 }}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
