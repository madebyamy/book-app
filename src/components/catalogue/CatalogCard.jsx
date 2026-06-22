import React, { useState, useEffect } from 'react';
import { BRAND, FONT } from '../../constants.js';
import { loadDateAdded, saveDateAdded, loadStatus, loadProgress } from '../../lib/books.js';
import { todayISO, formatCatalogDate } from '../../lib/helpers.js';

function StatusBadge({ status, accent }) {
  if (status === "read") return (
    <div title="Finished" style={{ position: "absolute", top: -6, right: -10, width: 34, height: 34, borderRadius: "50%", background: accent, border: "2px solid #F4EFE4", display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-12deg)", boxShadow: "0 2px 5px rgba(0,0,0,0.4)" }}>
      <span style={{ fontFamily: FONT.type, fontSize: "0.52rem", fontWeight: 700, letterSpacing: "0.03em", color: "#1A1610", textAlign: "center", lineHeight: 1.05 }}>READ</span>
    </div>
  );
  if (status === "reading") return (
    <div title="Currently reading" style={{ position: "absolute", top: -6, right: -14, width: 16, height: 38, background: accent, boxShadow: "0 2px 5px rgba(0,0,0,0.4)", clipPath: "polygon(0 0, 100% 0, 100% 78%, 50% 100%, 0 78%)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "6px" }}>
      <span style={{ fontSize: "0.6rem" }} role="img" aria-label="reading">📖</span>
    </div>
  );
  if (status === "up-next") return (
    <div title="Up next" style={{ position: "absolute", top: -8, right: -8, width: 28, height: 28, borderRadius: "50%", background: "#1A1612", border: `2px solid ${accent}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.4)" }}>
      <span style={{ fontSize: "0.72rem", color: accent }}>▶</span>
    </div>
  );
  return (
    <div title="To read" style={{ position: "absolute", top: -6, right: -10, width: 30, height: 30, borderRadius: "50%", background: "#F4EFE4", border: `2px solid ${accent}`, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-12deg)", boxShadow: "0 2px 5px rgba(0,0,0,0.35)" }}>
      <span style={{ fontFamily: FONT.type, fontSize: "0.42rem", fontWeight: 700, letterSpacing: "0.02em", color: accent, textAlign: "center", lineHeight: 1.05 }}>TO<br/>READ</span>
    </div>
  );
}

function DeleteConfirmModal({ bookTitle, onConfirm, onCancel }) {
  return (
    <div onClick={onCancel} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(38,32,32,.62)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: BRAND.paper, border: `1px solid ${BRAND.line}`, borderRadius: 5, maxWidth: 420, width: "100%", padding: "32px 28px 24px", boxShadow: "0 16px 40px rgba(20,30,50,.18)" }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(242,92,92,.1)", border: `1px solid rgba(242,92,92,.3)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, fontSize: 20 }}>🗑</div>
        <h3 style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 22, color: BRAND.ink, margin: "0 0 10px", lineHeight: 1.2 }}>Delete this book?</h3>
        <p style={{ fontFamily: FONT.read, fontSize: 15, lineHeight: 1.6, color: BRAND.muted, margin: "0 0 6px" }}>
          Are you sure you want to delete <em>"{bookTitle}"</em>?
        </p>
        <p style={{ fontFamily: FONT.read, fontSize: 13.5, lineHeight: 1.6, color: BRAND.coral, margin: "0 0 26px" }}>
          This will delete all data associated with this book.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, fontFamily: FONT.body, fontSize: 13, letterSpacing: ".04em", background: "transparent", border: `1px solid ${BRAND.line2}`, color: BRAND.muted, padding: "11px 16px", borderRadius: 3, cursor: "pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, fontFamily: FONT.body, fontSize: 13, letterSpacing: ".04em", background: BRAND.coral, border: "none", color: "#fff", padding: "11px 16px", borderRadius: 3, cursor: "pointer" }}>Yes, delete</button>
        </div>
      </div>
    </div>
  );
}

export function CatalogCard({ userId, book, onSelect, onDelete }) {
  const [date, setDate] = useState(null);
  const [readStatus, setReadStatus] = useState("to-read");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    let active = true;
    loadDateAdded(userId, book.id).then(async (val) => {
      if (!active) return;
      if (val) setDate(val);
      else { const today = todayISO(); await saveDateAdded(userId, book.id, today); if (active) setDate(today); }
    });
    (async () => {
      const manualStatus = await loadStatus(userId, book.id);
      if (!active) return;
      if (manualStatus) { setReadStatus(manualStatus); return; }
      const data = await loadProgress(userId, book.id);
      if (!active) return;
      const total = data?.totalPages ?? 0;
      const current = data?.currentPage ?? 0;
      if (total > 0 && current >= total) setReadStatus("read");
      else if (current > 0) setReadStatus("reading");
      else setReadStatus("to-read");
    })();
    return () => { active = false; };
  }, [userId, book.id]);

  const callNumber = `${book.author.split(" ").pop().slice(0, 3).toUpperCase()}-${book.year || "NEW"}`;

  return (
    <>
      <div style={{ position: "relative" }}>
        {/* Tab */}
        <span style={{ position: "absolute", top: 0, left: 16, width: 110, height: 26, background: BRAND.card, border: `1px solid ${BRAND.cardEdge}`, borderBottom: "none", borderRadius: "5px 5px 0 0", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
          <span style={{ fontFamily: FONT.type, fontSize: 10, color: BRAND.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 94 }}>{book.title}</span>
        </span>
        <button onClick={() => onSelect(book.id)} style={{ position: "relative", display: "flex", gap: 16, textAlign: "left", cursor: "pointer", width: "100%", background: BRAND.card, color: BRAND.ink, border: `1px solid ${BRAND.cardEdge}`, borderRadius: "0 0 3px 3px", marginTop: 26, padding: "16px 18px", boxShadow: "0 4px 12px rgba(20,30,50,.10)", transition: "transform .22s,box-shadow .22s" }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(20,30,50,.16)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(20,30,50,.10)"; }}>
          <span style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 4, background: book.accent, borderRadius: "3px 0 0 3px" }} />
          <div style={{ position: "relative", flexShrink: 0 }}>
            {book.cover
              ? <img src={book.cover} alt={book.title} style={{ width: 54, height: 78, objectFit: "cover", display: "block", borderRadius: 2, boxShadow: "0 2px 6px rgba(20,30,50,.2)" }} onError={(e) => { e.target.style.display = "none"; }} />
              : <div style={{ width: 54, height: 78, background: book.accent, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", padding: 4 }}><span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 11, color: "#fff", textAlign: "center", lineHeight: 1.2 }}>{book.title}</span></div>}
            <StatusBadge status={readStatus} accent={book.accent} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: FONT.type, fontSize: 9.5, letterSpacing: "0.04em", color: BRAND.terracotta, borderBottom: `1px solid ${BRAND.rule}`, paddingBottom: 7, marginBottom: 10 }}>{callNumber}</div>
            <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 20, lineHeight: 1.1, color: BRAND.ink, marginBottom: 4 }}>{book.title}</div>
            {book.subtitle && <div style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 13, color: BRAND.muted, marginBottom: 6 }}>{book.subtitle}</div>}
            <div style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 13.5, color: BRAND.muted, marginBottom: 12 }}>{book.author}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ height: 1, background: BRAND.rule, opacity: 0.7 }} />
              <div style={{ height: 1, background: BRAND.rule, opacity: 0.45 }} />
              <div style={{ height: 1, background: BRAND.rule, opacity: 0.25 }} />
            </div>
            <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontFamily: FONT.type, fontSize: 9.5, color: BRAND.muted }}>{book.year}{book.pages ? ` · ${book.pages} pp` : ""}</span>
                {book.shared && <span style={{ fontFamily: FONT.body, fontSize: 9.5, letterSpacing: ".08em", textTransform: "uppercase", color: BRAND.terracotta, background: "rgba(191,117,90,.12)", border: "1px solid rgba(191,117,90,.3)", borderRadius: 3, padding: "1px 6px" }}>Shared</span>}
              </div>
              <span style={{ fontFamily: FONT.body, fontSize: 11.5, color: BRAND.coral }}>{date ? formatCatalogDate(date) : ""} Read card →</span>
            </div>
          </div>
        </button>
        {onDelete && (
          <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
            title="Delete book"
            style={{ position: "absolute", top: 32, right: 10, zIndex: 2, width: 30, height: 30, borderRadius: "50%", border: `1px solid ${BRAND.line2}`, background: BRAND.paper, color: BRAND.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, transition: "background .2s,color .2s,border-color .2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(242,92,92,.1)"; e.currentTarget.style.borderColor = "rgba(242,92,92,.4)"; e.currentTarget.style.color = BRAND.coral; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = BRAND.paper; e.currentTarget.style.borderColor = BRAND.line2; e.currentTarget.style.color = BRAND.muted; }}>
            🗑
          </button>
        )}
      </div>
      {confirmDelete && (
        <DeleteConfirmModal
          bookTitle={book.title}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => { setConfirmDelete(false); onDelete(book.id); }}
        />
      )}
    </>
  );
}
