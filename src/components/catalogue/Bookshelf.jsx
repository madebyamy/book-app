import React, { useState, useEffect, useRef } from 'react';
import { addJournalEntry } from '../../lib/journal.js';
import { storage } from '../../storage.js';
import { BRAND, FONT, DEFAULT_DRAWERS, DRAWER_TO_STATUS, BRASS_GRAD, BRASS_BORDER, CC_DRAWER_STORE, CC_ASSIGN_STORE } from '../../constants.js';
import { loadBooks, saveBooks, saveStatus, saveProgress } from '../../lib/books.js';
import { AddBookModal } from './AddBookModal.jsx';
import { BookModal, callNumberFor } from './BookModal.jsx';
import { RecommendationsPanel } from './RecommendationsPanel.jsx';
import { CardCatalogueDrawer } from './CardCatalogueDrawer.jsx';

const RECS_DRAWER_ID = "recommendations";

function CatalogueDeleteModal({ book, onRemoveFromMarginalia, onDeleteAll, onCancel }) {
  return (
    <div onClick={onCancel} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(38,32,32,.68)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: BRAND.paper, border: `1px solid ${BRAND.line}`, borderRadius: 6, width: "min(480px,100%)", boxShadow: "0 20px 50px rgba(20,30,50,.22)", animation: "cc-pop .22s cubic-bezier(.16,1,.3,1)" }}>
        <div style={{ background: BRAND.espresso, padding: "20px 26px 16px", borderRadius: "6px 6px 0 0", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(242,92,92,.2)", border: "1px solid rgba(242,92,92,.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🗑</div>
          <div>
            <div style={{ fontFamily: FONT.body, fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: BRAND.tan }}>Remove book</div>
            <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 19, color: BRAND.cream, lineHeight: 1.1, marginTop: 2 }}>{book.title}</div>
          </div>
        </div>
        <div style={{ padding: "22px 26px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          {book.inMarginalia && (
            <button onClick={onRemoveFromMarginalia} style={{ textAlign: "left", background: BRAND.cream, border: `1px solid ${BRAND.line}`, borderRadius: 4, padding: "14px 16px", cursor: "pointer", display: "flex", gap: 13, alignItems: "flex-start" }}>
              <span style={{ fontSize: 20, marginTop: 1 }}>📖</span>
              <div>
                <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 14, color: BRAND.ink, marginBottom: 3 }}>Remove from Marginalia only</div>
                <div style={{ fontFamily: FONT.read, fontSize: 13, lineHeight: 1.5, color: BRAND.muted }}>Hides this book from your Marginalia page. All your notes and progress are kept — you can re-add it to Marginalia anytime from the Card Catalogue.</div>
              </div>
            </button>
          )}
          <button onClick={onDeleteAll} style={{ textAlign: "left", background: "rgba(242,92,92,.05)", border: `1px solid rgba(242,92,92,.3)`, borderRadius: 4, padding: "14px 16px", cursor: "pointer", display: "flex", gap: 13, alignItems: "flex-start" }}>
            <span style={{ fontSize: 20, marginTop: 1 }}>🗑</span>
            <div>
              <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 14, color: BRAND.coral, marginBottom: 3 }}>Delete book entirely</div>
              <div style={{ fontFamily: FONT.read, fontSize: 13, lineHeight: 1.5, color: BRAND.muted }}>Permanently removes this book from the Card Catalogue and Marginalia, including all notes, progress, and quotes.</div>
            </div>
          </button>
          <button onClick={onCancel} style={{ fontFamily: FONT.body, fontSize: 13, letterSpacing: ".04em", background: "transparent", border: `1px solid ${BRAND.line2}`, color: BRAND.muted, padding: "11px", borderRadius: 3, cursor: "pointer", marginTop: 4 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const SFX_KEY = "bookbrain:sfx";

// Load drawer audio once; split at midpoint for open vs close
let _actx = null;
let _drawerBuf = null;

async function _loadDrawerAudio() {
  if (_drawerBuf) return;
  try {
    _actx = new (window.AudioContext || window.webkitAudioContext)();
    const res = await fetch("/drawer-sound.mp3");
    const ab = await res.arrayBuffer();
    _drawerBuf = await _actx.decodeAudioData(ab);
  } catch {}
}

function _playSegment(start, duration) {
  if (!_drawerBuf || !_actx) return;
  if (_actx.state === "suspended") _actx.resume();
  const src = _actx.createBufferSource();
  src.buffer = _drawerBuf;
  src.connect(_actx.destination);
  src.start(0, start, duration);
}

function playDrawerSound() {
  if (!_drawerBuf) return;
  _playSegment(0, _drawerBuf.duration / 2);
}

function playDrawerCloseSound() {
  if (!_drawerBuf) return;
  const half = _drawerBuf.duration / 2;
  _playSegment(half, _drawerBuf.duration - half);
}

export function Bookshelf({ userId, userAccent, onBack, onLogout, onBooksChanged, inline = false }) {
  const [allBooks, setAllBooks] = useState([]);
  const [drawers, setDrawers] = useState(() => {
    try { const s = localStorage.getItem(CC_DRAWER_STORE(userId)); return s ? JSON.parse(s) : DEFAULT_DRAWERS; } catch { return DEFAULT_DRAWERS; }
  });
  const [openDrawer, setOpenDrawer] = useState(null);
  const [openingDrawer, setOpeningDrawer] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const selectedBookRef = useRef(null);

  // Push a history entry when a book modal opens so back closes it instead of exiting the site
  const openBook = (book) => {
    window.history.pushState({ bookModal: book.id }, "", window.location.href);
    setSelectedBook(book);
    selectedBookRef.current = book;
  };
  const closeBook = () => {
    setSelectedBook(null);
    selectedBookRef.current = null;
  };

  useEffect(() => {
    const onPop = () => {
      if (selectedBookRef.current) {
        setSelectedBook(null);
        selectedBookRef.current = null;
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const [showAddBook, setShowAddBook] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteDrawerTarget, setDeleteDrawerTarget] = useState(null);
  const [moveDestination, setMoveDestination] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try { return localStorage.getItem(SFX_KEY) !== "off"; } catch { return true; }
  });

  useEffect(() => { _loadDrawerAudio(); }, []);

  const [cardOrder, setCardOrder] = useState([]);
  const [newDrawerId, setNewDrawerId] = useState(null);
  const [datesAdded, setDatesAdded] = useState({});
  const [progressById, setProgressById] = useState({});

  useEffect(() => {
    let active = true;
    Promise.all([storage.getPrefix(`${userId}:dateAdded:`), storage.getPrefix(`${userId}:progress:`)]).then(([added, prog]) => {
      if (!active) return;
      const parsed = {};
      Object.entries(prog || {}).forEach(([id, v]) => { try { parsed[id] = JSON.parse(v); } catch {} });
      setDatesAdded(added || {});
      setProgressById(parsed);
    });
    return () => { active = false; };
  }, [userId, selectedBook]);

  useEffect(() => {
    let active = true;
    loadBooks(userId).then((list) => {
      if (!active) return;
      const oldAssign = (() => { try { const r = localStorage.getItem(CC_ASSIGN_STORE(userId)); return r ? JSON.parse(r) : {}; } catch { return {}; } })();
      const migrated = list.map((b) => ({ ...b, drawerId: b.drawerId || oldAssign[b.id] || "want" }));
      setAllBooks(migrated);
      setLoaded(true);
    });
    return () => { active = false; };
  }, [userId]);

  const persistDrawers = (nextDrawers) => {
    try { localStorage.setItem(CC_DRAWER_STORE(userId), JSON.stringify(nextDrawers)); } catch {}
  };

  const updateBooks = async (updated) => {
    setAllBooks(updated);
    await saveBooks(userId, updated);
    if (onBooksChanged) onBooksChanged();
  };

  const moveBook = async (book, drawerId) => {
    const updated = allBooks.map((b) => b.id === book.id ? { ...b, drawerId } : b);
    await updateBooks(updated);
    setSelectedBook((prev) => prev?.id === book.id ? { ...prev, drawerId } : prev);
    await saveStatus(userId, book.id, DRAWER_TO_STATUS[drawerId] || "to-read");
  };

  const toggleSfx = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try { localStorage.setItem(SFX_KEY, next ? "on" : "off"); } catch {}
      return next;
    });
  };

  const toggleDrawer = (id) => {
    setOpenDrawer((prev) => {
      if (prev === id) {
        if (soundEnabled) playDrawerCloseSound();
        return null;
      }
      if (soundEnabled) playDrawerSound();
      setOpeningDrawer(id);
      setTimeout(() => setOpeningDrawer(null), 500);
      return id;
    });
  };

  const addDrawer = () => {
    const id = "d" + Date.now();
    const next = [...drawers, { id, name: "New Shelf", removable: true }];
    setDrawers(next);
    persistDrawers(next);
    setNewDrawerId(id);
  };

  const renameDrawer = (id, name) => {
    const next = drawers.map((d) => d.id === id ? { ...d, name } : d);
    setDrawers(next);
    persistDrawers(next);
  };

  const removeDrawerById = (id) => removeDrawer({ stopPropagation() {} }, id);

  const catalogueBooks = allBooks.map((b) => {
    const p = progressById[b.id] || {};
    const d = b.drawerId || "want";
    const added = datesAdded[b.id] || null;
    let date = added, dateKind = "Added";
    if (d === "read") { date = p.dateFinished || added; dateKind = p.dateFinished ? "Finished" : "Read"; }
    else if (d === "reading") { date = p.startDate || added; dateKind = p.startDate ? "Started" : "Added"; }
    else if (d === "dnf") dateKind = "Set aside";
    return { ...b, description: b.summary || b.tagline || "", callNumber: callNumberFor(b), date: date ? String(date).slice(0, 10) : null, dateKind };
  });

  const openBookById = (id, orderedIds) => {
    const book = allBooks.find((b) => b.id === id);
    if (!book) return;
    if (orderedIds) setCardOrder(orderedIds);
    if (selectedBookRef.current) { setSelectedBook(book); selectedBookRef.current = book; }
    else openBook(book);
  };

  const stepBook = (delta) => {
    if (!selectedBook || !cardOrder.length) return;
    const i = cardOrder.indexOf(selectedBook.id);
    const nextId = cardOrder[(i + delta + cardOrder.length) % cardOrder.length];
    openBookById(nextId);
  };

  const removeDrawer = (e, id) => {
    e.stopPropagation();
    if (drawers.length <= 1) return;
    const otherDrawers = drawers.filter((d) => d.id !== id);
    setMoveDestination(otherDrawers[0]?.id || "");
    setDeleteDrawerTarget(id);
    if (openDrawer === id) setOpenDrawer(null);
  };

  const confirmDeleteDrawer = () => {
    if (!deleteDrawerTarget) return;
    const dest = moveDestination || drawers.filter((d) => d.id !== deleteDrawerTarget)[0]?.id;
    const nextDrawers = drawers.filter((d) => d.id !== deleteDrawerTarget);
    const updated = allBooks.map((b) => b.drawerId === deleteDrawerTarget ? { ...b, drawerId: dest } : b);
    setDrawers(nextDrawers);
    persistDrawers(nextDrawers);
    updateBooks(updated);
    setDeleteDrawerTarget(null);
    setMoveDestination("");
  };

  const handleAddBook = async ({ title, author, pages, summary, cover, year, drawerId, workId, inMarginalia, dateFinished }) => {
    const id = `book-${userId}-${Date.now().toString(36)}`;
    const targetDrawer = drawerId || openDrawer || "want";
    const newBook = { id, title, author, pages: pages || null, summary: summary || null, cover: cover || null, year: year || null, accent: userAccent, drawerId: targetDrawer, inMarginalia: inMarginalia !== false, shared: false, workId: workId || null, nodes: [], theme: null };
    const updated = [...allBooks, newBook];
    await updateBooks(updated);
    await saveStatus(userId, id, DRAWER_TO_STATUS[targetDrawer] || "to-read");
    if (dateFinished) await saveProgress(userId, id, { totalPages: pages || null, pagesRead: pages || 0, dateFinished, finishDate: "" });
    addJournalEntry(userId, { type: 'added', bookId: id, bookTitle: title, content: `Added "${title}" by ${author} to the reading list.` });
    setShowAddBook(false);
    setOpenDrawer(targetDrawer);
  };

  const handleAddFromRecommendation = async (rec, fromName) => {
    const id = `book-${userId}-${Date.now().toString(36)}`;
    const newBook = { id, title: rec.bookTitle, author: rec.bookAuthor, pages: null, summary: rec.bookDesc || null, cover: rec.bookCover || null, year: null, accent: userAccent, drawerId: "want", inMarginalia: false, shared: false, workId: null, nodes: [], theme: null, recommendedBy: fromName || "a friend" };
    const updated = [...allBooks, newBook];
    await updateBooks(updated);
    await saveStatus(userId, id, "to-read");
    addJournalEntry(userId, { type: 'added', bookId: id, bookTitle: rec.bookTitle, content: `Added "${rec.bookTitle}" to the reading list (recommended by ${fromName || "a friend"}).` });
  };

  const handleRateBook = async (book, rating) => {
    const updated = allBooks.map((b) => b.id === book.id ? { ...b, rating } : b);
    await updateBooks(updated);
    if (rating > 0) addJournalEntry(userId, { type: 'rating', bookId: book.id, bookTitle: book.title, stars: rating, content: `Gave ${rating} star${rating !== 1 ? 's' : ''} to this book.` });
  };

  const handleToggleMarginalia = async (book) => {
    const updated = allBooks.map((b) => b.id === book.id ? { ...b, inMarginalia: !b.inMarginalia } : b);
    await updateBooks(updated);
    setSelectedBook((prev) => prev?.id === book.id ? { ...prev, inMarginalia: !prev.inMarginalia } : prev);
  };

  const handleRemoveFromMarginalia = async (book) => {
    const updated = allBooks.map((b) => b.id === book.id ? { ...b, inMarginalia: false } : b);
    await updateBooks(updated);
    setDeleteTarget(null);
  };

  const handleDeleteBook = async (book) => {
    const updated = allBooks.filter((b) => b.id !== book.id);
    await updateBooks(updated);
    await Promise.all([
      storage.delete(`${userId}:progress:${book.id}`),
      storage.delete(`${userId}:status:${book.id}`),
      storage.delete(`${userId}:dateAdded:${book.id}`),
    ]);
    setDeleteTarget(null);
    setSelectedBook(null);
  };

  const booksInDrawer = (id) => allBooks.filter((b) => (b.drawerId || "want") === id);
  const openBooks = openDrawer ? booksInDrawer(openDrawer) : [];
  const openDrawerName = drawers.find((d) => d.id === openDrawer)?.name || "";

  return (
    <div style={{ background: BRAND.cream, overflowX: "hidden", ...(inline ? {} : { minHeight: "100vh" }) }}>
      {!inline && (
        <div style={{ background: BRAND.espresso, borderBottom: "1px solid rgba(217,162,130,.18)", padding: "clamp(24px,4vw,44px) 28px clamp(20px,3vw,32px)" }}>
          <div style={{ maxWidth: 1040, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <button onClick={onBack} style={{ fontFamily: FONT.body, fontSize: 13, letterSpacing: ".04em", background: "none", border: "1px solid rgba(242,239,235,.3)", color: "rgba(242,239,235,.7)", padding: "8px 14px", borderRadius: 2, cursor: "pointer" }}>← Back</button>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowAddBook(true)} style={{ fontFamily: FONT.body, fontSize: 13, letterSpacing: ".04em", textTransform: "uppercase", background: BRAND.coral, border: `1px solid ${BRAND.coral}`, color: "#fff", padding: "8px 16px", borderRadius: 2, cursor: "pointer" }}>+ Add book</button>
                <button onClick={onLogout} style={{ fontFamily: FONT.body, fontSize: 13, color: "rgba(242,239,235,.45)", background: "none", border: "none", cursor: "pointer" }}>Sign out</button>
              </div>
            </div>
            <div style={{ fontFamily: FONT.body, fontSize: 12, letterSpacing: ".28em", textTransform: "uppercase", color: BRAND.tan, marginBottom: 10 }}>The card catalogue</div>
            <h1 style={{ fontFamily: FONT.display, fontWeight: 500, fontSize: "clamp(30px,4.5vw,52px)", lineHeight: 1.03, letterSpacing: "-.01em", color: BRAND.cream, margin: "0 0 10px" }}>
              Pull a drawer. Find a book. <span style={{ fontStyle: "italic", color: BRAND.coral }}>Open the card.</span>
            </h1>
            <p style={{ fontFamily: FONT.read, fontSize: "clamp(14px,1.2vw,16px)", lineHeight: 1.6, color: "rgba(242,239,235,.62)", margin: 0 }}>Your shelves, filed the old-fashioned way.</p>
          </div>
        </div>
      )}

      {showAddBook && <AddBookModal drawers={drawers} onAdd={handleAddBook} onClose={() => setShowAddBook(false)} />}

      {selectedBook && (
        <BookModal
          key={selectedBook.id}
          userId={userId}
          book={allBooks.find((b) => b.id === selectedBook.id) || selectedBook}
          drawers={drawers}
          currentDrawer={(allBooks.find((b) => b.id === selectedBook.id) || selectedBook).drawerId || "want"}
          onMove={(drawerId) => moveBook(selectedBook, drawerId)}
          onClose={closeBook}
          onToggleMarginalia={() => handleToggleMarginalia(selectedBook)}
          onDelete={(b) => handleDeleteBook(b)}
          onBooksChanged={onBooksChanged}
          onRate={(r) => handleRateBook(allBooks.find((b) => b.id === selectedBook.id) || selectedBook, r)}
          onPrev={cardOrder.length > 1 ? () => stepBook(-1) : undefined}
          onNext={cardOrder.length > 1 ? () => stepBook(1) : undefined}
        />
      )}

      {deleteTarget && (
        <CatalogueDeleteModal
          book={deleteTarget}
          onRemoveFromMarginalia={() => handleRemoveFromMarginalia(deleteTarget)}
          onDeleteAll={() => handleDeleteBook(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {deleteDrawerTarget && (() => {
        const drawer = drawers.find((d) => d.id === deleteDrawerTarget);
        const booksInIt = allBooks.filter((b) => (b.drawerId || "want") === deleteDrawerTarget);
        const otherDrawers = drawers.filter((d) => d.id !== deleteDrawerTarget);
        return (
          <div onClick={() => setDeleteDrawerTarget(null)} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(38,32,32,.68)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: BRAND.paper, border: `1px solid ${BRAND.line}`, borderRadius: 6, width: "min(460px,100%)", boxShadow: "0 20px 50px rgba(20,30,50,.22)", animation: "cc-pop .22s cubic-bezier(.16,1,.3,1)" }}>
              <div style={{ background: BRAND.espresso, padding: "20px 26px 16px", borderRadius: "6px 6px 0 0", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(242,92,92,.2)", border: "1px solid rgba(242,92,92,.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🗑</div>
                <div>
                  <div style={{ fontFamily: FONT.body, fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: BRAND.tan }}>Delete drawer</div>
                  <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 19, color: BRAND.cream, lineHeight: 1.1, marginTop: 2 }}>{drawer?.name}</div>
                </div>
              </div>
              <div style={{ padding: "22px 26px 26px", display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ fontFamily: FONT.read, fontSize: 14, lineHeight: 1.6, color: BRAND.ink }}>
                  {booksInIt.length > 0
                    ? <>This drawer contains <strong>{booksInIt.length} {booksInIt.length === 1 ? "book" : "books"}</strong>. Where would you like to move {booksInIt.length === 1 ? "it" : "them"} before deleting?</>
                    : <>This drawer is empty. Are you sure you want to delete it?</>}
                </div>
                {booksInIt.length > 0 && (
                  <div>
                    <label style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: BRAND.muted, display: "block", marginBottom: 8 }}>Move books to</label>
                    <select value={moveDestination} onChange={(e) => setMoveDestination(e.target.value)}
                      style={{ width: "100%", fontFamily: FONT.body, fontSize: 14, color: BRAND.ink, background: BRAND.cream, border: `1px solid ${BRAND.line2}`, borderRadius: 3, padding: "10px 12px", cursor: "pointer" }}>
                      {otherDrawers.map((d) => <option key={d.id} value={d.id}>{d.name} ({allBooks.filter(b => (b.drawerId || "want") === d.id).length} books)</option>)}
                    </select>
                  </div>
                )}
                <div style={{ background: "rgba(242,92,92,.06)", border: "1px solid rgba(242,92,92,.2)", borderRadius: 4, padding: "10px 14px", fontFamily: FONT.body, fontSize: 12.5, color: BRAND.coral, lineHeight: 1.5 }}>
                  ⚠ This cannot be undone. The drawer will be permanently deleted.
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setDeleteDrawerTarget(null)} style={{ flex: 1, fontFamily: FONT.body, fontSize: 13, background: "transparent", border: `1px solid ${BRAND.line2}`, color: BRAND.muted, padding: "11px", borderRadius: 3, cursor: "pointer" }}>Cancel</button>
                  <button onClick={confirmDeleteDrawer} style={{ flex: 2, fontFamily: FONT.body, fontSize: 13, letterSpacing: ".04em", background: BRAND.coral, border: "none", color: "#fff", padding: "11px", borderRadius: 3, cursor: "pointer", fontWeight: 500 }}>
                    {booksInIt.length > 0 ? `Move & delete drawer` : "Delete drawer"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <section style={{ maxWidth: 1040, margin: "0 auto", padding: "clamp(16px,2.5vw,28px) clamp(12px,3.5vw,28px) clamp(48px,7vw,80px)" }}>
        {!loaded ? (
          <div style={{ textAlign: "center", padding: "60px 0", fontFamily: FONT.read, fontStyle: "italic", color: BRAND.muted }}>Loading your catalogue…</div>
        ) : (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10, maxWidth: 900, margin: "0 auto 14px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <button onClick={() => setShowAddBook(true)} style={{ background: BRASS_GRAD, border: BRASS_BORDER, borderRadius: 2, padding: "8px 18px", boxShadow: "0 1px 2px rgba(0,0,0,.4),inset 0 1px 1px rgba(255,255,255,.5)", fontFamily: FONT.body, fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: "#3a2c12", cursor: "pointer" }}>
                  + Add a Book
                </button>
                <button onClick={addDrawer} style={{ background: "transparent", border: `1px solid ${BRAND.line2}`, borderRadius: 2, padding: "8px 16px", fontFamily: FONT.body, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: BRAND.ink, cursor: "pointer" }}>
                  + Add a Drawer
                </button>
              </div>
              <button onClick={toggleSfx} title={soundEnabled ? "Mute drawer sound" : "Enable drawer sound"} aria-label={soundEnabled ? "Mute drawer sound" : "Enable drawer sound"}
                style={{ background: "transparent", border: `1px solid ${BRAND.line2}`, borderRadius: 2, padding: "6px 10px", fontSize: 14, cursor: "pointer", lineHeight: 1, opacity: soundEnabled ? 1 : .5 }}>
                {soundEnabled ? "🔊" : "🔇"}
              </button>
            </div>

            <CardCatalogueDrawer
              books={catalogueBooks}
              drawers={drawers}
              drawerOf={(b) => b.drawerId || "want"}
              openDrawer={openDrawer === RECS_DRAWER_ID ? null : openDrawer}
              onDrawerChange={(id) => toggleDrawer(id ?? openDrawer)}
              onOpenBook={openBookById}
              onRenameDrawer={renameDrawer}
              onRemoveDrawer={removeDrawerById}
              editDrawerId={newDrawerId}
              onEditDone={() => setNewDrawerId(null)}
              extraFaces={[{ id: RECS_DRAWER_ID, name: "Recommendations", sub: "from friends", paper: "#EFE6D2", onClick: () => setOpenDrawer(RECS_DRAWER_ID) }]}
            />

            <div style={{ marginTop: 18, textAlign: "center", fontFamily: FONT.read, fontStyle: "italic", fontSize: 15, color: BRAND.muted }}>
              Pull a drawer to open it · hover a drawer to rename it
            </div>

            {/* Recommendations drawer popup */}
            {openDrawer === RECS_DRAWER_ID && (
              <div onClick={() => setOpenDrawer(null)}
                style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(10,5,0,.72)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)", display: "flex", alignItems: "flex-end", justifyContent: "center", animation: "cc-fade-in .22s ease" }}>
                <div onClick={(e) => e.stopPropagation()}
                  style={{ width: "min(980px,100%)", maxHeight: "82vh", display: "flex", flexDirection: "column", animation: "drawer-slide-up .38s cubic-bezier(.16,1,.3,1)" }}>
                  <div style={{ background: "linear-gradient(180deg,#C8924E 0%,#A0682A 40%,#7A4A1C 100%)", borderRadius: "8px 8px 0 0", border: "2px solid #3a200a", borderBottom: "none", padding: "14px 24px 0", boxShadow: "0 -6px 24px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.18)", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <span style={{ width: 16, height: 16, borderRadius: "50%", background: "radial-gradient(circle at 38% 30%,#E8CF93,#C2A35E)", border: BRASS_BORDER, flexShrink: 0, boxShadow: "0 1px 3px rgba(0,0,0,.5)" }} />
                        <div>
                          <div style={{ fontFamily: FONT.body, fontSize: 9.5, letterSpacing: ".26em", textTransform: "uppercase", color: "rgba(251,246,232,.55)" }}>Open drawer</div>
                          <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 22, color: "#FBF6E8", lineHeight: 1 }}>Recommendations</div>
                        </div>
                      </div>
                      <button onClick={() => setOpenDrawer(null)}
                        style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", background: "rgba(0,0,0,.35)", color: "#FBF6E8", border: "1px solid rgba(251,246,232,.28)", cursor: "pointer", padding: "7px 14px", borderRadius: 2 }}>
                        Push shut ✕
                      </button>
                    </div>
                    <div style={{ height: 8, background: "linear-gradient(180deg,#E8CF93 0%,#C2A35E 45%,#8F7233 100%)", borderRadius: "3px 3px 0 0", boxShadow: "0 2px 4px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.5)", border: "1px solid #6b5220", borderBottom: "none" }} />
                  </div>
                  <div style={{ background: "linear-gradient(180deg,#2A1608 0%,#1E0F04 100%)", border: "2px solid #3a200a", borderTop: "none", overflowY: "auto", flex: 1, scrollbarWidth: "thin", scrollbarColor: "#5C3418 #1E0F04" }}>
                    <div style={{ padding: "24px 32px 36px" }}>
                      <RecommendationsPanel userId={userId} onAddBook={handleAddFromRecommendation} />
                    </div>
                  </div>
                  <div style={{ height: 16, background: "linear-gradient(180deg,#7A4A1C,#4A2C16)", border: "2px solid #3a200a", borderTop: "none", borderRadius: "0 0 4px 4px", flexShrink: 0 }} />
                </div>
              </div>
            )}

          </>
        )}
      </section>

    </div>
  );
}
