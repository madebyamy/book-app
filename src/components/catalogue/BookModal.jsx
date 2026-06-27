import React, { useState, useEffect } from 'react';
import { BRAND, FONT } from '../../constants.js';
import { loadProgress, saveProgress, saveStatus, loadBooks, saveBooks } from '../../lib/books.js';

function spineColor(book) {
  const SPINE_COLORS = ["#BF755A","#F25C5C","#2A201B","#D9A282","#9a6a3f","#6B4A3A","#3E7C57","#3a6ea5"];
  return book.accent || SPINE_COLORS[Math.abs(((book.id||"").charCodeAt(0) + ((book.id||"").charCodeAt(2)||0))) % SPINE_COLORS.length];
}

function estimateReadTime(pages) {
  if (!pages) return null;
  return Math.round(((pages * 250) / 200 / 60) * 10) / 10;
}

export function BookModal({ userId, book, drawers, currentDrawer, onMove, onClose, onToggleMarginalia, onBooksChanged }) {
  const spine = spineColor(book);
  const callNo = book.call || `${book.year || "????"} · ${(book.author || "").split(" ").pop().slice(0, 3).toUpperCase()}`;
  const readHours = estimateReadTime(book.pages);
  const [coverFailed, setCoverFailed] = useState(false);
  const showCover = book.cover && !coverFailed;
  const [editingSummary, setEditingSummary] = useState(false);
  const [summaryDraft, setSummaryDraft] = useState(book.summary || book.tagline || "");
  const [savingSummary, setSavingSummary] = useState(false);

  const [prog, setProg] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [projEndDate, setProjEndDate] = useState("");
  const [finishedDate, setFinishedDate] = useState("");
  const [trackerSaved, setTrackerSaved] = useState(false);

  useEffect(() => {
    if (!userId) return;
    loadProgress(userId, book.id).then((p) => {
      setProg(p);
      setStartDate(p?.startDate || "");
      setProjEndDate(p?.finishDate || "");
      setFinishedDate(p?.dateFinished || "");
      if (p?.tracking === true) setTrackerSaved(true);
    });
  }, [userId, book.id]);

  const handleAddToTracker = async () => {
    const next = { ...(prog || {}), tracking: true, pagesRead: prog?.pagesRead || 0, startDate, finishDate: projEndDate };
    await saveProgress(userId, book.id, next);
    setProg(next);
    setTrackerSaved(true);
    if (currentDrawer !== "reading") onMove("reading");
    if (onBooksChanged) onBooksChanged();
  };

  const handleFinishedDate = async (date) => {
    setFinishedDate(date);
    if (!date) return;
    const next = { ...(prog || {}), dateFinished: date, tracking: false };
    await saveProgress(userId, book.id, next);
    setProg(next);
    await saveStatus(userId, book.id, "read");
    onMove("read");
    if (onBooksChanged) onBooksChanged();
  };

  const handleSaveSummary = async () => {
    setSavingSummary(true);
    const allBooks = await loadBooks(userId);
    const updated = allBooks.map((b) => b.id === book.id ? { ...b, summary: summaryDraft.trim() } : b);
    await saveBooks(userId, updated);
    setSavingSummary(false);
    setEditingSummary(false);
    if (onBooksChanged) onBooksChanged();
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 75, background: "rgba(38,32,32,.62)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, animation: "cc-fade .2s cubic-bezier(.16,1,.3,1)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", width: "min(820px,100%)", maxHeight: "88vh", overflowY: "auto", display: "grid", gridTemplateColumns: "min(280px,40%) 1fr", background: BRAND.paper, borderRadius: 6, border: `1px solid ${BRAND.line}`, boxShadow: "0 16px 40px rgba(20,30,50,.16)", animation: "cc-pop .26s cubic-bezier(.16,1,.3,1)" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, zIndex: 2, width: 34, height: 34, borderRadius: "50%", border: `1px solid ${BRAND.line2}`, background: BRAND.paper, color: BRAND.ink, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        {/* Left — espresso cover */}
        <div style={{ background: BRAND.espresso, padding: "34px 28px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
          {showCover ? (
            <img src={book.cover} alt={book.title} style={{ width: 140, height: 204, objectFit: "cover", borderRadius: "3px 5px 5px 3px", boxShadow: "inset -10px 0 0 rgba(0,0,0,.18),0 8px 28px rgba(0,0,0,.45)" }} onError={() => setCoverFailed(true)} />
          ) : (
            <div style={{ position: "relative", width: 148, height: 216, borderRadius: "3px 5px 5px 3px", background: spine, boxShadow: "inset -12px 0 0 rgba(0,0,0,.18),0 16px 40px rgba(20,30,50,.16)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "20px 18px 20px 26px" }}>
              <span style={{ position: "absolute", left: 13, top: 14, bottom: 14, width: 1.5, background: "rgba(255,255,255,.28)", display: "block" }} />
              <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 19, lineHeight: 1.08, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,.3)" }}>{book.title}</div>
              <div style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 12, color: "rgba(255,255,255,.82)", marginTop: 8 }}>{book.author}</div>
            </div>
          )}
          <div style={{ display: "flex", gap: 14, fontFamily: FONT.body, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(242,239,235,.7)" }}>
            {book.year && <span>{book.year}</span>}
            {book.year && book.pages && <span style={{ opacity: .4 }}>·</span>}
            {book.pages && <span>{book.pages} pp</span>}
            {readHours && <><span style={{ opacity: .4 }}>·</span><span>~{readHours}h</span></>}
          </div>
        </div>
        {/* Right — paper details */}
        <div style={{ padding: "34px 32px 28px" }}>
          <div style={{ fontFamily: FONT.type, fontSize: 10, letterSpacing: ".06em", color: BRAND.terracotta, borderBottom: `1px solid ${BRAND.line}`, paddingBottom: 9, marginBottom: 16 }}>{callNo}</div>
          <h2 style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 30, lineHeight: 1.05, color: BRAND.ink, margin: "0 0 4px" }}>{book.title}</h2>
          {book.subtitle && <div style={{ fontFamily: FONT.read, fontSize: 14, color: BRAND.muted, marginBottom: 4 }}>{book.subtitle}</div>}
          <div style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 15, color: BRAND.muted, marginBottom: 18 }}>by {book.author}</div>
          <div style={{ marginBottom: 24 }}>
            {editingSummary ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <textarea value={summaryDraft} onChange={(e) => setSummaryDraft(e.target.value)} rows={5} autoFocus
                  style={{ fontFamily: FONT.read, fontSize: 14, lineHeight: 1.65, color: BRAND.ink, background: BRAND.cream, border: `1px solid ${BRAND.line2}`, borderRadius: 3, padding: "10px 12px", resize: "vertical", width: "100%", boxSizing: "border-box", outline: "none" }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={handleSaveSummary} disabled={savingSummary}
                    style={{ fontFamily: FONT.body, fontSize: 12, letterSpacing: ".04em", background: BRAND.espresso, border: "none", color: BRAND.cream, padding: "7px 16px", borderRadius: 3, cursor: "pointer" }}>
                    {savingSummary ? "Saving…" : "Save"}
                  </button>
                  <button onClick={() => { setEditingSummary(false); setSummaryDraft(book.summary || book.tagline || ""); }}
                    style={{ fontFamily: FONT.body, fontSize: 12, background: "transparent", border: `1px solid ${BRAND.line2}`, color: BRAND.muted, padding: "7px 14px", borderRadius: 3, cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ position: "relative", group: true }}>
                {summaryDraft ? (
                  <p style={{ fontFamily: FONT.read, fontSize: 15, lineHeight: 1.65, color: BRAND.ink, margin: 0 }}>{summaryDraft}</p>
                ) : (
                  <p style={{ fontFamily: FONT.read, fontSize: 14, fontStyle: "italic", color: BRAND.muted, margin: 0 }}>No description yet.</p>
                )}
                <button onClick={() => setEditingSummary(true)}
                  style={{ marginTop: 6, background: "none", border: `1px solid ${BRAND.line2}`, color: BRAND.muted, fontFamily: FONT.body, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 3, cursor: "pointer" }}>
                  ✎ Edit description
                </button>
              </div>
            )}
          </div>
          <div style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: BRAND.muted, marginBottom: 11 }}>File in a drawer</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {drawers.map((dr) => {
              const active = currentDrawer === dr.id;
              return (
                <button key={dr.id} onClick={() => onMove(dr.id)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: FONT.body, fontSize: 13, letterSpacing: ".03em", cursor: "pointer", padding: "10px 15px", borderRadius: 2, border: active ? `1px solid ${BRAND.coral}` : `1px solid ${BRAND.line2}`, background: active ? BRAND.coral : "transparent", color: active ? "#fff" : BRAND.muted, transition: "all .2s" }}>
                  <span>{active ? "✓" : "+"}</span>{dr.name}
                </button>
              );
            })}
          </div>
          {currentDrawer && (
            <div style={{ marginTop: 16, fontFamily: FONT.read, fontStyle: "italic", fontSize: 13.5, color: BRAND.muted }}>
              Filed in the "{drawers.find((d) => d.id === currentDrawer)?.name}" drawer.
            </div>
          )}
          {/* Reading Dates & Tracker */}
          {userId && (
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${BRAND.line}` }}>
              <div style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: BRAND.muted, marginBottom: 14 }}>Reading Dates</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <span style={{ fontFamily: FONT.body, fontSize: 11.5, color: BRAND.muted }}>Start date</span>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    style={{ fontFamily: FONT.body, fontSize: 13, background: BRAND.cream, border: `1px solid ${BRAND.line2}`, color: BRAND.ink, padding: "8px 10px", borderRadius: 3, outline: "none" }} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <span style={{ fontFamily: FONT.body, fontSize: 11.5, color: BRAND.muted }}>Projected end</span>
                  <input type="date" value={projEndDate} onChange={(e) => setProjEndDate(e.target.value)}
                    style={{ fontFamily: FONT.body, fontSize: 13, background: BRAND.cream, border: `1px solid ${BRAND.line2}`, color: BRAND.ink, padding: "8px 10px", borderRadius: 3, outline: "none" }} />
                </label>
              </div>
              {trackerSaved ? (
                <div style={{ fontFamily: FONT.body, fontSize: 13, color: BRAND.terracotta, background: "rgba(191,117,90,.08)", border: `1px solid rgba(191,117,90,.3)`, borderRadius: 3, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                  ✓ On your reading tracker
                </div>
              ) : (
                <button onClick={handleAddToTracker} style={{ fontFamily: FONT.body, fontSize: 13, letterSpacing: ".03em", background: BRAND.espresso, border: "none", color: BRAND.cream, padding: "11px 18px", borderRadius: 3, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 15 }}>📌</span> Add to Book Tracker
                </button>
              )}
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${BRAND.line}` }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <span style={{ fontFamily: FONT.body, fontSize: 11.5, color: BRAND.muted }}>Finished date <span style={{ fontStyle: "italic", opacity: .7 }}>— fills in when you complete the book</span></span>
                  <input type="date" value={finishedDate} onChange={(e) => handleFinishedDate(e.target.value)}
                    style={{ fontFamily: FONT.body, fontSize: 13, background: BRAND.cream, border: `1px solid ${BRAND.line2}`, color: BRAND.ink, padding: "8px 10px", borderRadius: 3, outline: "none", maxWidth: 200 }} />
                </label>
                {finishedDate && (
                  <div style={{ marginTop: 8, fontFamily: FONT.read, fontStyle: "italic", fontSize: 13, color: BRAND.terracotta }}>
                    Moved to your Read drawer ✓
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Marginalia toggle */}
          <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${BRAND.line}` }}>
            <div style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: BRAND.muted, marginBottom: 11 }}>Marginalia</div>
            {book.inMarginalia ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "rgba(191,117,90,.08)", border: `1px solid rgba(191,117,90,.3)`, borderRadius: 4, padding: "12px 14px" }}>
                <div style={{ fontFamily: FONT.read, fontSize: 14, color: BRAND.terracotta }}>✓ In your Marginalia</div>
                <button onClick={onToggleMarginalia} style={{ fontFamily: FONT.body, fontSize: 12, letterSpacing: ".04em", background: "transparent", border: `1px solid ${BRAND.line2}`, color: BRAND.muted, padding: "6px 12px", borderRadius: 3, cursor: "pointer", whiteSpace: "nowrap" }}>Remove</button>
              </div>
            ) : (
              <>
                <p style={{ fontFamily: FONT.read, fontSize: 13.5, lineHeight: 1.55, color: BRAND.muted, margin: "0 0 12px" }}>
                  Add this book to your Marginalia page to track notes, highlights, and reading progress.
                </p>
                <button onClick={onToggleMarginalia} style={{ fontFamily: FONT.body, fontSize: 13, letterSpacing: ".04em", background: BRAND.espresso, border: "none", color: BRAND.cream, padding: "11px 20px", borderRadius: 3, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 15 }}>📖</span> Add to Marginalia
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
