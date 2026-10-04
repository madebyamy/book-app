import React, { useState, useEffect } from 'react';
import { BRAND, FONT } from '../../constants.js';
import { loadProgress, saveProgress, saveStatus, loadBooks, saveBooks, loadNotations, saveNotations } from '../../lib/books.js';
import { addJournalEntry } from '../../lib/journal.js';
import { IndexCardModalFrame, cardSection, cardSectionLabel, cardFieldLabel, cardField, ruledText, darkAction, drawerChip } from './IndexCardModalFrame.jsx';

export function callNumberFor(book) {
  if (book.call) return book.call;
  const last = (book.author || "").trim().split(" ").pop() || "";
  return `${last.slice(0, 3).toUpperCase() || "???"}-${book.year || "NEW"}`;
}

function paceNote(pages, pagesRead, endISO) {
  if (!endISO) return null;
  const end = new Date(endISO + "T00:00:00");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = Math.round((end - today) / 86400000);
  const label = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  if (days < 0) return `That date has passed. Pick a new one whenever you like.`;
  if (!pages) return `Aiming to finish by ${label}.`;
  const left = Math.max(0, pages - (pagesRead || 0));
  return `~${Math.ceil(left / Math.max(1, days + 1))} pages a day to finish by ${label}`;
}

function spineColor(book) {
  const SPINE_COLORS = ["#BF755A","#F25C5C","#2A201B","#D9A282","#9a6a3f","#6B4A3A","#3E7C57","#3a6ea5"];
  return book.accent || SPINE_COLORS[Math.abs(((book.id||"").charCodeAt(0) + ((book.id||"").charCodeAt(2)||0))) % SPINE_COLORS.length];
}

function estimateReadTime(pages) {
  if (!pages) return null;
  return Math.round(((pages * 250) / 200 / 60) * 10) / 10;
}

