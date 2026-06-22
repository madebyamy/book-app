import React, { useState, useEffect } from 'react';
import { BRAND, FONT, USERS } from '../../constants.js';
import { loadBooks, saveBooks } from '../../lib/books.js';
import { CatalogCard } from '../catalogue/CatalogCard.jsx';

export function MyBooksHome({ userId, userAccent, staticBooks, onSelect, onBack, onLogout, onBooksChanged }) {
  const [userBooks, setUserBooks] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState(null);

  useEffect(() => {
    let active = true;
    loadBooks(userId).then((list) => { if (active) { setUserBooks(list); setLoaded(true); } });
    return () => { active = false; };
  }, [userId]);

  const userMarginalia = userBooks.filter((b) => b.inMarginalia);
  const staticIds = new Set(staticBooks.map((b) => b.id));
  const allBooks = [...staticBooks, ...userMarginalia.filter((b) => !staticIds.has(b.id))];

  const handleRemoveFromMarginalia = async (bookId) => {
    const updated = userBooks.map((b) => b.id === bookId ? { ...b, inMarginalia: false } : b);
    await saveBooks(userId, updated);
    setUserBooks(updated);
    setRemoveConfirm(null);
    if (onBooksChanged) onBooksChanged();
  };

  return (
    <div style={{ minHeight: "100vh", background: BRAND.cream, color: BRAND.ink, fontFamily: FONT.body }}>
      <div style={{ background: BRAND.espresso, borderBottom: `3px solid ${BRAND.oakDeep}`, padding: "clamp(28px,4vw,44px) 24px clamp(24px,3vw,36px)", position: "relative" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <button onClick={onBack} style={{ fontFamily: FONT.body, fontSize: 13, letterSpacing: "0.04em", background: "none", border: `1px solid rgba(242,239,235,.3)`, color: "rgba(242,239,235,.7)", padding: "8px 14px", borderRadius: 2, cursor: "pointer" }}>← Back</button>
            <button onClick={onLogout} style={{ fontFamily: FONT.body, fontSize: 13, color: "rgba(242,239,235,.45)", background: "none", border: "none", cursor: "pointer" }}>Sign out</button>
          </div>
          <div style={{ fontFamily: FONT.body, fontSize: 12, letterSpacing: "0.28em", textTransform: "uppercase", color: BRAND.tan, marginBottom: 12 }}>The card catalogue</div>
          <h1 style={{ fontFamily: FONT.display, fontWeight: 500, fontSize: "clamp(34px,5vw,60px)", lineHeight: 1.03, letterSpacing: "-0.01em", color: BRAND.cream, margin: "0 0 14px" }}>
            {USERS[userId].name}'s Marginalia
          </h1>
          <p style={{ fontFamily: FONT.read, fontSize: "clamp(15px,1.3vw,17px)", lineHeight: 1.6, color: "rgba(242,239,235,.62)", margin: 0, maxWidth: "40em" }}>
            Full summaries — key ideas, highlighted stories, quotes, and reading trackers.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "clamp(28px,4vw,48px) 24px clamp(48px,6vw,80px)" }}>
        <div style={{ fontFamily: FONT.type, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: BRAND.muted, marginBottom: 20, borderBottom: `1px solid ${BRAND.line}`, paddingBottom: 10 }}>
          {allBooks.length} {allBooks.length === 1 ? "entry" : "entries"} on file
        </div>
        {!loaded ? (
          <div style={{ fontFamily: FONT.body, fontSize: 14, color: BRAND.muted, padding: "1.5rem 0" }}>Loading…</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {allBooks.map((book) => (
              <CatalogCard key={book.id} userId={userId} book={book} onSelect={onSelect}
                onDelete={userMarginalia.some((b) => b.id === book.id) ? () => setRemoveConfirm(book.id) : undefined} />
            ))}
          </div>
        )}
      </div>

      {removeConfirm && (() => {
        const book = userBooks.find((b) => b.id === removeConfirm);
        return book ? (
          <div onClick={() => setRemoveConfirm(null)} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(38,32,32,.68)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: BRAND.paper, border: `1px solid ${BRAND.line}`, borderRadius: 6, width: "min(420px,100%)", boxShadow: "0 20px 50px rgba(20,30,50,.22)" }}>
              <div style={{ background: BRAND.espresso, padding: "18px 24px 14px", borderRadius: "6px 6px 0 0" }}>
                <div style={{ fontFamily: FONT.body, fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: BRAND.tan, marginBottom: 4 }}>Remove from Marginalia</div>
                <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 18, color: BRAND.cream }}>{book.title}</div>
              </div>
              <div style={{ padding: "20px 24px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
                <p style={{ fontFamily: FONT.read, fontSize: 14, lineHeight: 1.6, color: BRAND.muted, margin: 0 }}>
                  This removes <em>{book.title}</em> from your Marginalia page. All your notes, highlights, and progress are <strong style={{ color: BRAND.ink }}>saved</strong> — the book stays in your Card Catalogue and can be re-added to Marginalia anytime.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setRemoveConfirm(null)} style={{ flex: 1, fontFamily: FONT.body, fontSize: 13, background: "transparent", border: `1px solid ${BRAND.line2}`, color: BRAND.muted, padding: "11px", borderRadius: 3, cursor: "pointer" }}>Cancel</button>
                  <button onClick={() => handleRemoveFromMarginalia(removeConfirm)} style={{ flex: 2, fontFamily: FONT.body, fontSize: 13, letterSpacing: ".04em", background: BRAND.coral, border: "none", color: "#fff", padding: "11px", borderRadius: 3, cursor: "pointer" }}>Remove from Marginalia</button>
                </div>
              </div>
            </div>
          </div>
        ) : null;
      })()}
    </div>
  );
}
