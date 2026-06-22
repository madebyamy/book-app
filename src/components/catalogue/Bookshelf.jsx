import React, { useState, useEffect } from 'react';
import { storage } from '../../storage.js';
import { BRAND, FONT, DEFAULT_DRAWERS, DRAWER_TO_STATUS, OAK_FACE, BRASS_GRAD, BRASS_GRAD_V, BRASS_BORDER, CC_DRAWER_STORE, CC_ASSIGN_STORE } from '../../constants.js';
import { loadBooks, saveBooks, saveStatus } from '../../lib/books.js';
import { AddBookModal } from './AddBookModal.jsx';
import { BookModal } from './BookModal.jsx';

function BrassLabelHolder({ name, isEditing, draft, onInput, onKey, onCommit }) {
  return (
    <div style={{ position: "absolute", left: "50%", top: 30, transform: "translateX(-50%)", width: 132, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: 132, background: BRASS_GRAD_V, border: BRASS_BORDER, borderRadius: 3, padding: 4, boxShadow: "0 2px 3px rgba(0,0,0,.4),inset 0 1px 1px rgba(255,255,255,.55)" }}>
        <div style={{ background: "#FBF6E8", border: "1px solid #ddceac", borderRadius: 1, minHeight: 42, display: "flex", alignItems: "center", justifyContent: "center", padding: "6px 7px", boxShadow: "inset 0 1px 2px rgba(0,0,0,.14)" }}>
          {isEditing ? (
            <input autoFocus value={draft} onInput={onInput} onKeyDown={onKey} onBlur={onCommit} onClick={(e) => e.stopPropagation()} maxLength={22}
              style={{ width: "100%", border: "none", outline: "none", background: "#FFFCF2", textAlign: "center", fontFamily: FONT.type, fontSize: 13, color: "#2c2014", padding: "2px" }} />
          ) : (
            <span style={{ fontFamily: FONT.type, fontSize: 13, lineHeight: 1.18, letterSpacing: ".01em", color: "#2c2014", textAlign: "center", wordBreak: "break-word" }}>{name}</span>
          )}
        </div>
      </div>
      <div style={{ width: 8, height: 13, background: `linear-gradient(180deg,#C2A35E,#8F7233)`, border: BRASS_BORDER, borderTop: "none" }} />
      <div style={{ width: 46, height: 11, borderRadius: "0 0 4px 4px", background: BRASS_GRAD, border: BRASS_BORDER, boxShadow: "0 2px 3px rgba(0,0,0,.4),inset 0 1px 1px rgba(255,255,255,.5)" }} />
      <div style={{ marginTop: 11, width: 19, height: 19, borderRadius: "50%", background: "radial-gradient(circle at 38% 30%,#E8CF93,#C2A35E 52%,#8F7233)", border: BRASS_BORDER, boxShadow: "0 2px 3px rgba(0,0,0,.45),inset 0 1px 1px rgba(255,255,255,.6)" }} />
    </div>
  );
}

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

