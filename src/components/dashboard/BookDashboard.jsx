import React, { useState } from 'react';
import { BRAND, FONT, DEFAULT_THEME, MARGINALIA_THEME } from '../../constants.js';
import { loadBooks, saveBooks, loadDateAdded, saveDateAdded } from '../../lib/books.js';
import { todayISO, formatCatalogDate } from '../../lib/helpers.js';
import { PageTracker } from './PageTracker.jsx';
import { BookEditorPanel } from './BookEditorPanel.jsx';
import { AcademicSections } from './AcademicSections.jsx';
import { YourQuotes } from './YourQuotes.jsx';
import { YourNotations } from './YourNotations.jsx';
import { FriendsReadingThis } from './FriendsReadingThis.jsx';
import { BookChat } from './BookChat.jsx';

function DateAddedInverted({ userId, book, theme }) {
  theme = theme || book.theme || {};
  const [date, setDate] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [loaded, setLoaded] = useState(false);

  React.useEffect(() => {
    let active = true;
    setLoaded(false);
    loadDateAdded(userId, book.id).then(async (val) => {
      if (!active) return;
      if (val) { setDate(val); }
      else { const today = todayISO(); await saveDateAdded(userId, book.id, today); if (active) setDate(today); }
      if (active) setLoaded(true);
    });
    return () => { active = false; };
  }, [userId, book.id]);

  const commit = async () => {
    const val = draft || todayISO();
    setDate(val); setEditing(false);
    await saveDateAdded(userId, book.id, val);
  };

  if (!loaded) return null;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontFamily: theme.mono, fontSize: "0.72rem", color: `${theme.headerInk}aa` }}>
      <span style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>Added</span>
      {editing ? (
        <input type="date" value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit} onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }} autoFocus style={{ background: theme.headerBg, border: `1px solid ${theme.headerInk}`, color: theme.headerInk, fontFamily: theme.mono, fontSize: "0.72rem", padding: "0.2rem 0.4rem", borderRadius: 2 }} />
      ) : (
        <button onClick={() => { setDraft(date || todayISO()); setEditing(true); }} title="Click to edit" style={{ background: "none", border: "none", borderBottom: `1px dotted ${theme.headerInk}66`, color: theme.headerInk, fontFamily: theme.mono, fontSize: "0.72rem", padding: 0, cursor: "pointer" }}>{formatCatalogDate(date)}</button>
      )}
    </div>
  );
}

export function BookDashboard({ userId, book: initialBook, onBack, onLogout }) {
  const [book, setBook] = useState(initialBook);
  const theme = { ...(book.theme ? DEFAULT_THEME : MARGINALIA_THEME), ...(book.theme || {}) };
  const hasAcademic = !!(book.nodes && book.nodes.length && book.caseFile && book.keyLines && book.thread);
  const [openNode, setOpenNode] = useState(null);
  const isUserBook = book.id.startsWith("book-") || book.id.startsWith("shelf-");

  const handleToggleShared = async () => {
    const allBooks = await loadBooks(userId);
    const updated = allBooks.map((b) => b.id === book.id ? { ...b, shared: !b.shared } : b);
    await saveBooks(userId, updated);
    setBook((prev) => ({ ...prev, shared: !prev.shared }));
  };

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.ink }}>
      <div style={{ padding: "1.4rem 1.8rem", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: "1rem", background: theme.headerBg }}>
        <button onClick={onBack} style={{ background: "none", border: `1px solid ${theme.headerInk}55`, color: theme.headerInk, fontFamily: theme.mono, fontSize: "0.75rem", padding: "0.5rem 0.9rem", borderRadius: 3, cursor: "pointer" }}>← All books</button>
        <span style={{ fontFamily: theme.mono, fontSize: "0.72rem", color: `${theme.headerInk}99` }}>{book.author} · {book.year}</span>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "1.2rem" }}>
          <DateAddedInverted userId={userId} book={book} theme={theme} />
          <button onClick={onLogout} style={{ background: "none", border: `1px solid ${theme.headerInk}33`, color: `${theme.headerInk}88`, fontFamily: theme.mono, fontSize: "0.65rem", padding: "0.3rem 0.65rem", borderRadius: 3, cursor: "pointer" }}>Log out</button>
        </span>
      </div>
      <div style={{ padding: "3rem 1.8rem 5rem", maxWidth: 980, margin: "0 auto" }}>
        <div style={{ fontFamily: theme.mono, fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: book.accent, marginBottom: "0.8rem" }}>Book summary</div>
        <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", marginBottom: "1.6rem" }}>
          {book.cover && (
            <img src={book.cover} alt={book.title} style={{ width: 110, height: 160, objectFit: "cover", borderRadius: 4, flexShrink: 0, boxShadow: "0 6px 20px rgba(0,0,0,0.45)" }} onError={(e) => e.target.style.display = "none"} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontFamily: theme.display, fontWeight: theme.displayWeight, fontSize: "clamp(2rem, 5vw, 3.4rem)", lineHeight: 1.02, margin: "0 0 0.6rem", color: theme.ink }}>{book.title}</h1>
            {book.subtitle && <div style={{ fontFamily: theme.mono, fontSize: "0.76rem", color: theme.inkSoft, marginBottom: "0.5rem", letterSpacing: "0.03em" }}>{book.subtitle}</div>}
            {book.tagline && <p style={{ fontSize: "1rem", color: theme.inkSoft, margin: 0, maxWidth: "60ch", lineHeight: 1.5 }}>{book.tagline}</p>}
          </div>
        </div>
        <PageTracker userId={userId} book={book} theme={theme} />
        <BookEditorPanel userId={userId} book={book} theme={theme} onSaved={setBook} />
        {hasAcademic && <AcademicSections book={book} theme={theme} openNode={openNode} setOpenNode={setOpenNode} />}
        <YourQuotes userId={userId} book={book} theme={theme} />
        <YourNotations userId={userId} book={book} theme={theme} />

        {/* Share toggle — only for user-added books in Marginalia */}
        {isUserBook && (
          <div style={{ marginTop: "2.4rem", borderTop: `1px solid ${BRAND.line}`, paddingTop: "1.6rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: BRAND.muted, marginBottom: 4 }}>Share with connections</div>
              <div style={{ fontFamily: FONT.read, fontSize: 13.5, color: BRAND.muted, lineHeight: 1.5 }}>
                {book.shared ? "Your notes and highlights are visible to connected readers who also have this book." : "Share your notes and highlights with connected readers who have this book."}
              </div>
            </div>
            <button onClick={handleToggleShared} style={{ flexShrink: 0, fontFamily: FONT.body, fontSize: 13, letterSpacing: ".04em", background: book.shared ? BRAND.terracotta : "transparent", border: `1px solid ${book.shared ? BRAND.terracotta : BRAND.line2}`, color: book.shared ? "#fff" : BRAND.muted, padding: "9px 18px", borderRadius: 3, cursor: "pointer", transition: "all .2s", whiteSpace: "nowrap" }}>
              {book.shared ? "✓ Shared" : "Share"}
            </button>
          </div>
        )}

        <FriendsReadingThis userId={userId} book={book} theme={theme} />
        <BookChat userId={userId} book={book} theme={theme} />
      </div>
    </div>
  );
}
