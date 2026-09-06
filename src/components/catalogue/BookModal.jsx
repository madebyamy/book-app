import React, { useState, useEffect } from 'react';
import { BRAND, FONT } from '../../constants.js';
import { loadProgress, saveProgress, saveStatus, loadBooks, saveBooks, loadNotations, saveNotations } from '../../lib/books.js';
import { addJournalEntry } from '../../lib/journal.js';

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

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [notePage, setNotePage] = useState("");
  const [noteShare, setNoteShare] = useState(false);
  const [notesLoaded, setNotesLoaded] = useState(false);

  useEffect(() => {
    if (!userId) return;
    loadNotations(userId, book.id).then(rows => { setNotes(rows); setNotesLoaded(true); });
  }, [userId, book.id]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    const trimmed = noteText.trim();
    if (!trimmed) return;
    const newNote = { id: Date.now().toString(36), text: trimmed, page: notePage.trim(), tag: "", shared: noteShare, addedAt: new Date().toISOString() };
    const updated = [...notes, newNote];
    setNotes(updated);
    setNoteText(""); setNotePage(""); setNoteShare(false);
    await saveNotations(userId, book.id, updated);
    addJournalEntry(userId, { type: 'note', bookId: book.id, bookTitle: book.title, content: trimmed, bookPage: notePage.trim() || null });
  };

  const handleToggleNoteShare = async (id) => {
    const updated = notes.map(n => n.id === id ? { ...n, shared: !n.shared } : n);
    setNotes(updated);
    await saveNotations(userId, book.id, updated);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const books = await loadBooks(userId);
      await saveBooks(userId, books.filter(b => b.id !== book.id));
      onBooksChanged?.();
      onClose();
    } catch { setDeleting(false); }
  };

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
    addJournalEntry(userId, { type: 'finished', bookId: book.id, bookTitle: book.title, content: `Finished reading "${book.title}" by ${book.author}.` });
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
    <>
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 75, background: "rgba(38,32,32,.62)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, animation: "cc-fade .2s cubic-bezier(.16,1,.3,1)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", width: "min(820px,100%)", maxHeight: "88vh", overflowY: "auto", background: BRAND.paper, borderRadius: 6, border: `1px solid ${BRAND.line}`, boxShadow: "0 16px 40px rgba(20,30,50,.16)", animation: "cc-pop .26s cubic-bezier(.16,1,.3,1)" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, zIndex: 2, width: 34, height: 34, borderRadius: "50%", border: `1px solid ${BRAND.line2}`, background: BRAND.paper, color: BRAND.ink, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>

        {/* Single panel — paper background */}
        <div style={{ padding: "32px 32px 28px" }}>
          {/* Call number */}
          <div style={{ fontFamily: FONT.type, fontSize: 10, letterSpacing: ".06em", color: BRAND.terracotta, borderBottom: `1px solid ${BRAND.line}`, paddingBottom: 9, marginBottom: 20 }}>{callNo}</div>

          {/* Two-column header: cover left, title+meta right */}
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "20px 24px", alignItems: "start", marginBottom: 24 }}>
            {/* Cover */}
            <div style={{ flexShrink: 0 }}>
              {showCover ? (
                <img src={book.cover} alt={book.title} style={{ width: 100, height: 148, objectFit: "cover", borderRadius: "3px 5px 5px 3px", boxShadow: "inset -8px 0 0 rgba(0,0,0,.14),0 6px 20px rgba(20,30,50,.18)", display: "block" }} onError={() => setCoverFailed(true)} />
              ) : (
                <div style={{ position: "relative", width: 100, height: 148, borderRadius: "3px 5px 5px 3px", background: spine, boxShadow: "inset -10px 0 0 rgba(0,0,0,.18),0 8px 24px rgba(20,30,50,.16)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "14px 12px 14px 18px" }}>
                  <span style={{ position: "absolute", left: 10, top: 10, bottom: 10, width: 1.5, background: "rgba(255,255,255,.28)" }} />
                  <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 13, lineHeight: 1.1, color: "#fff" }}>{book.title}</div>
                  <div style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 10, color: "rgba(255,255,255,.8)", marginTop: 6 }}>{book.author}</div>
                </div>
              )}
            </div>
            {/* Title + meta */}
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: "clamp(22px,3vw,30px)", lineHeight: 1.05, color: BRAND.ink, margin: "0 0 4px" }}>{book.title}</h2>
              {book.subtitle && <div style={{ fontFamily: FONT.read, fontSize: 13, color: BRAND.muted, marginBottom: 4 }}>{book.subtitle}</div>}
              <div style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 15, color: BRAND.muted, marginBottom: 12 }}>by {book.author}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", fontFamily: FONT.body, fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", color: BRAND.muted }}>
                {book.year && <span>{book.year}</span>}
                {book.pages && <span>{book.pages} pp</span>}
                {readHours && <span>~{readHours}h to read</span>}
              </div>
            </div>
          </div>
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

          {/* Quick notes — below description */}
          <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: `1px solid ${BRAND.line}` }}>
            <div style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: BRAND.muted, marginBottom: 12 }}>Your Notes</div>
            <form onSubmit={handleAddNote} style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: notes.length > 0 ? 12 : 0 }}>
              <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add a note, reaction, or annotation…" rows={2}
                style={{ fontFamily: FONT.read, fontSize: 13.5, lineHeight: 1.55, color: BRAND.ink, background: BRAND.cream, border: `1px solid ${BRAND.line2}`, borderRadius: 3, padding: "8px 10px", resize: "vertical", width: "100%", boxSizing: "border-box", outline: "none" }} />
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <input value={notePage} onChange={e => setNotePage(e.target.value)} placeholder="Page (optional)"
                  style={{ width: 130, fontFamily: FONT.body, fontSize: 12, color: BRAND.ink, background: BRAND.cream, border: `1px solid ${BRAND.line2}`, borderRadius: 3, padding: "7px 10px", outline: "none" }} />
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: FONT.body, fontSize: 12, color: BRAND.muted, cursor: "pointer", userSelect: "none" }}>
                  <input type="checkbox" checked={noteShare} onChange={e => setNoteShare(e.target.checked)} style={{ accentColor: BRAND.terracotta, width: 14, height: 14 }} />
                  Share with readers
                </label>
                <button type="submit" disabled={!noteText.trim()} style={{ marginLeft: "auto", fontFamily: FONT.body, fontSize: 12, letterSpacing: ".04em", background: noteText.trim() ? BRAND.espresso : BRAND.line, border: "none", color: noteText.trim() ? BRAND.cream : BRAND.muted, padding: "8px 16px", borderRadius: 3, cursor: noteText.trim() ? "pointer" : "default" }}>
                  Save note
                </button>
              </div>
            </form>
            {notesLoaded && notes.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {notes.slice(-3).reverse().map(n => (
                  <div key={n.id} style={{ background: BRAND.cream, border: `1px solid ${BRAND.line}`, borderRadius: 3, padding: "9px 12px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: FONT.read, fontSize: 13, lineHeight: 1.55, color: BRAND.ink, margin: "0 0 4px" }}>{n.text}</p>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {n.page && <span style={{ fontFamily: FONT.body, fontSize: 11, color: BRAND.muted }}>p. {n.page}</span>}
                        {n.shared && <span style={{ fontFamily: FONT.body, fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase", color: BRAND.terracotta }}>✓ shared</span>}
                      </div>
                    </div>
                    <button onClick={() => handleToggleNoteShare(n.id)} title={n.shared ? "Stop sharing" : "Share with readers"}
                      style={{ fontFamily: FONT.body, fontSize: 10, letterSpacing: ".05em", background: n.shared ? "rgba(191,117,90,.12)" : "transparent", border: `1px solid ${n.shared ? BRAND.terracotta : BRAND.line2}`, color: n.shared ? BRAND.terracotta : BRAND.muted, padding: "3px 8px", borderRadius: 3, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                      {n.shared ? "Shared" : "Share"}
                    </button>
                  </div>
                ))}
                {notes.length > 3 && <div style={{ fontFamily: FONT.body, fontSize: 11, color: BRAND.muted, fontStyle: "italic" }}>+{notes.length - 3} more — open the book to see all notes</div>}
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

          {/* Delete book */}
          <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${BRAND.line}` }}>
            <button onClick={() => setConfirmDelete(true)}
              style={{ fontFamily: FONT.body, fontSize: 13, letterSpacing: ".04em", background: "transparent", border: `1px solid rgba(217,80,80,.35)`, color: "rgba(200,60,60,.8)", padding: "10px 18px", borderRadius: 3, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(217,80,80,.08)"; e.currentTarget.style.borderColor = "rgba(217,80,80,.6)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(217,80,80,.35)"; }}>
              🗑 Remove from library
            </button>
          </div>
        </div>
      </div>
    </div>
    {/* Delete confirmation */}
    {confirmDelete && (
      <div onClick={() => setConfirmDelete(false)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(38,32,32,.65)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div onClick={e => e.stopPropagation()} style={{ width: "min(400px,100%)", background: BRAND.paper, borderRadius: 8, border: `1px solid ${BRAND.line}`, boxShadow: "0 16px 48px rgba(20,30,50,.2)", padding: "28px 28px 24px", animation: "cc-pop .22s cubic-bezier(.16,1,.3,1)" }}>
          <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 22, color: BRAND.ink, marginBottom: 10 }}>Remove this book?</div>
          <p style={{ fontFamily: FONT.read, fontSize: 14, lineHeight: 1.6, color: BRAND.muted, margin: "0 0 22px" }}>
            <strong style={{ color: BRAND.ink }}>{book.title}</strong> will be removed from your library. This cannot be undone.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={() => setConfirmDelete(false)} style={{ fontFamily: FONT.body, fontSize: 13, background: "transparent", border: `1px solid ${BRAND.line2}`, color: BRAND.muted, padding: "10px 18px", borderRadius: 3, cursor: "pointer" }}>
              Cancel
            </button>
            <button onClick={handleDelete} disabled={deleting} style={{ fontFamily: FONT.body, fontSize: 13, fontWeight: 500, background: "#C83C3C", border: "none", color: "#fff", padding: "10px 20px", borderRadius: 3, cursor: deleting ? "default" : "pointer", opacity: deleting ? .7 : 1 }}>
              {deleting ? "Removing…" : "Yes, remove it"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