function StarRating({ rating, onRate }) {
  const [hoverStar, setHoverStar] = useState(0);
  const displayed = hoverStar || rating || 0;
  return (
    <div style={{ display: "flex", gap: 2 }}
      onMouseLeave={() => setHoverStar(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n}
          onClick={(e) => { e.stopPropagation(); onRate(rating === n ? 0 : n); }}
          onMouseEnter={() => setHoverStar(n)}
          title={`${n} star${n !== 1 ? "s" : ""}`}
          style={{ background: "none", border: "none", padding: "1px 0", cursor: "pointer", fontSize: 14, lineHeight: 1, color: n <= displayed ? "#C2A35E" : "#C9B79A", transition: "color .12s, transform .12s", transform: hoverStar === n ? "scale(1.25)" : "scale(1)" }}>
          {n <= displayed ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}

function IndexCard({ book, delay, onOpen, onDelete, onRate }) {
  const [hovered, setHovered] = useState(false);
  const [trashHovered, setTrashHovered] = useState(false);
  const tabTitle = book.title.length > 14 ? book.title.slice(0, 13) + "…" : book.title;
  const callNo = book.call || `${book.year || "????"} · ${(book.author || "").split(" ").pop().slice(0, 3).toUpperCase()}`;
  const summary = book.summary || book.tagline || null;
  return (
    <div style={{ flexShrink: 0, width: 220, position: "relative", animation: `card-shuffle .5s cubic-bezier(.16,1,.3,1) ${delay}ms both` }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => { setHovered(false); setTrashHovered(false); }}>
      <div style={{ position: "relative", transition: "transform .26s cubic-bezier(.16,1,.3,1),box-shadow .26s cubic-bezier(.16,1,.3,1)", transform: hovered && !trashHovered ? "translateY(-8px)" : "none", boxShadow: hovered ? "0 16px 40px rgba(20,30,50,.16)" : "0 4px 12px rgba(20,30,50,.10)" }}>
        <div style={{ marginLeft: 18, width: 118, height: 26, background: "#F6EEDD", border: "1px solid #E2D4BC", borderBottom: "none", borderRadius: "5px 5px 0 0", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8px", overflow: "hidden" }}>
          <span style={{ fontFamily: FONT.type, fontSize: 10, color: "#4a3a28", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tabTitle}</span>
        </div>
        <button onClick={onOpen} style={{ display: "block", width: "100%", textAlign: "left", cursor: "pointer", border: "none", padding: 0, background: "transparent" }}>
          <div style={{ background: "#F6EEDD", border: "1px solid #E2D4BC", borderTop: "none", borderRadius: "0 0 3px 3px", padding: "14px 16px 12px" }}>
            <div style={{ fontFamily: FONT.type, fontSize: 10, letterSpacing: ".04em", color: BRAND.terracotta, borderBottom: "1px solid #C9B79A", paddingBottom: 8, marginBottom: 10 }}>{callNo}</div>
            <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 18, lineHeight: 1.1, color: BRAND.ink, marginBottom: 4 }}>{book.title}</div>
            <div style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 12.5, color: BRAND.muted, marginBottom: 9 }}>{book.author}</div>
            {summary ? (
              <div style={{ fontFamily: FONT.read, fontSize: 11.5, lineHeight: 1.5, color: "#5a4a38", marginBottom: 9, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{summary}</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 9 }}>
                {[0.7, 0.5, 0.3].map((op, i) => <div key={i} style={{ height: 1, background: "#C9B79A", opacity: op }} />)}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <StarRating rating={book.rating || 0} onRate={onRate} />
              <span style={{ fontFamily: FONT.body, fontSize: 11, color: BRAND.coral }}>Read card →</span>
            </div>
          </div>
        </button>
      </div>
      {hovered && onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(book); }}
          onMouseEnter={() => setTrashHovered(true)}
          onMouseLeave={() => setTrashHovered(false)}
          title="Remove book"
          style={{ position: "absolute", top: 30, right: -10, width: 28, height: 28, borderRadius: "50%", border: `1px solid ${trashHovered ? "rgba(242,92,92,.5)" : "#E2D4BC"}`, background: trashHovered ? "rgba(242,92,92,.12)" : "#F6EEDD", color: trashHovered ? BRAND.coral : "#8a7a68", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, transition: "all .18s", boxShadow: "0 2px 6px rgba(20,30,50,.12)", zIndex: 3 }}>
          🗑
        </button>
      )}
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
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");
  const [hoveredDrawer, setHoveredDrawer] = useState(null);
  const [showAddBook, setShowAddBook] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try { return localStorage.getItem(SFX_KEY) !== "off"; } catch { return true; }
  });

  useEffect(() => { _loadDrawerAudio(); }, []);

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
    if (editing) { commitEdit(); return; }
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

  const startEdit = (e, id, name) => { e.stopPropagation(); setEditing(id); setDraft(name); };
  const commitEdit = () => {
    if (!editing) return;
    const name = draft.trim() || "Untitled";
    const next = drawers.map((d) => d.id === editing ? { ...d, name } : d);
    setDrawers(next);
    persistDrawers(next);
    setEditing(null); setDraft("");
  };

  const addDrawer = () => {
    const id = "d" + Date.now();
    const next = [...drawers, { id, name: "New Shelf", removable: true }];
    setDrawers(next);
    persistDrawers(next);
    setEditing(id); setDraft("New Shelf");
  };

  const removeDrawer = (e, id) => {
    e.stopPropagation();
    if (drawers.length <= 1) return;
    const nextDrawers = drawers.filter((d) => d.id !== id);
    const fallback = nextDrawers[0].id;
    const updated = allBooks.map((b) => b.drawerId === id ? { ...b, drawerId: fallback } : b);
    setDrawers(nextDrawers);
    persistDrawers(nextDrawers);
    updateBooks(updated);
    if (openDrawer === id) setOpenDrawer(null);
  };

  const handleAddBook = async ({ title, author, pages, summary, cover, year, drawerId, workId }) => {
    const id = `book-${userId}-${Date.now().toString(36)}`;
    const targetDrawer = drawerId || openDrawer || "want";
    const newBook = { id, title, author, pages: pages || null, summary: summary || null, cover: cover || null, year: year || null, accent: userAccent, drawerId: targetDrawer, inMarginalia: false, shared: false, workId: workId || null, nodes: [], theme: null };
    const updated = [...allBooks, newBook];
    await updateBooks(updated);
    await saveStatus(userId, id, DRAWER_TO_STATUS[targetDrawer] || "to-read");
    setShowAddBook(false);
    setOpenDrawer(targetDrawer);
  };

  const handleRateBook = async (book, rating) => {
    const updated = allBooks.map((b) => b.id === book.id ? { ...b, rating } : b);
    await updateBooks(updated);
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
          userId={userId}
          book={allBooks.find((b) => b.id === selectedBook.id) || selectedBook}
          drawers={drawers}
          currentDrawer={(allBooks.find((b) => b.id === selectedBook.id) || selectedBook).drawerId || "want"}
          onMove={(drawerId) => moveBook(selectedBook, drawerId)}
          onClose={() => setSelectedBook(null)}
          onToggleMarginalia={() => handleToggleMarginalia(selectedBook)}
          onBooksChanged={onBooksChanged}
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

      <section style={{ maxWidth: 1040, margin: "0 auto", padding: "clamp(16px,2.5vw,28px) 28px clamp(48px,7vw,80px)" }}>
        {!loaded ? (
          <div style={{ textAlign: "center", padding: "60px 0", fontFamily: FONT.read, fontStyle: "italic", color: BRAND.muted }}>Loading your catalogue…</div>
        ) : (
          <>
            <div style={{ padding: 14, borderRadius: 5, background: "linear-gradient(180deg,#6E4422,#4A2C16)", boxShadow: "0 16px 40px rgba(20,30,50,.16),inset 0 1px 0 rgba(255,255,255,.14)", border: "2px solid #3a230f" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <button onClick={() => setShowAddBook(true)} style={{ background: BRASS_GRAD, border: BRASS_BORDER, borderRadius: 2, padding: "5px 22px", boxShadow: "0 1px 2px rgba(0,0,0,.4),inset 0 1px 1px rgba(255,255,255,.5)", fontFamily: FONT.body, fontSize: 11, letterSpacing: ".34em", textTransform: "uppercase", color: "#3a2c12", cursor: "pointer", transition: "filter .18s", outline: "none" }}
                  onMouseEnter={(e) => e.currentTarget.style.filter = "brightness(1.08)"}
                  onMouseLeave={(e) => e.currentTarget.style.filter = ""}>
                  + Add a Book
                </button>
                <button onClick={toggleSfx} title={soundEnabled ? "Mute drawer sound" : "Enable drawer sound"}
                  style={{ background: "rgba(0,0,0,.28)", border: BRASS_BORDER, borderRadius: 2, padding: "5px 10px", boxShadow: "0 1px 2px rgba(0,0,0,.4)", fontFamily: FONT.body, fontSize: 14, color: soundEnabled ? "#E8CF93" : "rgba(251,246,232,.35)", cursor: "pointer", lineHeight: 1, transition: "color .2s", outline: "none" }}>
                  {soundEnabled ? "🔊" : "🔇"}
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,160px),1fr))", gap: 9 }}>
                {drawers.map((dr) => {
                  const count = booksInDrawer(dr.id).length;
                  const isOpen = openDrawer === dr.id;
                  const isHovered = hoveredDrawer === dr.id;
                  const isEditingThis = editing === dr.id;
                  return (
                    <div key={dr.id} onClick={() => toggleDrawer(dr.id)}
                      onMouseEnter={() => setHoveredDrawer(dr.id)}
                      onMouseLeave={() => setHoveredDrawer(null)}
                      style={{ position: "relative", height: 166, cursor: "pointer", borderRadius: 3, border: "1px solid #4A2C16", background: OAK_FACE, boxShadow: isOpen ? "inset 0 3px 6px rgba(0,0,0,.35),0 1px 2px rgba(0,0,0,.3)" : "0 2px 4px rgba(0,0,0,.3)", transform: isHovered && !isOpen ? "translateY(2px)" : isOpen ? "translateY(3px)" : "none", transition: openingDrawer === dr.id ? "none" : "transform .26s cubic-bezier(.16,1,.3,1),box-shadow .26s cubic-bezier(.16,1,.3,1)", animation: openingDrawer === dr.id ? "drawer-pull .48s cubic-bezier(.16,1,.3,1) forwards" : "none" }}>
                      {isHovered && (
                        <>
                          <button onClick={(e) => startEdit(e, dr.id, dr.name)} aria-label="Rename"
                            style={{ position: "absolute", top: 8, right: 8, zIndex: 3, width: 24, height: 24, borderRadius: "50%", border: BRASS_BORDER, cursor: "pointer", background: BRASS_GRAD, color: "#3a2c12", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 2px rgba(0,0,0,.4)" }}>✎</button>
                          {dr.removable && drawers.length > 1 && (
                            <button onClick={(e) => removeDrawer(e, dr.id)} aria-label="Remove"
                              style={{ position: "absolute", top: 8, left: 8, zIndex: 3, width: 24, height: 24, borderRadius: "50%", border: "1px solid #6f3030", cursor: "pointer", background: "rgba(38,32,32,.6)", color: BRAND.cream, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 2px rgba(0,0,0,.4)" }}>✕</button>
                          )}
                        </>
                      )}
                      <BrassLabelHolder name={dr.name} isEditing={isEditingThis} draft={draft}
                        onInput={(e) => setDraft(e.target.value)}
                        onKey={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") { setEditing(null); setDraft(""); } }}
                        onCommit={commitEdit} />
                      <div style={{ position: "absolute", left: 0, right: 0, bottom: 10, textAlign: "center", fontFamily: FONT.body, fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(251,246,232,.82)", textShadow: "0 1px 1px rgba(0,0,0,.4)" }}>
                        {count} {count === 1 ? "card" : "cards"} · {isOpen ? "Open" : "Pull"}
                      </div>
                    </div>
                  );
                })}

                <button onClick={addDrawer}
                  style={{ height: 166, cursor: "pointer", borderRadius: 3, border: "2px dashed rgba(251,246,232,.4)", background: "rgba(0,0,0,.18)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "rgba(251,246,232,.78)" }}>
                  <span style={{ width: 34, height: 34, borderRadius: "50%", border: `1px solid ${BRAND.brass}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#E8CF93" }}>+</span>
                  <span style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" }}>Add a drawer</span>
                </button>
              </div>
            </div>

            {openDrawer && (
              <div style={{ marginTop: 16, animation: "drawer-open-tray .34s cubic-bezier(.16,1,.3,1)" }}>
                {/* Drawer face — the front panel you're looking at when it's pulled out */}
                <div style={{ background: "linear-gradient(180deg,#C8924E 0%,#A0682A 40%,#7A4A1C 100%)", borderRadius: "4px 4px 0 0", border: "2px solid #3a200a", borderBottom: "none", padding: "12px 22px 0", boxShadow: "0 -4px 12px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.18)" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ width: 13, height: 13, borderRadius: "50%", background: "radial-gradient(circle at 38% 30%,#E8CF93,#C2A35E)", border: BRASS_BORDER, flexShrink: 0, boxShadow: "0 1px 3px rgba(0,0,0,.5)" }} />
                      <div>
                        <div style={{ fontFamily: FONT.body, fontSize: 9.5, letterSpacing: ".26em", textTransform: "uppercase", color: "rgba(251,246,232,.6)" }}>Open drawer</div>
                        <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 20, color: "#FBF6E8", lineHeight: 1 }}>{openDrawerName}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setShowAddBook(true)}
                        style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", background: BRAND.coral, color: "#fff", border: "none", cursor: "pointer", padding: "7px 14px", borderRadius: 2 }}>
                        + Add Book
                      </button>
                      <button onClick={() => toggleDrawer(openDrawer)}
                        style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", background: "rgba(0,0,0,.3)", color: "#FBF6E8", border: "1px solid rgba(251,246,232,.28)", cursor: "pointer", padding: "7px 14px", borderRadius: 2 }}>
                        Push shut ✕
                      </button>
                    </div>
                  </div>
                  {/* Brass retaining rod across the top of the drawer interior */}
                  <div style={{ height: 7, background: "linear-gradient(180deg,#E8CF93 0%,#C2A35E 45%,#8F7233 100%)", borderRadius: "3px 3px 0 0", boxShadow: "0 2px 4px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.5)", border: "1px solid #6b5220", borderBottom: "none" }} />
                </div>

                {/* Drawer interior — the box you're looking down into */}
                <div style={{ position: "relative", background: "linear-gradient(180deg,#2A1608 0%,#1E0F04 100%)", border: "2px solid #3a200a", borderTop: "none", borderRadius: "0 0 4px 4px", boxShadow: "0 20px 50px rgba(0,0,0,.5), inset 0 4px 18px rgba(0,0,0,.6)" }}>
                  {/* Left interior wall */}
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 20, background: "linear-gradient(90deg,#5C3418,#3A1F0A)", borderRight: "1px solid #1a0d03", zIndex: 2, borderRadius: "0 0 0 4px" }} />
                  {/* Right interior wall */}
                  <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 20, background: "linear-gradient(270deg,#5C3418,#3A1F0A)", borderLeft: "1px solid #1a0d03", zIndex: 2, borderRadius: "0 0 4px 0" }} />
                  {/* Interior floor — horizontal wood-grain lines like card catalog rails */}
                  <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(180deg,transparent,transparent 11px,rgba(0,0,0,.18) 11px,rgba(0,0,0,.18) 12px)", pointerEvents: "none", zIndex: 1 }} />

                  <div style={{ position: "relative", zIndex: 3, padding: "22px 28px 28px" }}>
                    {openBooks.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "26px 10px", fontFamily: FONT.read, fontStyle: "italic", fontSize: 16, color: "rgba(251,246,232,.5)" }}>
                        This drawer is empty — file a book here to fill it.
                      </div>
                    ) : (
                      <>
                        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 10, alignItems: "flex-start",
                          scrollbarWidth: "thin", scrollbarColor: "#5C3418 #1E0F04" }}>
                          {openBooks.map((book, i) => (
                            <IndexCard key={book.id} book={book} delay={i * 30} onOpen={() => setSelectedBook(book)} onDelete={(b) => setDeleteTarget(b)} onRate={(r) => handleRateBook(book, r)} />
                          ))}
                        </div>
                        <div style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: ".08em", color: "rgba(251,246,232,.38)", marginTop: 14, textAlign: "center" }}>
                          {openBooks.length} {openBooks.length === 1 ? "card" : "cards"} filed · scroll to browse · click to open
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!openDrawer && (
              <div style={{ marginTop: 24, textAlign: "center", fontFamily: FONT.read, fontStyle: "italic", fontSize: 17, color: BRAND.muted }}>
                Select a drawer above to slide it open · hover a drawer to rename it.
              </div>
            )}
          </>
        )}
      </section>

    </div>
  );
}