export function BookModal({ userId, book, drawers, currentDrawer, onMove, onClose, onToggleMarginalia, onDelete, onBooksChanged, onPrev, onNext, onRate }) {
  const spine = spineColor(book);
  const callNo = callNumberFor(book);
  const [hoverStar, setHoverStar] = useState(0);
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
      await onDelete?.(book);
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
    <IndexCardModalFrame callNumber={callNo} drawerName={drawers.find((d) => d.id === currentDrawer)?.name} onClose={onClose} onPrev={onPrev} onNext={onNext}>
        <style>{`@media (max-width:720px){.bm-dates{grid-template-columns:1fr!important}} @media (max-width:520px){.bm-head{grid-template-columns:72px 1fr!important;gap:14px!important}.bm-cover{width:72px!important;height:106px!important}}`}</style>
        <div>
          {/* Two-column header: cover left, title+meta right */}
          <div className="bm-head" style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "20px 24px", alignItems: "start", marginBottom: 24 }}>
            {/* Cover */}
            <div style={{ flexShrink: 0 }}>
              {showCover ? (
                <img className="bm-cover" src={book.cover} alt={book.title} style={{ width: 96, height: 140, objectFit: "cover", borderRadius: "2px 4px 4px 2px", boxShadow: "0 8px 18px rgba(0,0,0,.25)", display: "block" }} onError={() => setCoverFailed(true)} />
              ) : (
                <div className="bm-cover" style={{ position: "relative", width: 96, height: 140, borderRadius: "2px 4px 4px 2px", background: spine, boxShadow: "0 8px 18px rgba(0,0,0,.25)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "14px 10px 14px 16px", overflow: "hidden" }}>
                  <span style={{ position: "absolute", left: 10, top: 10, bottom: 10, width: 1.5, background: "rgba(255,255,255,.28)" }} />
                  <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 13, lineHeight: 1.1, color: "#fff" }}>{book.title}</div>
                  <div style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 10, color: "rgba(255,255,255,.8)", marginTop: 6 }}>{book.author}</div>
                </div>
              )}
            </div>
            {/* Title + meta */}
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: "clamp(24px,4vw,38px)", lineHeight: 1.05, color: BRAND.ink, margin: "0 0 4px", overflowWrap: "anywhere" }}>{book.title}</h2>
              {book.subtitle && <div style={{ fontFamily: FONT.read, fontSize: 13, color: BRAND.muted, marginBottom: 4 }}>{book.subtitle}</div>}
              <div style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 17, color: BRAND.muted, marginBottom: 12 }}>by {book.author}</div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 14px", fontFamily: FONT.type, fontSize: 12, letterSpacing: ".04em", color: "#4a3a2c" }}>
                {book.year && <span>{book.year}</span>}
                {book.pages && <span>{book.pages} pp</span>}
                {readHours && <span>~{readHours}h to read</span>}
                {onRate && (
                  <span onMouseLeave={() => setHoverStar(0)} style={{ display: "inline-flex", gap: 1 }} aria-label="Your rating">
                    {[1, 2, 3, 4, 5].map((n) => {
                      const shown = hoverStar || book.rating || 0;
                      return (
                        <button key={n} onClick={() => onRate(book.rating === n ? 0 : n)} onMouseEnter={() => setHoverStar(n)} title={`${n} star${n !== 1 ? "s" : ""}`}
                          style={{ background: "none", border: "none", padding: "0 1px", cursor: "pointer", fontSize: 17, lineHeight: 1, color: n <= shown ? BRAND.coral : "#C9B79A" }}>
                          {n <= shown ? "★" : "☆"}
                        </button>
                      );
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            {editingSummary ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <textarea value={summaryDraft} onChange={(e) => setSummaryDraft(e.target.value)} rows={5} autoFocus
                  style={{ ...cardField, fontFamily: FONT.read, lineHeight: 1.65, resize: "vertical", width: "100%", boxSizing: "border-box" }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={handleSaveSummary} disabled={savingSummary}
                    style={{ fontFamily: FONT.type, fontSize: 12.5, letterSpacing: ".04em", background: BRAND.coral, border: "none", color: "#fff", padding: "8px 16px", borderRadius: 2, cursor: "pointer" }}>
                    {savingSummary ? "Saving…" : "Save description"}
                  </button>
                  <button onClick={() => { setEditingSummary(false); setSummaryDraft(book.summary || book.tagline || ""); }}
                    style={{ fontFamily: FONT.body, fontSize: 12, background: "transparent", border: `1px solid ${BRAND.line2}`, color: BRAND.muted, padding: "7px 14px", borderRadius: 3, cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ position: "relative" }}>
                {summaryDraft ? (
                  <p style={{ ...ruledText, color: "#3a302a", margin: 0 }}>{summaryDraft}</p>
                ) : (
                  <p style={{ ...ruledText, fontStyle: "italic", color: BRAND.muted, margin: 0 }}>No description yet.</p>
                )}
                <button onClick={() => setEditingSummary(true)}
                  style={{ marginTop: 10, background: "none", border: `1px solid ${BRAND.line2}`, color: "#4a3a2c", fontFamily: FONT.type, fontSize: 11.5, letterSpacing: ".04em", textTransform: "uppercase", padding: "5px 10px", borderRadius: 2, cursor: "pointer", whiteSpace: "nowrap" }}>
                  ✎ Edit description
                </button>
              </div>
            )}
          </div>

          {/* Quick notes — below description */}
          <div style={{ ...cardSection, marginBottom: 4 }}>
            <div style={cardSectionLabel}>Your Notes</div>
            <form onSubmit={handleAddNote} style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: notes.length > 0 ? 12 : 0 }}>
              <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add a note, reaction, or annotation…" rows={2}
                style={{ ...cardField, fontFamily: FONT.read, lineHeight: 1.55, resize: "vertical", width: "100%", boxSizing: "border-box" }} />
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <input value={notePage} onChange={e => setNotePage(e.target.value)} placeholder="Page (optional)"
                  style={{ ...cardField, width: 130, fontSize: 13, padding: "8px 10px" }} />
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: FONT.type, fontSize: 12, color: "#4a3a2c", cursor: "pointer", userSelect: "none" }}>
                  <input type="checkbox" checked={noteShare} onChange={e => setNoteShare(e.target.checked)} style={{ accentColor: BRAND.coral, width: 14, height: 14 }} />
                  Share with readers
                </label>
                <button type="submit" disabled={!noteText.trim()} style={{ marginLeft: "auto", fontFamily: FONT.type, fontSize: 12.5, letterSpacing: ".04em", background: noteText.trim() ? BRAND.coral : "#E8DCCB", border: "none", color: noteText.trim() ? "#fff" : "#8a7b70", padding: "9px 16px", borderRadius: 2, cursor: noteText.trim() ? "pointer" : "default" }}>
                  Save note
                </button>
              </div>
            </form>
            {notesLoaded && notes.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {notes.slice(-3).reverse().map(n => (
                  <div key={n.id} style={{ background: "#FBF6E8", border: `1px solid ${BRAND.cardEdge}`, borderRadius: 2, padding: "9px 12px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: FONT.type, fontSize: 13.5, lineHeight: 1.55, color: BRAND.ink, margin: "0 0 4px", overflowWrap: "anywhere" }}>{n.text}</p>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {n.page && <span style={{ fontFamily: FONT.type, fontSize: 11.5, color: BRAND.terracotta }}>p. {n.page}</span>}
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

          <div style={cardSection}>
          <div style={cardSectionLabel}>File in a drawer</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {drawers.map((dr) => {
              const active = currentDrawer === dr.id;
              return (
                <button key={dr.id} onClick={() => onMove(dr.id)}
                  style={{ ...drawerChip(active), display: "inline-flex", alignItems: "center", gap: 7, transition: "all .2s" }}>
                  <span>{active ? "✓" : "+"}</span>{dr.name}
                </button>
              );
            })}
          </div>
          {currentDrawer && (
            <div style={{ marginTop: 16, fontFamily: FONT.type, fontSize: 12, color: BRAND.terracotta }}>
              Filed in the "{drawers.find((d) => d.id === currentDrawer)?.name}" drawer.
            </div>
          )}
          </div>
          {/* Reading Dates & Tracker */}
          {userId && (
            <div style={cardSection}>
              <div style={cardSectionLabel}>Reading Dates</div>
              <div className="bm-dates" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 0 }}>
                  <span style={cardFieldLabel}>Start date</span>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={cardField} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 0 }}>
                  <span style={cardFieldLabel}>Projected end</span>
                  <input type="date" value={projEndDate} onChange={(e) => setProjEndDate(e.target.value)} style={cardField} />
                </label>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px 16px" }}>
                {trackerSaved ? (
                  <span style={darkAction(true)}>✓ On your Book Tracker</span>
                ) : (
                  <button onClick={handleAddToTracker} style={darkAction(false)}>
                    <span style={{ fontSize: 15 }}>📌</span> Add to Book Tracker
                  </button>
                )}
                {projEndDate && (
                  <span style={{ fontFamily: FONT.type, fontSize: 12, color: BRAND.terracotta }}>
                    {paceNote(book.pages, prog?.pagesRead, projEndDate)}
                  </span>
                )}
              </div>
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px dashed ${BRAND.line2}` }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <span style={cardFieldLabel}>Finished date <span style={{ fontStyle: "italic", opacity: .7 }}>— fills in when you complete the book</span></span>
                  <input type="date" value={finishedDate} onChange={(e) => handleFinishedDate(e.target.value)}
                    style={{ ...cardField, maxWidth: 200 }} />
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
          <div style={cardSection}>
            <div style={cardSectionLabel}>Marginalia</div>
            <p style={{ fontFamily: FONT.type, fontSize: 12.5, lineHeight: 1.6, color: "#4a3a2c", margin: "0 0 12px" }}>
              {book.inMarginalia ? "This book is on your Marginalia page." : "Add this book to your Marginalia page to track notes, highlights, and reading progress."}
            </p>
            <button onClick={onToggleMarginalia} style={darkAction(book.inMarginalia)} title={book.inMarginalia ? "Remove from Marginalia" : "Add to Marginalia"}>
              {book.inMarginalia ? "✓ In your Marginalia" : <><span style={{ fontSize: 15 }}>📖</span> Add to Marginalia</>}
            </button>
          </div>

          {/* Delete book */}
          <div style={cardSection}>
            <button onClick={() => setConfirmDelete(true)}
              style={{ fontFamily: FONT.type, fontSize: 13, letterSpacing: ".04em", background: "transparent", border: `1px solid ${BRAND.coral}`, color: BRAND.coral, padding: "10px 18px", borderRadius: 2, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(242,92,92,.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              🗑 Remove from library
            </button>
          </div>
        </div>
    </IndexCardModalFrame>
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
